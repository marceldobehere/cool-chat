let app;
let io;
let sessionStuff;
let dbStuff;


function initApp(_app, _io, _sessionStuff, _dbStuff)
{
    app = _app;
    io = _io;
    sessionStuff = _sessionStuff;
    dbStuff = _dbStuff;


    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            //console.log("User disconnected");
            let sessionObj = sessionStuff.getSessionFromSocket(socket);
            if (sessionObj)
            {
                sessionObj["session"]["socket"] = undefined;
                sessionStuff.updateSession(sessionObj["id"], sessionObj["session"]);
                //console.log(`> User disconnected: ${sessionObj["session"]["username"]}`);
            }
        });

        socket.on('settings-account', (obj) => {
        let session = obj["session"];
        let action = obj["action"];

            if (action == "update")
            {
                let username = sessionStuff.getUserNameFromSession(session);
                if (!username)
                {
                    let data = obj["data"];
                    let errorObj = {valid:false, action:action, data:data, error:"Invalid Session"};
                    console.log(errorObj);
                    socket.emit("settings-account", errorObj);
                    return;
                }
                let tempSession = sessionStuff.getSessionFromId(session);
                tempSession["socket"] = socket;
                sessionStuff.updateSession(session, tempSession);
                //console.log(`> User connected: ${username}`);
                let data = obj["data"];
                let dbEntry = dbStuff.getUser(username);
                if (dbEntry)
                {
                    console.log('FIELD:')
                    console.log(data);
                    let field = data["field"];
                    let error = undefined;
                    if (field == "pfp")
                    {
                        let pfp = data["data"];
                        dbEntry["profile-pic"] = pfp;
                        dbStuff.saveUser(dbEntry);
                    }
                    else if (field == "email")
                    {
                        let email = data["data"];
                        dbEntry["email"] = email;
                        dbStuff.saveUser(dbEntry);
                    }
                    else
                    {
                        error = "invalid field";
                    }


                    socket.emit("settings-account",
                        {
                            valid:(!error),
                            error:error,
                            action:action,
                            data:data
                        });
                    return;
                }
                else
                {
                    let data = obj["data"];
                    let errorObj = {valid:false, action:action, data:data, error:"Invalid User"};
                    console.log(errorObj);
                    socket.emit("settings-account", errorObj);
                    return;
                }
            }
            });

        socket.on('session', (obj) => {
            let session = obj["session"];
            let action = obj["action"];
            //console.log(`> User Session Stuff: Action: \"${action}\", Session: \"${session}\"`);
            if (action == "get data")
            {
                let username = sessionStuff.getUserNameFromSession(session);
                if (!username)
                {
                    socket.emit("session", {valid:false});
                    return;
                }
                let tempSession = sessionStuff.getSessionFromId(session);
                tempSession["socket"] = socket;
                sessionStuff.updateSession(session, tempSession);
                //console.log(`> User connected: ${username}`);

                let dbEntry = dbStuff.getUser(username);
                if (dbEntry)
                {
                    socket.emit("session",
                        {
                            valid:true,
                            "username":username,
                            "email":dbEntry["email"],
                            "profile-pic":dbEntry["profile-pic"],
                            "id":dbEntry["id"]
                        });
                    return;
                }
                else
                {
                    sessionStuff.deleteSession(session);
                    socket.emit("session", {valid:false});
                    return;
                }
            }

        });
    });

}

module.exports = {initApp};