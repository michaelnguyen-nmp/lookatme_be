import express from "express";
import upload from "../middlewares/upload.js";
import {
  createPost,
  getAllPosts,
  getPostByUser,
  toggleLikePost,
  sharePost,
  toggleBookmark,
  addComment,
} from "../controllers/postController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, upload.array("media", 20), createPost);

router.get("/", verifyToken, getAllPosts);
router.get("/user/:userId", verifyToken, getPostByUser);

router.put("/:id/like", verifyToken, toggleLikePost);
router.put("/:id/share", verifyToken, sharePost);
router.put("/:id/bookmark", verifyToken, toggleBookmark);
router.post("/:id/comment", verifyToken, addComment);

export default router;
