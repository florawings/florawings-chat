const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname,"public")))

let users = {}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{
users[socket.id] = name
io.emit("message",name + " joined")
})

socket.on("chat",(data)=>{
io.emit("message",users[socket.id] + ": " + data)
})

socket.on("disconnect",()=>{
io.emit("message",users[socket.id] + " left")
delete users[socket.id]
})

})

server.listen(process.env.PORT || 3000,()=>{
console.log("Server running")
})
