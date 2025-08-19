const { SettlementNotification, MonthlySettlement, User } = require('../models');

// 사용자의 정산 알림 목록 조회
exports.getSettlementNotifications = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    const userId = req.user?.id || 1;

    const notifications = await SettlementNotification.findAll({
      where: {
        user_id: userId,
        is_read: false,
      },
      include: [
        {
          model: MonthlySettlement,
          as: 'settlement',
          attributes: ['id', 'settlement_year', 'settlement_month', 'status'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('정산 알림 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '정산 알림 조회 중 오류가 발생했습니다.',
    });
  }
};

// 알림 읽음 처리
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    // TODO: Auth 구현 후 req.user 사용
    const userId = req.user?.id || 1;

    const notification = await SettlementNotification.findOne({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.',
      });
    }

    notification.is_read = true;
    await notification.save();

    res.json({
      success: true,
      message: '알림이 읽음 처리되었습니다.',
    });
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리 중 오류가 발생했습니다.',
    });
  }
};

// 모든 알림 읽음 처리
exports.markAllAsRead = async (req, res) => {
  try {
    // TODO: Auth 구현 후 req.user 사용
    const userId = req.user?.id || 1;

    await SettlementNotification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    res.json({
      success: true,
      message: '모든 알림이 읽음 처리되었습니다.',
    });
  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '알림 읽음 처리 중 오류가 발생했습니다.',
    });
  }
};
