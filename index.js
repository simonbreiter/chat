const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const _ = require('lodash')

const user = (name) => {
    return {
        name: name,
    }
}

const room = (name) => {
    return {
        name: name,
        users: [],
        addUser(name) {
            this.users.push(user(name))
        },
        removeUser(name) {
            this.users = _.reject(this.users, user => user.name === name)
        },
        getUser() {

        }
    }
}

const rooms = {
    rooms: [],
    addRoom(name) {
        console.log(name)
        if (this.rooms.find(room => room.name === name) === undefined) {
            this.rooms.push(room(name))
        }
    },
}

app.use('/node_modules', express.static(__dirname + '/node_modules'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/:room', function(req, res) {
    res.sendFile(__dirname + '/chat.html')
})

io.sockets.on('connection', function(socket) {
    socket.on('room', function(room) {
        socket.join(room)
        rooms.addRoom(room)
    });
});

io.on('connection', function(socket) {
    socket.on('room', function(room, user) {
        console.log(`${user} joined room ${room}`)
        const currentRoom = rooms.rooms.filter(r => r.name === room)[0]
        console.log(currentRoom.users)
        currentRoom.addUser(user)
        io.sockets.in(room).emit('system message', {msg: `${user} joined!`});
        io.sockets.in(room).emit('user changed', {users: currentRoom.users});
        socket.on('disconnect', function() {
            currentRoom.removeUser(user)
            console.log(`${user} disconnected room ${room}`)
            io.sockets.in(room).emit('system message', {user: "System", msg: `${user} disconnected!`});
            io.sockets.in(room).emit('user changed', {users: currentRoom.users});
        })
        socket.on('chat message', function(data) {
            io.sockets.in(room).emit('chat message', {user: data.user, msg: data.msg});
        })
    })
})

http.listen(3000, function() {
    console.log('listening on *:3000')
})
