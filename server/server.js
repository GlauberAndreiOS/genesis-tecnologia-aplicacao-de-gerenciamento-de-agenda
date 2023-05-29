const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require("mysql");

var connection = mysql.createConnection({
	host: 'localhost',
	database: 'gtaga',
	user: 'root',
	password: '',
});

connection.connect();

app.use(express.json());
app.use(cors());

app.post('/agendamento', async (req, res) => {
    connection.query(`select * from agendamentos where medico = '${req.body.medico}' and data_agendamento = '${req.body.data_agendamento}'`, (err, result)=>{
        if(err){
            console.log(err)
        }else{
            if(result.length >= 1){
                res.send(JSON.stringify('Horário Indisponível para esse médico'))
            }else{
                if(req.body.tipo === 'editar'){
                    connection.query(`update agendamentos set nome = '${req.body.nome}', cpf = '${req.body.cpf}', cartaoSus = '${req.body.cartaoSus}', motivo = '${req.body.motivo}', data_agendamento = '${req.body.data_agendamento}', urgencia = '${req.body.urgencia}', medico = '${req.body.medico}', profissional = '${req.body.profissional}' where id = '${req.body.id}'`, (err, result)=>{
                        if(err){
                            res.status(500).send(JSON.stringify(err))
                            console.log(err)
                        }else{
                            res.send(JSON.stringify(result))
                        }
                    })
                }else{
                    connection.query(`insert into agendamentos (nome, cpf, cartaoSus, motivo, data_agendamento, urgencia, medico, profissional) values('${req.body.nome}', '${req.body.cpf}', '${req.body.cartaoSus}', '${req.body.motivo}', '${req.body.data_agendamento}', '${req.body.urgencia}', '${req.body.medico}', '${req.body.profissional}')`, (err, result)=>{
                        if(err){
                            res.status(500).send(JSON.stringify(err))
                            console.log(err)
                        }else{
                            res.send(JSON.stringify(result))
                        }
                    })
                }
            }
        }
    })
})

app.get('/agendamentos', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Methods", 'GET','OPTIONS')
    var filtro = `where data_agendamento >= '${req.query.filtro}'`
    var sql = `select * from agendamentos ${filtro}`
    connection.query(sql, (err, result) => {
        if(err){
            res.send(JSON.stringify(err))
        }else{
            res.send(JSON.stringify(result))
        }
    })
})

app.listen(3000, function(){
	console.log("Server is Running");
});