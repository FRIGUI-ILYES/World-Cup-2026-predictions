# WC2026 Prediction Pipeline — Project Documentation

## Overview

This document covers the full prediction phase built on top of `Data_Inspect.ipynb`. The pipeline trains a match outcome classifier on 49,459 historical international football matches (1872–2026), then applies it to simulate the complete FIFA World Cup 2026 bracket from the current group-stage state through to the predicted Final and champion.

All code lives in **`Predictions.ipynb`** (11 code cells, 3 output figures).

---

## Dataset Used

| File | Rows | Role |
|---|---|---|
| `results.csv` | 49,459 | Training data (historical match outcomes, 1872–2026) |
| `data/worldcup2026_clean.csv` | 104 | WC2026 fixtures — 60 finished, 12 group matches predicted, 32 knockout predicted |

---

## Feature Engineering

All features are computed **before each match** using only past data (no leakage). A temporal sort on `date` is applied before any feature is derived.

### A — ELO Ratings (per-match snapshot)

| Feature | Description |
|---|---|
| `home_elo` | Home team ELO before this match |
| `away_elo` | Away team ELO before this match |
| `elo_diff` | `home_elo − away_elo` |

K-factors by tournament category: WC=60, UEFA/CONMEBOL/CAF=40, Other=35, Friendly=20. Home advantage: +100 effective ELO for non-neutral venues.

**Final ELO rankings (post all 49,459 matches):**

| Rank | Team | ELO |
|---|---|---|
| 1 | Argentina | 2090.0 |
| 2 | Spain | 2071.7 |
| 3 | France | 2049.7 |
| 4 | England | 1986.3 |
| 5 | Brazil | 1980.1 |
| 6 | Colombia | 1973.3 |
| 7 | Germany | 1958.5 |
| 8 | Morocco | 1954.7 |
| 9 | Portugal | 1953.9 |
| 10 | Japan | 1938.2 |

### B — Rolling Form (last 10 matches per team)

| Feature | Description |
|---|---|
| `home_wr10` | Home team win rate over last 10 matches |
| `home_gf10` | Home team avg goals scored (last 10) |
| `home_ga10` | Home team avg goals conceded (last 10) |
| `away_wr10` / `away_gf10` / `away_ga10` | Same for away team |

Default priors for teams with no history: win_rate=0.40, gf=1.30, ga=1.10.

### C — Match Context

| Feature | Description |
|---|---|
| `neutral_i` | 1 if neutral venue, 0 if home ground |
| `cat_enc` | Tournament category (WC=0, UEFA=1, CONMEBOL=2, CAF=3, Other=4, Friendly=5) |
| `month` | Month of match (1–12) |
| `year` | Match year |

**Total: 13 features.**

---

## Target Variable

3-class classification:

| Label | Value | Meaning |
|---|---|---|
| 0 | `home_win` | Home team wins |
| 1 | `draw` | Match drawn |
| 2 | `away_win` | Away team wins |

Class distribution in training set: 0=22,029 · 1=10,186 · 2=12,622

---

## Temporal Train/Validation Split

| Split | Date range | Rows |
|---|---|---|
| Train | 1900–2021 | 44,837 |
| Validation | 2022–2023 | 2,024 |

---

## Models

### Logistic Regression (baseline)
- `StandardScaler` for normalization
- `multi_class='multinomial'`, `class_weight='balanced'`, `C=0.8`, `max_iter=1000`

### XGBoost (primary model)
- `n_estimators=400`, `learning_rate=0.05`, `max_depth=5`
- `subsample=0.8`, `colsample_bytree=0.8`
- Early stopping (patience=25) on validation log-loss

### Validation Results

| Model | Accuracy | Log-loss | F1 macro |
|---|---|---|---|
| Logistic Regression | 53.75% | 0.9369 | 0.5115 |
| **XGBoost** | **59.73%** | **0.8933** | **0.4357** |

XGBoost beats the naive baseline (always predict home_win, ~50%) by **+9.7 pp**.

### Top Feature Importances (XGBoost)
1. `elo_diff` — most predictive single feature
2. `home_elo` / `away_elo` — individual team strength
3. `home_wr10` / `away_wr10` — recent form
4. `neutral_i` — home/away advantage
5. `cat_enc` — competition stakes

---

## WC2026 Group Stage Predictions

### Prediction Method
Each pending match is predicted using `xgb_model.predict_proba()`. **All three outcomes (Home Win, Draw, Away Win) are possible** — the outcome with the highest probability is taken as the prediction. Draw probabilities range 20–31% across group stage fixtures, reflecting genuine uncertainty.

### All 12 Remaining Group Matches

| Group | Home Team | Away Team | Prediction | H% | D% | A% |
|---|---|---|---|---|---|---|
| G | Senegal | Iraq | **Home Win** | 48% | 31% | 22% |
| L | Panama | England | **Away Win** | 8% | 22% | 70% |
| K | DR Congo | Uzbekistan | **Away Win** | 9% | 20% | 72% |
| I | Norway | France | **Away Win** | 24% | 26% | 51% |
| G | Egypt | Iran | **Away Win** | 29% | 30% | 41% |
| H | Cape Verde | Saudi Arabia | **Home Win** | 39% | 29% | 32% |
| H | Uruguay | Spain | **Away Win** | 14% | 25% | 62% |
| J | Jordan | Argentina | **Away Win** | 6% | 14% | 80% |
| K | Colombia | Portugal | **Home Win** | 36% | 28% | 36% |
| L | Croatia | Ghana | **Home Win** | 68% | 21% | 11% |
| J | Algeria | Austria | **Home Win** | 39% | 27% | 34% |
| G | New Zealand | Belgium | **Away Win** | 14% | 22% | 64% |

