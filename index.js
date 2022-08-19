var express = require('express')
const http = require("http");
var app = express();
const server = http.createServer(app);

const socketIo = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

let users = []
let messages = []

socketIo.on("connection", (socket) => {
    console.log('>> New client connected', socket.id);
    socket.on("sendDataClient", function (data) {
        socketIo.emit("sendDataServer", { data });
        let find = messages.find(x => x.id === data.id || x.id === data.receiver)
        if (!find) {
            messages.push({
                id: data.id,
                messages: [data]
            })
            messages.push({
                id: data.receiver,
                messages: [data]
            })
        } else {
            messages = messages.map(x => {
                if (x.id === data.id || x.id === data.receiver) {
                    return {
                        ...x,
                        messages: [...x.messages, data]
                    }
                }
                return x
            }
            )
        }
        console.log("🚀  ~ messages", messages)
    })
    socket.on('login', function (data) {
        console.log("🚀  ~ New user logged: ", data)
        users.push({ id: socket.id, username: data.username });
        socketIo.emit("sendActiveUser", users.map(x => x.username));
    })

    socket.on("refresh", (username) => {
        const returning = messages.find(x => x.id === username)?.messages || [];
        console.log("🚀  ~ returning", returning)
        socketIo.emit("getMessages", returning);
    });

    socket.on('logout', function (usernameProp) {
        console.log("🚀  ~ User logged out: ", usernameProp)
        users = users.filter(x => x.username !== usernameProp);
        socketIo.emit("sendActiveUser", users.map(x => x.username));
    })
    socket.on("disconnect", () => {
        console.log('>> user ' + socket.id + ' disconnected');
        users = users.filter(x => x.id !== socket.id);
    });
})

server.listen(1405, () => {
    console.log('Server is running');
});
