let app;
let io;
let sessionStuff;
let dbStuff;
const sec = require("./security.js");
const nodemailer = require('nodemailer');
var passwordResetLinks = [];
var hostname = "localhost";

function findPasswordResetLink(passwordSession)
{
    for (let i = 0; i < passwordResetLinks.length; i++)
    {
        if (passwordResetLinks[i]["password-session"] == passwordSession)
        {
            return passwordResetLinks[i];
        }
    }
    return undefined;
}

function initApp(_app, _io, _sessionStuff, _dbStuff)
{
    app = _app;
    io = _io;
    sessionStuff = _sessionStuff;
    dbStuff = _dbStuff;

    io.on('connection', (socket) => {
        socket.on("password-recover", (obj) => {
            let action = obj["action"];
            if (action == "recover-account")
            {
                let username = obj["username"];
                let email = obj["email"];
                console.log(`> User Password Recover Stuff: Action: \"${action}\", Username: \"${username}\", Email: \"${email}\"`);

                let tUser = dbStuff.getUser(username);
                if (!tUser)
                {
                    socket.emit("password-recover", {
                        action: action,
                        error:"User does not exist!"
                    });
                    return;
                }
                if (tUser["email"] != email)
                {
                    socket.emit("password-recover", {
                        action: action,
                        error:"Email does not match user!"
                    });
                    return;
                }

                let passwordResetSession = sessionStuff.getRandomIntInclusive(100000000,999999999);
                let resetUrl = hostname + `/reset-password/reset-password.html?password-session=${passwordResetSession}`;
                let tPasswordResetLink =
                    {
                        "username":username,
                        "email":email,
                        "password-session":passwordResetSession,
                        "url":resetUrl
                    };
                passwordResetLinks.push(tPasswordResetLink);
                console.log(tPasswordResetLink);

                const transporter = nodemailer.createTransport({
                    port: 465,               // true for 465, false for other ports
                    host: "smtp.gmail.com",
                    auth: {
                        user: 'gamenightgalore@gmail.com',
                        pass: 'mpqpxctkegwbecgb', //please fix (?) or use outlook
                    },
                    secure: true,
                });

                const mailData = {
                    from: 'gamenightgalore@gmail.com',  // sender address
                    to: email,   // list of receivers
                    subject: 'Password reset?',
                    text: `RESET LINK: ${resetUrl}`,
                    html: `<h1>Email Reset</h1><br><br>Click <a href=\"${resetUrl}\">here</a> to reset your password!<br>`
                };

                transporter.sendMail(mailData, function (err, info) {
                    if(err)
                    {
                        console.log(err);
                        socket.emit("password-recover", {
                            action: action,
                            error:"Sending recovery email failed!"
                        });
                    }
                    else
                    {
                        //console.log(info);
                        socket.emit("password-recover", {
                            action: action,
                            error:0
                        });
                    }
                });
                return;
            }
            else if (action == "reset-password")
            {
                let pass2 = sec.hashString(obj["password"]);
                let passSession = obj["session"];
                let action = obj["action"];
                console.log(`> User Password Reset Stuff: Action: \"${action}\", Password: \"${pass2}\", Password Session: \"${passSession}\"`);

                let tSession = findPasswordResetLink(passSession);
                //console.log(tSession);
                if (!tSession)
                {
                    socket.emit("password-recover", {
                        action: action,
                        error:"Session invalid!"
                    });
                }
                else
                {
                    passwordResetLinks.splice(passwordResetLinks.indexOf(tSession), 1);
                    let usr = dbStuff.getUser(tSession["username"]);
                    if (!usr)
                    {
                        socket.emit("password-recover", {
                            action: action,
                            error:"User does not exist!"
                        });
                        return;
                    }

                    usr["password"] = pass2;
                    dbStuff.saveUser(usr);


                    socket.emit("password-recover", {
                        action: action,
                        error:0
                    });
                }
                return;
            }
        });
    });
}



module.exports = {initApp};