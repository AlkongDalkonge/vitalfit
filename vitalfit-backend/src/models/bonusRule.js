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
        comment: '룰 이름 (예: "주 500만 2회, 11일 이전")',
      },
      target_type: {
        type: DataTypes.ENUM('daily', 'weekly'),
        allowNull: false,
        comment: '기준 단위 (daily: 일, weekly: 주)',
      },
      threshold_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '기준 매출 (원 단위)',
      },
      achievement_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '달성 횟수 (몇 번째 달성인지)',
      },
      bonus_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '지급할 보너스 금액 (원 단위)',
      },
      before_11days: {
        type: DataTypes.ENUM('Y', 'N'),
        allowNull: false,
        defaultValue: 'N',
        comment: '11일 이전 조건 (Y: 11일 이전, N: 일반)',
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
