module.exports = (sequelize, DataTypes) => {
  const CommissionRate = sequelize.define(
    "CommissionRate",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      min_revenue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_revenue: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      commission_per_session: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      monthly_commission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: "commission_rates",
    }
  );

  return CommissionRate;
};
