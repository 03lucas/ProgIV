const express = require('express');
const Database = require('./utils/database');
const cookieParser = require('cookie-parser');	
const adminRoutes = require('./api/admin');

Database.conectar();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/front', express.static('../front'));

globalThis.app = app;
app.session = {};

adminRoutes.rotas(app);

app.listen(8070, function(){
    console.log('Servidor iniciado na porta 8070');
});