const express = require('express');
const Database = require('./util/database');
const { rotas } = require('./api/admin');

Database.conectar();

const app = express();

app.use(express.json());

rotas(app);

app.listen(8070, function(){
    console.log('Servidor iniciado na porta 8070');
});