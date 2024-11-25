import Pose from '../handleActions/pose.js';

export const createNewPose = async (req, res) => {
  // write all logic to modify data and send response
  try {
    const pose = new Pose();
    await pose.handleCreateNewPose(req.body);
    res.json({
      sucess: true,
      message: `Pose created successfully`,
    });
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export const modifyPoseById = async (req, res) => {
  try {
    const pose = new Pose();
    await pose.handleModifyPoseById(req.body);
    res.json({
      sucess: true,
      message: `Modifying data for ${req.body.name}-${req.body.poseId} `,
    });
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export const deletePoseById = async (req, res) => {
  try {
    const pose = new Pose();
    if (req.body.poseId) {
      await pose.handleDeletePoseById(req.body.poseId);
      res.json({
        sucess: true,
        message: `Deleted Pose ${req.body.poseId} `,
      });
    } else {
      res.json({
        sucess: false,
        message: `Invalid Req param ${req.body.poseId} `,
      });
    }
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export const getAllPoses = async (req, res) => {
  try {
    const pose = new Pose();
    const data = await pose.handleGetAllPoses();

    if (!data) {
      return res.json({
        sucess: false,
        message: `Something Went Wrong!! No Data`,
      });
    }
    res.json({
      sucess: true,
      data,
    });
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export const getPoseDetailsByPoseId = async (req, res) => {
  try {
    const pose = new Pose();
    const data = await pose.handleGetPoseDetailsByPoseId(req.params.id);

    if (!data) {
      return res.json({
        sucess: false,
        message: `Something Went Wrong!! No Data`,
      });
    }
    res.json({
      sucess: true,
      data,
    });
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export default {
  createNewPose,
  modifyPoseById,
  getAllPoses,
  getPoseDetailsByPoseId,
};
