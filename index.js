const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const socket = require("socket.io")

const app = express();
dotenv.config();
app.use(express.json());

app.use(cors());

const server = app.listen(process.env.PORT || 8000)

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use("/auth", require("./routers/userRouter"))
app.use("/message", require("./routers/messageRouter"))


//Socket Programming
const io = socket(server, {
    cors: {
        origin: "https://messanger26-backend.herokuapp.com",
        methods: ["GET", "POST"],
        credentials: true
    }
})

global.onlineUsers = new Map()

io.on("connection", (socket) => {
    global.chatSocket = socket
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    })

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message)
        }
    })
})