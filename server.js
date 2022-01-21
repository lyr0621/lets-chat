const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
var connected_users = [];
var messages = [];

app.get('/',(req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

io.on("connection", socket => {
    console.log("a user connected");
    let userName = "";
    updateUserNames();

    //login
    socket.on('login', (name,callback) => {
        io.emit('output', {
            messages: messages,
        });
        if(name.trim().length === 0){
            return;
        } else if (connected_users.indexOf(name) > -1) {
            return;
        }
        callback(true);
        socket.name = name;
        connected_users.push(name);
        updateUserNames();
    });


    //send message
    socket.on('chat message', msg => {
        if (msg[0] === "") {
            return
        }
        console.log(msg[1] + " says: "+ msg[0]);
        var date = new Date();
        var time = date.getTime();
        msg.push(time);
        msg.push(date.toLocaleDateString() + " " + date.toLocaleTimeString());
        //console.log(date.toLocaleDateString() + " " + date.toLocaleTimeString());
        messages.push(msg);
        console.log(messages);
        io.emit('output', {
            messages: messages,
        });
    });


    //disconect
    socket.on("disconnect", () => {
        console.log("user disconnected");
        connected_users.splice(connected_users.indexOf(socket.name), 1);
        updateUserNames();
    });

    function updateUserNames() {
        console.log(connected_users);
        io.emit("loadUsers", connected_users);
    }
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});