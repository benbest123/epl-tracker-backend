import dotenv from "dotenv";
dotenv.config();

import { query } from "../config/db.js";

const migrate = async () => {
  console.log("🚀 Running migrations...\n");

  // ─── Teams ────────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS teams (
      id                INTEGER PRIMARY KEY,
      name              VARCHAR(100) NOT NULL,
      code              VARCHAR(10),
      country           VARCHAR(50),
      founded           INTEGER,
      logo_url          TEXT,
      venue_id          INTEGER,
      venue_name        VARCHAR(100),
      venue_city        VARCHAR(100),
      venue_capacity    INTEGER,
      created_at        TIMESTAMP DEFAULT NOW(),
      updated_at        TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ teams");

  // ─── Players ──────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS players (
      id          INTEGER PRIMARY KEY,
      team_id     INTEGER REFERENCES teams(id) ON DELETE SET NULL,
      name        VARCHAR(100) NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ players");

  // ─── Matches ──────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS matches (
      id                INTEGER PRIMARY KEY,
      season            INTEGER NOT NULL,
      round             VARCHAR(50),
      match_date        TIMESTAMPTZ,
      status            VARCHAR(10),
      elapsed           INTEGER,
      referee           VARCHAR(100),
      venue_name        VARCHAR(100),
      venue_city        VARCHAR(100),
      home_team_id      INTEGER REFERENCES teams(id),
      away_team_id      INTEGER REFERENCES teams(id),
      home_goals        INTEGER,
      away_goals        INTEGER,
      home_goals_ht     INTEGER,
      away_goals_ht     INTEGER,
      home_goals_et     INTEGER,
      away_goals_et     INTEGER,
      home_goals_pen    INTEGER,
      away_goals_pen    INTEGER,
      result VARCHAR(10) GENERATED ALWAYS AS (
        CASE
          WHEN home_goals IS NULL OR away_goals IS NULL THEN NULL
          WHEN home_goals > away_goals THEN 'home'
          WHEN away_goals > home_goals THEN 'away'
          ELSE 'draw'
        END
      ) STORED,
      created_at        TIMESTAMP DEFAULT NOW(),
      updated_at        TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ matches");

  // ─── Match Events ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS match_events (
      id          SERIAL PRIMARY KEY,
      match_id    INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      team_id     INTEGER REFERENCES teams(id),
      player_id   INTEGER REFERENCES players(id) ON DELETE SET NULL,
      assist_id   INTEGER REFERENCES players(id) ON DELETE SET NULL,
      elapsed     INTEGER NOT NULL,
      extra_time  INTEGER,
      type        VARCHAR(20) NOT NULL,
      detail      VARCHAR(50),
      comments    VARCHAR(200),
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ match_events");

  console.log("\n🎉 All migrations complete!");
  process.exit(0);
};

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
