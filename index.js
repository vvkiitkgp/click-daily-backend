import dotenv from 'dotenv';
dotenv.config(); // Make sure this is called before anything else

import express from 'express';
import poseRouter from './routers/pose.js';
import picturesRouter from './routers/pictures.js';
import { connection } from './postgres/postgres.js';

console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME); // Should print the correct bucket name
console.log('S3_ACCESS_KEY:', process.env.S3_ACCESS_KEY); // Should print the access key
console.log('S3_SECRET_KEY:', process.env.S3_SECRET_KEY); // Should print the secret key
console.log('S3_REGION:', process.env.S3_REGION); // Should print the region

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
