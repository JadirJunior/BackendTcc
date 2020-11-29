require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const db = require("./database");
const chat = require("./chat/saveMessage");
const routes = require("./routes");
const messages = [];
const cors = require("cors");

io.on("connection", (socket) => {
  console.log("A user have been connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("chat message", (data) => {
    io.emit("messageReceived", data);
    chat.saveMessage(data.Author, data.Content, data.Destinatario);
    messages.push(data);
  });

  socket.on("render Messages", () => {
    io.emit("messagesList", messages);
  });
});

app.use(cors());
app.use(express.json());
app.use(routes);

http.listen(3333, async () => {
  const Messages = await db("Mensagens").select("*");
  Messages.forEach((message) => {
    messages.push(message);
  });

  console.log("Iniciando o servidor...");
});
