module.exports = (sequelize, DataTypes) => {
  const MonthlySettlement = sequelize.define(
    "MonthlySettlement",
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
      status: {
        type: DataTypes.ENUM("draft", "confirmed", "paid"),
        allowNull: false,
        defaultValue: "draft",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      tableName: "monthly_settlements",
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["center_id"],
        },
        {
          fields: ["settlement_year", "settlement_month"],
        },
        {
          fields: ["user_id", "settlement_year", "settlement_month"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  MonthlySettlement.associate = function (models) {
    // MonthlySettlement belongs to User (N:1) - 트레이너
    MonthlySettlement.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "trainer",
    });

    // MonthlySettlement belongs to Center (N:1)
    MonthlySettlement.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });
  };

  return MonthlySettlement;
};
