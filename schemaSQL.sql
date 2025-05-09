DROP TABLE IF EXISTS score;
DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS users;

create table movie (
	id SERIAL PRIMARY KEY,
	count INTEGER,
	dt_criacao TIMESTAMP DEFAULT NOW(),
	score FLOAT(53),
	image VARCHAR(255),
	title VARCHAR(255)
);

create table users (
	id SERIAL PRIMARY KEY,
	dt_criacao TIMESTAMP DEFAULT NOW(),
	email VARCHAR(255)
);

create table score (
	score_value FLOAT(53),
	dt_criacao TIMESTAMP DEFAULT NOW(),
	movie_id INTEGER not null,
	user_id INTEGER not null,
	primary key (movie_id, user_id),
	foreign key (movie_id) references movie(id),
	foreign key (user_id) references users(id)
);
