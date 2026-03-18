# HVAC Predictive Maintenance Monitoring System

Sistem monitoring dan prediksi kondisi AHU (Air Handling Unit) berbasis machine learning untuk pemeliharaan prediktif peralatan HVAC di lingkungan industri.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-green) ![Python](https://img.shields.io/badge/Python-3.11+-blue) ![React](https://img.shields.io/badge/React-18.2-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Fitur Utama

- **Real-time Monitoring** — Data sensor diperbarui setiap 5 detik
- **Prediksi 14 Hari ke Depan** — Menggunakan model Chronos-2 (Amazon) yang di-fine-tune pada data historis
- **Confidence Interval** — Visualisasi rentang prediksi pada persentil 10%, 50%, dan 90%
- **Threshold Alerts** — Peringatan otomatis berdasarkan standar ISO 10816-1
- **Model Switching** — Toggle antara model fine-tuned dan zero-shot
- **Data Historis** — Filter dan visualisasi data berdasarkan rentang tanggal
- **Fallback ke CSV** — Otomatis beralih ke data lokal jika database tidak tersedia

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│   Dashboard · Charts · Real-time Status Cards       │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────────┐
│                Backend (FastAPI)                    │
│   Routes · Services · Preprocessing · Auth         │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
┌──────────▼──────────┐  ┌─────────▼─────────────────┐
│    MySQL Database   │  │   Chronos-2 ML Model       │
│  (Primary Source)   │  │  (Fine-tuned / Zero-shot)  │
└─────────────────────┘  └───────────────────────────┘
           │ (fallback)
┌──────────▼──────────┐
│    Local CSV Files  │
│  (Backup Data)      │
└─────────────────────┘
```

---

## Parameter yang Dipantau

| Parameter      | Satuan | Warning Threshold | Critical Threshold |
|----------------|--------|-------------------|--------------------|
| Vibrasi X      | mm/s   | 2.8               | 4.5                |
| Vibrasi Z      | mm/s   | 2.8               | 4.5                |
| Temperature    | °C     | 45                | 50                 |
| Current        | A      | 18                | 20.5               |

> Threshold berdasarkan **ISO 10816-1** (Mechanical vibration — Evaluation of machine vibration)

---

## Teknologi

### Backend
| Library | Kegunaan |
|---------|----------|
| FastAPI | Web framework & REST API |
| PyMySQL | Koneksi database MySQL |
| Pandas  | Pemrosesan data time-series |
| NumPy   | Komputasi numerik |
| Chronos | Model forecasting Amazon (T5-based) |

### Frontend
| Library | Kegunaan |
|---------|----------|
| React 18 | UI framework |
| Recharts | Visualisasi chart |
| Axios | HTTP client |
| Lucide React | Icon library |

---

## Struktur Proyek

```
hvac-demo/
├── backend/
│   ├── main.py                  # Entry point FastAPI
│   ├── config.py                # Konfigurasi & konstanta
│   ├── .env                     # Variabel lingkungan (DB credentials)
│   ├── routes/
│   │   ├── ahu.py               # Endpoint AHU
│   │   └── auth.py              # Endpoint autentikasi
│   ├── services/
│   │   ├── ahu_service.py       # Logika bisnis & prediksi
│   │   ├── db_service.py        # Operasi database
│   │   └── preprocessing.py     # Normalisasi & resampling data
│   └── data/
│       ├── AHU_FT1.01.csv           # Data historis mentah
│       └── data_ft101_resampled.csv # Data hasil preprocessing
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Dashboard.jsx        # Layout utama & navigasi
│       │   ├── Login.jsx            # Halaman login
│       │   ├── StatusCard.jsx       # Kartu status real-time
│       │   ├── HistoricalChart.jsx  # Chart data historis
│       │   ├── PredictionChart.jsx  # Chart prediksi
│       │   └── ThresholdInfo.jsx    # Tabel threshold
│       └── services/
│           └── api.js               # Axios API client
│
└── model/
    └── chronos2_ft101_finetuned/    # Model ML yang sudah di-fine-tune
        ├── model.safetensors
        └── config.json
```

---

## Cara Menjalankan

### Prasyarat

- Python 3.11+
- Node.js 16+
- MySQL (opsional — sistem akan fallback ke CSV)
- CUDA-compatible GPU (opsional — untuk inferensi lebih cepat)

### 1. Backend

```bash
cd backend

# Install dependencies
pip install fastapi uvicorn pymysql pandas numpy torch
pip install git+https://github.com/amazon-science/chronos-forecasting.git

# Konfigurasi environment (opsional — untuk koneksi DB)
cp .env.example .env
# Edit .env dengan kredensial database Anda

# Jalankan server
python main.py
```

Server berjalan di: `http://0.0.0.0:8000`
Dokumentasi API: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Konfigurasi API URL (opsional)
# Edit .env dan ubah REACT_APP_API_URL sesuai IP backend

# Jalankan development server
npm start
```

Aplikasi berjalan di: `http://localhost:3000`

---

## Konfigurasi

### Backend (`.env`)

```env
DB_HOST=<ip-database>
DB_PORT=3306
DB_NAME=<nama-database>
DB_USER=<username>
DB_PASSWORD=<password>
```

### Frontend (`.env`)

```env
REACT_APP_API_URL=http://<ip-backend>:8000
```

---

## API Endpoints

| Method | Endpoint              | Deskripsi                          |
|--------|-----------------------|------------------------------------|
| GET    | `/ahu/status`         | Status & nilai sensor terkini      |
| GET    | `/ahu/historical`     | Data historis dengan filter tanggal |
| GET    | `/ahu/prediction`     | Prediksi time-series (1-30 hari)   |
| GET    | `/ahu/thresholds`     | Nilai threshold ISO 10816-1        |
| POST   | `/ahu/model/switch`   | Ganti model prediksi               |
| GET    | `/ahu/model/active`   | Model prediksi yang aktif          |
| POST   | `/auth/login`         | Login & validasi sesi              |
| POST   | `/auth/logout`        | Logout                             |

---

## Model Machine Learning

Sistem menggunakan **Amazon Chronos-2**, model foundation untuk time-series forecasting berbasis arsitektur T5 transformer.

- **Arsitektur**: T5, 12 layer, 768 dimensi model
- **Fine-tuning**: Dilakukan pada data historis AHU FT1.01
- **Output**: Prediksi titik + confidence interval (persentil 10, 50, 90)
- **Horizon Prediksi**: 14 hari ke depan
- **Resolusi Data**: 5 menit per titik (288 titik/hari)

Tersedia dua mode:
- **Fine-tuned** — Lebih akurat untuk peralatan spesifik ini
- **Zero-shot** — Baseline umum Chronos-2

---

## Peralatan yang Dipantau

- **AHU**: FT1.01
- **Lokasi**: Ruang Produksi
- **Motor**: 11 kW Blower
- **Sensor**: Akselerometer (vibrasi), termokopel (suhu), CT sensor (arus)

---

---

## Lisensi

MIT License — bebas digunakan untuk keperluan edukasi dan riset.
