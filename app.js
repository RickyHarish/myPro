const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    app.listen(3000, () => {
      console.log("surver running at http://localhost:3000");
    });

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const moviePostQuery = `INSERT INTO movie (movie_id, director_id, movie_name, lead_actor) VALUES (${null}, ${directorId}, ${movieName}, ${leadActor});`;
  const dbResponse = await db.run(moviePostQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieArray = await db.get(getMovieQuery);
  response.send(movieArray);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `UPDATE movie SET movie_id = ${movieId}, ${directorId}, ${movieName}, ${leadActor};`;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const directorArray = await db.get(getDirectorsQuery);

  response.send(directorArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const getMoviesOfDirector = `SELECT * FROM director LEFT JOIN movie ON movie.director_id = director.director_id`;
  const array = await db.all(getMoviesOfDirector);
  response.send(array);
});

module.exports = app;
