import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API Dental San Felipe funcionando 🚀");
});

export default app;
