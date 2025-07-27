module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
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
      session_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "payments",
      indexes: [
        {
          fields: ["trainer_id"],
        },
        {
          fields: ["member_id"],
        },
        {
          fields: ["center_id"],
        },
        {
          fields: ["payment_date"],
        },
        {
          fields: ["trainer_id", "payment_date"],
        },
      ],
    }
  );

  Payment.associate = function (models) {
    // Payment belongs to Member (N:1)
    Payment.belongsTo(models.Member, {
      foreignKey: "member_id",
      as: "member",
    });

    // Payment belongs to User (N:1) - 담당 트레이너
    Payment.belongsTo(models.User, {
      foreignKey: "trainer_id",
      as: "trainer",
    });

    // Payment belongs to Center (N:1)
    Payment.belongsTo(models.Center, {
      foreignKey: "center_id",
      as: "center",
    });
  };

  return Payment;
};
