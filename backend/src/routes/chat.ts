import express from "express";
import { getAllMessages, sendMessage } from "../controllers/chatController";

const router = express.Router();

router.get("/", getAllMessages);
router.post("/", sendMessage);

export default router;
