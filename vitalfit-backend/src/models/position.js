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
        comment: '직급 코드 (trainee, student, trainer, ...)',
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '직급명 (연습생, 교육생, 트레이너, ...)',
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '직급 레벨 (1=연습생, 11=센터장)',
      },
      base_salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '기본급(영업지원금)',
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: '적용일',
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '직급 설명',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '활성 상태',
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
