function _setCookie(cname, cvalue)
{
    let d = new Date();
    d.setTime(d.getTime() + (1000*24*60*60*1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + ";path=/;";
}

function CookieWrite(obj)
{
    let temp = encodeURIComponent(JSON.stringify(obj));
    _setCookie("data", temp);
    //console.log(`SETTING DATA: ${temp}`);
    //console.log(`COOKIE: ${document.cookie}`);
}
function CookieRead()
{
    let next = document.cookie;
    if (!next)
        next = "data=%7B%7D";
    let t = next.split('=');
    next = t[1];
    //console.log(`READING DATA: ${next}`)
    //console.log(`COOKIE: ${document.cookie}`);
    return JSON.parse(decodeURIComponent(next)) ;
}


function initStuff()
{
    if (!document.cookie || document.cookie == "")
        CookieWrite({});


    let obj = CookieRead();
    if (!obj["session"])
        obj["session"] = 0;
    if (!obj["loggedIn"])
        obj["loggedIn"] = false;


    CookieWrite(obj);
    console.log('> Cookie Init Complete')
}

initStuff();

