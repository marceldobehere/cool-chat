async function writeLoginStat()
{
    await checkLoggedInStatus();
    await getUserData();
    let cookies = CookieRead();
    let loggedIn = cookies["loggedIn"];
    // if (loggedIn)
    //     document.getElementById("login-text").innerHTML = `LOGGED IN AS ${globalUserData["username"]}`;
    // else
    //     document.getElementById("login-text").innerHTML = `NOT LOGGED IN`;
    //
    // document.getElementById("login-text").style.color = loggedIn ? "green" : "red";
}

writeLoginStat();



async function doLogoff()
{
    await logOff();
    writeLoginStat();

    let errorField = document.getElementById("error-field");
    errorField.textContent = "Logoff successful!";
    errorField.style.color = "green";
}

async function doLogin()
{
    let form = document.getElementById("login-form");
    let usr = form["username"].value;
    let pwd = form["password"].value;

    if (usr == "" || pwd == "")
    {
        let errorField = document.getElementById("error-field");
        errorField.textContent = 'Please fill out all the data!';
        errorField.style.color = "var(--error)";
        return;
    }

    await logOff();

    //console.log(`TRY LOGIN: ${usr}`);
    socket.emit("login", {
        "action": "login",
        "username":usr,
        "password":pwd,
    });
}



socket.on('login', (obj) => {
    //console.log(`GOT LOGIN REPLY:`);
    //console.log(obj);
    let errorField = document.getElementById("error-field");

    if (obj["error"] == 0)
    {
        let session = obj["session"];
        let obj2 = CookieRead();
        obj2["loggedIn"] = true;
        obj2["session"] = session;
        //console.log(`LOGIN SUCCESSFUL: ${session}`);
        //console.log(obj2);
        CookieWrite(obj2);

        errorField.textContent = "Login successful!";
        errorField.style.color = "var(--success)";

        goPage('/home');
    }
    else
    {
        errorField.textContent = obj["error"];
        errorField.style.color = "var(--error)";
    }
    writeLoginStat();
});

function addKeyListenerYes()
{
    let form = document.getElementById("login-form");
    form["password"].addEventListener("keypress", function (event) {
        if (event.keyCode == 13) {
            doLogin();
        }
    });
}
addKeyListenerYes();