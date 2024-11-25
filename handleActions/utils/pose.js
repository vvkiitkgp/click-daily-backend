import connection, {
  PosesModel,
  ChecklistsModel,
  PicturesModel,
  FactModel,
  PosePathsModel,
} from '../../postgres/postgres.js';

import { Op } from 'sequelize';

import { v4 as uuidv4 } from 'uuid';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

export const calculateDays = (pastDate, futureDate) => {
  console.log(futureDate, pastDate, 'DATEE');
  const differenceInMilliseconds = futureDate - pastDate;
  const daysDifference = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );
  return daysDifference;
};

export const checkForPoseClickedToday = (factList) => {
  const isClickedToday = factList.some((fact) => {
    const today = new Date();
    return (
      fact.ts.getDate() === today.getDate() &&
      fact.ts.getMonth() === today.getMonth() &&
      fact.ts.getFullYear() === today.getFullYear()
    );
  });
  return isClickedToday;
};

export const calculateStreak = async (
  userId,
  poseId,
  targetDate,
  createdDate
) => {
  let streak = 0;

  // Normalize targetDate and createdDate to midnight
  let currentDate = new Date(targetDate);
  currentDate.setHours(0, 0, 0, 0);

  const minDate = new Date(createdDate);
  minDate.setHours(0, 0, 0, 0);

  while (currentDate >= minDate) {
    // Check if there is any record for the current date
    const poseClicked = await FactModel.count({
      where: {
        ...(userId ? { user_id: userId } : {}),
        pose_id: poseId,
        ts: {
          [Op.gte]: currentDate,
          [Op.lt]: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (poseClicked > 0) {
      streak++;
    } else {
      break;
    }

    // Move to the previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

export const calculateTotalMissedDays = async (userId, pose) => {
  const createdDate = new Date(pose.createdDate);
  const today = new Date();
  let missedDays = 0;

  let currentDate = new Date(createdDate);
  while (currentDate < today) {
    const dayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const poseClicked = await FactModel.count({
      where: {
        ...(userId ? { user_id: userId } : {}),
        pose_id: pose.poseId,
        ts: {
          [Op.gte]: dayStart,
          [Op.lt]: dayEnd,
        },
      },
    });

    const reminderTime = new Date(pose.reminder);
    reminderTime.setFullYear(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const isPastReminder =
      new Date() > new Date(reminderTime.getTime() + 30 * 60 * 1000);
    if (poseClicked === 0 && isPastReminder) {
      missedDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return missedDays;
};

export const addNewPose = async (data) => {
  await connection();
  console.log('addNewPose:', data);
  const {
    poseId,
    userId,
    paths,
    name,
    reminder,
    totalDayCount,
    photoCount,
    createdDate,
    isPoseClickedToday,
    isMissedToday,
    streak,
    enabledWeekDays,
    totalMissed,
    poseIndexForUser,
    checklist,
  } = data;

  const pathsId = uuidv4();

  const newPose = await PosesModel.create({
    pose_id: poseId,
    user_id: userId ?? '1',
    pose_name: name,
    created_date: createdDate,
    enabled_weekdays: enabledWeekDays,
    paths_id: pathsId,
    reminder: reminder,
    checklist_ids: checklist.map((ckl) => ckl.id),
  });

  const newPath = await PosePathsModel.create({
    pose_id: poseId,
    paths: paths,
    paths_id: pathsId,
  });

  checklist.forEach(async (item) => {
    const { id, index, type, message, isChecked, count } = item;
    const newChecklist = await ChecklistsModel.create({
      checklist_id: id,
      pose_id: poseId,
      checklist_index: index,
      message,
      type,
      count,
      is_checked: isChecked,
    });
    console.log('New Checklist added:', newChecklist);
  });

  console.log('New Pose added:', newPose, newPath);
};

export const modifyPose = async (pose) => {
  await connection();

  const {
    poseId,
    userId,
    paths,
    name,
    reminder,
    totalDayCount,
    photoCount,
    createdDate,
    isPoseClickedToday,
    isMissedToday,
    streak,
    enabledWeekDays,
    totalMissed,
    poseIndexForUser,
    checklist,
  } = pose;

  await PosesModel.update(
    {
      user_id: userId,
      pose_name: name,
      created_date: createdDate,
      enabled_weekdays: enabledWeekDays,
      reminder: reminder,
      checklist_ids: checklist.map((ckl) => ckl.id),
    },
    {
      where: { pose_id: poseId },
    }
  );

  await PosePathsModel.update(
    {
      paths: paths,
    },
    {
      where: { pose_id: poseId },
    }
  );

  console.log('Updated Pose!');
};

export const getPosesByUserId = async (userId) => {
  await connection();

  try {
    // Fetch all poses for the user
    const poses = await PosesModel.findAll({
      where: {
        ...(userId ? { user_id: userId } : {}),
      },
    });

    // Map over poses and transform the data
    const posesData = poses.map((pose, index) => {
      const {
        pose_id,
        user_id,
        pose_name,
        created_date,
        enabled_weekdays,
        paths_id,
        reminder,
        checklist_ids,
      } = pose;

      return {
        poseId: pose_id,
        userId: user_id,
        paths: paths_id,
        name: pose_name,
        reminder: reminder,
        totalDayCount: calculateDays(created_date, new Date()),
        photoCount: null,
        createdDate: created_date,
        isPoseClickedToday: false,
        isMissedToday: false,
        streak: 1,
        enabledWeekDays: enabled_weekdays,
        totalMissed: null,
        poseIndexForUser: index,
        checklist: checklist_ids,
      };
    });

    // Use Promise.all to wait for all async operations
    const modifiedPoseData = await Promise.all(
      posesData.map(async (pose) => {
        const factList = await FactModel.findAll({
          where: {
            ...(userId ? { user_id: userId } : {}),
            pose_id: pose.poseId,
          },
        });

        const posePathsData = await PosePathsModel.findAll({
          where: {
            pose_id: pose.poseId,
          },
        });
        const posePathsRow = posePathsData.find(
          (pp) => pp.pose_id === pose.poseId
        );
        const finalPaths = posePathsRow.paths ?? [];

        const todayStart = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today
        const now = new Date();
        const reminderTime = new Date(pose.reminder);
        reminderTime.setFullYear(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const clickedTodayCount = await FactModel.count({
          where: {
            ...(userId ? { user_id: userId } : {}),
            pose_id: pose.poseId,
            ts: {
              [Op.gte]: todayStart,
              [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        const isClickedToday = clickedTodayCount > 0;
        const isPastReminder =
          now > new Date(reminderTime.getTime() + 30 * 60 * 1000);

        let isPoseClickedToday;
        if (isClickedToday) {
          isPoseClickedToday = true;
        } else if (now < reminderTime) {
          isPoseClickedToday = false;
        } else {
          isPoseClickedToday = isPastReminder ? false : true;
        }

        const isMissedToday = !isClickedToday && isPastReminder;
        const streak = await calculateStreak(
          userId,
          pose.poseId,
          new Date(),
          pose.createdDate
        );
        const totalMissedDays = await calculateTotalMissedDays(userId, pose);

        const checkListsList = await ChecklistsModel.findAll({
          where: { pose_id: pose.poseId },
        });

        const checkListData = pose.checklist.map((id) =>
          checkListsList.find((item) => item.checklist_id === id)
        );

        return {
          ...pose,
          photoCount: factList.length,
          isPoseClickedToday,
          isMissedToday,
          streak,
          totalMissed: totalMissedDays,
          checklist: checkListData,
          paths: finalPaths,
        };
      })
    );

    console.log('All Poses fetch success!!');
    return modifiedPoseData;
  } catch (error) {
    console.error('Error retrieving poses:', error);
    throw error;
  }
};

////

dotenv.config();

// Initialize AWS S3 client
const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.S3_SECRET_KEY,
    accessKeyId: process.env.S3_ACCESS_KEY,
  },
  region: process.env.S3_REGION,
});

// Helper function to delete a file from AWS S3
const deleteFromS3 = async (pictureUrl) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const key = pictureUrl.split('/').pop(); // Extract the file key from the URL

  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(params));
    console.log(`Deleted file from S3: ${pictureUrl}`);
  } catch (error) {
    console.error(`Error deleting file from S3: ${pictureUrl}`, error);
    throw new Error(`Failed to delete file from S3: ${pictureUrl}`);
  }
};

// Main delete function
export const deletePoseById = async (poseId) => {
  await connection(); // Ensure database connection
  console.log(`Deleting pose with ID: ${poseId}`);

  try {
    // Step 1: Delete Facts
    const facts = await FactModel.findAll({ where: { pose_id: poseId } });
    if (facts.length > 0) {
      await FactModel.destroy({ where: { pose_id: poseId } });
      console.log(`Deleted facts for pose ID ${poseId}`);
    }

    // Step 2: Delete Pictures and Files from S3
    if (facts.length > 0) {
      const pictureIds = facts.map((fact) => fact.picture_id); // Extract picture IDs
      const pictures = await PicturesModel.findAll({
        where: { picture_id: pictureIds },
      });

      for (const picture of pictures) {
        await deleteFromS3(picture.picture_url); // Delete from S3
      }

      await PicturesModel.destroy({ where: { picture_id: pictureIds } });
      console.log(`Deleted pictures and files from S3 for pose ID ${poseId}`);
    }

    // Step 3: Delete Pose Paths
    await PosePathsModel.destroy({ where: { pose_id: poseId } });
    console.log(`Deleted paths for pose ID ${poseId}`);

    // Step 4: Delete Checklists
    await ChecklistsModel.destroy({ where: { pose_id: poseId } });
    console.log(`Deleted checklists for pose ID ${poseId}`);

    // Step 5: Delete Pose
    const deletedPose = await PosesModel.destroy({
      where: { pose_id: poseId },
    });
    if (deletedPose) {
      console.log(`Pose with ID ${poseId} successfully deleted.`);
    } else {
      console.log(`Pose with ID ${poseId} not found.`);
    }
  } catch (error) {
    console.error(`Error deleting pose with ID ${poseId}:`, error);
    throw new Error('Failed to delete pose.');
  }
};
