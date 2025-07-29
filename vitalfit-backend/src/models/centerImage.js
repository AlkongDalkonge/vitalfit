module.exports = (sequelize, DataTypes) => {
  const CenterImage = sequelize.define(
    "CenterImage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      is_main: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "center_images",
    }
  );

  CenterImage.associate = function (models) {
    // CenterImage belongs to Center (N:1)
    CenterImage.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });
  };

  return CenterImage;
};
