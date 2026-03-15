from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from difflib import get_close_matches
from pathlib import Path

import httpx
import pandas as pd

app = FastAPI(title="Fitatu AI Engine")

# Load the recipe dataset once at startup
DATA_PATH = Path(__file__).parent / "epi_r.csv"
recipes_df = None
recipe_titles = []

@app.on_event("startup")
def load_recipe_data():
    global recipes_df, recipe_titles

    try:
        recipes_df = pd.read_csv(DATA_PATH, low_memory=False)
        if "title" in recipes_df.columns:
            recipe_titles = (
                recipes_df["title"].astype(str).fillna("").str.strip().tolist()
            )
        else:
            recipe_titles = []
        print(f"Loaded {len(recipe_titles)} recipes from {DATA_PATH.name}")
    except Exception as e:
        recipes_df = pd.DataFrame()
        recipe_titles = []
        print(f"Failed to load recipe dataset: {e}")


def _safe_number(val, default=0):
    try:
        if val is None or (isinstance(val, float) and pd.isna(val)):
            return default
        return float(val)
    except Exception:
        return default


def _find_recipe_match(query: str):
    if not recipes_df or recipes_df.empty:
        return None

    q = (query or "").strip().lower()
    if not q:
        return None

    matches = recipes_df[
        recipes_df["title"].astype(str).str.contains(q, case=False, na=False, regex=False)
    ]
    if not matches.empty:
        return matches.iloc[0]

    found = get_close_matches(q, recipe_titles, n=1, cutoff=0.5)
    if found:
        matched_title = found[0]
        match = recipes_df[recipes_df["title"] == matched_title]
        if not match.empty:
            return match.iloc[0]

    return None

# This allows your GitHub Pages frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We can lock this down to your exact GitHub URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple data model for incoming text/audio logs
class MealRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "Fitatu AI Backend is alive and listening! 🧠"}

API_NINJAS_KEY = "cIVL83gXuuAiK9R8StxdFItUzmGbHDHIfeWriudR"
API_NINJAS_URL = "https://api.api-ninjas.com/v1/nutrition"

# Endpoint for logging text meal entries
@app.post("/api/log-text")
async def log_text_meal(meal: MealRequest):
    query = (meal.text or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="No food query provided")

    headers = {"X-Api-Key": API_NINJAS_KEY}
    params = {"query": query}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(API_NINJAS_URL, headers=headers, params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text or "Nutrition API request failed",
        )

    data = response.json()
    if not isinstance(data, list) or len(data) == 0:
        raise HTTPException(status_code=404, detail="Food not found")

    total_calories = 0.0
    total_protein = 0.0
    total_fat = 0.0
    total_carbs = 0.0

    for item in data:
        total_calories += _safe_number(item.get("calories"))
        total_protein += _safe_number(item.get("protein_g") or item.get("protein"))
        total_fat += _safe_number(item.get("fat_total_g") or item.get("fat"))
        total_carbs += _safe_number(
            item.get("carbohydrates_total_g")
            or item.get("carbohydrates")
            or item.get("carbs")
        )

    return {
        "success": True,
        "food_detected": query,
        "calories": total_calories,
        "protein": total_protein,
        "fat": total_fat,
        "carbs": total_carbs,
        "macros": {
            "calories": total_calories,
            "protein": total_protein,
            "fat": total_fat,
            "carbs": total_carbs,
        },
    }