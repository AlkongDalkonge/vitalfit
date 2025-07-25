module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define("Notice", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notice_type: {
      type: DataTypes.ENUM("general", "important", "event"), // 필요에 따라 추가 가능
      defaultValue: "general",
    },
    fileName: {
      type: DataTypes.STRING, // 실제 파일명 (예: 원본파일명.pdf)
      allowNull: true,
    },
    attachments: {
      type: DataTypes.STRING, // 저장된 경로 또는 URL
      allowNull: true,
    },
  });

  return Notice;
};
