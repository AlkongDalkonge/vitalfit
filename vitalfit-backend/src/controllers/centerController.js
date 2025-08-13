const { Center, CenterImage, sequelize } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/centers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `center-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. (JPG, PNG, WebP만 가능)'));
    }
  },
});

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

// ✅ 센터 이미지 업로드
const uploadCenterImage = async (req, res, next) => {
  try {
    const { center_id, is_main = false } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 필요합니다.',
      });
    }

    if (!center_id) {
      return res.status(400).json({
        success: false,
        message: '센터 ID가 필요합니다.',
      });
    }

    // 센터 존재 확인
    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '해당 센터를 찾을 수 없습니다.',
      });
    }

    // 해당 센터의 기존 이미지 개수 확인
    const existingImages = await CenterImage.count({ where: { center_id: center_id } });
    
    // 메인 이미지로 설정하는 경우 기존 메인 이미지 해제
    if (is_main === 'true' || is_main === true) {
      await CenterImage.update({ is_main: false }, { where: { center_id: center_id } });
    }

    // 이미지 정보 저장
    const imageUrl = `/uploads/centers/${req.file.filename}`;
    const centerImage = await CenterImage.create({
      center_id: center_id,
      image_name: req.file.originalname,
      image_url: imageUrl,
      is_main: is_main === 'true' || is_main === true,
      sort_order: 0,
    });

    // 센터에 이미지가 없었던 경우 첫 번째 이미지를 자동으로 메인으로 설정
    if (existingImages === 0 && !(is_main === 'true' || is_main === true)) {
      await centerImage.update({ is_main: true });
    }

    return res.status(201).json({
      success: true,
      message: '센터 이미지 업로드 성공',
      data: centerImage,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 센터 이미지 삭제
const deleteCenterImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!imageId || isNaN(parseInt(imageId))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이미지 ID입니다.',
      });
    }

    const centerImage = await CenterImage.findByPk(imageId);
    if (!centerImage) {
      return res.status(404).json({
        success: false,
        message: '해당 이미지를 찾을 수 없습니다.',
      });
    }

    // 파일 시스템에서 이미지 파일 삭제
    const filePath = path.join(__dirname, '../../public', centerImage.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 데이터베이스에서 이미지 정보 삭제
    await centerImage.destroy();

    return res.status(200).json({
      success: true,
      message: '센터 이미지 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 센터 업데이트
const updateCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 센터 ID입니다.',
      });
    }

    const center = await Center.findByPk(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '해당 센터를 찾을 수 없습니다.',
      });
    }

    // 센터 정보 업데이트
    await center.update(updateData);

    // 업데이트된 센터 정보 조회
    const updatedCenter = await Center.findByPk(id, {
      include: [
        {
          model: CenterImage,
          as: 'images',
          attributes: ['id', 'image_url', 'is_main'],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: '센터 정보 업데이트 성공',
      data: updatedCenter,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 센터 삭제
const deleteCenter = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 센터 ID입니다.',
      });
    }

    const center = await Center.findByPk(id);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '해당 센터를 찾을 수 없습니다.',
      });
    }

    // 센터에 연결된 이미지들 삭제
    const centerImages = await CenterImage.findAll({ where: { center_id: id } });
    for (const image of centerImages) {
      // 파일 시스템에서 이미지 파일 삭제
      const filePath = path.join(__dirname, '../../public', image.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 센터 삭제 (이미지들은 CASCADE로 자동 삭제됨)
    await center.destroy();

    return res.status(200).json({
      success: true,
      message: '센터 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
};

// ✅ 메인 이미지 설정
const setMainImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!imageId || isNaN(parseInt(imageId))) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이미지 ID입니다.',
      });
    }

    const centerImage = await CenterImage.findByPk(imageId);
    if (!centerImage) {
      return res.status(404).json({
        success: false,
        message: '해당 이미지를 찾을 수 없습니다.',
      });
    }

    // 해당 센터의 모든 이미지를 메인 이미지에서 해제
    await CenterImage.update({ is_main: false }, { where: { center_id: centerImage.center_id } });

    // 선택된 이미지를 메인 이미지로 설정
    await centerImage.update({ is_main: true });

    return res.status(200).json({
      success: true,
      message: '메인 이미지 설정 성공',
      data: centerImage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCenters,
  getCenterById,
  searchCenters,
  updateCenter,
  deleteCenter,
  uploadCenterImage,
  deleteCenterImage,
  setMainImage,
  upload, // multer 미들웨어 export
};
