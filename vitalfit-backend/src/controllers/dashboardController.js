const { User, Member, Center, Team, Payment, PTSession, Notice, Position } = require('../models');
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

    // 전체 멤버 조회해서 최근 멤버 확인
    const allMembers = await Member.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    console.log(
      '전체 멤버 (최근 10개):',
      allMembers.map(m => ({
        id: m.id,
        name: m.name,
        createdAt: m.createdAt,
      }))
    );

    // 센터별 통계 추가
    const centers = await Center.findAll({
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

    // 최근 유저 조회 (오늘 생성된 것만)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    console.log('오늘 생성된 유저 조회 결과:', recentUsers.length, '개');
    console.log(
      '오늘 생성된 유저 데이터:',
      recentUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        position: user.position ? user.position.name : null,
        createdAt: user.createdAt,
      }))
    );

    // 최근 멤버 조회 (오늘 생성된 것만)
    const recentMembers = await Member.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      include: [
        {
          model: Center,
          as: 'center',
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    console.log('오늘 생성된 멤버 조회 결과:', recentMembers.length, '개');
    console.log(
      '오늘 생성된 멤버 데이터:',
      recentMembers.map(member => ({
        id: member.id,
        name: member.name,
        center: member.center ? member.center.name : null,
        createdAt: member.createdAt,
      }))
    );

    // 최근 공지 조회 (오늘 생성된 것만)
    const recentNotices = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    console.log('오늘 생성된 공지 조회 결과:', recentNotices.length, '개');
    console.log(
      '오늘 생성된 공지 데이터:',
      recentNotices.map(notice => ({
        id: notice.id,
        title: notice.title,
        sender: notice.sender ? notice.sender.name : null,
        createdAt: notice.createdAt,
      }))
    );

    console.log('최근 데이터 조회 완료');
    console.log('최근 유저 수:', recentUsers.length);
    console.log('최근 멤버 수:', recentMembers.length);
    console.log('최근 공지 수:', recentNotices.length);

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
          total_members: {
            value: totalMembers,
            change: 0,
            changeType: 'increase',
          },
          current_month_revenue: {
            value: 0,
            change: 0,
            changeType: 'increase',
          },
          current_month_sessions: {
            value: 0,
            change: 0,
            changeType: 'increase',
          },
        },
        center_stats: centerStats,
        position_stats: [],
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
    console.error('에러 스택:', error.stack);
    console.error('에러 상세:', {
      name: error.name,
      message: error.message,
      code: error.code,
      sql: error.sql,
    });
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
