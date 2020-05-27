(async () => {
const crypto = require('crypto');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cron = require('node-cron');
const fs = require('fs');
const util = require('util');
const asyncHandler = require('express-async-handler')
const jsonAutosave = require('json-autosave');

const state = await jsonAutosave('states/state.json', {
    data: {"users":[{"id":"fb195b641ea58eaad0a7f7b25dc55fcfefedb6bc","secret":"fcc26503d946b90d956c11cab0cb5bfebd061629"},{"id":"fe46872aafc77bb3abd873408c9e62b6fe2aabb0","secret":"acc14206385d8cb226c621c322ec3b76fe599a29"},{"id":"6b974bc2065dddd117b715fb40664aded02dc34e","secret":"8b385e29b0a958e9f925804016580e0a28fab385"}],"songs":[{"id":"724272d8178318621340ab8a2da4d5a5941ee4d4","name":"Tim Toupe - Helikopter 117","votes":["fb195b641ea58eaad0a7f7b25dc55fcfefedb6bc"],"creator":"fe46872aafc77bb3abd873408c9e62b6fe2aabb0"},{"id":"18b74f483c6e9972d484b2635c3ddeb6f7ae9334","name":"Queen - Bohemian Rhapsody","votes":[],"creator":"fe46872aafc77bb3abd873408c9e62b6fe2aabb0"},{"id":"4dc1e849402f63c97f93cbb2b79bcdfd755a2727","name":"Synapsenkitzler","votes":[],"creator":"fe46872aafc77bb3abd873408c9e62b6fe2aabb0"}]}
});

const timeout = ms => new Promise(res => setTimeout(res, ms))

const adminPassword = "unser-thorben-123"

app.use(express.static(__dirname + '/static'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));

app.get('/getState', asyncHandler(async (req, res, next) => {
    if (req.query.adminPassword !== adminPassword) throw "wrong admin password"
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state.data))
}))

app.get('/getSongs', asyncHandler(async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state.data.songs))
}))

app.get('/createUser', asyncHandler(async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    const user = {
        id: await getRandomBytesHex(20)
        ,
        secret: await getRandomBytesHex(20)
    }
    state.data.users.push(user)
    res.send(JSON.stringify(user))
}))

app.get('/isUserExists', asyncHandler(async (req, res, next) => {
    const userId = req.query.userId
    const user = getUser(userId)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(user != null))
}))

app.get('/createSong', asyncHandler(async (req, res, next) => {
    const name = req.query.name
    const userId = req.query.userId
    const user = getUser(userId)
    let id = req.query.id
    if (id == undefined) {
        id = await getRandomBytesHex(20);
    }
    if (!user) throw "user not found"
    if (user.secret !== req.query.userSecret) throw "wrong userSecret"
    if (getSong(id)) throw "song id duplicate"
    if (! name) throw "invalid name"
    const song = {
        id: id
        ,
        name: name
        ,
        votes: []
        ,
        creator: user.id
    }
    state.data.songs.push(song);
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state.data.songs))
    onSongsChanged(user.id)
}))

app.get('/voteSong', asyncHandler(async (req, res, next) => {
    const songId = req.query.songId
    const userId = req.query.userId
    const voteValue = req.query.voteValue === "true"
    const song = getSong(songId)
    const user = getUser(userId)
    if (!song) throw "song not found"
    if (!user) throw "user not found"
    if (user.secret !== req.query.userSecret) throw "wrong userSecret"
    const votes = song.votes
    if (voteValue && !(votes.includes(user.id))) {
        votes.push(user.id)
        onSongsChanged(user.id)
    } else if (!voteValue && votes.includes(user.id)) {
        removeValueFromArray(votes, user.id)
        onSongsChanged(user.id)
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state.data.songs))
}))

app.get('/deleteSong', asyncHandler(async (req, res, next) => {
    const songId = req.query.songId
    const song = getSong(songId)
    if (!song) throw "song not found"
    if (req.query.adminPassword !== adminPassword) throw "wrong admin password"
    removeValueFromArray(state.data.songs, song)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state.data.songs))
    onSongsChanged()
}))

function getUser(id) {
    return state.data.users.find(x => x.id == id)
}

function getSong(id) {
    return state.data.songs.find(x => x.id == id)
}

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
    })
});

const saveStateData = {
    lastSavedJsonString: "",
}

cron.schedule("* * * * *", saveState);
await saveState()

async function saveState() {
    const jsonString = JSON.stringify(state.data)
    if (saveStateData.lastSavedJsonString != jsonString) {
        saveStateData.lastSavedJsonString = jsonString
        const filename = `states/state-${getYYYYMMDDHHMMSS(new Date())}.json`
        await util.promisify(fs.writeFile)(filename, jsonString)
        console.log('Saved state to '+filename);
    }
}

async function getRandomBytesHex(byteCount) {
    return (await util.promisify(crypto.randomBytes)(byteCount)).toString('hex');
}

// copied from StackOverflow
function getYYYYMMDDHHMMSS(value) {
    function pad2(n) {  // always returns a string
        return (n < 10 ? '0' : '') + n;
    }

    return value.getFullYear() +
            pad2(value.getMonth() + 1) + 
            pad2(value.getDate()) +
            pad2(value.getHours()) +
            pad2(value.getMinutes()) +
            pad2(value.getSeconds());
}

// copied from StackOverflow
function removeValueFromArray(arr, value) {
    for (var i = 0; i < arr.length; i++){ 
        if (arr[i] === value) {
            arr.splice(i, 1); 
            i--;
        }
    }
}

function onSongsChanged(userId) {
    io.emit('reloadSongs',JSON.stringify({
        userIdThatCreatedChange: userId
    }));
}

server.listen(8080);
})()