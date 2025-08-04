module.exports = (sequelize, DataTypes) => {
  const NoticeTargetRole = sequelize.define(
    'NoticeTargetRole',
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
      role_code: {
        type: DataTypes.ENUM('team_member', 'team_leader', 'center_manager'),
        allowNull: false,
        comment: '직책 코드 (수신 대상 직책 구분)',
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'notice_target_roles',
      indexes: [
        {
          fields: ['notice_id'],
        },
        {
          fields: ['role_code'],
        },
        {
          fields: ['notice_id', 'role_code'],
          unique: true, // 같은 공지에 같은 역할 중복 방지
        },
      ],
    }
  );

  // 관계 설정
  NoticeTargetRole.associate = function (models) {
    // NoticeTargetRole belongs to Notice (N:1)
    NoticeTargetRole.belongsTo(models.Notice, {
      foreignKey: 'notice_id',
      as: 'notice',
    });
  };

  return NoticeTargetRole;
};
