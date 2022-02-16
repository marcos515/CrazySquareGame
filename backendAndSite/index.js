const ngrok = require('ngrok');
const {
    initializeApp
} = require('firebase/app');
const {
    getDatabase,
    ref,
    set
} = require('firebase/database');
const server = require('http').createServer(requestHandler);
var static = require('node-static');
const io = require('socket.io')(server);
const fs = require('fs');
require("dotenv").config();

const tableSize = {
    height: 10,
    width: 10
}
const maxFruits = 5;


let app = initializeApp({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
});


ngrok.authtoken(process.env.ngrokToken).then(v => {
    ngrok.connect(process.env.serverPort).then(url => {
        console.log("Public apiHost: " + url);
        setApiHost(url);
    })
});

var connectionsIds = [];
var things = new Map();

io.on('connection', socket => {
    io.emit('tableSize', tableSize);
    connectionsIds = Array.from(io.sockets.sockets.keys());
    updateAnalytics(connectionsIds, things);
    io.emit('moveUpdate', Object.fromEntries(things));
    socket.on('register', (msg) => {
        msg = JSON.parse(msg);
        things.set(msg.token, createUser(msg.token, msg.username));
        io.emit('moveUpdate', Object.fromEntries(things));
        updateAnalytics(connectionsIds, things);
    });
    socket.on('disconnect', () => {
        updateAnalytics(connectionsIds, things);
    });

    socket.on('moveL', (msg) => {
        try {
            msg = JSON.parse(msg);
            let updated = things.get(msg.token);
            updated.coordinate = updated.coordinate;

            if (updated.coordinate.width > 0) {
                updated.coordinate.width = updated.coordinate.width - 1;

            }
            colision(msg.token, updated.coordinate);
            things.set(msg.token, updated);
            updateAnalytics(connectionsIds, things);
            io.emit('moveUpdate', Object.fromEntries(things));
        } catch (error) {

        }
    });
    socket.on('moveR', (msg) => {
        try {
            msg = JSON.parse(msg);
            let updated = things.get(msg.token);
            updated.coordinate = updated.coordinate;
            if (updated.coordinate.width < tableSize.width - 1) {
                updated.coordinate.width = updated.coordinate.width + 1;
            }

            things.set(msg.token, updated);
            colision(msg.token, updated.coordinate);
            updateAnalytics(connectionsIds, things);
            io.emit('moveUpdate', Object.fromEntries(things));
        } catch (error) {

        }
    });
    socket.on('moveU', (msg) => {
        try {
            msg = JSON.parse(msg);
            let updated = things.get(msg.token);

            if (updated.coordinate.height > 0) {
                updated.coordinate.height = updated.coordinate.height - 1;
            }
            things.set(msg.token, updated);
            colision(msg.token, updated.coordinate);

            updateAnalytics(connectionsIds, things);
            io.emit('moveUpdate', Object.fromEntries(things));
        } catch (error) {

        }
    });
    socket.on('moveD', (msg) => {
        try {
            msg = JSON.parse(msg);
            let updated = things.get(msg.token);

            if (updated.coordinate.height < tableSize.height - 1) {
                updated.coordinate.height = updated.coordinate.height + 1;

            }

            things.set(msg.token, updated);
            colision(msg.token, updated.coordinate);

            updateAnalytics(connectionsIds, things);
            io.emit('moveUpdate', Object.fromEntries(things));
        } catch (error) {

        }
    });

});


server.listen(process.env.serverPort);
var file = new(static.Server)(__dirname);

function updateAnalytics(connectionsIds, things) {
    io.emit('analytics', {
        'connectionsCount': connectionsIds.length - getUsersSize(),
        "things": Object.fromEntries(things)
    });
}

function requestHandler(req, res) {
    file.serve(req, res);
}

function setApiHost(api) {
    const db = getDatabase(app);
    set(ref(db, "apiHost"), api).then(res => {
        console.log("apiHost published")
    });
}


function createUser(token, username) {
    return {
        token: token,
        username: username,
        color: getRandomColor(),
        score: 0,
        coordinate: {
            height: parseInt((Math.random() * 9).toFixed(0)),
            width: parseInt((Math.random() * 9).toFixed(0))
        }
    }
}

function createFruit(token) {
    return {
        token: token,
        color: '#66A82D',
        score: 0,
        coordinate: {
            height: parseInt((Math.random() * 9).toFixed(0)),
            width: parseInt((Math.random() * 9).toFixed(0))
        }
    }
}

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function colision(tk, coordinate) {
    things.forEach((value, key, map) => {
        if (key != tk && (value.coordinate.height == coordinate.height) && (value.coordinate.width == coordinate.width)) {
            things.delete(key)
            let updated = things.get(tk);
            if (key.startsWith("fruit_")) {
                updated.score = updated.score + 1;
            } else {
                updated.score = updated.score + 4;
            }
            things.set(tk, updated);
            updateAnalytics(connectionsIds, things);
            io.emit('moveUpdate', Object.fromEntries(things));
        }
    });
}

setInterval(() => {
    if (getFruitsSize() < maxFruits) {
        let tk = 'fruit_' + Math.floor(Math.random() * 16777215).toString(36);
        things.set(tk, createFruit(tk));
        io.emit('moveUpdate', Object.fromEntries(things));
    }
}, 3000);

function getUsersSize() {
    let size = 0;
    things.forEach((value, key, map) => {
        if (!key.startsWith('fruit_')) {
            size++;
        }
    });
    return size;
}

function getFruitsSize() {
    let size = 0;
    things.forEach((value, key, map) => {
        if (key.startsWith('fruit_')) {
            size++;
        }
    });
    return size;
}