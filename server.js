const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);    //import some modules for http server and socket io

var connected_users = [];      //store connected users
var messages = [];        //store all the messages

const mysql = require('mysql');         //import mysql module

var connection = mysql.createConnection({
    host: "localhost",
    user: "www",
    password:"www",
    database: "www",
});          //connect to database
connection.connect();
console.log("<--Connected to database, loading messages...-->");
connection.query('SELECT * FROM chat_log', function (error, results, fields) {
    if (error) throw error;
    messages = results;
    console.log("<--loaded " + messages.length + " message(s) from database-->");
});


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
        connection.query("INSERT INTO `chat_log` (`user_name`, `message`) VALUES ('" + msg[1]+"', '"+msg[0]+"');", function (error, results, fields) {
            if (error) throw error;
            console.log("<--message updated to databases-->");
        });
        connection.query('SELECT * FROM chat_log', function (error, results, fields) {
            if (error) throw error;
            messages = results;
        });
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