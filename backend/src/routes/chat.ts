import express from "express";
import { getHistory, sendMessage } from "../controllers/chatController";

const router = express.Router();

// ✅ Route lấy lịch sử phải có :roomId thì req.params.roomId mới hoạt động
router.get("/history/:roomId", getHistory);

router.post("/send", sendMessage);

export default router;
