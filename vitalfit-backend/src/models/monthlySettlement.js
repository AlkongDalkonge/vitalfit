module.exports = (sequelize, DataTypes) => {
  const MonthlySettlement = sequelize.define(
    'MonthlySettlement',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      settlement_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      settlement_month: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actual_revenue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      carryover_from_prev: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_revenue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      settlement_revenue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remaining_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      base_salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      regular_pt_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      free_pt_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      pt_commission_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      monthly_commission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      team_pt_incentive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bonus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_settlement: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      after_tax_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('draft', 'acknowledged', 'center_approved', 'hq_approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft',
      },
      acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      acknowledged_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      center_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      center_approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      hq_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hq_approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejected_role: {
        type: DataTypes.ENUM('center_manager', 'hq'),
        allowNull: true,
      },
      payment_ref: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'monthly_settlements',
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['center_id'],
        },
        {
          fields: ['settlement_year', 'settlement_month'],
        },
        {
          fields: ['user_id', 'settlement_year', 'settlement_month'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['center_id', 'status'],
        },
        {
          fields: ['user_id', 'settlement_year', 'settlement_month'],
          unique: true,
          name: 'unique_trainer_monthly_settlement',
        },
      ],
    }
  );

  MonthlySettlement.associate = function (models) {
    MonthlySettlement.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'trainer',
    });

    MonthlySettlement.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });

    // 승인/반려 관련 사용자 관계
    MonthlySettlement.belongsTo(models.User, {
      foreignKey: 'acknowledged_by',
      as: 'acknowledgedBy',
    });

    MonthlySettlement.belongsTo(models.User, {
      foreignKey: 'center_approved_by',
      as: 'centerApprovedBy',
    });

    MonthlySettlement.belongsTo(models.User, {
      foreignKey: 'hq_approved_by',
      as: 'hqApprovedBy',
    });

    MonthlySettlement.belongsTo(models.User, {
      foreignKey: 'rejected_by',
      as: 'rejectedBy',
    });

    // 거절 로그와의 관계 (1:N)
    MonthlySettlement.hasMany(models.SettlementRejectLog, {
      foreignKey: 'settlement_id',
      as: 'rejectLogs',
    });
  };

  return MonthlySettlement;
};
