import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const sslConfig =
  process.env.DB_SSL === "true"
    ? {
        minVersion: "TLSv1.2",
      }
    : undefined;

function createConnection() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: sslConfig,
  });

  connection.connect((err) => {
    if (err) {
      console.log("Database connection error:", err.code || err.message);
      return;
    }

    console.log("Database connected!");
  });

  connection.on("error", (err) => {
    console.log(
      "Database connection issue, reconnecting in 5s...",
      err.code || err.message
    );

    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.fatal) {
      setTimeout(() => {
        db.connection = createConnection();
      }, 5000);
    }
  });

  return connection;
}

export const db = {
  connection: createConnection(),

  query(...args) {
    return this.connection.query(...args);
  },
};