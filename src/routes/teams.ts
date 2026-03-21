import type { Request, Response } from "express";
import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

// GET /api/teams
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM teams ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/teams error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/teams/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`SELECT * FROM teams WHERE id = $1`, [id]);

    if (!result.rows.length) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/teams/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/teams/:id/players
router.get("/:id/players", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`SELECT * FROM players WHERE team_id = $1 ORDER BY name ASC`, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/teams/:id/players error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
