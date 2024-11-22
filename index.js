const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/User");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const ProfileDataRoutes = require("./routes/ProfileDataRoutes")

const profileRoutes = require("./routes/Profile");
dotenv.config({ path: "./config/.env" });

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb+srv://mongodbAtlas:mongodbAtlas@gyaansensei.l5ad5.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log(error, "Connection to MongoDb failed"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/auth/signup", async (req, res) => {
  console.log(req.body);
  const { name, email, password, mobile } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, mobile });
  await newUser.save();
  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ userId: newUser._id, token });
});

app.post("/api/auth/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User Not Found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ userId: user._id, token });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User Not Found " });

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });

  console.log(resetToken);
  const resetTokenExpiration = Date.now() + 3600000;

  user.resetToken = resetToken;
  user.resetTokenExpiration = resetTokenExpiration;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Request For Password Reset",
    html: `<p>You requested a password reset. Here's your resetToken ${resetToken} Click  <a href="${resetUrl}">here</a> to reset your password.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset email sent " });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    console.log(process.env.JWT_SECRET);
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    console.log("zzzzzzzzzzzzzzzzzzzzzzzzz", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (
      user.resetToken !== resetToken ||
      user.resetTokenExpiration < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token checking " });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
});

app.get("/", async (req, res) => {
  return res.json({ message: "Hello" });
});

app.use("/api/profile", profileRoutes);

app.use("/api/profile/",ProfileDataRoutes)
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


