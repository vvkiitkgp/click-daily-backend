import connection, {
  PosesModel,
  ChecklistsModel,
  PicturesModel,
  FactModel,
  PosePathsModel,
} from '../../postgres/postgres.js';
import { calculateDays, calculateStreak } from './pose.js';

export const uploadPicture = async (pictureData) => {
  await connection();

  await FactModel.create({
    pose_id: pictureData.poseId,
    user_id: pictureData.userId,
    picture_id: pictureData.pictureId,
    ts: pictureData.date,
  });
  await PicturesModel.create({
    picture_id: pictureData.pictureId,
    picture_url: pictureData.picture,
  });
};

export const getPicturesFromPoseId = async (poseId) => {
  try {
    const factsData = await FactModel.findAll({
      where: {
        pose_id: poseId,
      },
    });

    const poseData = await PosesModel.findAll({
      where: {
        pose_id: poseId,
      },
    });
    const picturesData = await Promise.all(
      factsData.map(async (facts, i) => {
        console.log(facts, 'facts facts facts facts');
        const pictureItem = await PicturesModel.findAll({
          where: {
            picture_id: facts.picture_id,
          },
        });

        console.log(poseData[0].user_id, 'poseData poseData poseData poseData');
        const streak = await calculateStreak(
          poseData[0].user_id,
          poseData[0].pose_id,
          facts.ts,
          poseData[0].created_date
        );
        console.log(pictureItem[0].picture_url, ' pictureItem.picture_url');
        return {
          userId: facts.user_id,
          poseId: facts.pose_id,
          pictureId: facts.picture_id,
          picture: pictureItem[0].picture_url,
          date: facts.ts,
          day: calculateDays(
            new Date(poseData[0].created_date),
            new Date(facts.ts)
          ),
          streak,
        };
      })
    );

    // console.log(`All Pictues for ${poseId} fetch success!!`, picturesData);
    return picturesData;
  } catch (error) {
    console.error('Error retrieving poses:', error);
    throw error;
  }
};
