import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import userRoutes from './routes/user.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Route mounts
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/entries', noteRoutes); // Support both /notes and /entries endpoints
app.use('/api/user', userRoutes);

// Health Check
app.get('/health', (_req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
