import type { Request, Response } from "express";
import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/matches
// Query params: status=FT|NS|LIVE, round=<string>
router.get("/", async (req: Request, res: Response) => {
  try {
    const { round } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (round) {
      params.push(round);
      conditions.push(`m.round = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT
        m.*,
        ht.name AS home_team_name, ht.logo_url AS home_team_logo,
        at.name AS away_team_name, at.logo_url AS away_team_logo
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      ${where}
      ORDER BY m.match_date DESC`,
      params,
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/matches error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/matches/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const matchResult = await query(
      `SELECT
        m.*,
        ht.name AS home_team_name, ht.logo_url AS home_team_logo,
        at.name AS away_team_name, at.logo_url AS away_team_logo
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.id = $1`,
      [id],
    );

    if (!matchResult.rows.length) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const eventsResult = await query(
      `SELECT
        e.*,
        p.name AS player_name,
        a.name AS assist_name,
        t.name AS team_name
      FROM match_events e
      LEFT JOIN players p ON p.id = e.player_id
      LEFT JOIN players a ON a.id = e.assist_id
      LEFT JOIN teams t ON t.id = e.team_id
      WHERE e.match_id = $1
      ORDER BY e.elapsed ASC`,
      [id],
    );

    res.json({
      match: matchResult.rows[0],
      events: eventsResult.rows,
    });
  } catch (err) {
    console.error("GET /api/matches/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
