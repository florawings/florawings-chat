const express = require("express")
const http = require("http")
const {Server} = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

let users={}
let muted={}
let banned=[]

app.get("/",(req,res)=>{

res.send(`
<!DOCTYPE html>
<html>
<head>

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Florawings Chat</title>

<style>

body{
margin:0;
font-family:Arial;
background:#0f172a;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
color:white;
}

.box{
width:95%;
max-width:700px;
background:#1e293b;
border-radius:10px;
overflow:hidden;
display:flex;
}

.chat{
flex:3;
display:flex;
flex-direction:column;
background:white;
color:black;
}

.users{
flex:1;
background:#0f172a;
padding:10px;
}

.messages{
flex:1;
overflow:auto;
padding:10px;
}

.input{
display:flex;
padding:10px;
border-top:1px solid #ccc;
}

.input input{
flex:1;
padding:8px;
}

button{
margin-left:5px;
padding:8px;
}

.login{
position:absolute;
top:20px;
}

</style>

<script src="/socket.io/socket.io.js"></script>

</head>

<body>

<div class="login">

<input id="name" placeholder="username">

<button onclick="login()">Join</button>

</div>

<div class="box">

<div class="chat">

<div class="messages" id="messages"></div>

<div class="input">

<input id="msg">

<input type="file" id="img">

<button onclick="send()">Send</button>

</div>

</div>

<div class="users">

<b>Online</b>

<div id="users"></div>

<hr>

<b>Admin</b>

<input id="adminUser" placeholder="username">

<button onclick="kick()">Kick</button>
<button onclick="mute()">Mute</button>
<button onclick="ban()">Ban</button>

</div>

</div>

<script>

let socket = io()
let name=""

function login(){

name=document.getElementById("name").value

socket.emit("join",name)

}

socket.on("system",(msg)=>addMsg(msg))

socket.on("chat",(data)=>{

let div=document.createElement("div")

if(data.type==="text"){
div.innerText=data.name+": "+data.msg
}

if(data.type==="image"){
div.innerHTML=data.name+"<br><img src='"+data.url+"' width='120'>"
}

document.getElementById("messages").appendChild(div)

})

socket.on("users",(list)=>{

let box=document.getElementById("users")

box.innerHTML=""

list.forEach(u=>{

let d=document.createElement("div")
d.innerText=u

box.appendChild(d)

})

})

function send(){

let text=document.getElementById("msg").value
let file=document.getElementById("img").files[0]

if(text){

socket.emit("chat",{type:"text",msg:text})

}

if(file){

let r=new FileReader()

r.onload=function(e){

socket.emit("chat",{type:"image",url:e.target.result})

}

r.readAsDataURL(file)

}

document.getElementById("msg").value=""

}

function kick(){

socket.emit("kick",document.getElementById("adminUser").value)

}

function mute(){

socket.emit("mute",document.getElementById("adminUser").value)

}

function ban(){

socket.emit("ban",document.getElementById("adminUser").value)

}

function addMsg(m){

let d=document.createElement("div")

d.innerText=m

document.getElementById("messages").appendChild(d)

}

</script>

</body>
</html>
`)

})

io.on("connection",(socket)=>{

socket.on("join",(name)=>{

if(banned.includes(name)){
socket.emit("system","You are banned")
socket.disconnect()
return
}

users[socket.id]=name

io.emit("system",name+" joined")

updateUsers()

})

socket.on("chat",(data)=>{

let name=users[socket.id]

if(muted[name]) return

io.emit("chat",{name,...data})

})

socket.on("kick",(u)=>{

for(let id in users){
if(users[id]===u){
io.sockets.sockets.get(id)?.disconnect()
}
}

})

socket.on("mute",(u)=>{

muted[u]=true

})

socket.on("ban",(u)=>{

banned.push(u)

})

socket.on("disconnect",()=>{

let name=users[socket.id]

delete users[socket.id]

io.emit("system",name+" left")

updateUsers()

})

function updateUsers(){

io.emit("users",Object.values(users))

}

})

const PORT=process.env.PORT||3000

server.listen(PORT,()=>{

console.log("Server running")

})
