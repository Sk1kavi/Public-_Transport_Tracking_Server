const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/bus",require("./routes/busRoutes"));
app.use("/drivers",require("./routes/driverRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));

app.use((req, res) => {
  console.log("❌ Route not found:", req.method, req.originalUrl);
  res.status(404).json({ error: "Route not found" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
console.log("It is printing");
