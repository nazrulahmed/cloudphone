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
import webhookRoutes from './routes/webhooks.js';
import onboardingRoutes from './routes/onboarding.js';
import path from 'path';

// Serve uploaded KYC documents statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/numbers', numbersRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/onboarding', onboardingRoutes);


// Basic health check
app.get('/health', (req, res) => {

    res.json({ status: 'ok', message: 'CloudPhone API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
