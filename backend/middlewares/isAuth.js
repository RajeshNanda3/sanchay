import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { prisma } from "../config/prisma.js";
import { stringify } from "querystring";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    // console.log(token, "latest");
    if (!token) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No token provided" });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // stringDecodedData = stringify(decodedData)
    // console.log(decodedData,"decodedData")
    // if (!decodedData) {
    //   return res.status(400).json({ message: "Unauthorized: Token Expired" });
    // }
  
    if (!decodedData) {
      return res.status(400).json({ message: "Unauthorized: Token Expired" });
    }
    // console.log(decodedData.id)
    const cacheUser = await redisClient.get(`user:${decodedData.id}`);
    // console.log(cacheUser,"cacheUser")
    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      //  console.log(cacheUser,"cacheUser3")
      return next();
    }
    // console.log(cacheUser,"cacheUser2")
    const user = await prisma.user.findUnique({
      where: { id: decodedData.id },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        role: true,
      },
    });
    // console.log(user, "user from db")

    if (!user) {
      return res.status(404).json({ message: "User not found with id" });
    }
    await redisClient.setEx(
      `user:${decodedData.id}`,
      3600,
      JSON.stringify(user)
    ); // Cache for 1 hour
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


export const authorizedAdmin = async(req,res,next) =>{
  const user = req.user;
  console.log("checking",user)
  if (user.role !== "ADMIN") {
    return res.status(401).json({
      message:"You are not allowed for this activity admin only"
    })
  }
  next()
}

export const authorizedVendor = async(req,res,next) =>{
  const user = req.user;
    console.log("checking",user)
  if (user.role !== "VENDOR") {
    return res.status(401).json({
      message:"You are not allowed for this activity"
    })
  }
  next()
}
