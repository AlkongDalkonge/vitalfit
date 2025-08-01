module.exports = (sequelize, DataTypes) => {
  const Center = sequelize.define(
    'Center',
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
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      weekday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      saturday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sunday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      holiday_hours: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      has_parking: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      parking_fee: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      parking_info: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      directions: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'closed'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'centers',
    }
  );

  Center.associate = function (models) {
    // Center has many CenterImages (1:N)
    Center.hasMany(models.CenterImage, {
      foreignKey: 'center_id',
      as: 'images',
    });

    // Center has many Users (1:N)
    Center.hasMany(models.User, {
      foreignKey: 'center_id',
      as: 'users',
    });

    // Center has many Teams (1:N)
    Center.hasMany(models.Team, {
      foreignKey: 'center_id',
      as: 'teams',
    });

    // Center has many Members (1:N)
    Center.hasMany(models.Member, {
      foreignKey: 'center_id',
      as: 'members',
    });

    // Center has many Payments (1:N)
    Center.hasMany(models.Payment, {
      foreignKey: 'center_id',
      as: 'payments',
    });

    // Center has many PTSessions (1:N)
    Center.hasMany(models.PTSession, {
      foreignKey: 'center_id',
      as: 'ptSessions',
    });

    // Center has many MonthlySettlements (1:N)
    Center.hasMany(models.MonthlySettlement, {
      foreignKey: 'center_id',
      as: 'settlements',
    });
  };

  return Center;
};
