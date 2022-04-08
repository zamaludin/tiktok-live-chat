require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { SocketAddress } = require('net');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-livestream-chat-connector');
const axios = require('axios')
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

let globalConnectionCount = 0;

setInterval(() => {
    io.emit('statistic', { globalConnectionCount });
}, 5000)

const request = require('request');

function printChat(name, chat, pp){
    let options = {
        uri: "http://[::1]:8000/print-chat?name="+name+"&chat="+chat+"&profile="+pp,
        method: 'GET',
    
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error("httpRequests : error " + error);
        }
        if (response) {
            let statusCode = response.status_code;
            console.log(response)
        }
    });
}

function printLike(name, like, pp){
    let options = {
        uri: "http://[::1]:8000/print-like?name="+name+"&like="+like+"&profile="+pp,
        method: 'GET',
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error("httpRequests : error " + error);
        }
        if (response) {
            let statusCode = response.status_code;
            console.log(response)
        }
    });
}

function printGift(name, giftName, giftCount, pp){
    let options = {
        uri: "http://[::1]:8000/print-like?name="+name+"&giftname="+giftName+"&giftcount="+giftCount+"&profile="+pp,
        method: 'GET',
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error("httpRequests : error " + error);
        }
        if (response) {
            let statusCode = response.status_code;
            console.log(response)
        }
    });
}

function printLike(name, like){
    let options = {
        uri: "http://[::1]:8000/print-chat?name="+name+"&chat="+chat,
        method: 'GET',
    
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error("httpRequests : error " + error);
        }
        if (response) {
            let statusCode = response.status_code;
            console.log(response)
        }
    });
}

io.on('connection', (socket) => {
    let chatConnection;
    var uniqueIdG = "";
    function disconnectChat() {
        if (chatConnection) {
            chatConnection.disconnect();
            chatConnection = null;
            socket.emit()
            socket.emit('setUniqueId', uniqueIdG, {
                enableExtendedGiftInfo: true
            });
        }
    }

    socket.on('setUniqueId', (uniqueId, options) => {
        uniqueIdG = uniqueId
        console.log('connecting', uniqueId, options);

        let thisConnection = new WebcastPushConnection(uniqueId, options);

        thisConnection.connect().then(state => {
            disconnectChat();
            chatConnection = thisConnection;
            if (!socket.connected) {
                disconnectChat();
                return;
            }
            socket.emit('setUniqueIdSuccess', state);
        }).catch(err => {
            socket.emit('setUniqueIdFailed', err.toString());
        })

        thisConnection.on('roomUser', msg => socket.emit('roomUser', msg));
        thisConnection.on('member', msg => socket.emit('member', msg));
        thisConnection.on('chat', msg => {
            socket.emit('chat', msg)
            printChat(msg.nickname, msg.comment, msg.profilePictureUrl)
        });
        thisConnection.on('gift', msg => {
            socket.emit('gift', msg)
            printGift(msg.nickname, msg.extendedGiftInfo.name, msg.extendedGiftInfo.diamond_count, msg.profilePictureUrl)
        });
        thisConnection.on('social', msg => socket.emit('social', msg));
        thisConnection.on('like', msg => {
            socket.emit('like', msg)
            printLike(msg.nickname, msg.likeCount, msg.profilePictureUrl)
        });
        thisConnection.on('streamEnd', () => socket.emit('streamEnd'));

        thisConnection.on('connected', () => {
            console.log("chatConnection connected");
            globalConnectionCount += 1;
        });

        thisConnection.on('disconnected', () => {
            console.log("chatConnection disconnected");
            globalConnectionCount -= 1;
            socket.emit('setUniqueId', uniqueIdG, {
                enableExtendedGiftInfo: true
            });
        });

        thisConnection.on('error', (err) => {
            console.error(err);
        });
    })

    socket.on('disconnect', () => {
        disconnectChat();
        console.log('client disconnected');
    })
    socket.emit('setUniqueId', uniqueIdG, {
        enableExtendedGiftInfo: true
    });
    console.log('client connected');
});

// Server frontend files
app.use(express.static('public'));

httpServer.listen(process.env.PORT || 8080);