> **Note on draws:** Egypt vs Iran (D=30%) and Norway vs France (D=26%) are the most draw-likely fixtures. No match is predicted as a draw because in all 12 cases either H% or A% exceeds D%, but draw probability is displayed to reflect real uncertainty.

### Group Winners & Runners-Up

| Group | Winner | Runner-up |
|---|---|---|
| A | Mexico | South Africa |
| B | Switzerland | Canada |
| C | Brazil | Morocco |
| D | United States | Australia |
| E | Germany | Ivory Coast |
| F | Netherlands | Japan |
| G | Iran | Belgium |
| H | Spain | Cape Verde |
| I | France | Norway |
| J | Argentina | Algeria |
| K | Colombia | Portugal |
| L | England | Croatia |

**Best 8 third-place qualifiers (greedy by pts→GD→GF):**
Egypt (G) · Ghana (L) · Sweden (F) · Ecuador (E) · Bosnia and Herzegovina (B) · Paraguay (D) · Austria (J) · South Korea (A)

---

## Knockout Bracket Simulation

For knockout rounds, draws are resolved by comparing `P(home_win)` vs `P(away_win)` — higher probability advances.

### Predicted Bracket Path

**Round of 32 → Round of 16 → Quarter-Finals → Semi-Finals → Final**

| Round | Match | Winner |
|---|---|---|
| SF 1 | France vs England | France |
| SF 2 | Spain vs Argentina | — |
| **Final** | **Spain vs Argentina** | **🏆 Argentina** |

### Predicted Champion
> ## 🏆 Argentina

---

## Monte Carlo Champion Probabilities

5,000 bracket simulations drawing outcomes from `predict_proba()` at every round:

| Rank | Team | Championship Probability |
|---|---|---|
| 1 | **Argentina** | **33.1%** |
| 2 | Spain | 23.1% |
| 3 | France | 12.1% |
| 4 | England | 7.2% |
| 5 | Colombia | 7.1% |
| 6 | Germany | 3.7% |
| 7 | Brazil | 3.5% |
| 8 | Morocco | 2.7% |
| 9 | Portugal | 2.1% |
| 10 | Netherlands | 1.0% |
| 11 | Norway | 0.9% |
| 12 | Mexico | 0.8% |
| 13 | Japan | 0.6% |
| 14 | Switzerland | 0.6% |
| 15 | Croatia | 0.4% |
| 16 | Iran | 0.3% |

> Probabilities renormalized after removing unresolvable bracket slots ("?" ≈ 4.2% of raw simulations). The "?" occurs when a third-place team slot cannot be deterministically assigned; redistributing it raises all real team probabilities by ~×1.044.

---

## Output Files

| File | Description |
|---|---|
| `Predictions.ipynb` | Main notebook — all code, models, and inline figures |
| `wc2026_group_stage.png` | Group stage board — all 72 matches (actual + predicted) with H%/D%/A% on predicted rows |
| `wc2026_bracket.png` | Full Round of 32 → Final bracket tree with flags and win probabilities |
| `wc2026_champion_probs.png` | Monte Carlo championship probability chart — flags before team names |
| `predictions.md` | This document |

---

## Notebook Structure

| Cell | Section | Content |
|---|---|---|
| 0 | Setup & Data Loading | Imports, flag utilities, CSV loading |
| 1 | ELO + Rolling Form | ELO snapshot loop + deque-based rolling form |
| 2 | Feature Assembly | Feature matrix, target encoding, temporal split |
| 3 | Model Training | Logistic Regression + XGBoost + feature importance |
| 4 | Prediction Helpers | `predict_probs()`, sanity checks |
| 5 | WC2026 Group Predictions | Load CSV, predict 12 remaining group matches (draws possible) |
| 6 | Group Standings | Build complete standings (actual + predicted) |
| 7 | Bracket Simulation | Resolve placeholders, simulate R32→Final |
| 8 | Figure 1 | Group stage board — draws in amber, H%/D%/A% on predicted rows |
| 9 | Figure 2 | Full knockout bracket (30×22 in, dpi=130) |
| 10 | Figure 3 | Champion probabilities — flags before names (18×11 in, dpi=160) |

---

## Key Design Decisions

- **Temporal split only** — no random shuffling, preserving time-series integrity
- **ELO at match time** — captures the rating *before* the update (correct no-leakage approach)
- **Draws are real outcomes** — group stage predictions use full 3-class output; draw is assigned when P(draw) > P(home_win) and P(draw) > P(away_win)
- **Knockout draw resolution** — when model says draw in a KO match, the team with higher `P(win)` advances
- **3rd-place bracket slots** — greedy assignment of best available qualifying 3rd-place team from each eligible group
- **Monte Carlo** — 5,000 simulations; probabilities weighted by `predict_proba()` at each round

---

## Limitations & Future Improvements

- **Player availability** — injuries, suspensions not modeled
- **Exact scoreline** — add a Poisson regression head for goal totals
- **Host nation advantage** — USA/Canada/Mexico all play "home" but are modeled as neutral
- **Retraining on WC2026 group results** — model could be fine-tuned on the 60 completed matches for better knockout predictions
- **Ensemble** — combining Logistic Regression and XGBoost probabilities may improve calibration
