import dotenv from 'dotenv';
dotenv.config()
import express from "express";
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser'
import cors from "cors"
import {io,app,server} from './lib/socket.js'
import path from 'path';

dotenv.config();

app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
    ))
    app.use(express.json({ limit: '5mb' }))
    app.use(cookieParser())

    
const PORT = process.env.PORT
const __dirname = path.resolve()
app.use('/api/auth',authRoutes)
app.use('/api/message',messageRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(PORT , ()=>{
    console.log("Port is running in port:" + PORT);
    connectDB()
})