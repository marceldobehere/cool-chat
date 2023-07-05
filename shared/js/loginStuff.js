async function checkLoggedInStatus()
{
    let obj = CookieRead();
    let sessionReplyPromise = new Promise(resolve =>
    {
        socket.on('session', (obj2) => {
            //console.log(`GOT DATA REPLY:`);
            //console.log(obj);
            resolve(obj2);
        });
    });

    socket.emit('session',
        {"action":"get data", "session":obj["session"]}
    );

    let sessionReply = await sessionReplyPromise;

    //console.log(sessionReply);
    obj["loggedIn"] = sessionReply["valid"];
    CookieWrite(obj);
}

//checkLoggedInStatus();

async function logOff()
{
    let obj = CookieRead();

    let logOffReplyPromise = new Promise(resolve =>
    {
        socket.on('logoff', (obj) => {
            resolve(obj);
        });
    });

    socket.emit('logoff', {"session":obj["session"]});

    await logOffReplyPromise;

    obj["loggedIn"] = false;
    obj["session"] = 0;
    CookieWrite(obj);
    await checkLoggedInStatus();
}