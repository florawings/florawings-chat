const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

/* ---------------- USERS DATABASE (temporary memory) ---------------- */

let users = [];
let onlineUsers = {};

/* ---------------- REGISTER ---------------- */

app.post("/register", (req, res) => {

const { username, email, password, dob, country } = req.body;

if (!username || !password || !email) {
return res.json({ ok:false, msg:"Missing fields" });
}

let exists = users.find(u => u.username === username);

if (exists) {
return res.json({ ok:false, msg:"Username already exists" });
}

users.push({
username,
email,
password,
dob,
country,
role:"user",
dp:""
});

res.json({ ok:true });

});

/* ---------------- LOGIN ---------------- */

app.post("/login", (req, res) => {

const { username, password } = req.body;

let user = users.find(
u => u.username === username && u.password === password
);

if (!user) {
return res.json({ ok:false });
}

res.json({
ok:true,
name:user.username,
role:user.role,
dp:user.dp
});

});

/* ---------------- SOCKET CHAT ---------------- */

io.on("connection", (socket) => {

socket.on("join", (name) => {

onlineUsers[socket.id] = name;

io.emit("system", name + " joined");

});

socket.on("chat", (msg) => {

let name = onlineUsers[socket.id];

io.emit("chat", {
name:name,
msg:msg
});

});

socket.on("disconnect", () => {

let name = onlineUsers[socket.id];

if(name){
io.emit("system", name + " left");
}

delete onlineUsers[socket.id];

});

});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
