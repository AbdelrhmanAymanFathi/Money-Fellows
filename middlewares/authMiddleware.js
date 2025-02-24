const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // الحصول على التوكن من الهيدر
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "غير مصرح! لا يوجد توكن" });
  }

  try {
    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };  // تعديل لتخزين userId داخل كائن
    next(); // الانتقال إلى الخطوة التالية
  } catch (error) {
    res.status(401).json({ message: "التوكن غير صالح" });
  }
};

module.exports = authMiddleware;
