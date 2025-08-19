import express from "express";
import { reverseGeocode } from "../controllers/locationController.js";

const router = express.Router();
router.get("/reverse-geocode", reverseGeocode);

export default router;
