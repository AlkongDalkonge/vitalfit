const { Team } = require('../models');

// ✅ 모든 팀 조회
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      message: '팀 목록 조회 성공',
      data: {
        teams: teams,
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
