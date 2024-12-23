const express = require("express");
const http = require("http"); // solo para http://
const https = require("https"); // solo para https://
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

// certificados root : /home/fernando/.local/share/mkcert
// Para habilitar el certificado ssl en desarrollo Cargar el certificado y la clave
// const options = {
//     key: fs.readFileSync("/home/fernando/localhost+2-key.pem"),
//     cert: fs.readFileSync("/home/fernando/localhost+2.pem"),
// };

// console.log("serda",options);

// const server = https.createServer(options, app);

const server = http.createServer(app);

const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static("public"));

// Cargar mensajes desde el archivo JSON
let messages = [];
if (fs.existsSync("data.json")) {
    messages = JSON.parse(fs.readFileSync("data.json"));
}

// Enviar mensajes existentes al cliente
io.on("connection", (socket) => {
    socket.emit("loadMessages", messages);

    // Enviar una notificación a todos los clientes
    socket.on("sendNotification", (data) => {
        // console.log("liste notification server");
        io.emit("notification", data);
    });

    socket.on("sendMessage", (msg) => {
        messages.push(msg);
        fs.writeFileSync("data.json", JSON.stringify(messages));
        io.emit("receiveMessage", msg);
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/clear-chats", (req, res) => {
    messages = [];
    fs.writeFileSync("data.json", JSON.stringify(messages));
    res.send(req.body);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});