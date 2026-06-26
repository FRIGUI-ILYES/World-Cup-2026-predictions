# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A static CSV dataset of international men's football (soccer) match results from 1872 to 2024. There are no build steps, no tests, and no code — contributions are data-only via pull requests.

## Dataset Structure

Four CSV files form a relational dataset, joinable on `date + home_team + away_team`:

| File | Primary content |
|---|---|
| `results.csv` | One row per match — scores, tournament, venue, neutral flag |
| `goalscorers.csv` | One row per goal — scorer, minute, own_goal, penalty flags |
| `shootouts.csv` | One row per shootout — winner, first_shooter |
| `former_names.csv` | Country name changes over time — current, former, date range |

## Key Data Conventions

- **Team names** use the *current* name of the team, even for historical matches (e.g. Northern Ireland for pre-1921 Ireland matches), to make per-team history easy to track.
- **Country names** (venue column in `results.csv`) use the name *at the time of the match*, so a team's home country name may differ from the team name in older records.
- `home_score` / `away_score` include extra time but **exclude** penalty shootouts. Check `shootouts.csv` for the shootout winner when scores are level.
- The `neutral` column is `TRUE`/`FALSE` (not 0/1).
- `own_goal` and `penalty` in `goalscorers.csv` are `TRUE`/`FALSE`.

## Contributing

To fix or add data, edit the relevant CSV(s) and submit a pull request. Sources include Wikipedia, rsssf.com, and individual football associations' websites.
