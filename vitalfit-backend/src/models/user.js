module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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
      phone_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "center_manager",
          "team_leader",
          "team_member"
        ),
        allowNull: false,
        defaultValue: "team_member",
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
        type: DataTypes.ENUM("active", "inactive", "retired"),
        allowNull: false,
        defaultValue: "active",
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
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      tableName: "users",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["center_id"],
        },
        {
          fields: ["team_id"],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["center_id", "role"],
        },
      ],
    }
  );

  User.associate = function (models) {
    // User belongs to Center (N:1)
    User.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });

    // User belongs to Team (N:1)
    User.belongsTo(models.Team, {
      foreignKey: "team_id",
      as: "team",
    });

    // User has many Notices (1:N) - 작성한 공지사항
    User.hasMany(models.Notice, {
      foreignKey: "sender_id",
      as: "sentNotices",
    });

    // User has many Members (1:N) - 담당 회원들
    User.hasMany(models.Member, {
      foreignKey: "trainer_id",
      as: "members",
    });

    // User has many Payments (1:N) - 트레이너 결제 내역
    User.hasMany(models.Payment, {
      foreignKey: "trainer_id",
      as: "trainerPayments",
    });

    // User has many PTSessions (1:N) - 트레이너 PT 세션
    User.hasMany(models.PTSession, {
      foreignKey: "trainer_id",
      as: "trainerSessions",
    });

    // User has many MonthlySettlements (1:N) - 정산 내역
    User.hasMany(models.MonthlySettlement, {
      foreignKey: "user_id",
      as: "settlements",
    });
  };

  return User;
};
