// backend/src/routes/chatbotRoute.ts
import express from "express";
import { getGeminiReply } from "../services/chatbotService";
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  const reply = await getGeminiReply(message);
  res.json({ reply });
});

export default router;
