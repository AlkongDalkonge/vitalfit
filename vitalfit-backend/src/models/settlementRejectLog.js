module.exports = (sequelize, DataTypes) => {
  const SettlementRejectLog = sequelize.define(
    'SettlementRejectLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      settlement_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'monthly_settlements',
          key: 'id',
        },
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      rejected_role: {
        type: DataTypes.ENUM('center_manager', 'hq'),
        allowNull: false,
      },
      reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'settlement_reject_logs',
      indexes: [
        {
          fields: ['settlement_id', 'rejected_at'],
          order: [['rejected_at', 'DESC']],
        },
        {
          fields: ['rejected_by'],
        },
      ],
    }
  );

  SettlementRejectLog.associate = function (models) {
    // 정산과의 관계
    SettlementRejectLog.belongsTo(models.MonthlySettlement, {
      foreignKey: 'settlement_id',
      as: 'settlement',
    });

    // 거절한 사용자와의 관계
    SettlementRejectLog.belongsTo(models.User, {
      foreignKey: 'rejected_by',
      as: 'rejectedBy',
    });
  };

  return SettlementRejectLog;
}; 