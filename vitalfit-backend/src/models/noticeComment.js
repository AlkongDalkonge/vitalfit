module.exports = (sequelize, DataTypes) => {
  const NoticeComment = sequelize.define(
    "NoticeComment",
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
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "notice_comments",
      indexes: [
        {
          fields: ["notice_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["notice_id", "created_at"],
        },
      ],
    }
  );

  NoticeComment.associate = function (models) {
    // NoticeComment belongs to Notice (N:1)
    NoticeComment.belongsTo(models.Notice, {
      foreignKey: "notice_id",
      as: "notice",
    });

    // NoticeComment belongs to User (N:1) - 댓글 작성자
    NoticeComment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "author",
    });
  };

  return NoticeComment;
};
