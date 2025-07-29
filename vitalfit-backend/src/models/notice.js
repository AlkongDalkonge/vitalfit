module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define(
    "Notice",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiver_type: {
        type: DataTypes.ENUM("all", "role", "center"),
        allowNull: false,
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      receiver_role: {
        type: DataTypes.ENUM("team_member", "team_leader", "center_manager"),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachment_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      attachment_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_important: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pin_until: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "notices",
      indexes: [
        {
          fields: ["sender_id"],
        },
        {
          fields: ["receiver_type"],
        },
        {
          fields: ["receiver_id"],
        },
        {
          fields: ["receiver_role"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["receiver_type", "receiver_id"],
        },
        {
          fields: ["is_important"],
        },
        {
          fields: ["pin_until"],
        },
      ],
    }
  );

  Notice.associate = function (models) {
    // Notice belongs to User (N:1) - 작성자
    Notice.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });

    // Notice belongs to Center (N:1) - receiver_type이 'center'일 때
    Notice.belongsTo(models.Center, {
      foreignKey: "receiver_id",
      as: "targetCenter",
    });

    // Notice has many NoticeComments (1:N)
    Notice.hasMany(models.NoticeComment, {
      foreignKey: "notice_id",
      as: "comments",
    });

    // Notice has many NoticeNotifications (1:N)
    Notice.hasMany(models.NoticeNotification, {
      foreignKey: "notice_id",
      as: "notifications",
    });
  };

  return Notice;
};
