const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use('/node_modules', express.static(__dirname + '/node_modules'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/:room', function(req, res) {
    res.sendFile(__dirname + '/chat.html')
})

io.sockets.on('connection', function(socket) {
    socket.on('room', function(room) {
        socket.join(room);
    });
});

io.on('connection', function(socket) {
    console.log('a user connected')
    socket.on('room', function(room) {
        console.log('joined room: ' + room)
        socket.on('disconnect', function() {
            console.log('user disconnected')
        })
        socket.on('chat message', function(userName, msg) {
            console.log(msg)
            io.sockets.in(room).emit('chat message', userName, msg);
        })
    })
})

http.listen(3000, function() {
    console.log('listening on *:3000')
})
