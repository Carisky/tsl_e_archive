import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './route/UserRoutes';
import fileRoutes from './route/FileRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Подключаем роуты
app.use('/api/user', userRoutes);
app.use('/api/files', fileRoutes);

// Глобальный обработчик ошибок (на будущее)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
