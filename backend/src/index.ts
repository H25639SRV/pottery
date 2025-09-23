// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import authRoutes from "./routes/auth"; // nếu có
import productRoutes from "./routes/products"; // nếu có

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
