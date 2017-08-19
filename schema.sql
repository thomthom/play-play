drop table if exists matches;
create table matches (
  id integer primary key autoincrement,
  game_title VARCHAR(255) not null,
  game_url VARCHAR(255),
  start_time TIMESTAMP not null,
  players_registered VARCHAR(512) not null,
  players_min integer not null,
  players_max integer not null,
  winner VARCHAR(64)
);
