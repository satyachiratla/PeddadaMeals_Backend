import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadFile-controllers.js";

const router = express.Router();
// const upload = multer({ dest: "uploads/" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), uploadFile);

export default router;
