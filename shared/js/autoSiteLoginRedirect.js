async function prepLoad()
{
    await checkLoggedInStatus();
    let obj = CookieRead();
    if (!obj["loggedIn"])
    {
        //alert("You are not logged in!");
        window.location.replace("/login/login.html");
    }
    await getUserData();
}

onModulesImported.push(prepLoad);