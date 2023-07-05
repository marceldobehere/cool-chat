let app;
let io;
let sessionStuff;
let dbStuff;
const sec = require("./security.js");
const {getRandomIntInclusive} = require("./sessionStuff");


function initApp(_app, _io, _sessionStuff, _dbStuff)
{
    app = _app;
    io = _io;
    sessionStuff = _sessionStuff;
    dbStuff = _dbStuff;
    let ogTime = Date.now();

    io.on('connection', (socket) => {
        socket.on('register', (obj) => {
            let username = obj["username"];
            let email = obj["email"];
            let password = obj["password"];
            if (!password)
                password = "";
            password = sec.hashString(password);
            let action = obj["action"];
            console.log(`> User Register Stuff: Action: \"${action}\", Username: \"${username}\", Password (hash): \"${password}\"`);

            if (action == "register")
            {
                let currTime = Date.now();
                if (currTime > ogTime + 10000)
                {
                    let test = dbStuff.getUser(username);
                    if (test != undefined)
                        socket.emit("register", {action: action, error:"User already exists"});
                    else
                    {
                        ogTime = currTime;
                        dbStuff.addUser({username:username, email:email, password:password,'profile-pic':"default", id:getRandomIntInclusive(10000, 100000000)});
                        socket.emit("register", {action: action, error:0});
                    }
                }
                else
                {
                    socket.emit("register", {action: action, error:"Too many people registering at once. Please try again later."});
                }
            }
        });
    });
}

module.exports = {initApp, sec};