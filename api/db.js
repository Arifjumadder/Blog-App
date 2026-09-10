import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config()

// TiDB Cloud (and most managed MySQL hosts) require a TLS connection.
// Set DB_SSL=true in .env for those; leave it unset for a plain local
// MySQL install, which usually isn't configured for TLS at all.
const sslConfig =
  process.env.DB_SSL === "true"
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined

function createConnection() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blog",
    port: process.env.DB_PORT || 3306,
    ssl: sslConfig,
  })

  connection.connect((err) => {
    if (err) {
      console.log("Database connection error:", err.code || err.message)
      return
    }
    console.log("Database connected!")
  })

  connection.on("error", (err) => {
    console.log("Database connection issue, reconnecting in 5s...", err.code)
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.fatal) {
      setTimeout(() => {
        db.connection = createConnection()
      }, 5000)
    }
  })

  return connection
}

// A tiny wrapper so the rest of the app can keep doing `db.query(...)`
// even after a reconnect swaps out the underlying connection object.
export const db = {
  connection: createConnection(),
  query(...args) {
    return this.connection.query(...args)
  },
}
