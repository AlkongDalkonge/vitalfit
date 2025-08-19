const { Team, User, PTSession, Payment } = require('../models');
const { Op } = require('sequelize');

// ✅ 모든 팀 조회
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      attributes: ['id', 'name', 'center_id'],
      order: [['name', 'ASC']],
    });

    // 중복된 팀 이름 제거 (같은 이름의 팀 중 첫 번째 것만 유지)
    const uniqueTeamsMap = new Map();

    teams.forEach(team => {
      if (!uniqueTeamsMap.has(team.name)) {
        uniqueTeamsMap.set(team.name, team);
      }
    });

    const uniqueTeams = Array.from(uniqueTeamsMap.values());

    console.log('원본 팀 수:', teams.length);
    console.log('중복 제거 후 팀 수:', uniqueTeams.length);
    console.log(
      '고유한 팀들:',
      uniqueTeams.map(t => t.name)
    );

    return res.status(200).json({
      success: true,
      message: '팀 목록 조회 성공',
      data: {
        teams: uniqueTeams,
      },
    });
  } catch (error) {
    console.error('팀 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '팀 목록 조회 중 오류가 발생했습니다.',
    });
  }
};

// ✅ 특정 팀 조회
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      attributes: ['id', 'name'],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 팀입니다.',
      });
    }

    return res.status(200).json({
      success: true,
      message: '팀 조회 성공',
      data: {
        team: team,
      },
    });
  } catch (error) {
    console.error('팀 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '팀 조회 중 오류가 발생했습니다.',
    });
  }
};

