import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// Create post
export const createPost = async (req, res) => {
  try {
    const { content, feeling, location } = req.body;
    const files = req.files;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!content && (!files || files.length === 0)) {
      return res
        .status(400)
        .json({ message: "Post must have content or media" });
    }

    let mediaFiles = [];

    if (files && files.length > 0) {
      const hasVideo = files.some((file) => file.mimetype.startsWith("video"));
      const hasImage = files.some((file) => file.mimetype.startsWith("image"));

      if (hasVideo && hasImage) {
        return res.status(400).json({
          message: "Post cannot contain both image(s) and video",
        });
      }

      if (hasVideo && files.length > 1) {
        return res.status(400).json({
          message: "A post can only have 1 video OR multiple images",
        });
      }

      mediaFiles = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
        isVideo: file.mimetype.startsWith("video"),
      }));
    }

    const newPost = new Post({
      user: userId,
      content,
      media: mediaFiles.length > 0 ? mediaFiles : null,
      feeling: feeling || null,
      location: location || null,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Create posts error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username fullname avatar")
      .populate("comments.user", "username fullname avatar")
      .populate({
        path: "sharedPost",
        populate: { path: "user", select: "username fullname avatar" },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get post by user id
export const getPostByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.findById({ user: userId })
      .populate("user", "username fullname avatar")
      .populate("comments.user", "username fullname avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get post by user id error", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Like / Unlike post
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post Not Found!" });

    const isLiked = post.likes.includes(req.user.id);
    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // lấy post gốc
    let originalPost = await Post.findById(id).populate(
      "user",
      "fullname username avatar"
    );

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (originalPost.sharedPost) {
      originalPost = await Post.findById(originalPost.sharedPost).populate(
        "user",
        "fullname username avatar"
      );
    }

    const newShare = new Post({
      user: userId,
      content: content || "",
      sharedPost: originalPost._id,
    });
    await newShare.save();

    originalPost.shares.push(userId);
    await originalPost.save();

    const populatedShare = await Post.findById(newShare._id)
      .populate("user", "fullname username avatar")
      .populate({
        path: "sharedPost",
        populate: { path: "user", select: "fullname username avatar" },
      });

    res.json(populatedShare);
  } catch (err) {
    console.error("Share failed:", err);
    res.status(500).json({ message: "Share failed" });
  }
};

// Bookmarks
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isBookmarked = post.bookmarks.includes(userId);

    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter(
        (uid) => uid.toString() !== userId.toString()
      );
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();

    const populatedPost = await Post.findById(id)
      .populate("user", "fullname username avatar")
      .populate("comments.user", "fullname username avatar");

    res.json(populatedPost);
  } catch (err) {
    console.error("Toggle bookmark failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add comments
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = { user: userId, content };
    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(id)
      .populate("user", "fullname username avatar")
      .populate("comments.user", "fullname username avatar");

    res.json(populatedPost);
  } catch (err) {
    console.error("Add comment failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};
