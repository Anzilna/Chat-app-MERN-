import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import {io, app, server} from './lib/socket.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - allow multiple origins in production
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
           ? [process.env.FRONTEND_URL || "*"] 
           : "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    // The correct path to the frontend build directory
    // Assuming your backend is in a 'backend' folder at the root
    const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
    
    app.use(express.static(frontendBuildPath));
  
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
}

server.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
    connectDB();
});