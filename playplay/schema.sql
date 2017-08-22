drop table if exists matches;
create table matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_title VARCHAR(255) NOT NULL,
  game_url VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  play_time_min INTEGER NOT NULL,
  play_time_max INTEGER,
  players_registered VARCHAR(512) NOT NULL DEFAULT '',
  players_min INTEGER NOT NULL,
  players_max INTEGER NOT NULL,
  winner VARCHAR(64)
);

drop table if exists games;
create table games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_title VARCHAR(255) NOT NULL UNIQUE,
  game_url VARCHAR(255),
  play_time_min INTEGER NOT NULL,
  play_time_max INTEGER,
  players_min INTEGER NOT NULL,
  players_max INTEGER NOT NULL
);
