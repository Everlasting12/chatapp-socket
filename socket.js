
const io = require("socket.io")(8000, {
    cors: {
        origin: "http://localhost:3000",
    },
})

let users = [];

const addUser = (userId, socketId) =>
{
    !users.some(user => user.userId === userId) && users.push({ userId, socketId })
}
const removeUser = (socketId) =>
{
    users = users.filter(user => user.socketId !== socketId)
}
const getUser = (userId) =>
{
    return users.find(user => user.userId === userId)
}

io.on("connection", socket =>
{
    console.log(socket.id, "a user connected")

    // add a user
    socket.on('addUser', (userId) =>
    {
        // addUser(userId, socket.id);
        const existingUser = users.find(u => u.userId === userId)
        if (!existingUser)
        {
            users.push({ userId, socketId: socket.id })
        }
        else
        {
            users.forEach(u =>
            {
                if (u.userId === userId) { u.socketId = socket.id }
            })
        }
        io.emit("getUsers", users)
    })

    // send message
    socket.on("chatmessage", ({ senderId, receiverId, text }) =>
    {
        console.log({ senderId, receiverId, text })
        const user = getUser(receiverId);
        user && io.to(user.socketId).emit("getMessage", {
            senderId, text
        })
    })

    //remove a user
    socket.on("disconnect", () =>
    {
        console.log(socket.id, "a user disconnected")
        removeUser(socket.id);
        io.emit("getUsers", users)
    })
})