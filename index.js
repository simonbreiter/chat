const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use('/node_modules', express.static(__dirname + '/node_modules'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', function(socket) {
    console.log('a user connected')
    socket.on('disconnect', function() {
        console.log('user disconnected')
    })
    socket.on('chat message', function(userName, msg) {
        io.emit('chat message', userName, msg)
    })
})

http.listen(3000, function() {
    console.log('listening on *:3000')
})
