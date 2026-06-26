import requests
import pandas as pd
from pathlib import Path

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

GAMES_URL = "https://worldcup26.ir/get/games"
TEAMS_URL = "https://worldcup26.ir/get/teams"

# -----------------------------
# 1) Fetch API data
# -----------------------------
games_json = requests.get(GAMES_URL, timeout=30).json()
teams_json = requests.get(TEAMS_URL, timeout=30).json()

games = pd.DataFrame(games_json["games"])
teams = pd.DataFrame(teams_json["teams"])

# -----------------------------
# 2) Standardize types
# -----------------------------
for col in ["home_team_id", "away_team_id"]:
    if col in games.columns:
        games[col] = games[col].astype(str)

if "_id" in teams.columns:
    teams["_id"] = teams["_id"].astype(str)

# -----------------------------
# 3) Keep useful team columns
# -----------------------------
teams_small = teams[["_id", "name_en", "fifa_code"]].copy()
teams_small = teams_small.rename(columns={
    "_id": "team_doc_id",
    "name_en": "team_name",
    "fifa_code": "team_code"
})

# -----------------------------
# 4) Merge home team info
# -----------------------------
games = games.merge(
    teams_small,
    left_on="home_team_id",
    right_on="team_doc_id",
    how="left"
)

games = games.rename(columns={
    "team_name": "home_team_from_lookup",
    "team_code": "home_code"
}).drop(columns=["team_doc_id"], errors="ignore")

# -----------------------------
# 5) Merge away team info
# -----------------------------
games = games.merge(
    teams_small,
    left_on="away_team_id",
    right_on="team_doc_id",
    how="left"
)

games = games.rename(columns={
    "team_name": "away_team_from_lookup",
    "team_code": "away_code"
}).drop(columns=["team_doc_id"], errors="ignore")

# -----------------------------
# 6) Build final home/away team names
# Priority:
#   1. merged lookup
#   2. direct API english name
#   3. label field
# -----------------------------
games["home_team"] = games["home_team_from_lookup"]
games["away_team"] = games["away_team_from_lookup"]

if "home_team_name_en" in games.columns:
    games["home_team"] = games["home_team"].fillna(games["home_team_name_en"])

if "away_team_name_en" in games.columns:
    games["away_team"] = games["away_team"].fillna(games["away_team_name_en"])

if "home_team_label" in games.columns:
    games["home_team"] = games["home_team"].fillna(games["home_team_label"])

if "away_team_label" in games.columns:
    games["away_team"] = games["away_team"].fillna(games["away_team_label"])

# -----------------------------
# 7) Numeric conversion
# -----------------------------
for col in ["home_score", "away_score", "matchday"]:
    if col in games.columns:
        games[col] = pd.to_numeric(games[col], errors="coerce")

# -----------------------------
# 8) Boolean cleanup
# -----------------------------
if "finished" in games.columns:
    games["finished"] = games["finished"].astype(str).str.upper().map({
        "TRUE": True,
        "FALSE": False
    })

# -----------------------------
# 9) Derived features
# -----------------------------
games["goal_diff"] = games["home_score"] - games["away_score"]
games["total_goals"] = games["home_score"] + games["away_score"]

def get_result(row):
    if pd.isna(row["home_score"]) or pd.isna(row["away_score"]):
        return "not_played"
    if row["finished"] is False:
        return "not_finished"
    if row["home_score"] > row["away_score"]:
        return "home_win"
    if row["home_score"] < row["away_score"]:
        return "away_win"
    return "draw"

games["match_result"] = games.apply(get_result, axis=1)

# -----------------------------
# 10) Parse date if possible
# -----------------------------
if "local_date" in games.columns:
    games["local_date_parsed"] = pd.to_datetime(
        games["local_date"],
        format="%m/%d/%Y %H:%M",
        errors="coerce"
    )

# -----------------------------
# 11) Save raw enriched file
# -----------------------------
raw_keep = [
    "id", "group", "type", "matchday", "local_date", "local_date_parsed",
    "home_team_id", "away_team_id",
    "home_team", "away_team", "home_code", "away_code",
    "home_score", "away_score",
    "home_scorers", "away_scorers",
    "stadium_id", "finished", "time_elapsed",
    "goal_diff", "total_goals", "match_result"
]

raw_keep = [c for c in raw_keep if c in games.columns]
games[raw_keep].to_csv(
    DATA_DIR / "worldcup2026_matches_enriched.csv",
    index=False,
    encoding="utf-8"
)

# -----------------------------
# 12) Save analysis-ready file
# -----------------------------
clean_keep = [
    "id", "group", "type", "matchday", "local_date_parsed",
    "home_team", "away_team", "home_code", "away_code",
    "home_score", "away_score", "finished",
    "goal_diff", "total_goals", "match_result"
]

clean_keep = [c for c in clean_keep if c in games.columns]
df_clean = games[clean_keep].copy()

df_clean = df_clean.rename(columns={
    "id": "match_id",
    "local_date_parsed": "match_datetime"
})

df_clean.to_csv(
    DATA_DIR / "worldcup2026_clean.csv",
    index=False,
    encoding="utf-8"
)

# -----------------------------
# 13) Quick checks
# -----------------------------
print("Saved:")
print(DATA_DIR / "worldcup2026_matches_enriched.csv")
print(DATA_DIR / "worldcup2026_clean.csv")

print("\nMissing home team names:", df_clean["home_team"].isna().sum() if "home_team" in df_clean.columns else "N/A")
print("Missing away team names:", df_clean["away_team"].isna().sum() if "away_team" in df_clean.columns else "N/A")

print("\nPreview:")
print(df_clean.head(10))