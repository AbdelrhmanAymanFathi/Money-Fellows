const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

console.log("Loaded environment variables from:", path.resolve(__dirname, ".env"));
console.log(process.env.JWT_SECRET);
