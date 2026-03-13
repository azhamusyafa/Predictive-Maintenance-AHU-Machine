import pandas as pd

def preprocess_raw_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns={
        'time@timestamp': 'timestamp',
        'data_format_0': 'vibrasi_x',
        'data_format_1': 'vibrasi_z',
        'data_format_2': 'temperature',
        'data_format_3': 'current'
    })
    
    columns_to_drop = ['data_format_4', 'data_index']
    existing_drops = [col for col in columns_to_drop if col in df.columns]
    if existing_drops:
        df = df.drop(columns=existing_drops)
    
    df['vibrasi_x'] = df['vibrasi_x'] / 1000
    df['vibrasi_z'] = df['vibrasi_z'] / 1000
    df['temperature'] = df['temperature'] / 100
    df['current'] = df['current'] / 100
    
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
    df = df.set_index('timestamp')
    
    df_resampled = df.resample('5min').agg({
        'vibrasi_x': 'max',
        'temperature': 'max',
        'vibrasi_z': 'mean',
        'current': 'mean'
    }).dropna()
    
    df_resampled = df_resampled.reset_index()
    df_resampled = df_resampled[df_resampled['current'] > 0].copy()

    df_resampled = df_resampled.set_index('timestamp')
    df_resampled = df_resampled.asfreq('5min', method='ffill')
    df_resampled = df_resampled.reset_index()

    df_resampled['item_id'] = 'FT1.01'

    return df_resampled.reset_index(drop=True)