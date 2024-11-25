import dotenv from 'dotenv';
dotenv.config(); // Make sure this is called before anything else

import express from 'express';
import poseRouter from './routers/pose.js';
import picturesRouter from './routers/pictures.js';
import { connection } from './postgres/postgres.js';

const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

const app = express();

app.use('/api', poseRouter);
app.use('/api', picturesRouter);

app.listen(3000, () => {
  console.log('port is listening.');
});

connection();
