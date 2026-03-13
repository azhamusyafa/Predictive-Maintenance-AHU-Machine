from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from services.ahu_service import (
    get_ahu_status,
    get_ahu_historical,
    get_ahu_prediction,
    get_ahu_thresholds,
    switch_model,
    get_active_model
)

router = APIRouter(prefix="/ahu", tags=["AHU"])

@router.get("/status")
def status():
    return get_ahu_status()

@router.get("/historical")
def historical(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: Optional[int] = Query(None)
):
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    return get_ahu_historical(start, end, limit)

@router.get("/prediction")
def prediction(days: int = Query(default=14, ge=1, le=30)):
    return get_ahu_prediction(days)

@router.get("/thresholds")
def thresholds():
    return get_ahu_thresholds()

@router.post("/model/switch")
def model_switch(model_type: str = Query(..., description="finetuned or zeroshot")):
    return switch_model(model_type)

@router.get("/model/active")
def model_active():
    return get_active_model()