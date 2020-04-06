const express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var session = require('express-session');
var cors = require('cors')
const app = express()
const port = 3000
app.use(cookieParser());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({secret: "sdasds a secret!"}));
var corsOptions = {
  origin: 'http://localhost:8080',
  credentials:true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))

var identities = {}
var table = {
    qwerty123:{
        playersCount:0
    }
}
var cardsArray = [
    {number: "J", suit: "clubs"},
    {number: "Q", suit: "diams"},
    {number: "7", suit: "diams"},
    {number: "9", suit: "hearts"},
    {number: "A", suit: "hearts"},
    {number: "10", suit: "diams"},
    {number: "Q", suit: "spades"},
    {number: "7", suit: "hearts"},
    {number: "A", suit: "diams"},
    {number: "10", suit: "spades"},
    {number: "A", suit: "clubs"},
    {number: "Q", suit: "clubs"},
    {number: "K", suit: "hearts"},
    {number: "8", suit: "clubs"},
    {number: "K", suit: "diams"},
    {number: "K", suit: "spades"},
    {number: "A", suit: "spades"},
    {number: "Q", suit: "hearts"},
    {number: "J", suit: "diams"},
    {number: "9", suit: "spades"},
    {number: "J", suit: "hearts"},
    {number: "7", suit: "clubs"},
    {number: "8", suit: "diams"},
    {number: "9", suit: "clubs"},
    {number: "J", suit: "spades"},
    {number: "9", suit: "diams"},
    {number: "7", suit: "spades"},
    {number: "10", suit: "clubs"},
    {number: "K", suit: "clubs"},
    {number: "10", suit: "hearts"},
    {number: "8", suit: "hearts"},
    {number: "8", suit: "spades"},
]

