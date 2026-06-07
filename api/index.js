// Vercel serverless entry — Express app מיוצא כ-handler
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import moviesRouter from '../server/routes/movies.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// חיבור Mongo עם cache (חשוב ל-serverless — לא מתחבר מחדש בכל בקשה)
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { promise: null };
function connectDB() {
  if (!cached.promise && process.env.MONGO_URI) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .catch((err) => { cached.promise = null; throw err; });
  }
  return cached.promise;
}

// מוודאים חיבור לפני כל בקשה
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/movies', moviesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
});

export default app;
