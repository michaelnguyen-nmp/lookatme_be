import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "posts";

    if (req.uploadType === "messenger") {
      folder = "messenger";
    } else if (req.uploadType === "avatar") {
      folder = "avatars";
    }

    let resourceType = file.mimetype.startsWith("video") ? "video" : "image";

    return {
      folder,
      resource_type: resourceType,
      public_id: Date.now() + "-" + file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

export default upload;
