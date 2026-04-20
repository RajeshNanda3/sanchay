// import crypto from 'crypto';
// import { redisClient } from '../index.js';

// export const generateCSRFToken = async (userId, res) => {
//   const csrfToken = crypto.randomBytes(32).toString('hex');

//   const csrfKey = `csrf:${userId}`;
//   await redisClient.setEx(csrfKey, 3600, csrfToken); // 1 hour expiration
//   res.cookie('csrfToken', csrfToken, {
//     httpOnly : false,
//     secure : true,
//     sameSite : 'none',
//     maxAge : 3600 *24*7 * 1000, // 1 week
//   });
//   return csrfToken;
// };

// export const verifyCSRFToken = async (req, res, next) => {
//   try {
//     if (req.method ==="GET"){
//       return next();
//     }
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({
//       message: "User not authenticated",
//       });
//     }
//     const clientToken = req.headers['x-csrf-token'] ||
//      req.headers["x-xsrf-token"] ||
//       req.headers["csrf-token"];
//       if (!clientToken) {
//         return res.status(403).json({
//           message: "CSFR Token is Missing. Please refresh the page",
//           code: "CSRF-TOKEN_MISSING"
//         });
//       }
//       const csrfKey = `csrf:${userId}`;
//       const storedToken = await redisClient.get(csrfKey);
//       if (!storedToken) {
//         return res.status(403).json({
//           message: "CSFR Token is Expired. Please try again",
//           code: "CSRF-TOKEN_EXPIRED"
//         });
//       }

//       if (storedToken !== clientToken) {
//         return res.status(403).json({
//           message: "Invalid CSFR Token. Please refresh the page",
//           code: "CSRF-TOKEN_INVALID"
//         });
//       }
//       next();

//   } catch (error) {
//     console.log("CSRF verification error", error);
//     return res.status(500).json({
//       message : "CSRF verification failed",
//       code : "CSRF-VERIFICATION_ERROR"
//     });

//     }
// };

// export const revokeCSRFTOKEN = async (userId) => {
//   const csrfKey = `csrf:${userId}`;
//   await redisClient.del(csrfKey);
// }

// export const refreshCSRFToken = async (userId, res) => {
//  await revokeCSRFTOKEN(userId);

//  return await generateCSRFToken(userId, res);
// }




 
 
import crypto from "crypto";
import { redisClient } from "../index.js";

/*
Generate CSRF Token
*/
export const generateCSRFToken = async (userId, res) => {
  try {
    if (!userId) {
      throw new Error("UserId is required to generate CSRF token");
    }

    const csrfToken = crypto.randomBytes(32).toString("hex");

    const csrfKey = `csrf:${userId}`;

    // store token in redis (1 hour)
    await redisClient.setEx(csrfKey, 3600, csrfToken);

    // set cookie
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false, // frontend needs to read it
      secure: process.env.NODE_ENV === "production", // only secure in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    });

    console.log("CSRF token generated for user:", userId);

    return csrfToken;
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    throw error;
  }
};

/*
Verify CSRF Token Middleware
*/
export const verifyCSRFToken = async (req, res, next) => {
  try {
    // Allow safe requests
    if (req.method === "GET") {
      return next();
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const clientToken =
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      req.headers["csrf-token"];

    if (!clientToken) {
      return res.status(403).json({
        message: "CSRF Token is missing. Please refresh the page",
        code: "CSRF_TOKEN_MISSING"
      });
    }

    const csrfKey = `csrf:${userId}`;
    const storedToken = await redisClient.get(csrfKey);

    if (!storedToken) {
      return res.status(403).json({
        message: "CSRF Token expired. Please refresh",
        code: "CSRF_TOKEN_EXPIRED"
      });
    }

    if (storedToken !== clientToken) {
      return res.status(403).json({
        message: "Invalid CSRF Token. Please refresh",
        code: "CSRF_TOKEN_INVALID"
      });
    }

    next();
  } catch (error) {
    console.error("CSRF verification error:", error);

    return res.status(500).json({
      message: "CSRF verification failed",
      code: "CSRF_VERIFICATION_ERROR"
    });
  }
};

/*
Revoke CSRF Token
*/
export const revokeCSRFTOKEN = async (userId) => {
  try {
    const csrfKey = `csrf:${userId}`;
    await redisClient.del(csrfKey);

    console.log("CSRF token revoked for user:", userId);
  } catch (error) {
    console.error("Error revoking CSRF token:", error);
  }
};

/*
Refresh CSRF Token
*/
export const refreshCSRFToken = async (userId, res) => {
  try {
    await revokeCSRFTOKEN(userId);

    const newToken = await generateCSRFToken(userId, res);

    console.log("CSRF token refreshed for user:", userId);

    return newToken;
  } catch (error) {
    console.error("Error refreshing CSRF token:", error);
    throw error;
  }
};
