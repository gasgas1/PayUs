const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');



const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const server = express();

server.use(logger('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));
server.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
/*server.use(cors({
    origin:['http://localhost:3000/'],
    methods:['GET','POST','PUT','DELETE'],
    credentials: true
}));*/

server.use('/', indexRouter);
server.use('/api', apiRouter);

//start dei pagamenti programmati
cronjob.init();

server.listen(3000);

//module.exports = server;




