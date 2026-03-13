from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
from config import DEMO_USERNAME, DEMO_PASSWORD
from services.db_service import test_connection

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

sessions = {}

@router.post("/login")
def login(request: LoginRequest):
    if request.username != DEMO_USERNAME or request.password != DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_status = test_connection()
    
    session_token = f"session_{request.username}"
    sessions[session_token] = {
        "username": request.username,
        "db_connected": db_status
    }
    
    return {
        "message": "Login successful",
        "session_token": session_token,
        "db_connected": db_status,
        "data_source": "MySQL" if db_status else "CSV Local"
    }

@router.post("/logout")
def logout(session_token: str):
    if session_token in sessions:
        del sessions[session_token]
    return {"message": "Logout successful"}

@router.get("/status")
def auth_status(session_token: str):
    if session_token not in sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return sessions[session_token]