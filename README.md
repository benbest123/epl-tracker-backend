# ⚽ EPL Tracker — Backend

A Node.js/Express/Typescript backend service that syncs Premier League data from the Football API into a hosted PostgreSQL database and exposes a REST API for the frontend.

## Stack

- **Runtime**: Node.js (ESM modules)
- **Framework**: Express
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech))
- **Scheduler**: node-cron
- **Data source**: [api-football.com](https://www.api-football.com) (free tier: 100 req/day)

---
