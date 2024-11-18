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
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST, // Database host (e.g., RDS endpoint)
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432, // Default to port 5432 if not specified
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
