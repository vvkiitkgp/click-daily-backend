import express from 'express';
const router = express.Router();

import {
  uploadPictureByPoseId,
  getAllPicturesByPoseId,
} from '../controllers/pictures.js';
import uploadMiddleware from '../middleware/pictureUpload.js';

router.use(express.json());

router.post('/uploadPictureByPoseId', uploadMiddleware, uploadPictureByPoseId);

router.get('/getAllPicturesByPoseId/:id', getAllPicturesByPoseId);

export default router;
