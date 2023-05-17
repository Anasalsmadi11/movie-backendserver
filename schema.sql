-- DROP TABLE IF EXISTS memes;
-- CREATE TABLE IF NOT EXISTS memes (
--     id SERIAL PRIMARY KEY,
--     image_path VARCHAR(255),
--     meme_name VARCHAR(255),
--     rank INTEGER,
--     tags VARCHAR(255),
--     top_text VARCHAR(255)
-- );
drop table if exists movielist;
create table if not exists movielist(
    id serial primary key,
    title varchar(255),
    releasedate varchar(255),
    posterpath VARCHAR(255),
    overview varchar(255)
);