module.exports = (sequelize, DataTypes) => {
  const PTSession = sequelize.define(
    "PTSession",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      session_type: {
        type: DataTypes.ENUM("regular", "free"),
        allowNull: false,
        defaultValue: "regular",
      },
      signature_data: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      signature_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      idempotency_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      tableName: "pt_sessions",
      underscored: true, // snake_case 사용
      indexes: [
        {
          fields: ["session_date"],
        },
        {
          fields: ["trainer_id"],
        },
        {
          fields: ["member_id"],
        },
        {
          fields: ["center_id"],
        },
        {
          fields: ["trainer_id", "session_date"],
        },
        {
          fields: ["member_id", "session_date"],
        },
        {
          fields: ["idempotency_key"],
        },
      ],
    }
  );

  PTSession.associate = function (models) {
    // PTSession belongs to Member (N:1)
    PTSession.belongsTo(models.Member, {
      foreignKey: "member_id",
      as: "member",
    });

    // PTSession belongs to User (N:1) - 담당 트레이너
    PTSession.belongsTo(models.User, {
      foreignKey: "trainer_id",
      as: "trainer",
    });

    // PTSession belongs to Center (N:1)
    PTSession.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });
  };

  return PTSession;
};
