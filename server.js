const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

let users = [];   // registered users
let online = {};  // socket users

// REGISTER
app.post("/register", (req, res) => {

const { username, email, password, dob, country } = req.body;

if (!username || !password) {
return res.json({ ok:false, msg:"Missing fields" });
}

if (users.find(u => u.username === username)) {
return res.json({ ok:false, msg:"Username already exists" });
}

users.push({
username,
email,
password,
dob,
country,
role:"user"
});

res.json({ ok:true });

});

// LOGIN
app.post("/login", (req, res) => {

const { username, password } = req.body;

const user = users.find(
u => u.username === username && u.password === password
);

if (!user) {
return res.json({ ok:false });
}

res.json({
ok:true,
name:user.username,
role:user.role,
dp:""
});

});

// SOCKET CHAT
io.on("connection
