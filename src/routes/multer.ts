
import express from "express";
import multer from "multer";
import path from "path";
import '../config.js';

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL path to access the uploaded file
 *       500:
 *         description: Upload failed
 */

const router = express.Router();

const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')
            .filter(Boolean)
            .slice(1)
            .join('.')
        cb(null, Date.now() + "." + ext)
    }
})
const upload = multer({ storage: storage });

router.post('/', upload.single("file"), function (req: any, res: any) {
    const filename = path.basename(req.file.path);
    const url = "/uploads/" + filename;
    console.log("router.post(/file: " + url);
    res.status(200).send({ url: url })
});

export default router;
