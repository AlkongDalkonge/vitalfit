module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    "Member",
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
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      join_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      expire_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      used_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      free_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      memo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "expired", "withdrawn"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      timestamps: true, // created_at, updated_at 자동 생성
      tableName: "members",
      underscored: true, // snake_case 사용
      indexes: [
        {
          fields: ["trainer_id"],
        },
        {
          fields: ["center_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["trainer_id", "status"],
        },
      ],
    }
  );

  Member.associate = function (models) {
    // Member belongs to Center (N:1)
    Member.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });

    // Member belongs to User (N:1) - 담당 트레이너
    Member.belongsTo(models.User, {
      foreignKey: "trainer_id",
      as: "trainer",
    });

    // Member has many Payments (1:N)
    Member.hasMany(models.Payment, {
      foreignKey: "member_id",
      as: "payments",
    });

    // Member has many PTSessions (1:N)
    Member.hasMany(models.PTSession, {
      foreignKey: "member_id",
      as: "pt_sessions",
    });
  };

  return Member;
};
