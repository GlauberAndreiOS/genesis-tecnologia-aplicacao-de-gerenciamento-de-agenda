drop database if exists gtaga;
create database if not exists gtaga;
use gtaga;

drop table if exists agendamentos;
create table if not exists agendamentos(
	id int auto_increment primary key,
    nome char(100),
    cpf char(100),
    cartaoSus char(100),
    motivo char(255),
    data_agendamento datetime,
    urgencia char(10),
    medico char (100),
    profissional char(100)
);

insert into agendamentos (nome, cpf, cartaoSus, motivo, data_agendamento, urgencia, medico, profissional)
values ('Glauber', '053.764.121.13', '12345678', 'Retorno', '2023-05-27 16:32:27', 'urgente', 'Rodrigo', 'Vanessa');

select * from agendamentos