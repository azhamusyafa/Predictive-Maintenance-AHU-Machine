import os
from dotenv import load_dotenv

load_dotenv()

AHU_ID = "FT1.01"
AHU_NAME = "AHU Ruang Produksi"

PREDICTION_HORIZON_DAYS = 14
DATA_INTERVAL_MINUTES = 5

THRESHOLDS = {
    'Vibrasi X': {'warning': 2.8, 'critical': 4.5, 'unit': 'mm/s'},
    'Vibrasi Z': {'warning': 2.8, 'critical': 4.5, 'unit': 'mm/s'},
    'Temperature': {'warning': 45, 'critical': 50, 'unit': 'Â°C'},
    'Current': {'warning': 18, 'critical': 20.5, 'unit': 'A'}
}

ISO_STANDARD = "ISO 10816-1"

DB_HOST = os.getenv('DB_HOST')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')
TABLE_NAME = os.getenv('TABLE_NAME', 'ahu_ft101')

DEMO_USERNAME = ''
DEMO_PASSWORD = ''

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'chronos2_ft101_finetuned')

AVAILABLE_MODELS = {
    'finetuned': MODEL_PATH,
    'zeroshot': 'amazon/chronos-2'
}

ACTIVE_MODEL = 'finetuned'
