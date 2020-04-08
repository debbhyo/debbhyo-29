<template>
    <div class="container-fluid board-container playingCards fourColours rotateHand">
        <div class="row h-100">
            <template v-if="tableData">
                <div class="col-9 board-left" v-if="tableData.playersCount === 4">
                    <div class="row board-row-top" style="text-align: center;">
                        <div class="col-3"></div>
                            <div class="col-6">
                            <!-- <div style="width:100%;"><h4 class="mb-0">{{this.tableData['p' + ((this.tableData.me + 2) % 4)]['identity']['username']}}({{this.tableData['p' + ((this.tableData.me + 2) % 4)]['points']}})</h4></div> -->
                            <div class="col-12 palyer-1" style="text-align: center;">
                                <div style="width: 235px;" :class="{'quadrat': (tableData.current.round === 'BIDDING' && tableData.current.bidder === ((this.tableData.me + 2) % 4)) || (tableData.current.round === 'GAME' && tableData.current.player === ((this.tableData.me + 2) % 4)) || (tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 2) % 4))}">
                                    <ul class="hand">
                                        <li v-for="n in this.tableData['p' + ((this.tableData.me + 2) % 4)]['cardCount']">
                                            <div class="cardd back">*</div>
                                        </li>
                                    </ul>
                                     <div style="width:100%;text-align: center;">
                                        <h4 class="mb-0 mt-4">{{this.tableData['p' + ((this.tableData.me + 2) % 4)]['identity']['username']}}</h4>
                                        <h4 v-if="tableData.current.round === 'BIDDING' && (tableData['p' + ((this.tableData.me + 2) % 4)]['bid'] > 15 || tableData['p' + ((this.tableData.me + 2) % 4)]['bidPass'] === true)">Bid: {{this.tableData['p' + ((this.tableData.me + 2) % 4)]['bidPass']=== true ? 'Passed' : this.tableData['p' + ((this.tableData.me + 2) % 4)]['bid']}}</h4>
                                        <h4 v-if="tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 2) % 4)">Setting Trump</h4>
                                        <h4 v-if="tableData.current.round === 'GAME'">Points: {{this.tableData['p' + ((this.tableData.me + 2) % 4)]['points'] ? this.tableData['p' + ((this.tableData.me + 2) % 4)]['points'] : 0}}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-3" style="text-align: left">
                            <h5 class="mt-2">Trump: {{tableData.current.isTrumpRevealed ? tableData.current.trump : 'Not Open'}}</h5>
                            <h5 class="mt-2" v-if="tableData.current.round === 'GAME'">Bidder: {{tableData['p'+tableData.current.winner]['identity']['username']}}</h5>
                            <h5 class="mt-2" v-if="tableData.current.round === 'GAME'">Bid: {{tableData['p'+tableData.current.winner]['bid']}}</h5>
                        </div>
                    </div>
                    <div class="row board-middle-row">
                        <div class="col-3 palyer-1" style="text-align: center;">
                            <div style="width: 235px;" :class="{'quadrat': (tableData.current.round === 'BIDDING' && tableData.current.bidder === ((this.tableData.me + 3) % 4)) || (tableData.current.round === 'GAME' && tableData.current.player === ((this.tableData.me + 3) % 4)) || (tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 3) % 4))}">
                                <ul class="hand">
                                    <li v-for="n in this.tableData['p' + ((this.tableData.me + 3) % 4)]['cardCount']">
                                        <div class="cardd back">*</div>
                                    </li>
                                </ul>
                                <div style="width:100%;text-align: center;">
                                    <h4 class="mb-0 mt-4">{{this.tableData['p' + ((this.tableData.me + 3) % 4)]['identity']['username']}}</h4>
                                    <h4 v-if="tableData.current.round === 'BIDDING' && (tableData['p' + ((this.tableData.me + 3) % 4)]['bid'] > 15 || tableData['p' + ((this.tableData.me + 3) % 4)]['bidPass'] === true)">Bid: {{this.tableData['p' + ((this.tableData.me + 3) % 4)]['bidPass']=== true ? 'Passed' : this.tableData['p' + ((this.tableData.me + 3) % 4)]['bid']}}</h4>
                                    <h4 v-if="tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 3) % 4)">Setting Trump</h4>
                                     <h4 v-if="tableData.current.round === 'GAME'">Points: {{this.tableData['p' + ((this.tableData.me + 3) % 4)]['points'] ? this.tableData['p' + ((this.tableData.me + 3) % 4)]['points'] : 0}}</h4>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="row h-100">
                                <div class="col-4 h-100" style="display: flex;align-items: center;justify-content: center;">
                                    <div class="cardd" :class="getClassesByObject(this.tableData['p' + ((this.tableData.me + 3) % 4)]['tableCard'])" style="text-align: center;" v-if="this.tableData['p' + ((this.tableData.me + 3) % 4)]['tableCard']">
                                        <span class="rank">{{this.tableData['p' + ((this.tableData.me + 3) % 4)]['tableCard']['number']}}</span>
                                        <span class="suit" v-html="'&' + this.tableData['p' + ((this.tableData.me + 3) % 4)]['tableCard']['suit'] + ';'"></span>
                                    </div>
                                </div>
                                <div class="col-4 h-100">
                                    <div class="row h-50">
                                        <div class="col-12" style="display: flex;align-items: center;justify-content: center;">
                                            <div class="cardd" :class="getClassesByObject(this.tableData['p' + ((this.tableData.me + 2) % 4)]['tableCard'])" style="text-align: center;" v-if="this.tableData['p' + ((this.tableData.me + 2) % 4)]['tableCard']">
                                                <span class="rank">{{this.tableData['p' + ((this.tableData.me + 2) % 4)]['tableCard']['number']}}</span>
                                                <span class="suit" v-html="'&' + this.tableData['p' + ((this.tableData.me + 2) % 4)]['tableCard']['suit'] + ';'"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row h-50">
                                        <div class="col-12" style="display: flex;align-items: center;justify-content: center;">
                                            <div class="cardd" :class="getClassesByObject(this.tableData['p' + ((this.tableData.me) % 4)]['tableCard'])" style="text-align: center;" v-if="this.tableData['p' + ((this.tableData.me) % 4)]['tableCard']">
                                                <span class="rank">{{this.tableData['p' + ((this.tableData.me) % 4)]['tableCard']['number']}}</span>
                                                <span class="suit" v-html="'&' + this.tableData['p' + ((this.tableData.me) % 4)]['tableCard']['suit'] + ';'"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4" style="display: flex;align-items: center;justify-content: center;">
                                    <div class="cardd" :class="getClassesByObject(this.tableData['p' + ((this.tableData.me + 1) % 4)]['tableCard'])" style="text-align: center;" v-if="this.tableData['p' + ((this.tableData.me + 1) % 4)]['tableCard']">
                                        <span class="rank">{{this.tableData['p' + ((this.tableData.me + 1) % 4)]['tableCard']['number']}}</span>
                                        <span class="suit" v-html="'&' + this.tableData['p' + ((this.tableData.me + 1) % 4)]['tableCard']['suit'] + ';'"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-3 palyer-1" style="text-align: center;">
                            <div style="width: 235px;" :class="{'quadrat': (tableData.current.round === 'BIDDING' && tableData.current.bidder === ((this.tableData.me + 1) % 4)) || (tableData.current.round === 'GAME' && tableData.current.player === ((this.tableData.me + 1) % 4)) || (tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 1) % 4))}">
                                <ul class="hand">
                                    <li v-for="n in this.tableData['p' + ((this.tableData.me + 1) % 4)]['cardCount']">
                                        <div class="cardd back">*</div>
                                    </li>
                                </ul>
                                <div style="width:100%;text-align: center;">
                                    <h4 class="mb-0 mt-4">{{this.tableData['p' + ((this.tableData.me + 1) % 4)]['identity']['username']}}</h4>
                                    <h4 v-if="tableData.current.round === 'BIDDING' && (tableData['p' + ((this.tableData.me + 1) % 4)]['bid'] > 15 || tableData['p' + ((this.tableData.me + 1) % 4)]['bidPass'] === true)">Bid: {{this.tableData['p' + ((this.tableData.me + 1) % 4)]['bidPass']=== true ? 'Passed' : this.tableData['p' + ((this.tableData.me + 1) % 4)]['bid']}}</h4>
                                    <h4 v-if="tableData.current.round === 'SET_TRUMP' && tableData.current.winner === ((this.tableData.me + 1) % 4)">Setting Trump</h4>
                                     <h4 v-if="tableData.current.round === 'GAME'">Points: {{this.tableData['p' + ((this.tableData.me + 1) % 4)]['points'] ? this.tableData['p' + ((this.tableData.me + 1) % 4)]['points'] : 0}}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row" style="height:5%">
                        <div class="col-12" style="text-align: center; display:flex; align-items: center;justify-content: center;">
                            <template v-if="tableData.current && tableData.current.round === 'BIDDING' && tableData.current.bidder === tableData.me">
                                <button @click.stop.prevent="turn({'pass':true})" type="button" class="btn btn-dark ml-1 mr-1" v-if="tableData.current.defender !== null">pass</button>
                                <button @click.stop.prevent="turn({'bid':bid})" type="button" class="btn btn-secondary ml-1 mr-1" v-for="bid in 29" v-if="bid >= tableData.current.minBid">{{bid}}</button>
                            </template>
                            <template v-if="tableData.current && tableData.current.round === 'SET_TRUMP' && tableData.current.winner === tableData.me">
                                 <button @click.stop.prevent="turn({'trump':'spades'})" type="button" class="btn btn-dark ml-1 mr-1">SPADES</button>
                                <button @click.stop.prevent="turn({'trump':'clubs'})" type="button" class="btn btn-success ml-1 mr-1">CLUBS</button>
                                <button @click.stop.prevent="turn({'trump':'diams'})" type="button" class="btn btn-primary ml-1 mr-1">DIAMONDS</button>
                                <button @click.stop.prevent="turn({'trump':'hearts'})" type="button" class="btn btn-danger ml-1 mr-1">HEARTS</button>
                                <button @click.stop.prevent="turn({'trump':'reverse'})" type="button" class="btn btn-secondary ml-1 mr-1">REVERSE</button>
                                <button @click.stop.prevent="turn({'trump':'no-trump'})" type="button" class="btn btn-secondary ml-1 mr-1">NO TRUMP</button>
                            </template>
                            <template v-if="tableData.current && tableData.current.round === 'GAME' && tableData.current.player === tableData.me && tableData.current.canRevealTrump === true && tableData.current.isTrumpRevealed === false">
                                <button @click.stop.prevent="turn({'isTrumpRevealed':true})" type="button" class="btn btn-dark ml-1 mr-1" v-if="tableData.current.defender !== null">Show Trump</button>
                            </template>
                        </div>
                    </div>
                    <div class="row board-bottom-row">
                        <div class="col-12 pt-2 quadrat" style="text-align: center; display:flex; align-items: center;justify-content: center;" v-if="tableData.current && tableData.current.round === 'GAME' && tableData.current.player === tableData.me">
                            <template v-for="(card,index) in this.tableData['p' + this.tableData.me]['cards']">
                                <a class="cardd" :class="getClasses(card.number,card.suit)" v-if="containsObject(card, tableData.current.options)" @click.stop.prevent="turn({card:card,isTrumpRevealed:tableData.current.isTrumpRevealed})">
                                    <span class="rank">{{card.number}}</span>
                                    <span class="suit" v-html="'&' + card.suit + ';'"></span>
                                </a>
                                <a class="cardd" :class="getClasses(card.number,card.suit)" v-else style="opacity: 0.2;">
                                    <span class="rank">{{card.number}}</span>
                                    <span class="suit" v-html="'&' + card.suit + ';'"></span>
                                </a>
                            </template>
                        </div>
                        <div v-else class="col-12 pt-2" style="text-align: center; display:flex; align-items: center;justify-content: center;">
                            <a class="cardd" :class="getClasses(card.number,card.suit)" v-for="(card,index) in this.tableData['p' + this.tableData.me]['cards']" :key="index">
                                <span class="rank">{{card.number}}</span>
                                <span class="suit" v-html="'&' + card.suit + ';'"></span>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-9 board-left" v-else>
                    <h2>Waiting for others to join. {{tableData.playersCount}} players joined.</h2>
                </div>
            </template>
            <div class="col-3 board-right">
                <template v-if="!isLoggedIn">
                    <div class="card-body">
                        <div class="card-title">
                            <h3>Login</h3>
                            <hr>
                        </div>
                    </div>
                    <div class="card-footer">
                        <p style="color: red" v-if="loginError">{{loginError}}</p>
                        <form @submit.prevent="login">
                            <div class="gorm-group">
                                <label for="user">Username:</label>
                                <input type="text" v-model="username" class="form-control">
                            </div>
                            <div class="gorm-group pb-3">
                                <label for="message">Table:</label>
                                <input type="text" v-model="table" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-success">Login</button>
                        </form>
                    </div>
                </template>
                <template v-else>
                    <div class="card-body" id="chatbox" style="height:500px;overflow-y: scroll;">
                        <div class="card-title">
                            <h3>Chat</h3>
                            <hr>
                        </div>
                        <div class="card-body">
                            <div class="messages" v-for="(msg, index) in messages" :key="index">
                                <p><span class="font-weight-bold">{{ msg.user }}: </span>{{ msg.message }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <twemoji-textarea
                                :emojiData="emojiDataAll"
                                :emojiGroups="emojiGroups"
                                @enterKey="onEnterKey">
                        </twemoji-textarea>
                    </div>
                </template>
            </div>
        </div>
    </div>

</template>
<script>
    import {
        TwemojiTextarea
    } from '@kevinfaguiar/vue-twemoji-picker';
    import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/en/emoji-all-groups.json';
    import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json';
import io from 'socket.io-client';
import api from '@/services/api.js'
export default {
    name: 'Home',
    components: {
        'twemoji-textarea': TwemojiTextarea
    },
    computed: {
        emojiDataAll() {
            return EmojiAllData;
        },
        emojiGroups() {
            return EmojiGroups;
        }
    },
    data() {
        return {
            user: '',
            message: '',
            table: '',
            messages: [],
            socket : null,
            identity: null,
            isLoggedIn: false,
            identityInfo: null,
            username: null,
            tableData: null,
            loginError: null
        }
    },
    props: {
    },
    methods: {
        onEnterKey(e) {
            let input='';
            if(e.srcElement.children.length()>=1 && 'alt' in e.srcElement.children[0]) {
                input = e.srcElement.innerText + e.srcElement.children[0].alt;
            }
            else {
                input = e.srcElement.innerText;
            }
            this.socket.emit('SEND_MESSAGE', {
                user: this.identityInfo.username,
                message: input
            });
            this.message = ''
            console.log(e.srcElement.innerHTML,e);
        },
        getClassesByObject(payload) {
            let c = {};
            c['rank-' + payload.number.toLowerCase()] = true
            c[payload.suit] = true
            return c
        },
        getClasses: function(number, suit) {
            let c = {};
            c['rank-' + number.toLowerCase()] = true
            c[suit] = true
            return c
        },
        sendMessage(e) {
            e.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                user: this.identityInfo.username,
                message: this.message
            });
            this.message = ''
        },
        initiateSocketConnection() {
            this.socket = io('http://159.65.153.201:3009', {query : "identity=" + this.identity,autoConnect: false})
            // this.socket = io('http://localhost:3009', {query : "identity=" + this.identity,autoConnect: false})
            this.socket.on('connect', () => {
                this.socket.emit('UPDATE_ME')
            })
            this.socket.on('MESSAGE', (data) => {
                this.messages = [...this.messages, data];
                this.$nextTick(() => {
                    var container = this.$el.querySelector("#chatbox");
                    container.scrollTop = container.scrollHeight;
                })
                // you can also do this.messages.push(data)
            });
            this.socket.on('UPDATE_TABLE', (data) => {
                // console.log(data)
                this.tableData = data;
                // you can also do this.messages.push(data)
            });
            this.socket.open();
        },
        turn(data) {
            this.socket.emit('TURN', data)
        },
        containsObject(obj, list) {
            let i;
            for (i = 0; i < list.length; i++) {
                if (list[i].number === obj.number && list[i].suit === obj.suit) {
                    return true;
                }
            }
            return false;
        },
        login(e) {
            e.preventDefault();
            if (this.username && this.username.length > 0 && this.table && this.table.length > 0) {
                api.login(this.username, this.table)
                .then(resp => {
                    if (resp.loggedIn === true) {
                        this.isLoggedIn = resp.loggedIn
                        this.identityInfo = resp.info
                        this.initiateSocketConnection()
                    } else {
                        if (resp.error) {
                            this.loginError = resp.error
                        }
                    }
                })
            }
        }
    },
    mounted() {
        api.getIdentity()
        .then(resp => {
            this.identity = resp.identity
            this.isLoggedIn = resp.loggedIn
            if (resp.loggedIn) {
                this.identityInfo = resp.info
                this.initiateSocketConnection()
            }
        })
    }
}
</script>
<style>
.board-container {
    /*background-color: green;*/
    min-height: 100%;
    height: 100%;
}
.board-row-top {
    height:30%;
    /*background-color: pink;*/
}
.board-middle-row {
    height:40%;
    /*background-color: blue*/
}
.board-bottom-row {
    height:25%;
    /*background-color: red*/
}
.board-right {
    background-color: #f5f5f5;
}
.palyer-1 {
    display: flex;
    justify-content: center;
}
.palyer-1 ul{
    display: flex
    /*width: fit-content;
    margin-left: auto !important;
    margin-right: auto !important;*/
}
.palyer-1 ul li{
}
.quadrat {
  -webkit-animation: blinking-background 2s infinite;  /* Safari 4+ */
  -moz-animation: blinking-background 2s infinite;  /* Fx 5+ */
  -o-animation: blinking-background 2s infinite;  /* Opera 12+ */
  animation: blinking-background 2s infinite;  /* IE 10+, Fx 29+ */
}

@-webkit-keyframes blinking-background {
  0%, 49% {
    background-color: #dadada;
    /*border: 3px solid #e50000;*/
  }
  50%, 100% {
    background-color: white;
    /*border: 3px solid rgb(117, 209, 63);*/
  }
}
</style>
