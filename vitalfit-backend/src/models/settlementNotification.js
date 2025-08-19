module.exports = (sequelize, DataTypes) => {
  const SettlementNotification = sequelize.define(
    'SettlementNotification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      settlement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notification_type: {
        type: DataTypes.ENUM('rejected', 'approved'),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'settlement_notifications',
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['settlement_id'],
        },
        {
          fields: ['notification_type'],
        },
        {
          fields: ['is_read'],
        },
        {
          fields: ['user_id', 'is_read'],
        },
      ],
    }
  );

  SettlementNotification.associate = function (models) {
    // SettlementNotification belongs to MonthlySettlement (N:1)
    SettlementNotification.belongsTo(models.MonthlySettlement, {
      foreignKey: 'settlement_id',
      as: 'settlement',
    });

    // SettlementNotification belongs to User (N:1)
    SettlementNotification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return SettlementNotification;
};
