'use strict'

// Cargar módulos de node para crear servidor
var express = require('express');
var bodyParser = require ('body-parser');
var article_routes = require ('./routes/article');

// Ejecutar express (http)
var app = express();

// Cargar ficheros rutas

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Cargar rutas
app.use('/api', article_routes);

// Exportar modulo (fichero acutal)
module.exports = app;