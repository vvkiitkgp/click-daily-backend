import { Sequelize } from 'sequelize';
import {
  createUsersModel,
  createPosesModel,
  createChecklistsModel,
  createPicturesModel,
  createFactModel,
  createPosePathsModel,
} from '../model/userSchema.js';

const sequelize = new Sequelize(
  `postgres`,
  `postgres`, // Database user
  `postgres<3password`, // Database password
  {
    host: 'click-daily-postgres-database-1.cpcukma0yrsy.ap-northeast-1.rds.amazonaws.com', // Database host (e.g., RDS endpoint)
    dialect: 'postgres',
    port: 5432, // Default to port 5432 if not specified
  }
);

let UserModel,
  PosesModel,
  ChecklistsModel,
  PicturesModel,
  FactModel,
  PosePathsModel;

export const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    UserModel = await createUsersModel(sequelize);
    PosesModel = await createPosesModel(sequelize);
    ChecklistsModel = await createChecklistsModel(sequelize);
    PicturesModel = await createPicturesModel(sequelize);
    FactModel = await createFactModel(sequelize);
    PosePathsModel = await createPosePathsModel(sequelize);
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export {
  UserModel,
  PosesModel,
  ChecklistsModel,
  PicturesModel,
  FactModel,
  PosePathsModel,
};
export default connection;
