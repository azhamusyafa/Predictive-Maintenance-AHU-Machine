from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ahu import router as ahu_router
from routes.auth import router as auth_router

app = FastAPI(
    title="HVAC Predictive Maintenance DEMO",
    description="Sistem Prediktif Maintenance Motor Blower AHU FT1.01 11kW"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ahu_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return{
        "message": "HVAC Predictive Maintenance API is running.",
        "ahu_id": "FT1.01",
        "status": "berjalan"
    }
    
@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)