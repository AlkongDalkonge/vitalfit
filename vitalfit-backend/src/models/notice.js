module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define(
    'Notice',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachment_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      attachment_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_important: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pin_until: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_for_all: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: true,
      tableName: 'notices',
      indexes: [
        {
          fields: ['sender_id'],
        },
        {
          fields: ['created_at'],
        },
        {
          fields: ['is_important'],
        },
        {
          fields: ['pin_until'],
        },
        {
          fields: ['is_for_all'],
        },
      ],
    }
  );

  Notice.associate = function (models) {
    // Notice belongs to User (N:1) - 작성자
    Notice.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender',
    });

    // Notice has many NoticeTargetCenters (1:N)
    Notice.hasMany(models.NoticeTargetCenter, {
      foreignKey: 'notice_id',
      as: 'targetCenters',
    });

    // Notice has many NoticeTargetRoles (1:N)
    Notice.hasMany(models.NoticeTargetRole, {
      foreignKey: 'notice_id',
      as: 'targetRoles',
    });

    // Notice has many NoticeComments (1:N)
    Notice.hasMany(models.NoticeComment, {
      foreignKey: 'notice_id',
      as: 'comments',
    });

    // Notice has many NoticeNotifications (1:N)
    Notice.hasMany(models.NoticeNotification, {
      foreignKey: 'notice_id',
      as: 'notifications',
    });
  };

  return Notice;
};
