const bodyParser=require("body-parser")
const express=require("express")
const app=express();
const path=require("path")
const cors=require("cors");
const {connect}=require("./db")
const router=require("./Routes/index")
const port =5000

app.use(cors())
app.use(bodyParser.json({limit:"50mb"}))
app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}))
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Hello This is My backend")
})
app.use("/api",router)
connect();
 app.use((req,res,next)=>{
    req.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Allow-Origin","*")
    next()
 })

app.listen(port,()=>{
    console.log("server is running on port ",port)
})



// const bodyParser = require("body-parser");
// const express = require("express");
// const { Server } = require("socket.io");
// const http = require("http");
// const app = express();
// const server = http.createServer(app);
// const path = require("path");
// const cors = require("cors");
// const { connect } = require("./db");
// const router = require("./Routes/index");
// const port = 5000;

// app.use(cors());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Hello This is My backend");
// });
// app.use("/api", router);
// connect();
// app.use((req, res, next) => {
//   req.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });

// const io = new Server(server, {
//     cors: {
//       origin: "*", // Allow all origins for development
//     },
//   });

// // Store active user sockets
// const userSockets = {};

// // Socket.IO Connection
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Listen for user login and map their socket
//   socket.on("registerUser", (userId) => {
//     userSockets[userId] = socket.id;
//     console.log(`User ${userId} registered with socket ${socket.id}`);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     for (const [userId, socketId] of Object.entries(userSockets)) {
//       if (socketId === socket.id) {
//         delete userSockets[userId];
//         console.log(`User ${userId} disconnected.`);
//       }
//     }
//   });
// });

// app.listen(port, () => {
//   console.log("server is running on port ", port);
// });
