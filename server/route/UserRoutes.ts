import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// POST /api/user/register
router.post('/register', UserController.register);

// POST /api/user/login
router.post('/login', UserController.login);

export default router;
