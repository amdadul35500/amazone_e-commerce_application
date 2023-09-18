import express from "express";
import data from "./data.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import path from "path";
import cors from "cors";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://amazone-frontend-steel.vercel.app",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

// database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("connect to mongodb");
  })
  .catch((error) => {
    console.log(error.message);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/seed", seedRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build/index.html"));
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`server at http://localhost:${PORT}`);
});
