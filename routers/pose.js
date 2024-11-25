import express from 'express';
const router = express.Router();

import {
  createNewPose,
  modifyPoseById,
  getAllPoses,
  getPoseDetailsByPoseId,
  deletePoseById,
} from '../controllers/pose.js';

router.use(express.json());

router.post('/createNewPose', createNewPose);
router.post('/modifyPoseById', modifyPoseById);
router.post('/deletePoseById', deletePoseById);

router.get('/getAllPoses', getAllPoses);
router.get('/getPoseDetailsByPoseId/:id', getPoseDetailsByPoseId);

export default router;
