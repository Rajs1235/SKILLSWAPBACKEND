// upload.js
import multer from "multer";

// Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
