import mysql from "mysql"

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blog"
})

db.connect((err) => {
  if (err) {
    console.log("Database connection error:", err)
    return
  }

  console.log("Database connected!")
})