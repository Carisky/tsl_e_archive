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
 *               createdAt:
 *                 type: string
 *                 format: date
 *                 description: Optional custom file date
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
router.get('/:id/download', authMiddleware as any, FileController.download);
router.delete('/:id', authMiddleware as any, FileController.delete);
/**
 * @swagger
 * /api/files/{id}/link:
 *   get:
 *     summary: Получить pre-signed URL файла
 *     tags: [File]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Идентификатор файла
 *     responses:
 *       200:
 *         description: { url: string }
 *       400:
 *         description: Invalid id
 *       404:
 *         description: File not found or deleted
 */
router.get('/:id/link', authMiddleware as any, FileController.getLink);
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List
 */
router.get('/categories', authMiddleware as any, CategoryController.list);

router.post('/categories', authMiddleware as any, CategoryController.create);
router.put('/categories/:id', authMiddleware as any, CategoryController.update);
router.delete('/categories/:id', authMiddleware as any, CategoryController.remove);

export default router;
