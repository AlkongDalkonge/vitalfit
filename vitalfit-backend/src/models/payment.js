module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trainer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pt_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'PT 종류 (개인PT, 그룹PT 등)',
      },
      session_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      free_session_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'payments',
      indexes: [
        {
          fields: ['trainer_id'],
        },
        {
          fields: ['member_id'],
        },
        {
          fields: ['center_id'],
        },
        {
          fields: ['payment_date'],
        },
        {
          fields: ['trainer_id', 'payment_date'],
        },
        // 복합 인덱스: member_id, trainer_id, center_id, payment_date
        {
          fields: ['member_id', 'trainer_id', 'center_id', 'payment_date'],
          name: 'idx_payment_member_trainer_center_date',
        },
        // Unique 제약: 같은 회원이 같은 날짜에 같은 결제 방법으로 중복 결제 방지
        {
          fields: ['member_id', 'payment_date', 'payment_method'],
          unique: true,
          name: 'unique_member_payment_per_day_method',
        },
      ],
    }
  );

  Payment.associate = function (models) {
    // Payment belongs to Member (N:1)
    Payment.belongsTo(models.Member, {
      foreignKey: 'member_id',
      as: 'member',
    });

    // Payment belongs to User (N:1) - 담당 트레이너
    Payment.belongsTo(models.User, {
      foreignKey: 'trainer_id',
      as: 'trainer',
    });

    // Payment belongs to Center (N:1)
    Payment.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });
  };

  return Payment;
};
