var globalUserData = {};
async function getUserData()
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

    globalUserData = {
        "username":sessionReply["username"],
        "email":sessionReply["email"],
        "profile-pic":sessionReply["profile-pic"],
        "session": obj["session"]
    };

    console.log(globalUserData);
}

//getUserData();