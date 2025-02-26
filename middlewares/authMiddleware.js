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

// ✅ Ensure Correct Export
module.exports = { authenticate, adminOnly };
