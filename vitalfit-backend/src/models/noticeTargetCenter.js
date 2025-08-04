module.exports = (sequelize, DataTypes) => {
  const NoticeTargetCenter = sequelize.define(
    'NoticeTargetCenter',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'notice_target_centers',
      indexes: [
        {
          fields: ['notice_id'],
        },
        {
          fields: ['center_id'],
        },
        {
          fields: ['notice_id', 'center_id'],
          unique: true, // 같은 공지에 같은 센터 중복 방지
        },
      ],
    }
  );

  // 관계 설정
  NoticeTargetCenter.associate = function (models) {
    // NoticeTargetCenter belongs to Notice (N:1)
    NoticeTargetCenter.belongsTo(models.Notice, {
      foreignKey: 'notice_id',
      as: 'notice',
    });

    // NoticeTargetCenter belongs to Center (N:1)
    NoticeTargetCenter.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });
  };

  return NoticeTargetCenter;
};
