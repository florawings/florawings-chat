const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

let users = {};
let muted = {};
let banned = [];

io.on("connection", (socket) => {

  socket.on("join", (name) => {

    if (banned.includes(name)) {
      socket.emit("system","You are banned");
      socket.disconnect();
      return;
    }

    users[socket.id] = name;

    io.emit("system", name + " joined");

    updateUsers();

  });

  socket.on("chat", (msg) => {

    let name = users[socket.id];

    if (muted[name]) return;

    io.emit("chat", { name, msg });

  });

  socket.on("kick", (target) => {

    for (let id in users) {
      if (users[id] === target) {
        io.to(id).emit("system","You were kicked by admin");
        io.sockets.sockets.get(id)?.disconnect();
      }
    }

  });

  socket.on("mute", (target) => {

    muted[target] = true;

    io.emit("system", target + " was muted");

  });

  socket.on("ban", (target) => {

    banned.push(target);

    for (let id in users) {
      if (users[id] === target) {
        io.sockets.sockets.get(id)?.disconnect();
      }
    }

  });

  socket.on("disconnect", () => {

    let name = users[socket.id];

    delete users[socket.id];

    io.emit("system", name + " left");

    updateUsers();

  });

  function updateUsers(){

    let list = Object.values(users);

    io.emit("users", list);

  }

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
