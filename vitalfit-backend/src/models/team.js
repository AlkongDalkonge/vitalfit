module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leader_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "teams",
    }
  );

  Team.associate = function (models) {
    // Team belongs to Center (N:1)
    Team.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });

    // Team belongs to User (N:1) - 팀장
    Team.belongsTo(models.User, {
      foreignKey: "leader_id",
      as: "leader",
    });

    // Team has many Users (1:N) - 팀원들
    Team.hasMany(models.User, {
      foreignKey: "team_id",
      as: "members",
    });
  };

  return Team;
};
