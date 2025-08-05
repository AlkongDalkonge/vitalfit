module.exports = (sequelize, DataTypes) => {
  const CommissionRate = sequelize.define(
    'CommissionRate',
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
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      position_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'commission_rates',
      indexes: [
        {
          fields: ['min_revenue', 'max_revenue'],
        },
        {
          fields: ['center_id'],
        },
        {
          fields: ['position_id'],
        },
        {
          fields: ['is_active'],
        },
        {
          fields: ['effective_date'],
        },
        {
          fields: ['center_id', 'position_id', 'effective_date'],
        },
      ],
    }
  );

  // 관계 설정
  CommissionRate.associate = function (models) {
    // CommissionRate belongs to Center (N:1) - 지점별 정책
    CommissionRate.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });

    // CommissionRate belongs to Position (N:1) - 직급별 정책
    CommissionRate.belongsTo(models.Position, {
      foreignKey: 'position_id',
      as: 'position',
    });
  };

  return CommissionRate;
};
