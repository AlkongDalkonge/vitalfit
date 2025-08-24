module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          len: [10, 20],
        },
        set(value) {
          // 빈 문자열을 null로 변환하지 않고 그대로 유지
          if (value === '') {
            this.setDataValue('phone', null);
          } else {
            this.setDataValue('phone', value);
          }
        },
      },
      gender: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          isIn: [['male', 'female', 'other']],
        },
      },
      terms_accepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      terms_accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      position_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        set(value) {
          // 빈 문자열을 null로 변환
          if (value === '') {
            this.setDataValue('team_id', null);
          } else {
            this.setDataValue('team_id', value);
          }
        },
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      join_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        set(value) {
          // 빈 값이거나 잘못된 날짜인 경우 현재 날짜로 설정
          if (!value || value === '') {
            this.setDataValue('join_date', new Date());
          } else {
            this.setDataValue('join_date', value);
          }
        },
      },
      status: {
        type: DataTypes.ENUM('pending_verification', 'active', 'retired'),
        allowNull: false,
        defaultValue: 'pending_verification', // 회원가입 시 pending_verification으로 시작
      },
      leave_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      profile_image_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      profile_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      license: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      experience: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      education: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      instagram: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      shift: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      remember_me: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // 이메일 인증용 (간소화)
      verification_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      verification_code_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // 비밀번호 재설정용 (새로 추가)
      password_reset_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      password_reset_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // 재인증 토큰 (JWT - 매우 긴 문자열)
      reAuthToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Refresh Token (JWT - 매우 긴 문자열, 누락된 필드)
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // 계좌 관련 필드
      account_number: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      account_bank: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      account_image_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      account_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'users',
      indexes: [
        { unique: true, fields: ['email'] },
        { fields: ['center_id'] },
        { fields: ['team_id'] },
        { fields: ['position_id'] },
        { fields: ['status'] },
      ],
    }
  );

  User.associate = function (models) {
    User.belongsTo(models.Position, {
      foreignKey: 'position_id',
      as: 'position',
    });
    User.belongsTo(models.Center, {
      foreignKey: 'center_id',
      as: 'center',
    });
    User.belongsTo(models.Team, {
      foreignKey: 'team_id',
      as: 'team',
    });
    User.hasMany(models.Notice, {
      foreignKey: 'sender_id',
      as: 'sentNotices',
    });
    User.hasMany(models.Member, {
      foreignKey: 'trainer_id',
      as: 'members',
    });
    User.hasMany(models.Payment, {
      foreignKey: 'trainer_id',
      as: 'trainerPayments',
    });
    User.hasMany(models.PTSession, {
      foreignKey: 'trainer_id',
      as: 'trainerSessions',
    });
    User.hasMany(models.MonthlySettlement, {
      foreignKey: 'user_id',
      as: 'settlements',
    });

    // 거절 로그와의 관계 (1:N)
    User.hasMany(models.SettlementRejectLog, {
      foreignKey: 'rejected_by',
      as: 'rejectedSettlements',
    });
  };

  return User;
};