// ✅ 팀별 매출 통계 조회 (새로 추가)
const getTeamRevenueStats = async (req, res) => {
  try {
    const { teamId, year, month } = req.params;

    console.log('팀별 매출 통계 조회 시작:', { teamId, year, month });

    // 파라미터 유효성 검증
    const teamIdNum = parseInt(teamId);
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(teamIdNum) || teamIdNum <= 0) {
      console.log('유효하지 않은 팀 ID:', teamIdNum);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 팀 ID입니다.',
      });
    }

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      console.log('유효하지 않은 년도:', yearNum);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 년도입니다.',
      });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.log('유효하지 않은 월:', monthNum);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 월입니다.',
      });
    }

    console.log('파라미터 검증 통과:', { teamIdNum, yearNum, monthNum });

    // 팀 정보 조회 (팀장 포함)
    const team = await Team.findByPk(teamIdNum, {
      include: [
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'name', 'nickname', 'position_id'],
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'nickname', 'position_id'],
        },
      ],
    });

    console.log('팀 정보 조회 결과:', {
      teamFound: !!team,
      teamId: team?.id,
      teamName: team?.name,
      leaderId: team?.leader_id,
      membersCount: team?.members?.length || 0,
      leaderPositionId: team?.leader?.position_id,
      membersPositionIds:
        team?.members?.map(m => ({ id: m.id, name: m.name, position_id: m.position_id })) || [],
    });

    if (!team) {
      console.log('존재하지 않는 팀:', teamIdNum);
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 팀입니다.',
      });
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // 팀원들의 ID 목록 생성 (팀장 + 팀원들)
    const teamMemberIds = [team.leader_id];
    if (team.members && team.members.length > 0) {
      team.members.forEach(member => {
        teamMemberIds.push(member.id);
      });
    }

    // 팀원들의 해당 월 PT 세션 조회
    const ptSessions = await PTSession.findAll({
      where: {
        trainer_id: {
          [Op.in]: teamMemberIds,
        },
        session_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ['id', 'trainer_id', 'session_date', 'start_time', 'end_time', 'session_type'],
      order: [
        ['session_date', 'ASC'],
        ['start_time', 'ASC'],
      ],
    });

    // 팀원들의 해당 월 결제 내역 조회
    const payments = await Payment.findAll({
      where: {
        trainer_id: {
          [Op.in]: teamMemberIds,
        },
        payment_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ['id', 'trainer_id', 'payment_date', 'payment_amount', 'pt_type'],
      order: [['payment_date', 'ASC']],
    });

    // 팀원별 통계 계산
    const memberStats = {};
    teamMemberIds.forEach(memberId => {
      const memberSessions = ptSessions.filter(session => session.trainer_id === memberId);
      const memberPayments = payments.filter(payment => payment.trainer_id === memberId);

      // PT 세션 통계
      const totalSessions = memberSessions.length;
      const completedSessions = memberSessions.filter(session => session.end_time).length;
      const regularSessions = memberSessions.filter(
        session => session.session_type === 'regular'
      ).length;
      const freeSessions = memberSessions.filter(session => session.session_type === 'free').length;

      // 수업 시간 계산 (시간 단위)
      let totalSessionHours = 0;
      memberSessions.forEach(session => {
        if (session.start_time && session.end_time) {
          const startTime = new Date(`2000-01-01T${session.start_time}`);
          const endTime = new Date(`2000-01-01T${session.end_time}`);
          const diffMs = endTime - startTime;
          const diffHours = diffMs / (1000 * 60 * 60);
          totalSessionHours += diffHours;
        } else {
          // end_time이 없는 경우 기본 1시간으로 계산
          totalSessionHours += 1;
        }
      });

      // 결제 통계
      const totalRevenue = memberPayments.reduce((sum, payment) => sum + payment.payment_amount, 0);

      memberStats[memberId] = {
        pt_sessions: {
          total: totalSessions,
          completed: completedSessions,
          regular: regularSessions,
          free: freeSessions,
          total_hours: Math.round(totalSessionHours * 100) / 100,
        },
        revenue: {
          total: totalRevenue,
          payments_count: memberPayments.length,
        },
      };
    });

    // 팀 전체 통계 계산
    const teamTotalSessions = ptSessions.length;
    const teamCompletedSessions = ptSessions.filter(session => session.end_time).length;
    const teamTotalRevenue = payments.reduce((sum, payment) => sum + payment.payment_amount, 0);

    // 팀원 정보와 통계 결합
    const teamMembersWithStats = [];

    // 팀장 정보 추가
    if (team.leader) {
      teamMembersWithStats.push({
        id: team.leader.id,
        name: team.leader.name,
        nickname: team.leader.nickname,
        position_id: team.leader.position_id,
        is_leader: team.leader.position_id === 7,
        stats: memberStats[team.leader.id] || {
          pt_sessions: { total: 0, completed: 0, regular: 0, free: 0, total_hours: 0 },
          revenue: { total: 0, payments_count: 0 },
        },
      });
    }

    // 팀원들 정보 추가
    if (team.members && team.members.length > 0) {
      team.members.forEach(member => {
        teamMembersWithStats.push({
          id: member.id,
          name: member.name,
          nickname: member.nickname,
          position_id: member.position_id,
          is_leader: member.position_id === 7,
          stats: memberStats[member.id] || {
            pt_sessions: { total: 0, completed: 0, regular: 0, free: 0, total_hours: 0 },
            revenue: { total: 0, payments_count: 0 },
          },
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: '팀별 매출 통계 조회 성공',
      data: {
        team: {
          id: team.id,
          name: team.name,
          center_id: team.center_id,
        },
        year: yearNum,
        month: monthNum,
        team_statistics: {
          total_sessions: teamTotalSessions,
          completed_sessions: teamCompletedSessions,
          total_revenue: teamTotalRevenue,
          members_count: teamMembersWithStats.length,
        },
        members: teamMembersWithStats,
        pt_sessions: ptSessions,
        payments: payments,
      },
    });
  } catch (error) {
    console.error('팀별 매출 통계 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '팀별 매출 통계 조회 중 오류가 발생했습니다.',
    });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  getTeamRevenueStats,
};
