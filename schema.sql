drop table if exists matches;
create table matches (
  id INTEGER primary key autoincrement,
  game_title VARCHAR(255) not null,
  game_url VARCHAR(255),
  start_time TIMESTAMP not null,
  players_registered VARCHAR(512) not null default '',
  players_min INTEGER not null,
  players_max INTEGER not null,
  winner VARCHAR(64)
);
