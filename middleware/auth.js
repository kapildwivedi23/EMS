const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).send("Access Denied");

      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(user.role)) return res.status(403).send("Forbidden");
      req.user = user;
      next();
    } catch (err) {
      return res.status(404).json({ message: "Invalid Token" });
    }
  };
};
