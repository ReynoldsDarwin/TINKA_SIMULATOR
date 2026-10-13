
create table users(
    id int serial primary key,
    nombres varchar(100) null,
    apellidos varchar(100) null,
    dni varchar(100) unique null,
    n1 int not null,
    n2 int not null,
    n3 int not null, 
    n4 int not null,
    n5 int not null,
    n6 int not null,
);