import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', UserController.register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post('/login', UserController.login);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: List users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users list
 *       403:
 *         description: Forbidden
 */
router.get('/', authMiddleware as any, UserController.list);

/**
 * @swagger
 * /api/user/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden
 */
router.put('/:id/role', authMiddleware as any, UserController.setRole);

export default router;
