const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(express.json());
// app.use(cookieParser());
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
}));

app.listen(process.env.PORT,() => console.log(`Server started at ${process.env.PORT}`))

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use("/auth",require("./routers/userRouter"))