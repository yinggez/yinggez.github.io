Drop database if exists haha;
create database haha;
use haha;
drop table if exists label;
create table  label(
    name text not null,
    label_id integer
);
    
drop table if exists idol;
create table idol(
    id serial primary key,
    name text not null,
    team_id integer,
    age integer
);
drop table if exists team;
create table team(
    name text not null,
    team_id integer
);
drop table if exists team_label;
create table team_label(
      label_id integer,
      team_id integer
);

insert into label(name,label_id) values
('starship',1),
('sm',2),
('jyp',3),
('hybe',4);
insert into idol(name,team_id,age) values
('柳智敏',4,21),
('宁艺卓',4,19),
('金玟庭',4,20),
('内永亚绘里',4,21),
('孙胜完',5,28),
('裴珠泫',5,31),
('姜涩琪',5,28),
('joy',5,25),
('金艺琳',5,23),
('林娜琏',6,26),
('momo',6,25),
('俞定延',6,25),
('sana',6,25),
('朴志效',6,25),
('mina',6,25),
('金多贤',6,24),
('孙彩瑛',6,23),
('周子瑜',6,23),
('黄礼志',7,22),
('崔智秀',7,21),
('申留真',7,21),
('李彩领',7,21),
('申宥娜',7,18),
('张元英',1,17),
('安肴真',1,18),
('金智媛',1,17),
('直井怜',1,17),
('李瑞',1,14),
('金秋天',1,19),
('雪娥',2,27),
('恩熙',2,23),
('苞娜',2,26),
('吴宣仪',2,27),
('孟美岐',2,23),
('程萧',2,23),
('夏天',2,23),
('俞延静',2,22),
('EXY',2,26),
('李luda',2,25),
('南多愿',2,25),
('任多荣',2,23),
('朴秀彬',2,25),
('蔡亨源',3,28),
('李玟赫',3,28),
('基显',3,28),
('李周宪',3,27),
('Shownu',3,29),
('I.M',3,26),
('宫胁咲良',8,24),
('中村一叶',8,18),
('金采元',8,21),
('许允真',8,20),
('洪恩彩',8,15);
insert into team(name,team_id) values
('ive',1),
('宇宙少女',2),
('monstax',3),
('aespa',4),
('redvelvet',5),
('twice',6),
('itzy',7),
('lesserafim',8);
insert into team_label(team_id,label_id) values
(2,1),
(1,1),
(3,1),
(4,2),
(5,2),
(6,3),
(7,3),
(8,4);
select*from team_label;
select*from team;
select*from label;
select*from idol;
select 
t.name,
l.name as label_name
from team_label a
join team t
on t.team_id = a.team_id
join label l 
on l.label_id = a.label_id
    













