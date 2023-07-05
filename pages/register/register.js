async function doLogin()
{
    await logOff();
    let form = document.getElementById("register-form");
    let usr = form["username"].value;
    let pwd = form["password"].value;
    socket.emit("login", {
        "action": "login",
        "username":usr,
        "password":pwd,
    });
}

function CheckIfPasswordIsValid(dontCheckRepeatPass){
    let s = document.getElementsByName("password")[0];
    let ok = true;
    // checking if pw meets requirements
    // digit test
    let req_digit = document.getElementsByName("req-digit")[0];
    if (/\d/.test(s.value)){
        req_digit.className = "requirement_correct";
        req_digit.textContent = req_digit.textContent.replace("✗", "✓");
    }
    else {
        req_digit.className = "requirement_wrong";
        req_digit.textContent = req_digit.textContent.replace("✓", "✗");
        ok = false;
    }

    // letter test
    let req_letter = document.getElementsByName("req-letter")[0];
    if (/[a-z]/.test(s.value) && /[A-Z]/.test(s.value)){
        req_letter.className = "requirement_correct";
        req_letter.textContent = req_letter.textContent.replace("✗", "✓");
    }
    else {
        req_letter.className = "requirement_wrong";
        req_letter.textContent = req_letter.textContent.replace("✓", "✗");
        ok = false;
    }

    // special char test
    let req_special = document.getElementsByName("req-special")[0];
    if (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(s.value)){
        req_special.className = "requirement_correct";
        req_special.textContent = req_special.textContent.replace("✗", "✓");
    }
    else {
        req_special.className = "requirement_wrong";
        req_special.textContent = req_special.textContent.replace("✓", "✗");
        ok = false;
    }

    // length test
    let req_length = document.getElementsByName("req-length")[0];
    if (s.value.length >= 8){
        req_length.className = "requirement_correct";
        req_length.textContent = req_length.textContent.replace("✗", "✓");
    }
    else {
        req_length.className = "requirement_wrong";
        req_length.textContent = req_length.textContent.replace("✓", "✗");
        ok = false;
    }

    if (!dontCheckRepeatPass)
    {
        CheckIfPasswordIsTheSame();
    }

    return ok;
}

function CheckIfPasswordIsTheSame(){
    let s = document.getElementsByName("password-repeat")[0];
    let pwd = document.getElementsByName("password")[0];
    let errorElement = document.getElementById("password-repeat-error");
    let signUpBtn = document.getElementById("sign-up-btn");

    if (pwd.value !== s.value)
    {
        errorElement.innerText = "passwords don't match";
        signUpBtn.disabled = true;
    }
    else
    {
        errorElement.innerText = "";
        signUpBtn.disabled = !CheckIfPasswordIsValid(true);
    }
}

async function doRegister()
{
    let form = document.getElementById("register-form");
    let usr = form["username"].value;
    let eml = form["email"].value;
    let pwd = form["password"].value;
    let rpwd = form["password-repeat"].value;
    let errorField = document.getElementById("error-field")


    if (usr == "" || eml == "" || pwd == "")
    {
        errorField.textContent = 'Please fill out all the data!';
        errorField.style.color = "#5DD830";
        return;
    }

    
    const regex = new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,50}$')
    if (!regex.test(pwd)){
        errorField.innerHTML = "Password doesn't match the requirements";
        errorField.style.color = "#5DD830";
        return;
    }


    if (pwd !== rpwd){
        errorField.textContent = 'Passwords do not match';
        errorField.style.color = "#5DD830";
        return;
    }
    await logOff();


    //console.log(`TRY REGISTER: ${usr}`);
    socket.emit("register", {
        "action": "register",
        "username":usr,
        "email": eml,
        "password":pwd,
    });
}

socket.on('register', (obj) => {
    let errorField = document.getElementById("error-field");

    if (obj["error"] == 0)
    {
        errorField.textContent = "Register successful!";
        errorField.style.color = "green";
        doLogin();
    }
    else
    {
        errorField.textContent = obj["error"];
        errorField.style.color = "#5DD830";
    }
});

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
        goPage('/home');
/*      errorField.textContent = "Login successful!";
        errorField.style.color = "green";*/
    }
    else
    {
        errorField.textContent = obj["error"];
        errorField.style.color = "#5DD830";
    }
});

function addKeyListenerYes()
{
    let form = document.getElementById("register-form");
    form["password"].addEventListener("keypress", function (event) {
        if (event.keyCode == 13) {
            doRegister();
        }
    });
}
addKeyListenerYes();