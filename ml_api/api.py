from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

MODEL_PATH = Path("telco_churn_xgboost.joblib")
model = joblib.load(MODEL_PATH)

app = FastAPI(title="Customer Churn API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str
    MonthlyCharges: float
    TotalCharges: float

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(data: PredictionInput):
    try:
        X = pd.DataFrame([data.model_dump()])
        probability = float(model.predict_proba(X)[0, 1])
        return {
            "churn_probability": round(probability, 4),
            "risk_category": (
                "High" if probability >= 0.70
                else "Medium" if probability >= 0.40
                else "Low"
            ),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Prediction failed; check model feature types."
        ) from exc
