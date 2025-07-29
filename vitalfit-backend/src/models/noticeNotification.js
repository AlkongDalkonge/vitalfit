module.exports = (sequelize, DataTypes) => {
  const NoticeNotification = sequelize.define(
    "NoticeNotification",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "notice_notifications",
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["notice_id"],
        },
        {
          fields: ["is_read"],
        },
        {
          fields: ["user_id", "is_read"],
        },
        {
          fields: ["notice_id", "user_id"],
          unique: true, // 같은 공지에 대해 한 사용자당 하나의 알림만
        },
      ],
    }
  );

  NoticeNotification.associate = function (models) {
    // NoticeNotification belongs to Notice (N:1)
    NoticeNotification.belongsTo(models.Notice, {
      foreignKey: "notice_id",
      as: "notice",
    });

    // NoticeNotification belongs to User (N:1)
    NoticeNotification.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return NoticeNotification;
};