function generateIdentity() {
    let length = 20
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function startGame(tablename) {
    table[tablename]['deck'] = []
    let deck = []
    for (let i = 0;i < 32;i++) {
        deck.push(i)
    }
    table[tablename]['deck'] = shuffle(deck)
    table[tablename]['dealer'] = 0;
    nextRound(tablename, "BIDDING_1")
}

function syncTable(tablename) {
    for (let j = 0;j < 4; j++) {
        let player = 'p' + j
        if (table[tablename][player] && table[tablename][player]['identity'] && table[tablename][player]['identity']['socket']) {
            let socket = table[tablename][player]['identity']['socket']
            let data = JSON.parse(JSON.stringify(table[tablename]))
            data['me'] = j
            io.to(socket).emit('UPDATE_TABLE', data);
        }
    }
}

function nextRound(tablename, type) {
    switch(type){
        case "BIDDING_1":
            for (let j = 0;j < 4; j++) {
                let player = 'p' + ((table[tablename]['dealer'] + j) % 4)
                table[tablename][player]['cards'] = []
                for (let k = 0;k < 4; k++) {
                    table[tablename][player]['cards'].push(cardsArray[table[tablename]['deck'].pop()])
                }
                table[tablename][player]['cardCount'] = table[tablename][player]['cards'].length
            }
            table[tablename]['current'] = {
                round: 'BIDDING_1',
                bidder: table[tablename]['dealer'],
                minBid: 17,
                defender: null
            }
            break
    }
    syncTable(tablename)
}

function findPlayerFromSocket(socket) {
    let tablename = "qwerty123"
    for (let j = 0;j < 4; j++) {
        let player = 'p' + j
        if (table[tablename][player] && table[tablename][player]['identity'] && table[tablename][player]['identity']['socket'] === socket) {
            return j
        }
    }
    return null
}

function turn(socket, data) {
    let player = findPlayerFromSocket(socket)
    console.log("socket player:" + player)
    let tablename = "qwerty123"
    if (table[tablename].current && table[tablename].current['bidder'] === player) {
        switch(table[tablename].current.round) {
            case "BIDDING_1":
                    if (data.pass === true) {
                        table[tablename]['p' + player]['bidPass'] = true
                        if (table[tablename].current.defender === player) {
                            for (let i = 1; i <= 4; i++) {
                                if (table[tablename]['p' + ((player + i) % 4)]['bidPass'] !== true){
                                    table[tablename]['current'].defender = (player + i) % 4
                                    table[tablename]['current'].minBid = table[tablename]['p' + ((player + i) % 4)]['bid'] + 1
                                    if (table[tablename]['p' + ((player + i + 1) % 4)]['bidPass'] !== true) {
                                        table[tablename]['current'].bidder = (player + i) % 4
                                    } else {
                                        // start game
                                    }
                                }
                            }
                        } else {
                            for (let i = 1; i <= 4; i++) {
                                if (table[tablename]['p' + ((player + i) % 4)]['bidPass'] !== true){
                                    if (((player + i) % 4) === table[tablename].current.defender) {
                                        //start game
                                    } else {
                                        table[tablename]['current'].bidder = (player + i) % 4
                                    }
                                }
                            }
                        }
                    } else {
                        table[tablename]['p' + player]['bid'] = data.bid
                        if ((table[tablename].current.defender) === null) {
                            console.log("defender is null")
                            table[tablename]['current'].minBid = data.bid + 1
                            table[tablename]['current'].bidder = (player + 1) % 4
                            table[tablename]['current'].defender = player
                        } else {
                            if (table[tablename].current.defender === player) {
                                console.log("defender is player")
                                table[tablename]['current'].minBid = data.bid + 1
                                for (let i = 1; i <= 4; i++) {
                                    if (table[tablename]['p' + ((player + i) % 4)]['bidPass'] !== true){
                                        if (((player + i) % 4) === table[tablename].current.defender) {
                                            //start game
                                        } else {
                                            table[tablename]['current'].bidder = (player + i) % 4
                                        }
                                    }
                                }
                            } else {
                                console.log("player bidded against defender")
                                table[tablename]['current'].minBid = data.bid
                                table[tablename]['current'].bidder = table[tablename]['current'].defender
                            }
                        }
                    }
                break
        }
    }
    syncTable("qwerty123")
}
app.get('/get-identity', (req, res) => {
    if (req.session.identity && req.session.identity.length === 20) {
        if (identities[req.session.identity]) {
            res.json({
                identity : req.session.identity,
                loggedIn : true,
                info : identities[req.session.identity]
            })
        } else {
            res.json({
                identity : req.session.identity,
                loggedIn : false
            })
        }
    } else {
        req.session.identity = generateIdentity()
        res.json({
            identity : req.session.identity,
            loggedIn : false
        })
    }
})

app.post('/login', (req, res) => {
    let error = null
    if (req.session.identity && req.session.identity.length === 20) {
        const username = req.body.username
        const tablename = req.body.table
        if (tablename === "qwerty123" && table["qwerty123"].playersCount < 4) {
            identities[req.session.identity] = {
                username : username,
                table : tablename
            }
            table["qwerty123"]["p" + table["qwerty123"].playersCount] = {
                name : username,
                cardCount: 0,
                tableCard: null,
                identity: identities[req.session.identity]
            }
            table["qwerty123"].playersCount += 1
            if (table["qwerty123"].playersCount === 4) {
                startGame("qwerty123")
            }
            res.json({
                identity : req.session.identity,
                loggedIn : true,
                info : identities[req.session.identity]
            })
        } else {
            error = "Invalid Table Name!"
        }
    } else {
        error = "Something went wrong!"
    }
    if (error) {
        res.json({
            error: error
        })
    }
})
const server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const io = require('socket.io')(server);

io.on('connection', function(socket) {
    if (socket.handshake.query.identity && identities[socket.handshake.query.identity]) {
        identities[socket.handshake.query.identity]['socket'] = socket.id
        socket.on('SEND_MESSAGE', function(data) {
            io.emit('MESSAGE', data)
        });
        socket.on('UPDATE_ME', function(data) {
                syncTable("qwerty123")
        });
        socket.on('TURN', (data) => {
            turn(socket.id, data)
        })
        syncTable("qwerty123")
    }
});