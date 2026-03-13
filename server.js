const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

let users = {}

io.on("connection", (socket) => {

  socket.on("join", ({name, room}) => {

    socket.join(room)

    users[socket.id] = { name, room }

    io.to(room).emit("system", name + " joined")

  })

  socket.on("chat", (msg) => {

    const user = users[socket.id]

    if(!user) return

    io.to(user.room).emit("chat", {
      name: user.name,
      msg: msg
    })

  })

  socket.on("disconnect", () => {

    const user = users[socket.id]

    if(user){
      io.to(user.room).emit("system", user.name + " left")
    }

    delete users[socket.id]

  })

})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})
