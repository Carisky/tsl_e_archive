import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();
const upload = multer();

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload file
 *     tags: [File]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               categories:
 *                 type: string
 *                 description: Comma separated category ids
 *     responses:
 *       200:
 *         description: Uploaded
 */
router.post('/upload', authMiddleware as any, upload.single('file'), FileController.upload);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List files
 *     tags: [File]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by filename
 *     responses:
 *       200:
 *         description: List files
 */
router.get('/', authMiddleware as any, FileController.list);

// Category routes should appear before dynamic :id routes to avoid conflicts
router.get('/categories', authMiddleware as any, CategoryController.list);
router.post('/categories', authMiddleware as any, CategoryController.create);
router.put('/categories/:id', authMiddleware as any, CategoryController.update);
router.delete('/categories/:id', authMiddleware as any, CategoryController.remove);

router.get('/:id/download', authMiddleware as any, FileController.download);
router.get('/:id', authMiddleware as any, FileController.get);
router.put('/:id', authMiddleware as any, FileController.update);
router.delete('/:id', authMiddleware as any, FileController.delete);

export default router;
