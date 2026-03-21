import dotenv from "dotenv";
dotenv.config();

import { query } from "../config/db.js";
import { fetchFixtures } from "../services/footballApi.js";

export const syncFixtures = async () => {
  console.log("🔄 Syncing fixtures...");
  const data = await fetchFixtures();

  console.log(`API returned ${data.length} fixtures`);

  let upserted = 0;
  for (const item of data) {
    const { fixture, league, teams, goals, score } = item;

    await query(
      `INSERT INTO matches (
        id, season, round, match_date, status, elapsed, referee,
        venue_name, venue_city,
        home_team_id, away_team_id,
        home_goals, away_goals,
        home_goals_ht, away_goals_ht,
        home_goals_et, away_goals_et,
        home_goals_pen, away_goals_pen
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (id) DO UPDATE SET
        status        = EXCLUDED.status,
        elapsed       = EXCLUDED.elapsed,
        home_goals    = EXCLUDED.home_goals,
        away_goals    = EXCLUDED.away_goals,
        home_goals_ht = EXCLUDED.home_goals_ht,
        away_goals_ht = EXCLUDED.away_goals_ht,
        home_goals_et = EXCLUDED.home_goals_et,
        away_goals_et = EXCLUDED.away_goals_et,
        home_goals_pen = EXCLUDED.home_goals_pen,
        away_goals_pen = EXCLUDED.away_goals_pen,
        updated_at    = NOW()`,
      [
        fixture.id,
        league.season,
        league.round ? parseInt(league.round.split(" - ")[1]) : null,
        fixture.date,
        fixture.status.short,
        fixture.status.elapsed ?? null,
        fixture.referee?.split(",")[0] ?? null,
        fixture.venue?.name ?? null,
        fixture.venue?.city ?? null,
        teams.home.id,
        teams.away.id,
        goals.home ?? null,
        goals.away ?? null,
        score.halftime.home ?? null,
        score.halftime.away ?? null,
        score.extratime.home ?? null,
        score.extratime.away ?? null,
        score.penalty.home ?? null,
        score.penalty.away ?? null,
      ],
    );
    upserted++;
  }

  console.log(`✅ Fixtures synced: ${upserted}`);
  return upserted;
};

const isMain = process.argv[1]?.includes("syncFixtures");
if (isMain) {
  syncFixtures()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to sync fixtures:", err);
      process.exit(1);
    });
}
