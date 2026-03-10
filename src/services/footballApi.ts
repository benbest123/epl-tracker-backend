import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const client = axios.create({
  baseURL: process.env.FOOTBALL_API_BASE_URL ?? "",
  headers: {
    "x-apisports-key": process.env.FOOTBALL_API_KEY ?? "",
  },
  timeout: 10_000,
});

export const fetchTeams = async () => {
  const res = await client.get("/teams", {
    params: {
      league: process.env.EPL_LEAGUE_ID,
      season: process.env.EPL_SEASON,
    },
  });
  return res.data.response;
};

export const fetchFixtures = async () => {
  const res = await client.get("/fixtures", {
    params: {
      league: process.env.EPL_LEAGUE_ID,
      season: process.env.EPL_SEASON,
    },
  });
  return res.data.response;
};

export const fetchFixtureStats = async (fixtureId: number) => {
  const res = await client.get("/fixtures/statistics", {
    params: { fixture: fixtureId },
  });
  return res.data.response;
};

export const fetchFixtureEvents = async (fixtureId: number) => {
  const res = await client.get("/fixtures/events", {
    params: { fixture: fixtureId },
  });
  return res.data.response;
};

export const fetchSquad = async (teamId: number) => {
  const res = await client.get("/players/squads", {
    params: { team: teamId },
  });
  return res.data.response;
};

export const fetchPlayers = async (page: number = 1) => {
  const res = await client.get("/players", {
    params: {
      league: process.env.EPL_LEAGUE_ID,
      season: process.env.EPL_SEASON,
      page,
    },
  });
  return res.data;
};
