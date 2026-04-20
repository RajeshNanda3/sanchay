import { redisClient } from "../index.js";

export const rateLimiter = ({
  windowSeconds = 60,
  maxAttempts = 5,
  keyGenerator = (req) => req.ip,
  message = "Too many requests. Please try again later.",
}) => {
  return async (req, res, next) => {
    try {
      const key = `rate-limit:${keyGenerator(req)}`;

      let attempts = await redisClient.get(key);

      if (attempts && parseInt(attempts) >= maxAttempts) {
        return res.status(429).json({
          message,
          remainingAttempts: 0,
        });
      }

      attempts = await redisClient.incr(key);

      if (attempts === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      res.setHeader("X-RateLimit-Limit", maxAttempts);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, maxAttempts - attempts)
      );

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // fail open (don’t block user if Redis fails)
    }
  };
};