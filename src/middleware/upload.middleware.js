import multer from 'multer';

const storage = multer.memoryStorage(); // or configure cloud/disk storage
const upload = multer({ storage });

export default upload;