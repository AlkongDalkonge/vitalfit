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
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // null이면 최상위 댓글
        references: {
          model: "notice_comments",
          key: "id",
        },
      },
      depth: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0: 댓글, 1: 대댓글, 2: 대대댓글, 3: 최대 깊이
        validate: {
          min: 0,
          max: 3,
        },
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

    // 대댓글 자기 참조 관계
    // NoticeComment belongs to NoticeComment (N:1) - 부모 댓글
    NoticeComment.belongsTo(models.NoticeComment, {
      foreignKey: "parent_id",
      as: "parent",
    });

    // NoticeComment has many NoticeComments (1:N) - 자식 댓글들
    NoticeComment.hasMany(models.NoticeComment, {
      foreignKey: "parent_id",
      as: "replies",
    });
  };

  return NoticeComment;
};
