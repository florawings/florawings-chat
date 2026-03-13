const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = [
 {name:"Main room", id:"main"},
 {name:"Adult room", id:"adult"},
 {name:"Hindi room", id:"hindi"},
 {name:"Quiz room", id:"quiz"}
];

let users = [];

app.get("/rooms",(req,res)=>{
 res.json(rooms);
});

io.on("connection",(socket)=>{

 socket.on("join",(data)=>{

  socket.join(data.room);

  users.push({
   id:socket.id,
   name:data.name,
   room:data.room
  });

  io.to(data.room).emit("system",data.name+" joined");

  io.to(data.room).emit(
   "users",
   users.filter(u=>u.room===data.room)
  );

 });

 socket.on("chat",(data)=>{

  io.to(data.room).emit("chat",{
   name:data.name,
   msg:data.msg
  });

 });

 socket.on("disconnect",()=>{

  users = users.filter(u=>u.id!==socket.id);

 });

});

server.listen(3000,()=>{
 console.log("server running");
});
