DROP DATABASE IF EXISTS epytodo;
create database epytodo;

use epytodo;

CREATE TABLE IF NOT EXISTS epytodo.user (
    id int NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    create_at datetime NOT NULL DEFAULT NOW(),
    CONSTRAINT id PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS epytodo.todo (
    id int NOT NULL AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    description varchar(255) NOT NULL,
    create_at datetime NOT NULL DEFAULT NOW(),
    due_time datetime NOT NULL,
    user_id int unsigned NOT NULL,
    CONSTRAINT id PRIMARY KEY (id)
);
