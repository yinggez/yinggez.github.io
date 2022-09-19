use xiagu;
drop table if exists 英雄;
create table 英雄(
yx_id int(225) primary key,
名称 varchar(2500),
被动技能 varchar(20),
主动技能 varchar(50),
分类 varchar(10),
适合路线 varchar(10)
);
drop table if exists 英雄详细一;
create table 英雄详细一(
xx_id int(225) primary key,
名称 varchar(1000),
皮肤 varchar(1000),
生存能力 varchar(1000),
攻击伤害 varchar(1000),
上手难度 varchar(1000),
技能效果 varchar(1000)
);
drop table if exists 英雄详细二;
create table 英雄详细二(
xy_id int(225) primary key,
铭文搭配推荐 varchar(1000),
召唤师技能推荐 varchar(1000),
推荐出装一 varchar(1000),
推荐出装二 varchar(1000),
最佳搭档 varchar(1000),
压制英雄 varchar(1000),
被压制英雄 varchar(1000)
);
drop table if exists 装备;
create table 装备(
wq_id int(255) ,
名称 varchar(1000),
技能 varchar(1000),
属性 varchar(1000),
总价 varchar(1000),
分类 varchar(1000),
售价 varchar(1000)
);
