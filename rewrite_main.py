"""Rewrite main.py with the desired FastAPI logic using epi_r.csv dataset."""

from pathlib import Path

main_path = Path(__file__).parent / "main.py"

new_content = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from difflib import get_close_matches
from pathlib import Path

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
        recipes_df["title"].astype(str).str.lower().str.contains(q, na=False)
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

# Endpoint for logging text meal entries
@app.post("/api/log-text")
async def log_text_meal(meal: MealRequest):
    query = (meal.text or "").strip()

    matched = _find_recipe_match(query)

    if matched is not None:
        calories = _safe_number(matched.get("calories"))
        protein = _safe_number(matched.get("protein"))
        fat = _safe_number(matched.get("fat"))
        carbs = _safe_number(matched.get("carbs")) if "carbs" in matched else 0
        matched_title = str(matched.get("title", "")).strip()
    else:
        # When no good match is found, return a reasonable default
        calories = 300
        carbs = 30
        protein = 20
        fat = 10
        matched_title = "Healthy Meal"

    return {
        "success": True,
        "food_detected": query,
        "matched_title": matched_title,
        "macros": {
            "calories": calories,
            "carbs": carbs,
            "protein": protein,
            "fat": fat,
        },
    }
'''

main_path.write_text(new_content, encoding="utf-8")
print(f"Wrote updated main.py ({len(new_content)} bytes)")
