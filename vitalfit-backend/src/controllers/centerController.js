const { Center, CenterImage, sequelize } = require('../models');

// ✅ 모든 센터 목록 조회
const getAllCenters = async (req, res, next) => {
  try {
    const centers = await Center.findAll({
      where: { status: 'active' },
      include: [
        {
          model: CenterImage,
          as: 'images',
          attributes: ['id', 'image_url', 'is_main'],
          where: { is_main: true },
          required: false,
        },
      ],
      attributes: [
        'id',
        'name',
        'address',
        'phone',
        'description',
        'weekday_hours',
        'saturday_hours',
        'sunday_hours',
        'holiday_hours',
        'has_parking',
        'parking_fee',
        'parking_info',
        'directions',
        'status',
        'created_at',
        'updated_at',
      ],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      message: '센터 목록 조회 성공',
      data: {
        centers,
        total: centers.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 특정 센터 상세 조회
const getCenterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 센터 ID입니다.',
      });
    }

    const center = await Center.findByPk(id, {
      include: [
        {
          model: CenterImage,
          as: 'images',
          attributes: ['id', 'image_url', 'is_main', 'created_at'],
          order: [
            ['is_main', 'DESC'],
            ['created_at', 'ASC'],
          ],
        },
      ],
      attributes: [
        'id',
        'name',
        'address',
        'phone',
        'description',
        'weekday_hours',
        'saturday_hours',
        'sunday_hours',
        'holiday_hours',
        'has_parking',
        'parking_fee',
        'parking_info',
        'directions',
        'status',
        'created_at',
        'updated_at',
      ],
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: '해당 센터를 찾을 수 없습니다.',
      });
    }

    if (center.status === 'closed') {
      return res.status(404).json({
        success: false,
        message: '해당 센터는 폐점되었습니다.',
      });
    }

    return res.status(200).json({
      success: true,
      message: '센터 상세 정보 조회 성공',
      data: center,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 센터 검색 (이름, 주소로 검색)
const searchCenters = async (req, res, next) => {
  try {
    const { q, status = 'active' } = req.query;

    const whereClause = { status };

    if (q) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${q}%` } },
        { address: { [sequelize.Op.iLike]: `%${q}%` } },
      ];
    }

    const centers = await Center.findAll({
      where: whereClause,
      include: [
        {
          model: CenterImage,
          as: 'images',
          attributes: ['id', 'image_url', 'is_main'],
          where: { is_main: true },
          required: false,
        },
      ],
      attributes: [
        'id',
        'name',
        'address',
        'phone',
        'description',
        'weekday_hours',
        'saturday_hours',
        'sunday_hours',
        'holiday_hours',
        'has_parking',
        'parking_fee',
        'parking_info',
        'directions',
        'status',
        'created_at',
        'updated_at',
      ],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      message: '센터 검색 완료',
      data: {
        centers,
        total: centers.length,
        query: q || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  searchCenters,
};
