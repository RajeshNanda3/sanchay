const trycatch = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  };
};

export default trycatch;