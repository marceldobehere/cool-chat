const fs = require('fs');
let app;
let io;
let dirName;


function initApp(_app, _io, _dirName)
{
    app = _app;
    io = _io;
    dirName = _dirName;
}

function getRedirect(url)
{
    if (!url.startsWith('/shared/') &&
        url.indexOf(".") == -1)
        return url + url + ".html";
    return undefined;
}

function getActualPath(url)
{
    // If url is shared it will go to shared directly and not to pages
    if (!url.startsWith('/shared/'))
        url = "/pages" + url;

    // No Escape
    url = url.replace("..", "");

    // Remove Query String
    if (url.indexOf("?") != -1)
        url = url.substring(0, url.indexOf("?"));// url.split("?")[0];

    let filePath = dirName + url;
    return filePath;
}

function serveFile(url, res)
{
    let redirect = getRedirect(url);
    if (redirect)
    {
        //console.log(`URL ${url} redirected to ${redirect}`);
        res.redirect(redirect);
        return;
    }

    let filePath = getActualPath(url);
    //console.log(`URL ${url} served from ${filePath}`)

    // send error if file doesnt exist
    if (!fs.existsSync(filePath))
    {
        console.log(`Path ${filePath} not found!`)
        res.status(404).send("File not found!");
        return;
    }

    //console.log(`Path ${filePath} found!`);
    prepAndSendFile(filePath, res);
}

function prepAndSendFile(filePath, res)
{
    res.sendFile(filePath);
}

module.exports = {initApp, serveFile};