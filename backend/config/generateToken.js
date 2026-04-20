import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";
import { generateCSRFToken, revokeCSRFTOKEN } from "./csrfMiddleware.js";

export const generateToken = async (id, res) => {
  try {
    if (!id) {
      console.error("generateToken called with undefined id");
      throw new Error("User id is required to generate tokens");
    }
    console.log({ id });
    
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw err;
  }
  try {
    console.log({ id });
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "1m",
    });

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, {
      expiresIn: "7d",
    });
    // console.log(accessToken, "and", refreshToken);
    const refreshTokenKey = `refresh_token:${id}`;
  
    await redisClient.setEx(refreshTokenKey, 604800, refreshToken); // 7 days expiration
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 60 * 1000, // 1 minute
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "none",
      secure: true,
    });

    const csrfToken = await generateCSRFToken(id, res);

    
    return { accessToken, refreshToken, 
      csrfToken 
    };
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw err;
  }
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
  
    const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const storedToken = await redisClient.get(
      `refresh_token:${decode.id}`
    );
    if (storedToken == refreshToken) {
      return decode;
    }

    return null;
  } catch (err) {
    return null;
  }
};

export const generateAccessToken = (id, res) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 60 * 1000, // 1 minute
  });
  return accessToken;
};



export const revokeRefreshToken = async (userId) => {
  await redisClient.del(`refresh_token:${userId}`);
  await revokeCSRFTOKEN(userId);
};