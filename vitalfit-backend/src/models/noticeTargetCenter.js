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
        comment: '공지 ID (notices 테이블 참조)',
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '지점 ID (centers 테이블 참조)',
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
