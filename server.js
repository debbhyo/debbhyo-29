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
    {number: "J", suit: "clubs", sort:16, points:3},
    {number: "Q", suit: "diams", sort:27, points:0},
    {number: "7", suit: "diams", sort:25, points:0},
    {number: "9", suit: "hearts", sort:23, points:2},
    {number: "A", suit: "hearts", sort:22, points:1},
    {number: "10", suit: "diams", sort:29, points:1},
    {number: "Q", suit: "spades", sort:3, points:0},
    {number: "7", suit: "hearts", sort:17, points:0},
    {number: "A", suit: "diams", sort:30, points:1},
    {number: "10", suit: "spades", sort:5, points:1},
    {number: "A", suit: "clubs", sort:14, points:1},
    {number: "Q", suit: "clubs", sort:11, points:0},
    {number: "K", suit: "hearts", sort:20, points:0},
    {number: "8", suit: "clubs", sort:10, points:0},
    {number: "K", suit: "diams", sort:28, points:0},
    {number: "K", suit: "spades", sort:4, points:0},
    {number: "A", suit: "spades", sort:6, points:1},
    {number: "Q", suit: "hearts", sort:19, points:0},
    {number: "J", suit: "diams", sort:32, points:3},
    {number: "9", suit: "spades", sort:7, points:2},
    {number: "J", suit: "hearts", sort:24, points:3},
    {number: "7", suit: "clubs", sort:9, points:0},
    {number: "8", suit: "diams", sort:26, points:0},
    {number: "9", suit: "clubs", sort:15, points:2},
    {number: "J", suit: "spades", sort:8, points:3},
    {number: "9", suit: "diams", sort:31, points:2},
    {number: "7", suit: "spades", sort:1, points:0},
    {number: "10", suit: "clubs", sort:13, points:1},
    {number: "K", suit: "clubs", sort:12, points:0},
    {number: "10", suit: "hearts", sort:21, points:1},
    {number: "8", suit: "hearts", sort:18, points:0},
    {number: "8", suit: "spades", sort:2, points:0},
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
    nextRound(tablename, "BIDDING")
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
        case "BIDDING":
            for (let j = 0;j < 4; j++) {
                let player = 'p' + ((table[tablename]['dealer'] + j) % 4)
                table[tablename][player]['cards'] = []
                for (let k = 0;k < 4; k++) {
                    table[tablename][player]['cards'].push(cardsArray[table[tablename]['deck'].pop()])
                }
                table[tablename][player]['cardCount'] = table[tablename][player]['cards'].length
            }
            table[tablename]['current'] = {
                round: 'BIDDING',
                bidder: table[tablename]['dealer'],
                minBid: 17,
                defender: null
            }
            break

        case "SET_TRUMP":
            let bidWinner = table[tablename]['current'].winner
            table[tablename]['current'] = {
                round: 'SET_TRUMP',
                winner: bidWinner
            }
            break

        case "NEXT_ROUND":
            for(let r = 0; r < 4;r++) {
                table[tablename]['p' + r]['tableCard'] = null
            }
            table[tablename]['current']['game'] += 1
            table[tablename]['current']['turn'] = 1
            table[tablename]['current']['player'] = table[tablename]['current']['roundWinner']
            table[tablename]['current']['starter'] = table[tablename]['current']['roundWinner']
            table[tablename]['current']['options'] = table[tablename]['p'+(table[tablename]['current']['roundWinner'])]['cards']
            break

        case "NEXT_GAME":
            table[tablename]['deck'] = []
            let deck = []
            for (let i = 0;i < 32;i++) {
                deck.push(i)
            }
            for (let i = 0;i < 4;i++) {
                table[tablename]['p' + i]['tableCard'] = null
                table[tablename]['p' + i]['bidPass'] = false
            }
            table[tablename]['deck'] = shuffle(deck)
            table[tablename]['dealer'] += 1;
            nextRound(tablename, "BIDDING")
            return
            break

        case "START_ROUND":
            let trump = table[tablename]['current'].trump
            let winner = table[tablename]['current'].winner
            for (let j = 0;j < 4; j++) {
                let player = 'p' + ((table[tablename]['dealer'] + j) % 4)
                for (let k = 0;k < 4; k++) {
                    table[tablename][player]['cards'].push(cardsArray[table[tablename]['deck'].pop()])
                }
                table[tablename][player]['cards'].sort((a,b) => a.sort > b.sort ? 1 : -1)
                table[tablename][player]['cardCount'] = table[tablename][player]['cards'].length
            }
            table[tablename]['current'] = {
                round: 'GAME',
                game:1,
                trump: trump,
                isTrumpRevealed: false,
                canRevealTrump: false,
                turn: 1,
                player: winner,
                starter: winner,
                dealer: table[tablename]['dealer'],
                options: table[tablename]['p'+winner]['cards']
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
    switch(table[tablename].current.round){
        case "BIDDING":
            if (table[tablename].current && table[tablename].current['bidder'] === player) {
                switch(table[tablename].current.round) {
                    case "BIDDING":
                            if (data.pass === true) {
                                table[tablename]['p' + player]['bidPass'] = true
                                if (table[tablename].current.defender === player) {
                                    for (let i = 1; i <= 4; i++) {
                                        if (table[tablename]['p' + ((player + i) % 4)]['bidPass'] !== true){
                                            table[tablename]['current'].defender = (player + i) % 4
                                            table[tablename]['current'].minBid = table[tablename]['p' + ((player + i) % 4)]['bid'] + 1
                                            if (table[tablename]['p' + ((player + i + 1) % 4)]['bidPass'] !== true) {
                                                table[tablename]['current'].bidder = (player + i + 1) % 4
                                                break
                                            } else {
                                                table[tablename]['current'].winner = player + i
                                                nextRound(tablename,"SET_TRUMP")
                                                return
                                            }
                                        }
                                    }
                                } else {
                                    for (let i = 1; i <= 4; i++) {
                                        if (table[tablename]['p' + ((player + i) % 4)]['bidPass'] !== true){
                                            if (((player + i) % 4) === table[tablename].current.defender) {
                                                table[tablename]['current'].winner = table[tablename].current.defender
                                                nextRound(tablename,"SET_TRUMP")
                                                return
                                            } else {
                                                table[tablename]['current'].bidder = (player + i) % 4
                                                break
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
                                    break
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
                                                    break
                                                }
                                            }
                                        }
                                    } else {
                                        console.log("player bidded against defender")
                                        table[tablename]['current'].minBid = data.bid
                                        table[tablename]['current'].bidder = table[tablename]['current'].defender
                                        break
                                    }
                                }
                            }
                        break
                }
            }
            break

        case "SET_TRUMP":
            if (table[tablename].current && table[tablename].current['winner'] === player) {
                table[tablename].current.trump = data.trump
                nextRound("qwerty123","START_ROUND")
                return
            }
            break

        case "GAME":
            console.log("GAME recieved")
            if (table[tablename].current && table[tablename].current['player'] === player) {
                if (data.isTrumpRevealed === true && table[tablename].current.canRevealTrump === true) {
                    table[tablename].current.isTrumpRevealed = true
                    table[tablename].current.canRevealTrump = false
                    let options = table[tablename]['p' + table[tablename]['current']['player']]['cards'].filter(item => item.suit === table[tablename].current.trump)
                    if (!options.length) {
                        options = table[tablename]['p' + table[tablename]['current']['player']]['cards']
                    }
                    table[tablename].current.options = options
                } else {
                    if (table[tablename]['current']['turn'] === 1) {
                        console.log("Turn 1")
                        table[tablename]['current'].turnSuit = data.card.suit
                        table[tablename]['current']['turn'] += 1
                        table[tablename]['p' + player]['tableCard'] = data.card
                        table[tablename]['p' + player]['cards'] = table[tablename]['p' + player]['cards'].filter(item => item.suit !== data.card.suit || item.number !== data.card.number)
                        table[tablename]['current']['player'] = (table[tablename]['current']['player'] + 1) % 4
                        table[tablename]['current'].canRevealTrump = false
                        let options = table[tablename]['p' + table[tablename]['current']['player']]['cards'].filter(item => item.suit === table[tablename]['current'].turnSuit)
                        if (!(options.length)) {
                            if (table[tablename]['current'].isTrumpRevealed === false) {
                                table[tablename]['current'].canRevealTrump = true
                            }
                            options = table[tablename]['p' + table[tablename]['current']['player']]['cards']
                        }
                        table[tablename]['current']['options'] = options
                    } else if (table[tablename]['current']['turn'] === 4) {
                        table[tablename]['p' + player]['tableCard'] = data.card
                        table[tablename]['p' + player]['cards'] = table[tablename]['p' + player]['cards'].filter(item => item.suit !== data.card.suit || item.number !== data.card.number)
                        let winner = table[tablename]['current']['starter']
                        let starter = table[tablename]['current']['starter']
                        let iterator = table[tablename]['current']['starter']
                        let points = 0;
                        points += table[tablename]['p' + winner]['tableCard']['points']
                        for (let i=1; i<=3; i++) {
                            let player1 = table[tablename]['p' + winner]['tableCard']
                            let player2 = table[tablename]['p' + ((iterator + i) % 4)]['tableCard']
                            points += table[tablename]['p' + ((iterator + i) % 4)]['tableCard']['points']
                            if (table[tablename]['current'].isTrumpRevealed === true) {
                                if (table[tablename]['current']['trump'] === "reverse") {
                                    if (table[tablename]['p' + starter]['tableCard']['isTrumpRevealed'] === true) {
                                        if (player2.suit === player1.suit && player2.sort < player1.sort) {
                                            winner = ((iterator + i) % 4)
                                        }
                                    } else {
                                        if (player2.suit === player1.suit && player2.sort > player1.sort) {
                                            winner = ((iterator + i) % 4)
                                        }
                                    }
                                } else if(table[tablename]['current']['trump'] === "no-trump") {
                                    if (player2.suit === player1.suit && player2.sort < player1.sort) {
                                        winner = ((iterator + i) % 4)
                                    }
                                } else {
                                    if (player2.suit !== player1.suit && player2.suit === table[tablename]['current']['trump']) {
                                        winner = ((iterator + i) % 4)
                                    }
                                }
                            } else {
                                if (player2.suit === player1.suit && player2.sort > player1.sort) {
                                    winner = ((iterator + i) % 4)
                                }
                            }
                        }
                        if (table[tablename]['p' + winner]['points']) {
                            table[tablename]['p' + winner]['points'] += points
                        } else {
                            table[tablename]['p' + winner]['points'] = points
                        }
                        table[tablename]['current']['roundWinner'] = winner
                        table[tablename]['current'].canRevealTrump = false
                        if (table[tablename].current.game === 8) {
                            nextRound(tablename, "NEXT_GAME")
                        } else {
                            nextRound(tablename, "NEXT_ROUND")
                        }
                    } else {
                        table[tablename]['current']['turn'] += 1
                        table[tablename]['p' + player]['tableCard'] = data.card
                        table[tablename]['p' + player]['cards'] = table[tablename]['p' + player]['cards'].filter(item => item.suit !== data.card.suit || item.number !== data.card.number)
                        table[tablename]['current']['player'] = (table[tablename]['current']['player'] + 1) % 4
                        table[tablename]['current'].canRevealTrump = false
                        let options = table[tablename]['p' + table[tablename]['current']['player']]['cards'].filter(item => item.suit === table[tablename]['current'].turnSuit)
                        if (!(options.length)) {
                            if (table[tablename]['current'].isTrumpRevealed === false) {
                                table[tablename]['current'].canRevealTrump = true
                            }
                            options = table[tablename]['p' + table[tablename]['current']['player']]['cards']
                        }
                        table[tablename]['current']['options'] = options
                    }
                }
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