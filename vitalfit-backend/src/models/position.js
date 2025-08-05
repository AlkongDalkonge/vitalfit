module.exports = (sequelize, DataTypes) => {
  const Position = sequelize.define(
    'Position',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      base_salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'positions',
      indexes: [
        {
          fields: ['code'],
          unique: true,
        },
        {
          fields: ['level'],
        },
        {
          fields: ['is_active'],
        },
      ],
    }
  );

  // 관계 설정
  Position.associate = function (models) {
    // Position은 여러 User를 가질 수 있음
    Position.hasMany(models.User, {
      foreignKey: 'position_id',
      as: 'users',
    });
  };

  return Position;
};
