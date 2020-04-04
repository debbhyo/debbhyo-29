<template>
    <div class="container-fluid board-container playingCards fourColours rotateHand">
        <div class="row h-100">
            <template v-if="tableData">
                <div class="col-9 board-left" v-if="tableData.playersCount === 4">
                    <div class="row board-row-top" style="text-align: center;">
                        <div style="width:100%;"><h4 class="mb-0">{{this.config['p' + ((this.config.me + 2) % 4)]['name']}}</h4></div>
                        <div class="col-12 palyer-1" style="transform: rotate(180deg); text-align: center;">
                            <div style="width: 235px;">
                                <ul class="hand">
                                    <li v-for="n in this.config['p' + ((this.config.me + 2) % 4)]['cardCount']">
                                        <div class="cardd back">*</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="row board-middle-row">
                        <div class="col-3 palyer-1" style="text-align: center;">
                            <div style="transform: rotate(90deg); width: 235px;">
                                <ul class="hand">
                                    <li v-for="n in this.config['p' + ((this.config.me + 3) % 4)]['cardCount']">
                                        <div class="cardd back">*</div>
                                    </li>
                                </ul>
                                <div style="width:100%;text-align: center;"><h4 class="mb-0 mt-4">{{this.config['p' + ((this.config.me + 3) % 4)]['name']}}</h4></div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="row h-100">
                                <div class="col-4 h-100" style="display: flex;align-items: center;justify-content: center;">
                                    <div class="cardd rank-7 spades" style="text-align: center;">
                                        <span class="rank">7</span>
                                        <span class="suit">&spades;</span>
                                    </div>
                                </div>
                                <div class="col-4 h-100">
                                    <div class="row h-50">
                                        <div class="col-12" style="display: flex;align-items: center;justify-content: center;">
                                            <div class="cardd rank-7 spades" style="text-align: center;">
                                                <span class="rank">7</span>
                                                <span class="suit">&spades;</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row h-50">
                                        <div class="col-12" style="display: flex;align-items: center;justify-content: center;">
                                            <div class="cardd rank-7 spades" style="text-align: center;">
                                                <span class="rank">7</span>
                                                <span class="suit">&spades;</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-4" style="display: flex;align-items: center;justify-content: center;">
                                    <div class="cardd rank-7 spades" style="text-align: center;">
                                        <span class="rank">7</span>
                                        <span class="suit">&spades;</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-3 palyer-1" style="text-align: center;">
                            <div style="transform: rotate(-90deg); width: 235px;">
                                <ul class="hand">
                                    <li v-for="n in this.config['p' + ((this.config.me + 1) % 4)]['cardCount']">
                                        <div class="cardd back">*</div>
                                    </li>
                                </ul>
                                <div style="width:100%;text-align: center;"><h4 class="mb-0 mt-4">{{this.config['p' + ((this.config.me + 1) % 4)]['name']}}</h4></div>
                            </div>
                        </div>
                    </div>
                    <div class="row board-bottom-row">
                        <div class="col-12 pt-5" style="text-align: center; display:flex; align-items: center;justify-content: center;">

                            <a class="cardd" :class="getClasses(card.number,card.suit)" v-for="(card,index) in this.config.myCards" :key="index">
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
                    <div class="card-body" style="height:75%;overflow-y: scroll;">
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
                        <form @submit.prevent="sendMessage">
                            <div class="gorm-group pb-3">
                                <label for="message">Message:</label>
                                <input type="text" v-model="message" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-success">Send</button>
                        </form>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
import io from 'socket.io-client';
import api from '@/services/api.js'
export default {
    name: 'Home',
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
            loginError: null,
            config: {
                p0 : {
                    name:"rahul",
                    cardCount: 7,
                    tableCard: null
                },
                p1: {
                    name:"abu",
                    cardCount: 7
                },
                p2: {
                    name:"aishwarya",
                    cardCount: 7
                },
                p3: {
                    name:"rp",
                    cardCount: 8
                },
                me: 3,
                myCards: [
                    {
                        number: '7',
                        suit: 'spades'
                    },
                    {
                        number: '9',
                        suit: 'spades'
                    },
                    {
                        number: '10',
                        suit: 'spades'
                    },
                    {
                        number: 'A',
                        suit: 'spades'
                    },
                    {
                        number: 'Q',
                        suit: 'spades'
                    },
                    {
                        number: 'K',
                        suit: 'spades'
                    },
                    {
                        number: 'J',
                        suit: 'spades'
                    },
                    {
                        number: '7',
                        suit: 'spades'
                    },
                ]
            }
        }
    },
    props: {
    },
    methods: {
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
        login(e) {
            e.preventDefault();
            if (this.username && this.username.length > 0 && this.table && this.table.length > 0) {
                api.login(this.username, this.table)
                .then(resp => {
                    if (resp.loggedIn === true) {
                        this.isLoggedIn = resp.loggedIn
                        this.identityInfo = resp.info
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
            }
            this.socket = io.connect('localhost:3000', {query : "identity=" + this.identity})
            this.socket.on('MESSAGE', (data) => {
                this.messages = [...this.messages, data];
                // you can also do this.messages.push(data)
            });
            this.socket.on('UPDATE_TABLE', (data) => {
                this.tableData = data;
                // you can also do this.messages.push(data)
            });
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
    height:30%;
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
</style>