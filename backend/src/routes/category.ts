import express from "express";
import {
  getCategories,
  createCategory,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);

export default router;
