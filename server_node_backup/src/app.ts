import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import assetRoutes from './routes/assetRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import transactionRoutes from './routes/transactionRoutes'; // Transaction routes

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export { app };
