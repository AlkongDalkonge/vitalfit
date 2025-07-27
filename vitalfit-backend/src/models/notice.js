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
        type: DataTypes.ENUM(
          "all",
          "branch_all",
          "branch_manager",
          "team_leader",
          "team_member"
        ),
        allowNull: false,
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
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      tableName: "notices",
    }
  );

  Notice.associate = function (models) {
    // Notice belongs to User (N:1) - 작성자
    Notice.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });
  };

  return Notice;
};
