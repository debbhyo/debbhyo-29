const express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var session = require('express-session');
var cors = require('cors')
const app = express()
const port = 3000
var tables = {
}
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
var identities = {
}
var table = {
    qwerty123:{
        playersCount:0
    }
}
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
    res.json({
        error: error
    })
})
const server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

const io = require('socket.io')(server);

io.on('connection', function(socket) {
    if (socket.handshake.query.identity) {
        identities[socket.handshake.query.identity]['socket'] = socket.id
        socket.on('SEND_MESSAGE', function(data) {
            io.emit('MESSAGE', data)
        });
    }
});