import express from "express";
import { getAIResponse } from "../services/aiService";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Không thể gọi AI" });
  }
});

export default router;
