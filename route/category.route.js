import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategoryById,
} from "../controller/category.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);
router.delete("/:categoryId", deleteCategoryById);

export default router;
