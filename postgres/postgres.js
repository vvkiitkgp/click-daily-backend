import { Sequelize } from 'sequelize';
import {
  createUsersModel,
  createPosesModel,
  createChecklistsModel,
  createPicturesModel,
  createFactModel,
  createPosePathsModel,
} from '../model/userSchema.js';
const isLocal = false;
const sequelize = new Sequelize(
  isLocal ? `postgres` : process.env.DB_NAME, // Database name
  isLocal ? `postgres` : process.env.DB_USER, // Database user
  `postgres<3password`,
  {
    host: isLocal
      ? 'click-daily-postgres-database-1.cpcukma0yrsy.ap-northeast-1.rds.amazonaws.com'
      : process.env.DB_HOST, // Database host (e.g., RDS endpoint)
    dialect: 'postgres',
    port: isLocal ? 5432 : process.env.DB_PORT, // Default to port 5432 if not specified
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
