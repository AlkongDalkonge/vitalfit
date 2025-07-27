module.exports = (sequelize, DataTypes) => {
  const BaseSalary = sequelize.define(
    "BaseSalary",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      position: {
        type: DataTypes.ENUM("center_manager", "team_leader", "team_member"),
        allowNull: false,
      },
      base_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      tableName: "base_salaries",
    }
  );

  return BaseSalary;
};
