import User from "../models/user.model.js"; 
import bcrypt from "bcryptjs"; 
import  {generateToken}  from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  console.log(req.body);

  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ errorMessage: "All fields are required" });
    }

    if (fullName.length < 3) {
      return res
        .status(400)
        .json({ errorMessage: "Full name must be at least 3 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ errorMessage: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ errorMessage: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errorMessage: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const login =async (req,res) => {
  const {email , password} = req.body

  try {
    const user = await User.findOne({email})
    
    if(!user){
      return res.status(400).json({
        message: "invalid credentials"
      })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect){
      return res.status(400).json({
        message: "invalid credentials"
      })
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const logout = (req,res) => {
try {
  res.cookie("chatjwt", "", {
    maxAge:0
  })
  return res.status(200).json({ message: "Logged out successfully" });

} catch (error) {
  console.error("Error during logout :", error);
  res.status(500).json({ error: "Internal server error" });
}

}

export const updateProfile =async (req,res) => {
  
 
  try {
    const {profilePic} = req.body;
    const userId = req.user._id

    if (!profilePic) {
      return res.status(400).json({ errorMessage: "profile Pic is required" });
    }

    const  uploadResponse = await cloudinary.uploader.upload(profilePic)

    const updatedUser = await User.findByIdAndUpdate(userId,{
      profilePic:uploadResponse.secure_url
    },{new:true})

    return res.status(200).json({ Message: "profile Pic updated" ,updatedUser});


  } catch (error) {
    console.error("Error during updateProfile :", error);
    res.status(500).json({ error: "Internal server error" });
  }

  }
  

export const checkAuth = async (req,res) => {
 
   try {
    res.status(200).json(req.user)  
   } catch (error) {
    console.error("Error during checkAuth :", error);
    res.status(500).json({ error: "Internal server error" });
   }
 }
