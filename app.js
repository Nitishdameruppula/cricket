const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/players/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getFullTeamQuery = `SELECT * FROM cricket_team`;
  const CricketObject = await db.all(getFullTeamQuery);
  return response.send(CricketObject);
});

app.post("/players/", async (request, response) => {
  const inputDetails = request.body;
  const { playerName, jerseyNumber, role } = inputDetails;
  const addPlayersQuery = `INSERT INTO 
  cricket_team 
  (player_name,jersey_number,role) 
  VALUES ('${playerName}','${jerseyNumber}','${role}')`;
  const addPlayer = await db.run(addPlayersQuery);
  const player_id = addPlayer.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const OnePlayerDetails = `SELECT * FROM cricket_team WHERE player_id= ${playerId}`;
  const SinglePlayer = await db.get(OnePlayerDetails);
  response.send(SinglePlayer);
});

app.put("players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const InputDetails = request.body;
  const { playerName, jerseyNumber, role } = InputDetails;

  const updatePlayerDetails = `
    UPDATE 
      cricket_team
    SET 
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE 
      player_id = ${playerId}`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});
