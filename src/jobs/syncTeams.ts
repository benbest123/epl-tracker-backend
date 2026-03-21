import dotenv from "dotenv";
dotenv.config();

import { query } from "../config/db.js";
import { fetchTeams } from "../services/footballApi.js";

export const syncTeams = async () => {
  console.log("🔄 Syncing teams...");
  const data = await fetchTeams();

  let upserted = 0;
  for (const item of data) {
    const { team, venue } = item;

    await query(
      `INSERT INTO teams (id, name, code, country, founded, logo_url, venue_id, venue_name, venue_city, venue_capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name           = EXCLUDED.name,
         code           = EXCLUDED.code,
         country        = EXCLUDED.country,
         founded        = EXCLUDED.founded,
         logo_url       = EXCLUDED.logo_url,
         venue_id       = EXCLUDED.venue_id,
         venue_name     = EXCLUDED.venue_name,
         venue_city     = EXCLUDED.venue_city,
         venue_capacity = EXCLUDED.venue_capacity,
         updated_at     = NOW()`,
      [team.id, team.name, team.code, team.country, team.founded, team.logo, venue?.id ?? null, venue?.name ?? null, venue?.city ?? null, venue?.capacity ?? null],
    );
    upserted++;
  }

  console.log(`✅ Teams synced: ${upserted}`);
  return upserted;
};

// Allow running directly: npx ts-node src/jobs/syncTeams.ts
const isMain = process.argv[1]?.includes("syncTeams");
if (isMain) {
  syncTeams()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to sync teams:", err);
      process.exit(1);
    });
}
