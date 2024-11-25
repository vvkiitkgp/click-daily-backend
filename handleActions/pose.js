import fs from 'fs';
import {
  addNewPose,
  getPosesByUserId,
  modifyPose,
  deletePoseById,
} from './utils/pose.js';

class Pose {
  constructor(filename = 'pose.json') {
    this.path = `./data/${filename}`;

    try {
      fs.readdirSync('data');
    } catch (err) {
      fs.mkdirSync('data');
    }

    try {
      fs.accessSync(this.path);
    } catch (err) {
      fs.writeFileSync(this.path, '[]');
    }
  }

  async handleGetAllPoses() {
    // return JSON.parse(await fs.promises.readFile(this.path));
    return getPosesByUserId();
  }

  async handleCreateNewPose(data) {
    const totalData = await this.handleGetAllPoses();
    totalData.push(data);

    // await fs.promises.writeFile(this.path, JSON.stringify(totalData, null, 2));
    await addNewPose(data);
  }

  async handleModifyPoseById(data) {
    console.log('handleModifyPoseById', data);
    await modifyPose(data);
  }

  async handleDeletePoseById(poseId) {
    if (poseId) {
      console.log('Got poseId', poseId);
      await deletePoseById(poseId);
    } else {
      console.log(poseId);
    }
  }

  async handleGetPoseDetailsByPoseId(poseId) {
    const data = await this.handleGetAllPoses();
    return data.find((p) => p.poseId === poseId) ?? {};
  }
}

export default Pose;
