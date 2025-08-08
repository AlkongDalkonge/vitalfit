const {
  User,
  Member,
  Center,
  Team,
  Payment,
  PTSession,
  Notice,
  Position,
} = require('../models');
const { Op } = require('sequelize');

// 대시보드 통계 조회
const getDashboardStats = async (req, res) => {
  try {
    console.log('대시보드 통계 조회 시작');
    
    // 기본 통계만 먼저 테스트
    const totalUsers = await User.count();
    console.log('총 사용자 수:', totalUsers);
    
    const totalCenters = await Center.count();
    console.log('총 센터 수:', totalCenters);
    
    const totalMembers = await Member.count();
    console.log('총 회원 수:', totalMembers);

    // 센터별 통계 추가
    const centers = await Center.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'status']
        },
        {
          model: Member,
          as: 'members',
          attributes: ['id', 'status']
        }
      ]
    });

    const centerStats = centers.map(center => ({
      id: center.id,
      name: center.name,
      total_users: center.users.length,
      active_users: center.users.filter(user => user.status === 'active').length,
      total_members: center.members.length,
      active_members: center.members.filter(member => member.status === 'active').length,
    }));

    console.log('센터별 통계 완료');

    return res.status(200).json({
      success: true,
      message: '대시보드 통계 조회 성공',
      data: {
        overview: {
          total_users: {
            value: totalUsers,
            change: 0,
            changeType: 'increase'
          },
          total_centers: {
            value: totalCenters,
            change: 0,
            changeType: 'increase'
          },
          total_members: {
            value: totalMembers,
            change: 0,
            changeType: 'increase'
          },
          current_month_revenue: {
            value: 0,
            change: 0,
            changeType: 'increase'
          },
          current_month_sessions: {
            value: 0,
            change: 0,
            changeType: 'increase'
          }
        },
        center_stats: centerStats,
        position_stats: [],
        recent_activities: []
      }
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    console.error('에러 스택:', error.stack);
    return res.status(500).json({
      success: false,
      message: '대시보드 통계 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats,
};
