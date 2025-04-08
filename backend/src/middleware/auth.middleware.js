import jwt from 'jsonwebtoken'
import User from "../models/user.model.js"; 


export const  protectRoute =async (req, res, next) => {

    try {
        const token = req.cookies.chatjwt

        if(!token){
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });

            res.redirect('')
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        if(!decodedToken){
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });

            res.redirect('')
        }

        const user = await User.findById(decodedToken.userId).select("-password")

        if(!user){
            return res.status(404).json({ message: "User not found" });

            res.redirect('')
        }

        req.user = user

        next()
    } catch (error) {
        console.error("Error during protectRoute middleware :", error);
        res.status(500).json({ error: "Internal server error" });
    }
   
}