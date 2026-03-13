const express = require("express")
const http = require("http")
const {Server} = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))

let usersDB = []     // registered users
let onlineUsers = []
let messages = []

function createGuest(){
 return "Guest_"+Math.floor(Math.random()*9000+1000)
}

app.post("/register",(req,res)=>{

 const {username,password} = req.body

 usersDB.push({
  username,
  password,
  role:"user",
  gold:100,
  color:"#000000",
  avatar:"default.png"
 })

 res.json({success:true})

})

app.post("/login",(req,res)=>{

 const {username,password} = req.body

 const user = usersDB.find(
  u=>u.username===username && u.password===password
 )

 if(user){
  res.json(user)
 }else{
  res.json({error:"invalid"})
 }

})

io.on("connection",(socket)=>{

 let currentUser = {
  name:createGuest(),
  role:"guest",
  gold:0,
  color:"#000"
 }

 socket.on("loginUser",(user)=>{
  currentUser = user
 })

 socket.on("join",(room)=>{

  socket.join(room)

  onlineUsers.push({
   id:socket.id,
   name:currentUser.name
  })

  io.to(room).emit("system",currentUser.name+" joined")

 })

 socket.on("chat",(data)=>{

  const msg = {
   id:Date.now(),
   name:currentUser.name,
   msg:data.msg,
   color:currentUser.color
  }

  messages.push(msg)

  io.emit("chat",msg)

 })

 socket.on("deleteMsg",(id)=>{

  if(currentUser.role!=="guest"){

   messages = messages.filter(m=>m.id!==id)

   io.emit("deleteMsg",id)

  }

 })

 socket.on("promote",(data)=>{

  if(currentUser.role==="owner"){

   const u = usersDB.find(x=>x.username===data.user)

   if(u){
    u.role="moderator"
   }

  }

 })

 socket.on("disconnect",()=>{
  onlineUsers = onlineUsers.filter(u=>u.id!==socket.id)
 })

})

server.listen(3000,()=>{
 console.log("Server running")
})
