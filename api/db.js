import mysql from "mysql"
import dotenv from "dotenv"

dotenv.config()

export const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "blog"
})

db.connect((err) => {
  if (err) {
    console.log("Database connection error:", err)
    return
  }

  console.log("Database connected!")
})
