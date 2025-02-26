const jwt = require("jsonwebtoken");

// ✅ Middleware: Authenticate User
const authenticate = (req, res, next) => {
  console.log("🛠️ Debug: authenticate() Middleware Called");

  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "🚫 Authentication required" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    // ✅ Check token expiration (2-hour limit)
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ message: "❌ Token expired, please login again" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid Token:", error);
    res.status(401).json({ message: "❌ Invalid token" });
  }
};

// ✅ Middleware: Restrict Access to Admins Only
const adminOnly = (req, res, next) => {
  console.log("🛠️ Debug: adminOnly() Middleware Called");

  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "🚫 Forbidden: Admins Only" });
  }
  next();
};

// ✅ Function to Generate a Token with 2-hour Expiry
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "2h" } // ✅ Token expires in 2 hours
  );
};

// ✅ Ensure Correct Export
module.exports = { authenticate, adminOnly, generateToken };
