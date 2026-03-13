const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let users = {}
let muted = {}
let banned = []

app.use(express.static("public"))

io.on("connection", (socket) => {

  socket.on("join", (name) => {

    if (banned.includes(name)) {
      socket.emit("system","You are banned")
      socket.disconnect()
      return
    }

    users[socket.id] = name
    io.emit("system", name + " joined")

  })

  socket.on("chat", (msg) => {

    let name = users[socket.id]

    if (muted[name]) {
      socket.emit("system","You are muted")
      return
    }

    io.emit("chat", {
      user:name,
      text:msg
    })

  })

  socket.on("kick", (target) => {

    for (let id in users) {
      if (users[id] === target) {
        io.to(id).emit("system","You were kicked")
        io.sockets.sockets.get(id).disconnect()
      }
    }

  })

  socket.on("mute", (target) => {
    muted[target] = true
    io.emit("system", target + " muted")
  })

  socket.on("ban", (target) => {

    banned.push(target)

    for (let id in users) {
      if (users[id] === target) {
        io.sockets.sockets.get(id).disconnect()
      }
    }

    io.emit("system", target + " banned")

  })

  socket.on("disconnect", () => {

    let name = users[socket.id]

    delete users[socket.id]

    if(name){
      io.emit("system", name + " left")
    }

  })

})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log("Server running on " + PORT)
})
