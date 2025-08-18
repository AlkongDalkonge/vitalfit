module.exports = (sequelize, DataTypes) => {
  const JobRun = sequelize.define(
    'JobRun',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      job_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      target_period: {
        type: DataTypes.STRING(7),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('running', 'completed', 'failed', 'cancelled', 'skipped'),
        allowNull: false,
        defaultValue: 'running',
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      execution_time_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      records_processed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: 'job_runs',
      indexes: [
        {
          fields: ['job_name'],
        },
        {
          fields: ['target_period'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['started_at'],
        },
        {
          fields: ['job_name', 'target_period'],
          unique: true,
          name: 'unique_job_period',
          where: {
            target_period: {
              [sequelize.Sequelize.Op.not]: null,
            },
          },
        },
        {
          fields: ['status', 'started_at'],
        },
      ],
    }
  );

  return JobRun;
};
