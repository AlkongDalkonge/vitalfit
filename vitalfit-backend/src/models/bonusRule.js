module.exports = (sequelize, DataTypes) => {
  const BonusRule = sequelize.define(
    'BonusRule',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      target_type: {
        type: DataTypes.ENUM('daily', 'weekly'),
        allowNull: false,
      },
      threshold_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      achievement_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bonus_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      before_11days: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: false,
        defaultValue: 'N',
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'bonus_rules',
      indexes: [
        {
          fields: ['target_type'],
        },
        {
          fields: ['threshold_amount'],
        },
        {
          fields: ['before_11days'],
        },
      ],
    }
  );

  return BonusRule;
};
