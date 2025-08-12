module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          len: [10, 20],
        },
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true,
      },
      terms_accepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      terms_accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      position_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      join_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'retired'),
        allowNull: false,
        defaultValue: 'active',
      },
      leave_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      profile_image_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      profile_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      license: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      experience: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      education: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      instagram: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      shift: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      remember_me: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'users',
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['center_id'] },
        { fields: ['team_id'] },
        { fields: ['position_id'] },
        { fields: ['status'] },
      ],
    }
  );

  User.associate = function (models) {
    User.belongsTo(models.Position, {
      foreignKey: 'position_id',
      as: 'position',
    });
    User.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });
    User.belongsTo(models.Team, {
      foreignKey: 'team_id',
      as: 'team',
    });
    User.hasMany(models.Notice, {
      foreignKey: 'sender_id',
      as: 'sentNotices',
    });
    User.hasMany(models.Member, {
      foreignKey: 'trainer_id',
      as: 'members',
    });
    User.hasMany(models.Payment, {
      foreignKey: 'trainer_id',
      as: 'trainerPayments',
    });
    User.hasMany(models.PTSession, {
      foreignKey: 'trainer_id',
      as: 'trainerSessions',
    });
    User.hasMany(models.MonthlySettlement, {
      foreignKey: 'user_id',
      as: 'settlements',
    });
  };

  return User;
};
