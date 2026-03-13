import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from chronos import BaseChronosPipeline
from services.db_service import test_connection, fetch_data_from_mysql
from services.preprocessing import preprocess_raw_data
from config import AVAILABLE_MODELS, ACTIVE_MODEL

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'AHU_FT1.01.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'model', 'chronos2_ft101_finetuned')

THRESHOLDS = {
    'Vibrasi X': {'warning': 2.8, 'critical': 4.5},
    'Vibrasi Z': {'warning': 2.8, 'critical': 4.5},
    'Temperature': {'warning': 45, 'critical': 50},
    'Current': {'warning': 18, 'critical': 20}
}

PARAMS = ['vibrasi_x', 'vibrasi_z', 'temperature', 'current']
PARAM_MAP = {
    'vibrasi_x': 'Vibrasi X',
    'vibrasi_z': 'Vibrasi Z', 
    'temperature': 'Temperature',
    'current': 'Current'
}

_data_cache = None
_pipeline = None
_current_model = None

def load_data():
    global _data_cache
    if _data_cache is None:
        try:
            if test_connection():
                df_raw = fetch_data_from_mysql()
                _data_cache = preprocess_raw_data(df_raw)
            else:
                raise Exception("Database not available")
        except Exception as e:
            print(f"Using CSV fallback: {str(e)}")
            df = pd.read_csv(DATA_PATH)
            _data_cache = preprocess_raw_data(df)
    return _data_cache

def load_pipeline(model_type: str = None):
    global _pipeline, _current_model
    
    if model_type is None:
        model_type = ACTIVE_MODEL
    
    if _pipeline is None or _current_model != model_type:
        model_path = AVAILABLE_MODELS.get(model_type, AVAILABLE_MODELS['finetuned'])
        _pipeline = BaseChronosPipeline.from_pretrained(model_path, device_map="cuda")
        _current_model = model_type
    
    return _pipeline

def get_status_level(param: str, value: float) -> str:
    th = THRESHOLDS.get(param)
    if not th:
        return 'normal'
    if value >= th['critical']:
        return 'critical'
    if value >= th['warning']:
        return 'warning'
    return 'normal'

def get_ahu_status() -> Dict[str, Any]:
    df = load_data()
    latest = df.iloc[-1]
    history = df.tail(12)
    
    current_values = {
        'Vibrasi X': round(latest['vibrasi_x'], 4),
        'Vibrasi Z': round(latest['vibrasi_z'], 4),
        'Temperature': round(latest['temperature'], 2),
        'Current': round(latest['current'], 2)
    }
    
    status_levels = {k: get_status_level(k, v) for k, v in current_values.items()}
    
    overall = 'normal'
    if 'critical' in status_levels.values():
        overall = 'critical'
    elif 'warning' in status_levels.values():
        overall = 'warning'
    
    return {
        'ahu_id': 'FT1.01',
        'name': 'AHU-FT1.01',
        'status': overall,
        'current_values': current_values,
        'status_levels': status_levels,
        'last_update': latest['timestamp'].isoformat(),
        'sparkline': {
            'Vibrasi X': history['vibrasi_x'].tolist(),
            'Vibrasi Z': history['vibrasi_z'].tolist(),
            'Temperature': history['temperature'].tolist(),
            'Current': history['current'].tolist()
        }
    }

def get_ahu_historical(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    df = load_data()
    
    if start_date and end_date:
        mask = (df['timestamp'] >= start_date) & (df['timestamp'] <= end_date)
        df = df[mask]
    
    if limit:
        df = df.tail(limit)
    
    return {
        'ahu_id': 'FT1.01',
        'total_points': len(df),
        'data': {
            'timestamps': df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S').tolist(),
            'vibrasi_x': df['vibrasi_x'].round(4).tolist(),
            'vibrasi_z': df['vibrasi_z'].round(4).tolist(),
            'temperature': df['temperature'].round(2).tolist(),
            'current': df['current'].round(2).tolist()
        }
    }

def get_ahu_prediction(days: int = 14) -> Dict[str, Any]:
    df = load_data()
    pipeline = load_pipeline()
    
    prediction_length = days * 288
    last_timestamp = df['timestamp'].iloc[-1]
    
    predictions = {
        'timestamps': [],
        'vibrasi_x': {'values': [], 'low': [], 'high': []},
        'vibrasi_z': {'values': [], 'low': [], 'high': []},
        'temperature': {'values': [], 'low': [], 'high': []},
        'current': {'values': [], 'low': [], 'high': []}
    }
    
    for i in range(1, prediction_length + 1):
        future_time = last_timestamp + timedelta(minutes=5 * i)
        predictions['timestamps'].append(future_time.strftime('%Y-%m-%d %H:%M:%S'))
    
    for param in PARAMS:
        df_input = df[['timestamp', 'item_id', param]].rename(columns={param: 'target'})
        pred = pipeline.predict_df(df_input, prediction_length=prediction_length, quantile_levels=[0.1, 0.5, 0.9])
        
        predictions[param]['values'] = pred['predictions'].round(4).tolist()
        predictions[param]['low'] = pred['0.1'].round(4).tolist()
        predictions[param]['high'] = pred['0.9'].round(4).tolist()
    
    warnings = []
    for param in PARAMS:
        param_name = PARAM_MAP[param]
        th = THRESHOLDS[param_name]
        values = predictions[param]['values']
        
        for i, val in enumerate(values):
            if val >= th['critical']:
                warnings.append({
                    'parameter': param_name,
                    'step': i,
                    'timestamp': predictions['timestamps'][i],
                    'value': val,
                    'level': 'critical'
                })
                break
            elif val >= th['warning']:
                warnings.append({
                    'parameter': param_name,
                    'step': i,
                    'timestamp': predictions['timestamps'][i],
                    'value': val,
                    'level': 'warning'
                })
                break
    
    history_length = 200
    history_df = df.tail(history_length)
    history = {
        'timestamps': history_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S').tolist(),
        'vibrasi_x': history_df['vibrasi_x'].round(4).tolist(),
        'vibrasi_z': history_df['vibrasi_z'].round(4).tolist(),
        'temperature': history_df['temperature'].round(2).tolist(),
        'current': history_df['current'].round(2).tolist()
    }
    return {
        'ahu_id': 'FT1.01',
        'predictions': days,
        'total_points': prediction_length,
        'model_status': 'trained',
        'historical': history,
        'prediction_data': predictions,
        'warnings': warnings
    }

def get_ahu_thresholds() -> Dict[str, Any]:
    return {
        'ahu_id': 'FT1.01',
        'standard': 'ISO 10816-1',
        'thresholds': THRESHOLDS
    }

def switch_model(model_type: str) -> Dict[str, Any]:
    global ACTIVE_MODEL, _pipeline, _current_model
    
    if model_type not in AVAILABLE_MODELS:
        return {
            'success': False,
            'message': f'Model type not found. Available: {list(AVAILABLE_MODELS.keys())}'
        }
    
    import config
    config.ACTIVE_MODEL = model_type
    _pipeline = None
    _current_model = None
    
    return {
        'success': True,
        'active_model': model_type,
        'model_path': AVAILABLE_MODELS[model_type]
    }

def get_active_model() -> Dict[str, Any]:
    return {
        'active_model': ACTIVE_MODEL,
        'model_path': AVAILABLE_MODELS[ACTIVE_MODEL],
        'available_models': list(AVAILABLE_MODELS.keys())
    }