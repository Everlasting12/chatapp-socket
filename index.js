const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


let users = [];

const addUser = (userid, socketid) =>
{
    !users.some(user => user.userid === userid) && users.push({ userid, socketid })

}
const removeUser = (socketid) =>
{
    users = users.filter(user => user.socketid !== socketid)
}
const getUser = (userid) =>
{
    return users.find(user => user.userid === userid)
}


io.on('connection', (socket) =>
{
    console.log(socket.id, 'a user connected');

    socket.on("add_user", userid =>
    {
        addUser(userid, socket.id)
        io.emit("getUsers", users)
    })
    socket.on('chat_message', (msg) =>
    {
        const user = getUser(msg.receiverid);
        io.to(user.socketid).emit("chat_message", msg);
    });
    socket.on('disconnect', () =>
    {
        console.log('user disconnected');
    });
});

server.listen(8000, () =>
{
    console.log('listening on *:8000');
});