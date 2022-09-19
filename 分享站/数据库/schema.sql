DROP DATABASE IF EXISTS hogwarts_yingge_zhou;
CREATE DATABASE hogwarts_yingge_zhou;

use hogwarts_yingge_zhou;

DROP TABLE IF EXISTS houses;
create table houses (
  id serial primary key,
  name varchar(50) not null
);

DROP TABLE IF EXISTS parents;
create table parents (
  id serial primary key,
  name varchar (50)
);

DROP TABLE IF EXISTS students;
create table students (
  id serial primary key,
  name varchar(50) not null,
  year integer not null,
  house_id integer references houses(id)
);

DROP TABLE IF EXISTS teachers;
create table teachers (
  id serial primary key,
  name varchar(50),
  house_id integer references houses(id)
);

DROP TABLE IF EXISTS classes;
create table classes (
  id serial primary key,
  subject varchar(50),
  teacher_id integer
);

DROP TABLE IF EXISTS par_child_rels;
create table par_child_rels (
  id serial primary key,
  student_id integer,
  parent1_id integer,
  parent2_id integer
);

DROP TABLE IF EXISTS class_rosters;
create table class_rosters (
  class_id integer,
  student_id integer
);
