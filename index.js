const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require("fs");

io.setMaxListeners(1000);

const fileServer = require("./yesServer/fileServer.js");
fileServer.initApp(app, io, __dirname);


app.get('/', (req, res) => {
    res.redirect('/home');
});


app.get('/*', (req, res) => {
    fileServer.serveFile(req.url, res);
});


const sessionStuff = require("./yesServer/sessionStuff.js");
sessionStuff.initApp(app, io);

const dbStuff = require("./yesServer/simpleDB.js");

const loginManager = require("./yesServer/loginHandling");
loginManager.initApp(app, io, sessionStuff, dbStuff);

const registerManager = require("./yesServer/registerHandling");
registerManager.initApp(app, io, sessionStuff, dbStuff);

const userManager = require("./yesServer/userManager.js");
userManager.initApp(app, io, sessionStuff, dbStuff);

const roomManager = require("./yesServer/roomManager.js");
roomManager.initApp(app, io, sessionStuff, dbStuff, userManager);

const shell = require("./yesServer/shell");
shell.initApp(sessionStuff, dbStuff, loginManager, registerManager, userManager);


server.listen(80, () => {
    console.log('listening on *:80');
});

shell.start();