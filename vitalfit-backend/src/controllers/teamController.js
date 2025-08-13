const { Team } = require('../models');

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
    console.log('고유한 팀들:', uniqueTeams.map(t => t.name));

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

module.exports = {
  getAllTeams,
  getTeamById,
};
