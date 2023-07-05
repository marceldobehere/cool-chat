const fs = require('fs');

function readAllUsers()
{
    const data = fs.readFileSync('./data/users.json', 'utf8');
    return JSON.parse(data);
}

function writeAllUsers(users)
{
    const data = JSON.stringify(users, null, 4);
    fs.writeFileSync('./data/users.json', data, 'utf8');
}

function readAllServers()
{
    const data = fs.readFileSync('./data/servers.json', 'utf8');
    return JSON.parse(data);
}

function writeAllServers(servers)
{
    const data = JSON.stringify(servers, null, 4);
    fs.writeFileSync('./data/servers.json', data, 'utf8');
}

function readAllChannels()
{
    const data = fs.readFileSync('./data/channels.json', 'utf8');
    return JSON.parse(data);
}

function writeAllChannels(channels)
{
    const data = JSON.stringify(channels, null, 4);
    fs.writeFileSync('./data/channels.json', data, 'utf8');
}

function readAllMessages()
{
    const data = fs.readFileSync('./data/messages.json', 'utf8');
    return JSON.parse(data);
}

function writeAllMessages(messages)
{
    const data = JSON.stringify(messages, null, 4);
    fs.writeFileSync('./data/messages.json', data, 'utf8');
}


module.exports = {readAllUsers, writeAllUsers, readAllServers, writeAllServers, readAllChannels, writeAllChannels, readAllMessages, writeAllMessages};