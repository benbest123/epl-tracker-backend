import dotenv from "dotenv";
dotenv.config();

import { query } from "../config/db.js";
import { fetchSquad } from "../services/footballApi.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const syncPlayers = async () => {
  console.log("🔄 Syncing players...");

  // Get all team ids from the database
  const teamsResult = await query(`SELECT id FROM teams`);
  const teamIds: number[] = teamsResult.rows.map((row) => row.id);

  console.log(`Found ${teamIds.length} teams to sync players for...`);

  let upserted = 0;
  for (const teamId of teamIds) {
    const data = await fetchSquad(teamId);
    const players = data[0]?.players ?? [];

    for (const player of players) {
      await query(
        `INSERT INTO players (id, team_id, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET
           team_id = EXCLUDED.team_id,
           name    = EXCLUDED.name`,
        [player.id, teamId, player.name],
      );
      upserted++;
    }

    console.log(`  ✅ ${data[0]?.team.name}: ${players.length} players`);
    await sleep(7000); // wait 7 seconds between requests to stay under 10/min
  }

  console.log(`✅ Players synced: ${upserted}`);
  return upserted;
};

const isMain = process.argv[1]?.includes("syncPlayers");
if (isMain) {
  syncPlayers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to sync players:", err);
      process.exit(1);
    });
}
