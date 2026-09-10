import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  // CHECK EXISTING USER
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    // Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users (`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = (req, res) => {
  // CHECK USER
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    // CHECK PASSWORD
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);
    if (!isPasswordCorrect) return res.status(400).json("Wrong username or password!");

    const token = jwt.sign(
      { id: data[0].id, role: data[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json(other);
  });
};

export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "lax",
    })
    .status(200)
    .json("User has been logged out.");
};

// Lets the frontend check "am I still logged in?" on page refresh
// without exposing the password hash.
export const getMe = (req, res) => {
  const q = "SELECT id, username, email, img, bio, role, created_at FROM users WHERE id = ?";
  db.query(q, [req.user.id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (!data.length) return res.status(404).json("User not found!");
    return res.status(200).json(data[0]);
  });
};
