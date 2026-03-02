import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { initDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDb().catch(console.error);

import authRoutes from './routes/auth.js';
import numbersRoutes from './routes/numbers.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/numbers', numbersRoutes);


// Basic health check
app.get('/health', (req, res) => {

    res.json({ status: 'ok', message: 'CloudPhone API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
