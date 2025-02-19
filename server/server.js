const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();
const cookieParser = require('cookie-parser')
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());
// ✅ Connect MongoDB Before Using Routes
const URI = process.env.MONGODB_URL;
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error);
  });

// ✅ Define Routes After Database Connection
app.use('/user', require('./routes/userRouter'));

// ✅ Test API Route
app.get('/', (req, res) => {
  res.json({ msg: "This is an example" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}...`);
});
