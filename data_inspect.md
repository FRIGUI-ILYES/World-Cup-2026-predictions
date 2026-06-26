# Data_Inspect.ipynb — Reference Guide

Full documentation of the notebook: dataset variables, visualization objectives, and cell-by-cell descriptions.

---

## Dataset Variable Reference

### results.csv — one row per match

| Variable | Type | Description |
|---|---|---|
| `date` | date | Calendar date of the match (YYYY-MM-DD). |
| `home_team` | string | Name of the home team, using the team's **current** name even for historical matches. |
| `away_team` | string | Name of the away team, using the team's **current** name even for historical matches. |
| `home_score` | integer | Goals scored by the home team. Includes extra time; **excludes** penalty shootout goals. |
| `away_score` | integer | Goals scored by the away team. Includes extra time; **excludes** penalty shootout goals. |
| `tournament` | string | Name of the tournament or competition in which the match was played (e.g. "FIFA World Cup", "Friendly"). |
| `city` | string | City where the match was hosted. |
| `country` | string | Country where the match was hosted, using the name **at the time of the match** (may differ from the current country name). |
| `neutral` | boolean | `TRUE` if the match was played at a neutral venue (neither team's home country); `FALSE` otherwise. |

**Derived columns added during loading:**

| Variable | Description |
|---|---|
| `year` | Calendar year extracted from `date`. |
| `decade` | Decade of the match (e.g. 1990 for any year from 1990–1999). |
| `total_goals` | `home_score + away_score`. |
| `result` | `'home_win'`, `'away_win'`, or `'draw'` based on score comparison. |
| `category` | Broad tournament category: FIFA World Cup, UEFA, CONMEBOL, CAF, Friendly, or Other. Derived at load time via `categorise()`. |

---

### goalscorers.csv — one row per goal

| Variable | Type | Description |
|---|---|---|
| `date` | date | Date of the match in which the goal was scored. |
| `home_team` | string | Home team of the match (join key with `results.csv`). |
| `away_team` | string | Away team of the match (join key with `results.csv`). |
| `team` | string | Team for which the goal was scored (may differ from scorer's nationality for own goals). |
| `scorer` | string | Full name of the player who scored (or who caused the own goal). Missing for a small number of historical records. |
| `minute` | float | Match minute in which the goal was scored. Can exceed 90 for extra time. Missing for some older records. |
| `own_goal` | boolean | `TRUE` if the goal was an own goal (credited to the opposing team's score). |
| `penalty` | boolean | `TRUE` if the goal was scored from the penalty spot. |

**Derived columns added during loading:**

| Variable | Description |
|---|---|
| `year` | Calendar year extracted from `date`. |
| `decade` | Decade of the match. |
| `goal_type` | Categorical label: `'Own Goal'` when `own_goal` is `TRUE`, `'Penalty'` when `penalty` is `TRUE`, otherwise `'Normal'`. Priority: Own Goal > Penalty > Normal. |

---

### shootouts.csv — one row per penalty shootout

| Variable | Type | Description |
|---|---|---|
| `date` | date | Date of the match that went to a shootout. |
| `home_team` | string | Home team of the match (join key with `results.csv`). |
| `away_team` | string | Away team of the match (join key with `results.csv`). |
| `winner` | string | Team that won the penalty shootout. |
| `first_shooter` | string | Team that took the first penalty kick. Missing for many older records. |

**Derived columns added during loading:**

| Variable | Description |
|---|---|
| `year` | Calendar year extracted from `date`. |
| `first_won` | `TRUE` if the team that shot first also won the shootout (computed in the first-shooter analysis cell). |

---

### former_names.csv — one row per country name change

| Variable | Type | Description |
|---|---|---|
| `current` | string | The team's current name as used in `results.csv`, `goalscorers.csv`, and `shootouts.csv`. |
| `former` | string | A historical name the team was known by during the period defined by `start_date` and `end_date`. |
| `start_date` | date | First date on which the `former` name was used in competition. |
| `end_date` | date | Last date on which the `former` name was used in competition. |

This table is a lookup reference: it explains why a team may appear under a different name in external sources, while the three main CSVs always use `current`.

---

## Cell-by-Cell Descriptions

All cells are listed in notebook order (1-indexed, matching the Jupyter UI). Total: 43 cells.

> **Flag system (added 2026-06-26):** Cells 19, 20, 21, 33, and the WC 2026 dashboard cells now render national flag thumbnails fetched from `https://flagcdn.com/{size}/{code}.png`. The shared `TEAM_TO_CODE` mapping (177 entries) lives in the flag-utilities cell (Cell 38). Flags are cached in `_flag_cache` so each team is only downloaded once per kernel session. The helper `add_flags_barh(ax, teams)` uses a blended axes/data transform to place flags just left of the y-axis on horizontal bar charts without disturbing `tight_layout`. For the WC 2026 match-result board and group-standings table, flags are placed inline via `AnnotationBbox` with `xycoords=ax.transAxes`.

---

### Section 0 — Setup & Data Loading

**Cell 1** *(markdown)*
Title cell. Introduces the notebook and its scope: full inspection and visualization of the four international football CSV files.

**Cell 2** *(markdown)*
Section header: "Section 0 — Setup & Data Loading".

**Cell 3** *(code — imports)*
Imports `pandas`, `numpy`, `matplotlib`, `matplotlib.patches`, and `seaborn`. Sets the seaborn dark-grid theme, default DPI (110), and default figure size (12×5). Suppresses warnings.

**Cell 4** *(code — data loading & cleaning)*
Loads all four raw CSV files. Applies cleaning:

- **results**: drops the 18 rows with missing scores (future fixtures); casts scores to `int`; parses `date`; converts `neutral` to `bool` using a dual-key map `{True: True, False: False, 'TRUE': True, 'FALSE': False}` to handle both native Python booleans and strings that pandas may produce from CSV; derives `year`, `decade`, `total_goals`, and `result`.
- **category**: defines `categorise()` and applies it to `results['tournament']` to produce the `category` column (FIFA World Cup / UEFA / CONMEBOL / CAF / Friendly / Other). Derived here at load time so all later sections can use it without ordering dependencies.
- **goalscorers**: parses `date`; maps `own_goal` and `penalty` from raw CSV boolean values to Python `bool` (handling both string `'TRUE'`/`'FALSE'` and native Python `True`/`False` that pandas may produce); coerces `minute` to numeric; derives `year`.
- **shootouts**: parses `date`; derives `year`.

Prints a row/column count summary for all four DataFrames, plus the `neutral` value counts as a sanity check (expected: roughly 73% False, 27% True).

---

### Section 1 — Data Inspection

**Cell 5** *(markdown)*
Section header: "Section 1 — Data Inspection".

**Cell 6** *(code — dataset summary table)*
**Objective:** Give an at-a-glance overview of dataset size and temporal coverage.
Builds a table with one row per CSV file showing row count, column count, earliest date, and latest date.

**Cell 7** *(code — head & describe)*
**Objective:** Sanity-check raw data and types after loading.
Prints the first 3 rows and a `.describe()` statistical summary (count, mean, min, max) for `results`, `goalscorers`, and `shootouts`. Also displays the complete `former_names` table for reference.

**Cell 8** *(code — null value bar charts)*
**Objective:** Identify which columns need attention before analysis.
Draws three horizontal bar charts (one per major CSV) showing the percentage of missing values in each column. Bars are red where nulls exist, green where the column is fully populated. The `scorer`, `minute`, and `first_shooter` columns are the main sources of missingness.

---

### Section 2 — Match Results Overview

**Cell 9** *(markdown)*
Section header: "Section 2 — Match Results Overview".

**Cell 10** *(code — matches per year)*
**Objective:** Show how international football has grown from a handful of annual matches in the 19th century to hundreds per year today.
Area+line chart of the count of completed matches per year from 1872 to the present. Sharp dips around 1914–1918 and 1939–1945 correspond to the World Wars.

**Cell 11** *(code — goals per game by decade)*
**Objective:** Track whether international football has become more or less attacking over time.
Bar chart of the average total goals per match by decade. Color intensity increases with the decade index. The chart reveals the historically high-scoring 1880s–1890s era and a gradual defensive consolidation from the 1970s onward.

**Cell 12** *(code — home/away/draw donut charts)*
**Objective:** Quantify home advantage and show how it changes at neutral venues.
Side-by-side donut charts comparing match outcome distributions (Home Win / Draw / Away Win) for non-neutral vs. neutral venues. Percentage labels sit inside each wedge in white bold text. At neutral venues, the home team's structural advantage disappears: home win rate drops from ~51% to ~44% and away win rate rises toward parity.

**Cell 13** *(code — score distribution heatmap)*
**Objective:** Map the most and least common scorelines in international football.
Seaborn heatmap of `home_score × away_score` frequency with scores capped at 8+. The darkest cells (1–0, 2–0, 1–1, 2–1) are the modal scorelines; high-score cells are extremely rare.

---

### Section 3 — Tournament Breakdown

**Cell 14** *(markdown)*
Section header: "Section 3 — Tournament Breakdown".

**Cell 15** *(code — top 15 tournaments by match count)*
**Objective:** Show which competitions dominate the dataset.
Horizontal bar chart of the 15 most frequent tournaments, annotated with exact counts. Friendlies account for the large majority of all matches; FIFA World Cup qualifiers are a distant second.

**Cell 16** *(code — matches per decade by category)*
**Objective:** Reveal how the competitive calendar has evolved, from friendly-dominated early decades to a richer confederation structure.
Stacked area chart grouping all 200+ tournaments into six categories (FIFA World Cup, UEFA, CONMEBOL, CAF, Friendly, Other) by decade. Uses the `category` column derived at load time in Cell 4. The growth of confederation competitions since the 1950s–1960s is clearly visible.

**Cell 17** *(code — average goals per game by tournament)*
**Objective:** Find the highest-scoring competitions, controlling for match count.
Horizontal bar chart of the 15 highest-scoring tournaments (minimum 20 matches each), annotated with the exact mean and sample size. Tournaments in the chart tend to be smaller regional or era-specific competitions where defensive tactics were less developed.

---

### Section 4 — Top Teams & Goalscorers

**Cell 18** *(markdown)*
Section header: "Section 4 — Top Teams & Goalscorers".

**Cell 19** *(code — team win counts)*
**Objective:** Identify the most historically successful national teams by raw win count.
Combines home and away appearances into a single per-team record (matches, wins, win %). Plots a horizontal bar chart of the 20 most-winning teams with national flag thumbnails via `add_flags_barh`. Brazil, England, and Germany lead this list given their long histories and high match volumes.

**Cell 20** *(code — top 20 teams by goals scored)*
**Objective:** Show which teams have been the most prolific scorers in absolute terms.
Sums home goals and away goals per team. Plots the 20 highest-scoring teams as a horizontal bar chart annotated with exact totals and flag thumbnails. High match count and high win rate both contribute to a large goal total.

**Cell 21** *(code — win rate, top 25 teams)*
**Objective:** Find the most consistently dominant teams, normalized by match volume (min 50 matches).
Filters teams with at least 50 all-time appearances and ranks the top 25 by win percentage with flag thumbnails. This surface-controls for teams that played few games but won most of them.

**Cell 22** *(code — top 20 individual goalscorers)*
**Objective:** Rank the greatest international goal scorers of all time.
Counts goals per player, excluding own goals, and plots the 20 highest scorers. Cristiano Ronaldo leads with 123 goals; Harry Kane, Lewandowski, and Messi follow.

**Cell 23** *(code — goal type breakdown by decade)*
**Objective:** Show how the composition of goals (normal, penalty, own goal) has shifted over time.
Stacked area chart of Normal, Penalty, and Own Goal counts per decade using three distinct colors (green / orange / red). `goal_type` is assigned in priority order: Own Goal overrides Penalty, Penalty overrides Normal. The growing orange penalty band in recent decades reflects more competitive, tactically constrained matches.

**Cell 24** *(code — goal minute distribution)*
**Objective:** Reveal when within a match goals are most likely to occur.
Histogram of goal minute (capped at 120') with dashed vertical lines at 45' (half-time) and 90' (full-time). The spikes at minutes 45 and 90 reflect goals scored in added time, which are binned into those exact minutes.

---

### Section 5 — Shootout & Penalty Stats

**Cell 25** *(markdown)*
Section header: "Section 5 — Shootout & Penalty Stats".

**Cell 26** *(code — top 10 shootout wins)*
**Objective:** Identify which nations are the most successful in penalty shootouts.
Horizontal bar chart of the 10 teams with the most all-time shootout victories, drawn from `shootouts.csv`. South Korea, Argentina, and Egypt share the top spot with 15 wins each.

**Cell 27** *(code — first-shooter advantage)*
**Objective:** Test whether the team that takes the first penalty in a shootout has a statistically meaningful advantage.
For all shootouts with a recorded `first_shooter`, computes the win rate of the team that went first vs. second. Displayed as two adjacent bars. The first shooter wins 53.1% of the time (n=256), confirming a modest but real psychological advantage.

**Cell 28** *(code — shootouts per year)*
**Objective:** Show whether penalty shootouts have become more common as the competitive calendar has grown.
Bar chart of the number of shootouts per year. Volume naturally increases from the late 1960s onward as more knockout-format tournaments were introduced across all confederations.

**Cell 29** *(code — penalty goal share by team)*
**Objective:** Compare how heavily each top-20 scoring team relies on penalty kicks relative to their total goal output.
For each of the 20 highest goal-scoring teams, computes `penalty goals / total goals × 100`. Displayed as a horizontal bar chart sorted by ascending penalty share. Denmark and Austria rely most heavily on penalties (~8.5%); Japan and Thailand the least (~5%).

**Cell 30** *(code — own goal rate per year)*
**Objective:** Track whether own goals have become more or less frequent over the history of the dataset.
Raw annual own-goal rate (own goals as % of all goals) plotted as semi-transparent bars, overlaid with a 5-year centered rolling average line. The rolling average shows a gradual upward trend from the 1960s to the present, reaching ~3–4% in recent years.

---

### Section 6 — ELO Ratings

**Cell 31** *(markdown)*
Section header: "Section 6 — ELO Ratings".

**Cell 32** *(code — ELO computation)*
**Objective:** Produce a data-driven ranking of all national teams that accounts for opponent quality, venue, and match importance.
Implements an ELO rating system from scratch over all completed matches in chronological order:
- Every team starts at **1500**.
- **K-factor varies by tournament category**: FIFA World Cup = 60, UEFA/CONMEBOL/CAF = 40, Other = 35, Friendly = 20. This weights tournament results more heavily than friendlies.
- **Home advantage**: +100 effective ELO added to the home team's rating before computing expected score. Skipped when `neutral = True`.
- Expected score: `E_h = 1 / (1 + 10^((ea - (eh + home_bonus)) / 400))`.
- After each match, both teams' ratings are updated by `K × (actual − expected)`.
- Iteration uses `.to_dict('records')` instead of `iterrows()` for ~5–10× faster execution.
- Full rating history is stored per team for the trajectory chart.

Prints the current top-10 ELO-rated teams.

**Cell 33** *(code — current ELO top 20)*
**Objective:** Show the current pecking order of international football using ELO.
Horizontal bar chart of the 20 highest-rated teams at the end of the dataset, using a plasma color gradient. Exact ratings are annotated and flag thumbnails are placed via `add_flags_barh`. Argentina (2090), Spain (2072), and France (2050) lead, reflecting recent World Cup and continental championship performances.

**Cell 34** *(code — ELO history, top 8 teams)*
**Objective:** Show how the relative strength of the leading nations has evolved over more than a century of football.
Line chart of the ELO trajectory of the 8 currently top-rated teams from their first match to the present. A dotted gray line marks the 1500 baseline. Divergence above the baseline indicates sustained dominance; dips reveal periods of underperformance.

**Cell 35** *(code — ELO distribution, all teams)*
**Objective:** Show the spread of current team quality across all nations ever recorded.
Histogram of current ELO ratings across all 336 teams with vertical lines marking the 1500 starting value and the current mean. The mean sits exactly at 1500, confirming the ELO system is correctly zero-sum across all teams.

---

### Section 7 — FIFA World Cup 2026 Live Results Dashboard

**Cell 36** *(markdown)*
Section header: "Section 7 — FIFA World Cup 2026 Live Results Dashboard".

**Cell 37** *(code — WC 2026 data loading)*
Loads `data/worldcup2026_clean.csv`, parses `match_datetime`, and maps `finished` to Python bool. Splits into `finished` (all completed matches) and `group_matches` (group-stage only). Prints counts, groups with data, total goals, and average goals per game.

**Cell 38** *(code — flag utilities)*
Shared utility cell for all WC 2026 visualizations. Defines:
- `TEAM_TO_CODE` — dict of 177+ team-name → ISO 3166-1 alpha-2 country code mappings (supports subdivision codes `gb-eng`, `gb-sct`, `gb-wls`, `gb-nir` for UK home nations).
- `_flag_cache` — module-level dict that memoises downloaded images so each flag URL is fetched at most once per kernel session.
- `get_flag_img(team, size='32x24')` — fetches a PNG from `https://flagcdn.com/{size}/{code}.png`, reads it via `mpimg.imread`, returns a NumPy array or `None` on failure.
- `add_flags_barh(ax, teams, zoom=0.55, x_offset=-0.01)` — places `OffsetImage` flag thumbnails just left of the y-axis for any horizontal bar chart using a blended `(ax.transAxes, ax.transData)` transform, so flags remain visually aligned regardless of data scale.

**Cell 39** *(code — group stage match results board)*
**Objective:** Display every completed group-stage match in a card-based grid, one panel per group.
Draws 12 subplots (4 columns × 3 rows). Each card shows: home-team flag + name, score, away-team name + flag, matchday, and date. Card background tints blue/red/grey according to home win / away win / draw. Bold team name indicates winner; dark center text shows the result color.

**Cell 40** *(code — group standings table)*
**Objective:** Show the live league table for each group after all completed matches.
Renders 12 standalone axes as styled tables with: colored rank badge (gold/silver/bronze/grey), flag thumbnail, team name, and columns MP W D L GF GA GD PTS. Teams are sorted by points → goal difference → goals scored. Points column is highlighted in yellow. The separator line uses `ax.axhline` in data coordinates (ylim 0–1, so data = axes fraction).

**Cell 41** *(code — goals analysis: per-group totals + result donut)*
**Objective:** Summarise goal scoring patterns and match outcome distribution across all group-stage matches.
Left panel: bar chart of total goals per group, labeled with count and goals-per-game average; a dashed line marks the cross-group average. Right panel: donut chart of match result split (Home Win / Draw / Away Win) with percentage labels.

**Cell 42** *(code — WC 2026 top performers)*
**Objective:** Identify the strongest teams so far by points and by goal difference across all groups.
Two horizontal bar charts: top 15 teams by points (colored by group) and top 15 by goal difference (green/red for positive/negative). Both charts include flag thumbnails via `add_flags_barh`.

**Cell 43** *(code — scoreline heatmap + goals-per-matchday timeline)*
**Objective:** Surface fine-grained patterns in WC 2026 scoring.
Left panel: heatmap of home × away scoreline frequencies (capped at 6+). Right panel: scatter of total goals per match (with jitter) overlaid with a line of average goals per matchday, labeled with exact averages.
