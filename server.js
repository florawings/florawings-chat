const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const bodyParser = require("body-parser")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))
app.use(bodyParser.json())

let usersDB = []

// REGISTER
app.post("/register",(req,res)=>{

const {username,email,password,dob,country}=req.body

if(!username || !email || !password){
return res.json({ok:false,msg:"Missing fields"})
}

let exist = usersDB.find(u=>u.email===email)

if(exist){
return res.json({ok:false,msg:"Email already registered"})
}

usersDB.push({username,email,password,dob,country})

res.json({ok:true})

})

// LOGIN
app.post("/login",(req,res)=>{

const {username,password}=req.body

let user = usersDB.find(
u=>u.username===username && u.password===password
)

if(!user){
return res.json({ok:false})
}

res.json({ok:true,name:user.username})

})

// CHAT

let online = {}

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

online[socket.id]=name
io.emit("msg",name+" joined")

})

socket.on("chat",(data)=>{

io.emit("msg",data.name+": "+data.msg)

})

socket.on("disconnect",()=>{

let name=online[socket.id]

if(name){
io.emit("msg",name+" left")
}

delete online[socket.id]

})

})

server.listen(3000,()=>{
console.log("Server started")
})
