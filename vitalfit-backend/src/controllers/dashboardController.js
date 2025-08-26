const { User, Member, Center, Team, Payment, PTSession, Notice, Position } = require('../models');
const { Op } = require('sequelize');

// 유틸리티 함수들
const getCurrentMonthRange = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  return { startOfMonth, endOfMonth };
};

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// 대시보드 통계 조회
const getDashboardStats = async (req, res) => {
  try {
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();
    const { today, tomorrow } = getTodayRange();

    // 기본 통계를 병렬로 조회 (성능 최적화)
    const [
      totalUsers,
      totalCenters,
      currentMonthPayments,
      currentMonthSessions,
      completedSessions,
      centers,
      recentUsers,
      recentMembers,
      recentNotices,
    ] = await Promise.all([
      User.count(),
      Center.count(),
      // 이번달 매출 계산 - payment_amount 컬럼 사용
      Payment.sum('payment_amount', {
        where: {
          payment_date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      }).then(sum => sum || 0),
      // 이번달 PT 세션 수
      PTSession.count({
        where: {
          session_date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      }),
      // 정산완료율 계산
      PTSession.count({
        where: {
          session_date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
          end_time: {
            [Op.ne]: null,
          },
        },
      }),
      // 센터별 통계
      Center.findAll({
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'status'],
            required: false,
          },
          {
            model: Member,
            as: 'members',
            attributes: ['id', 'status'],
            required: false,
          },
        ],
      }),
      // 최근 유저 조회 (전체에서 최신 3개)
      User.findAll({
        include: [
          {
            model: Position,
            as: 'position',
            attributes: ['name'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 3,
      }),
      // 최근 멤버 조회 (전체에서 최신 3개)
      Member.findAll({
        include: [
          {
            model: Center,
            as: 'center',
            attributes: ['name'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 3,
      }),
      // 최근 공지 조회 (전체에서 최신 3개)
      Notice.findAll({
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['name'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 3,
      }),
    ]);

    // 이번달 인건비 계산 (임시로 매출의 60%로 설정)
    const currentMonthLaborCost = Math.round(currentMonthPayments * 0.6);

    // 정산완료율 계산
    const settlementCompletionRate =
      currentMonthSessions > 0 ? Math.round((completedSessions / currentMonthSessions) * 100) : 0;

    // 센터별 통계 처리
    const centerStats = centers.map(center => ({
      id: center.id,
      name: center.name,
      total_users: center.users.length,
      active_users: center.users.filter(user => user.status === 'active').length,
      total_members: center.members.length,
      active_members: center.members.filter(member => member.status === 'active').length,
    }));

    // 직급별 통계 조회
    const positionStats = await Position.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'status'],
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });

    const processedPositionStats = positionStats.map(position => {
      const totalUsers = position.users.length;
      const activeUsers = position.users.filter(user => user.status === 'active').length;

      // 이번달 정산 금액 계산 (임시로 활성 유저 수 * 1000000으로 설정)
      const totalSettlement = activeUsers * 1000000;

      return {
        id: position.id,
        name: position.name,
        total_users: totalUsers,
        active_users: activeUsers,
        total_settlement: totalSettlement,
      };
    });

    return res.status(200).json({
      success: true,
      message: '대시보드 통계 조회 성공',
      data: {
        overview: {
          total_users: {
            value: totalUsers,
            change: 0,
            changeType: 'increase',
          },
          total_centers: {
            value: totalCenters,
            change: 0,
            changeType: 'increase',
          },
          current_month_revenue: {
            value: currentMonthPayments,
            change: 0,
            changeType: 'increase',
          },
          current_month_labor_cost: {
            value: currentMonthLaborCost,
            change: 0,
            changeType: 'increase',
          },
          current_month_sessions: {
            value: currentMonthSessions,
            change: 0,
            changeType: 'increase',
          },
          settlement_completion_rate: {
            value: settlementCompletionRate,
            change: 0,
            changeType: 'increase',
          },
        },
        center_stats: centerStats,
        position_stats: processedPositionStats,
        recent_activities: [],
        recent_users: recentUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          position: user.position ? user.position.name : null,
          createdAt: user.createdAt,
        })),
        recent_members: recentMembers.map(member => ({
          id: member.id,
          name: member.name,
          center: member.center ? member.center.name : null,
          createdAt: member.createdAt,
        })),
        recent_notices: recentNotices.map(notice => ({
          id: notice.id,
          title: notice.title,
          sender: notice.sender ? notice.sender.name : null,
          createdAt: notice.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '대시보드 통계 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboardStats,
};
