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
       socket.on('room', (obj) => {
           let action = obj["action"];
           if (action == "query")
           {
               let sessions = sessionStuff.sessionList;
               let found = [];
               for (let session of sessions)
               {
                   //console.log(session);
                   let hostedRoom = session[1]["hosting-room"];
                   if (hostedRoom == undefined)
                       continue;
                   let tSocket = session[1]["socket"];
                   if (tSocket == undefined)
                       continue;
                   if (!hostedRoom["name"].startsWith(obj["query"]))
                       continue;

                   let roomData = {
                        name:hostedRoom["name"],
                        owner:hostedRoom["owner"],
                        description:hostedRoom["description"],
                        "player-count":hostedRoom["users"].length,
                        "selected-game":hostedRoom["selected-game"],
                        "max-player-count":hostedRoom["max-player-count"]
                   };
                   found.push(roomData);
               }

               //console.log(found);
               socket.emit("room", {action:action,found:found,error:0});
           }
           else if (action == "get room info")
           {
               let roomUsername = obj["username"];
               let sessions = sessionStuff.sessionList;
               for (let session of sessions)
               {
                   //console.log(session);
                   let hostedRoom = session[1]["hosting-room"];
                   if (hostedRoom == undefined)
                       continue;
                   let tSocket = session[1]["socket"];
                   if (tSocket == undefined)
                       continue;
                   let username = hostedRoom["owner"];
                   if (username != roomUsername)
                       continue;



                   let roomData = {
                       name:hostedRoom["name"],
                       owner:hostedRoom["owner"],
                       description:hostedRoom["description"],
                       "users":hostedRoom["users"],
                       "selected-game":hostedRoom["selected-game"],
                       "max-player-count":hostedRoom["max-player-count"]
                   };
                   //console.log("ROOM YES");
                   socket.emit("room", {action:action,data:roomData,error:0});
                   return;
               }
               socket.emit("room", {action:action,data:undefined,error:"Room not found!"});
           }
           else if (action == "update")
           {
               console.log(`> Room update: ${obj["session"]}, ${JSON.stringify(obj["data"])} `);
               let sessionObj = sessionStuff.getSessionFromId(obj["session"]);
               if (!sessionObj)
               {
                   socket.emit("room", {action:action,error:"invalid session"});
                   return;
               }

               if (sessionObj["hosting-room"] == undefined)
               {
                   socket.emit("room", {action:action,error:"Room does not exist!"});
                   return;
               }

               sessionObj["hosting-room"]["name"] = obj["data"]["name"];
               sessionObj["hosting-room"]["password"] = obj["data"]["password"];
               sessionObj["hosting-room"]["description"] = obj["data"]["description"];
               sessionObj["hosting-room"]["selected-game"] = obj["data"]["selected-game"];
               sessionObj["hosting-room"]["max-player-count"] = obj["data"]["max-player-count"];

               sessionObj["joined-room"] = sessionObj["username"];
               sessionStuff.updateSession(obj["session"], sessionObj);
               socket.emit("room", {action:action,error:0});
           }
           else if (action == "create")
           {
               console.log(`> Room creation: ${obj["session"]}, ${JSON.stringify(obj["data"])} `);

               let sessionObj = sessionStuff.getSessionFromId(obj["session"]);
               if (!sessionObj)
                {
                    socket.emit("room", {action:action,error:"invalid session"});
                    return;
                }

               if (sessionObj["hosting-room"] != undefined)
               {
                   socket.emit("room", {action:action,error:"Room already exists!"});
                   return;
               }
               sessionObj["hosting-room"] = {
                   name:obj["data"]["name"],
                   owner:sessionObj["username"],
                   password:obj["data"]["password"],
                   description:obj["data"]["description"],
                   users:[],
                   "selected-game":obj["data"]["selected-game"],
                   "max-player-count":obj["data"]["max-player-count"]
               };



               sessionObj["joined-room"] = sessionObj["username"];
               sessionStuff.updateSession(obj["session"], sessionObj);
               socket.emit("room", {action:action,error:0});
           }
           else if (action == "join")
           {

               socket.emit("room", {action:action,error:0});
           }
           else if (action == "leave")
           {
               console.log(`> Room deletion: ${obj["session"]}`);
               let sessionObj = sessionStuff.getSessionFromId(obj["session"]);
               if (!sessionObj)
               {
                   socket.emit("room", {action:action,error:"invalid session"});
                   return;
               }
               sessionObj["joined-room"] = undefined;
               sessionStuff.updateSession(obj["session"], sessionObj);
               socket.emit("room", {action:action,error:0});
           }
           else if (action == "delete")
           {
               console.log(`> Room deletion: ${obj["session"]}`);
               let sessionObj = sessionStuff.getSessionFromId(obj["session"]);
               if (!sessionObj)
               {
                   socket.emit("room", {action:action,error:"invalid session"});
                   return;
               }
               sessionObj["hosting-room"] = undefined;
               sessionObj["joined-room"] = undefined;
               sessionStuff.updateSession(obj["session"], sessionObj);
               socket.emit("room", {action:action,error:0});
           }
       });
    });
    // io.on('connection', (socket) => {
    //     socket.on('session', (obj) => {
    //         let session = obj["session"];
    //         let action = obj["action"];
    //         //console.log(`> User Session Stuff: Action: \"${action}\", Session: \"${session}\"`);
    //         if (action == "get data")
    //         {
    //             let username = sessionStuff.getUserNameFromSession(session);
    //             if (!username)
    //             {
    //                 socket.emit("session", {valid:false});
    //                 return;
    //             }
    //             let dbEntry = dbStuff.getUser(username);
    //             if (dbEntry)
    //             {
    //                 socket.emit("session",
    //                     {
    //                         valid:true,
    //                         "username":username,
    //                         "email":dbEntry["email"],
    //                         "profile-pic":dbEntry["profile-pic"]
    //                     });
    //                 return;
    //             }
    //             else
    //             {
    //                 sessionStuff.deleteSession(session);
    //                 socket.emit("session", {valid:false});
    //                 return;
    //             }
    //         }
    //
    //     });
    // });

}

module.exports = {initApp};