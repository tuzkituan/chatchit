var express = require('express')
const http = require("http");
var app = express();
const server = http.createServer(app);

const socketIo = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

socketIo.on("connection", (socket) => {
    console.log('New client connected', socket.id);
    socket.on("sendDataClient", function (data) {
        console.log("🚀  ~ New message: ", data)
        socketIo.emit("sendDataServer", { data });
    })
    socket.on("disconnect", () => {
        console.log("Client disconnected"); // Khi client disconnect thì log ra terminal.
    });
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});