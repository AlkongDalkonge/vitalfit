module.exports = (sequelize, DataTypes) => {
  const Center = sequelize.define(
    "Center",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      weekday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      saturday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sunday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      parking_info: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      directions: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      customer_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "centers",
      timestamps: false,
      underscored: true, // created_at → createdAt 자동 매핑 안함, 그대로 사용
    }
  );

  Center.associate = function (models) {
    // 관계 설정 예시 (필요 시)
    // Center.hasMany(models.Trainer, { foreignKey: 'center_id', as: 'trainers' });
  };

  return Center;
};
