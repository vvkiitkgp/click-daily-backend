import { DataTypes } from 'sequelize';

export const createUsersModel = async (sequelize) => {
  const User = await sequelize.define('Users', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return User;
};

export const createPosesModel = async (sequelize) => {
  const Poses = await sequelize.define('Poses', {
    pose_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pose_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    enabled_weekdays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    paths_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reminder: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checklist_ids: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  });

  return Poses;
};

export const createChecklistsModel = async (sequelize) => {
  const Checklists = await sequelize.define('Checklists', {
    checklist_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pose_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checklist_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return Checklists;
};

export const createPicturesModel = async (sequelize) => {
  const Pictures = await sequelize.define('Pictures', {
    picture_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Pictures;
};

export const createFactModel = async (sequelize) => {
  const Fact = await sequelize.define('Fact', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pose_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ts: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return Fact;
};

export const createPosePathsModel = async (sequelize) => {
  const PosePaths = await sequelize.define('PosePaths', {
    paths_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pose_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paths: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Paths must be an array');
          }
        },
      },
    },
  });

  return PosePaths;
};
