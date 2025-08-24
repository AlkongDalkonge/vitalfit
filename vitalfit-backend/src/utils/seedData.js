const bcrypt = require('bcrypt');

const {
  Center,
  User,
  Member,
  Team,
  Payment,
  PTSession,
  Position,
  CommissionRate,
  BonusRule,
  Notice,
  NoticeTargetCenter,
  NoticeTargetRole,
} = require('../models/index');

// 센터 시드 데이터
const seedCenters = async () => {
  try {
    // 기존 센터 데이터 확인
    const existingCenters = await Center.findAll();
    if (existingCenters.length > 0) {
      console.log(`✅ 센터 데이터가 이미 존재합니다 (${existingCenters.length}개 센터)`);
      return existingCenters;
    }

    const centers = await Center.bulkCreate([
      {
        name: '바이탈핏 강남센터',
        address: '서울시 강남구 테헤란로 123-45 강남빌딩 2층',
        phone: '02-1234-5678',
        description:
          '강남 최고의 프리미엄 피트니스 센터입니다. 최신 운동기구와 전문 트레이너들이 여러분의 건강한 변화를 도와드립니다.',
        weekday_hours: '06:00 - 22:00',
        saturday_hours: '08:00 - 20:00',
        sunday_hours: '09:00 - 18:00',
        holiday_hours: '10:00 - 16:00',
        has_parking: true,
        parking_fee: '2시간 무료, 추가 시간당 1,000원',
        parking_info: '지하 1층 ~ 지하 3층 (총 50대 가능)',
        directions: '강남역 2번 출구에서 도보 3분, 테헤란로 방향',
        status: 'active',
      },
      {
        name: '바이탈핏 홍대센터',
        address: '서울시 마포구 홍익로 456-78 홍대타워 3층',
        phone: '02-2345-6789',
        description:
          '홍대의 핫한 감성과 함께하는 트렌디한 피트니스 공간입니다. 젊은 에너지가 넘치는 분위기에서 운동하세요.',
        weekday_hours: '06:30 - 23:00',
        saturday_hours: '07:00 - 22:00',
        sunday_hours: '08:00 - 20:00',
        holiday_hours: '09:00 - 18:00',
        has_parking: false,
        parking_fee: null,
        parking_info: '인근 공영주차장 이용 (도보 2분)',
        directions: '홍대입구역 9번 출구에서 도보 5분, 홍익대 정문 방향',
        status: 'active',
      },
      {
        name: '바이탈핏 신림센터',
        address: '서울시 관악구 신림동 789-12 신림프라자 4층',
        phone: '02-3456-7890',
        description:
          '학생과 직장인을 위한 합리적인 가격의 피트니스 센터입니다. 넓은 공간과 다양한 프로그램을 제공합니다.',
        weekday_hours: '05:30 - 23:30',
        saturday_hours: '06:00 - 22:00',
        sunday_hours: '07:00 - 21:00',
        holiday_hours: '08:00 - 19:00',
        has_parking: true,
        parking_fee: '첫 1시간 무료, 추가 30분당 500원',
        parking_info: '건물 뒤편 전용 주차장 (30대 가능)',
        directions: '신림역 1번 출구에서 도보 7분, 신림사거리 방향',
        status: 'active',
      },
    ]);

    console.log(`✅ 센터 시드 데이터 생성 완료 (${centers.length}개 센터)`);
    return centers;
  } catch (error) {
    console.error('❌ 센터 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// Position 시드 데이터 생성 (기존 RoleCode + BaseSalary 통합)
const seedPositions = async () => {
  try {
    console.log('📊 Position 시드 데이터 생성 중...');

    // 기존 Position 데이터 확인
    const existingPositions = await Position.findAll();
    if (existingPositions.length > 0) {
      console.log(`✅ Position 데이터가 이미 존재합니다 (${existingPositions.length}개 Position)`);
      return existingPositions;
    }

    const positions = await Position.bulkCreate([
      {
        code: 'trainee',
        name: '연습생',
        level: 1,
        base_salary: 600000, // 60만원
        effective_date: '2024-06-01',
        description: '신입 직원 교육 과정',
        is_active: true,
      },
      {
        code: 'student',
        name: '교육생',
        level: 2,
        base_salary: 800000, // 80만원
        effective_date: '2024-06-01',
        description: '기본 교육 이수 후 단계',
        is_active: true,
      },
      {
        code: 'trainer',
        name: '트레이너',
        level: 3,
        base_salary: 1000000, // 100만원
        effective_date: '2024-06-01',
        description: '일반 트레이너',
        is_active: true,
      },
      {
        code: 'junior',
        name: '주니어',
        level: 4,
        base_salary: 1300000, // 130만원
        effective_date: '2024-06-01',
        description: '경력 1-2년 트레이너',
        is_active: true,
      },
      {
        code: 'senior',
        name: '시니어',
        level: 5,
        base_salary: 1500000, // 150만원
        effective_date: '2024-06-01',
        description: '경력 3년 이상 숙련 트레이너',
        is_active: true,
      },
      {
        code: 'etiquette_manager',
        name: '에티켓장',
        level: 6,
        base_salary: 1500000, // 150만원
        effective_date: '2024-06-01',
        description: '센터 에티켓 및 질서 관리',
        is_active: true,
      },
      {
        code: 'team_leader',
        name: '팀장',
        level: 7,
        base_salary: 1800000, // 180만원
        effective_date: '2024-06-01',
        description: '팀 리더십 및 관리 업무',
        is_active: true,
      },
      {
        code: 'area_manager',
        name: '에리어매니저',
        level: 8,
        base_salary: 1800000, // 180만원
        effective_date: '2024-06-01',
        description: '지역별 센터 관리',
        is_active: true,
      },
      {
        code: 'manager',
        name: '매니저',
        level: 9,
        base_salary: 2000000, // 200만원
        effective_date: '2024-06-01',
        description: '센터 운영 관리',
        is_active: true,
      },
      {
        code: 'operation_manager',
        name: '운영팀장',
        level: 10,
        base_salary: 2000000, // 200만원
        effective_date: '2024-06-01',
        description: '센터 전체 운영 총괄',
        is_active: true,
      },
      {
        code: 'center_manager',
        name: '센터장',
        level: 11,
        base_salary: 2500000, // 250만원
        effective_date: '2024-06-01',
        description: '센터 최고 책임자',
        is_active: true,
      },
      {
        code: 'finance_team',
        name: '회계팀',
        level: 12,
        base_salary: 0, // 회계팀은 별도 급여 체계
        effective_date: '2024-06-01',
        description: '재무 및 회계 업무 담당',
        is_active: true,
      },
      {
        code: 'admin',
        name: '관리자',
        level: 99, // 특별 관리자 레벨
        base_salary: 0, // 관리자는 별도 급여 체계
        effective_date: '2024-06-01',
        description: '시스템 최고 관리자',
        is_active: true,
      },
    ]);

    console.log(`✅ Position 시드 데이터 생성 완료 (${positions.length}개 직급)`);
    return positions;
  } catch (error) {
    console.error('❌ Position 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 팀 시드 데이터
const seedTeams = async centers => {
  try {
    const teams = await Team.bulkCreate([
      // 강남센터 4개 팀
      {
        name: '강남1팀', // 4명 구성 (10%)
        center_id: centers[0].id,
        leader_id: null,
      },
      {
        name: '강남2팀', // 3명 구성 (70%)
        center_id: centers[0].id,
        leader_id: null,
      },
      {
        name: '강남3팀', // 3명 구성 (70%)
        center_id: centers[0].id,
        leader_id: null,
      },
      {
        name: '강남4팀', // 3명 구성 (70%)
        center_id: centers[0].id,
        leader_id: null,
      },
      // 홍대센터 3개 팀
      {
        name: '홍대1팀', // 3명 구성 (70%)
        center_id: centers[1].id,
        leader_id: null,
      },
      {
        name: '홍대2팀', // 3명 구성 (70%)
        center_id: centers[1].id,
        leader_id: null,
      },
      {
        name: '홍대3팀', // 3명 구성 (70%)
        center_id: centers[1].id,
        leader_id: null,
      },
      // 신림센터 3개 팀
      {
        name: '신림1팀', // 3명 구성 (70%)
        center_id: centers[2].id,
        leader_id: null,
      },
      {
        name: '신림2팀', // 2명 구성 (20%)
        center_id: centers[2].id,
        leader_id: null,
      },
      {
        name: '신림3팀', // 2명 구성 (20%)
        center_id: centers[2].id,
        leader_id: null,
      },
    ]);

    console.log(`✅ 팀 시드 데이터 생성 완료 (${teams.length}개 팀)`);
    return teams;
  } catch (error) {
    console.error('❌ 팀 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 사용자 시드 데이터
const seedUsers = async (centers, teams, positions) => {
  try {
    console.log('사용자 시드 데이터 생성 시작...');

    // 기존 사용자 데이터 확인
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log(`✅ 사용자 데이터가 이미 존재합니다 (${existingUsers.length}명 사용자)`);
      return existingUsers;
    }

    // 각 사용자를 개별적으로 생성 (bcrypt.hash 때문에)
    const userData = [
      // 관리자
      {
        name: '관리자',
        email: 'admin@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-0000-0000',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'admin').id,
        team_id: null,
        center_id: centers[0].id,
        join_date: '2024-01-01',
        status: 'active',
        nickname: 'Admin',
        // 새로 추가된 프로필 필드들
        gender: 'male',
        license: JSON.stringify({
          items: [
            {
              image_name: 'license1.png',
              image_url: '/img/license1.png',
              uploaded_at: '2024-01-01T09:00:00Z',
              licenseName: '체육지도사 2급',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2020-03-15',
            },
          ],
        }),
        experience: JSON.stringify({
          items: [
            {
              startDate: '2020-03-01',
              endDate: '2024-01-01',
              content: 'VitalFit - 총괄 매니저',
              status: '재직',
            },
            {
              startDate: '2018-06-01',
              endDate: '2020-02-28',
              content: 'ABC피트니스 - 매니저',
              status: '재직',
            },
          ],
        }),
        education: JSON.stringify({
          items: [
            {
              startDate: '2014-03-01',
              endDate: '2018-02-28',
              content: '서울대학교 체육교육과',
              status: '졸업',
            },
            {
              startDate: '2011-03-01',
              endDate: '2014-02-28',
              content: '서울체육고등학교',
              status: '졸업',
            },
          ],
        }),
        instagram: JSON.stringify({
          image_name: 'instagram.jpg',
          image_url: '/img/instagram.jpg',
          uploaded_at: '2024-01-01T09:00:00Z',
          accountName: 'vitalfit_admin',
          instagramLink: 'https://instagram.com/vitalfit_admin',
          description: 'VitalFit 공식 인스타그램',
        }),
        shift: JSON.stringify({
          schedules: [
            {
              days: ['월', '화', '수', '목', '금'],
              time: { start: '09:00', end: '18:00' },
            },
          ],
        }),
        account_number: '123-456789-01-234',
        account_bank: '신한',
        account_image_name: 'account.png',
        account_image_url: '/img/account.png',
      },

      // 강남센터 (13명) - 강남1팀(4명) + 강남2팀(3명) + 강남3팀(3명) + 강남4팀(3명)
      // 강남1팀 (4명)
      {
        name: '김민수',
        email: 'kim.gangnam1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1001-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[0].id, // 강남1팀
        center_id: centers[0].id,
        join_date: '2024-01-15',
        status: 'active',
        nickname: '김민수',
        // 새로 추가된 프로필 필드들
        gender: 'male',
        license: JSON.stringify({
          items: [
            {
              image_name: 'kim_license_1.jpg',
              image_url: '/img/kim_license_1.jpg',
              uploaded_at: '2024-01-15T10:00:00Z',
              licenseName: '개인트레이너 자격증',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2022-05-20',
            },
          ],
        }),
        experience: JSON.stringify({
          items: [
            {
              startDate: '2022-06-01',
              endDate: '2024-01-15',
              content: 'VitalFit 강남센터 - 팀장',
              status: '재직',
            },
            {
              startDate: '2020-03-01',
              endDate: '2022-05-31',
              content: 'XYZ헬스클럽 - 개인트레이너',
              status: '재직',
            },
          ],
        }),
        education: JSON.stringify({
          items: [
            {
              startDate: '2016-03-01',
              endDate: '2020-02-28',
              content: '경희대학교 체육학과',
              status: '졸업',
            },
          ],
        }),
        instagram: JSON.stringify({
          image_name: 'kim_instagram.jpg',
          image_url: '/img/kim_instagram.jpg',
          uploaded_at: '2024-01-15T10:00:00Z',
          accountName: 'minsoo_fitness',
          instagramLink: 'https://instagram.com/minsoo_fitness',
          description: '개인 맞춤형 피트니스 트레이닝',
        }),
        shift: JSON.stringify({
          schedules: [
            {
              days: ['월', '화', '수', '목', '금'],
              time: { start: '07:00', end: '16:00' },
            },
            {
              days: ['토'],
              time: { start: '09:00', end: '15:00' },
            },
          ],
        }),
        account_number: '110-123456-01-001',
        account_bank: '국민은행',
        account_image_name: 'kim_account.jpg',
        account_image_url: '/img/kim_account.jpg',
      },
      {
        name: '이영희',
        email: 'lee.gangnam1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1001-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[0].id,
        center_id: centers[0].id,
        join_date: '2024-02-01',
        status: 'active',
        nickname: '이영희',
        // 새로 추가된 프로필 필드들
        gender: 'female',
        license: JSON.stringify({
          items: [
            {
              image_name: 'license1.png',
              image_url: '/img/license1.png',
              uploaded_at: '2024-02-01T11:00:00Z',
              licenseName: '개인트레이너 자격증',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2023-03-15',
            },
          ],
        }),
        experience: JSON.stringify({
          items: [
            {
              startDate: '2023-04-01',
              endDate: '2024-02-01',
              content: 'VitalFit 강남센터 - 개인트레이너',
              status: '재직',
            },
            {
              startDate: '2022-01-01',
              endDate: '2023-03-31',
              content: 'ABC필라테스 - 보조강사',
              status: '재직',
            },
          ],
        }),
        education: JSON.stringify({
          items: [
            {
              startDate: '2017-03-01',
              endDate: '2021-02-28',
              content: '성신여자대학교 스포츠건강학과',
              status: '졸업',
            },
          ],
        }),
        instagram: JSON.stringify({
          image_name: 'instagram.jpg',
          image_url: '/img/instagram.jpg',
          uploaded_at: '2024-02-01T11:00:00Z',
          accountName: 'younghee_pilates',
          instagramLink: 'https://instagram.com/younghee_pilates',
          description: '필라테스 & 개인트레이닝',
        }),
        shift: JSON.stringify({
          schedules: [
            {
              days: ['월', '화', '수', '목', '금'],
              time: { start: '10:00', end: '19:00' },
            },
            {
              days: ['토'],
              time: { start: '10:00', end: '16:00' },
            },
          ],
        }),
        account_number: '110-123456-01-002',
        account_bank: '국민은행',
        account_image_name: 'account.png',
        account_image_url: '/img/account.png',
      },
      {
        name: '박철수',
        email: 'park.gangnam1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1001-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[0].id,
        center_id: centers[0].id,
        join_date: '2024-02-15',
        status: 'active',
        nickname: '박철수',
      },
      {
        name: '최미영',
        email: 'choi.gangnam1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1001-0004',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[0].id,
        center_id: centers[0].id,
        join_date: '2024-03-01',
        status: 'active',
        nickname: '최미영',
      },

      // 강남2팀 (3명)
      {
        name: '정준호',
        email: 'jung.gangnam2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1002-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[1].id, // 강남2팀
        center_id: centers[0].id,
        join_date: '2024-01-20',
        status: 'active',
        nickname: '정준호',
      },
      {
        name: '한지영',
        email: 'han.gangnam2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1002-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[1].id,
        center_id: centers[0].id,
        join_date: '2024-02-05',
        status: 'active',
        nickname: '한지영',
      },
      {
        name: '오상우',
        email: 'oh.gangnam2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1002-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[1].id,
        center_id: centers[0].id,
        join_date: '2024-02-20',
        status: 'active',
        nickname: '오상우',
      },

      // 강남3팀 (3명)
      {
        name: '강수진',
        email: 'kang.gangnam3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1003-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[2].id, // 강남3팀
        center_id: centers[0].id,
        join_date: '2024-01-25',
        status: 'active',
        nickname: '강수진',
      },
      {
        name: '윤현우',
        email: 'yoon.gangnam3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1003-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[2].id,
        center_id: centers[0].id,
        join_date: '2024-02-10',
        status: 'active',
        nickname: '윤현우',
      },
      {
        name: '임예은',
        email: 'lim.gangnam3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1003-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[2].id,
        center_id: centers[0].id,
        join_date: '2024-02-25',
        status: 'active',
        nickname: '임예은',
      },

      // 강남4팀 (3명)
      {
        name: '장동훈',
        email: 'jang.gangnam4@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1004-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[3].id, // 강남4팀
        center_id: centers[0].id,
        join_date: '2024-01-30',
        status: 'active',
        nickname: '장동훈',
      },
      {
        name: '전소영',
        email: 'jeon.gangnam4@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1004-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[3].id,
        center_id: centers[0].id,
        join_date: '2024-03-05',
        status: 'active',
        nickname: '전소영',
      },
      {
        name: '조재혁',
        email: 'jo.gangnam4@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-1004-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[3].id,
        center_id: centers[0].id,
        join_date: '2024-03-10',
        status: 'active',
        nickname: '조재혁',
      },

      // 홍대센터 (9명) - 홍대1팀(3명) + 홍대2팀(3명) + 홍대3팀(3명)
      // 홍대1팀 (3명)
      {
        name: '홍유진',
        email: 'hong.hongdae1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2001-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[4].id, // 홍대1팀
        center_id: centers[1].id,
        join_date: '2024-01-15',
        status: 'active',
        nickname: '홍유진',
      },
      {
        name: '구태민',
        email: 'gu.hongdae1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2001-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[4].id,
        center_id: centers[1].id,
        join_date: '2024-02-01',
        status: 'active',
        nickname: '구태민',
      },
      {
        name: '권하늘',
        email: 'kwon.hongdae1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2001-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[4].id,
        center_id: centers[1].id,
        join_date: '2024-02-15',
        status: 'active',
        nickname: '권하늘',
      },

      // 홍대2팀 (3명)
      {
        name: '김은호',
        email: 'kim.hongdae2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2002-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[5].id, // 홍대2팀
        center_id: centers[1].id,
        join_date: '2024-01-20',
        status: 'active',
        nickname: '김은호',
      },
      {
        name: '나다은',
        email: 'na.hongdae2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2002-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[5].id,
        center_id: centers[1].id,
        join_date: '2024-02-05',
        status: 'active',
        nickname: '나다은',
      },
      {
        name: '남성민',
        email: 'nam.hongdae2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2002-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[5].id,
        center_id: centers[1].id,
        join_date: '2024-02-20',
        status: 'active',
        nickname: '남성민',
      },

      // 홍대3팀 (3명)
      {
        name: '노서연',
        email: 'no.hongdae3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2003-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[6].id, // 홍대3팀
        center_id: centers[1].id,
        join_date: '2024-01-25',
        status: 'active',
        nickname: '노서연',
      },
      {
        name: '류민수',
        email: 'ryu.hongdae3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2003-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[6].id,
        center_id: centers[1].id,
        join_date: '2024-02-10',
        status: 'active',
        nickname: '류민수',
      },
      {
        name: '문영희',
        email: 'moon.hongdae3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-2003-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[6].id,
        center_id: centers[1].id,
        join_date: '2024-02-25',
        status: 'active',
        nickname: '문영희',
      },

      // 신림센터 (7명) - 신림1팀(3명) + 신림2팀(2명) + 신림3팀(2명)
      // 신림1팀 (3명)
      {
        name: '민철수',
        email: 'min.sillim1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3001-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[7].id, // 신림1팀
        center_id: centers[2].id,
        join_date: '2024-01-15',
        status: 'active',
        nickname: '민철수',
      },
      {
        name: '박미영',
        email: 'park.sillim1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3001-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[7].id,
        center_id: centers[2].id,
        join_date: '2024-02-01',
        status: 'active',
        nickname: '박미영',
      },
      {
        name: '배준호',
        email: 'bae.sillim1@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3001-0003',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[7].id,
        center_id: centers[2].id,
        join_date: '2024-02-15',
        status: 'active',
        nickname: '배준호',
      },

      // 신림2팀 (2명)
      {
        name: '백지영',
        email: 'baek.sillim2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3002-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[8].id, // 신림2팀
        center_id: centers[2].id,
        join_date: '2024-01-20',
        status: 'active',
        nickname: '백지영',
      },
      {
        name: '변상우',
        email: 'byun.sillim2@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3002-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[8].id,
        center_id: centers[2].id,
        join_date: '2024-02-05',
        status: 'active',
        nickname: '변상우',
      },

      // 신림3팀 (2명)
      {
        name: '서수진',
        email: 'seo.sillim3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3003-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[9].id, // 신림3팀
        center_id: centers[2].id,
        join_date: '2024-01-25',
        status: 'active',
        nickname: '서수진',
      },
      {
        name: '손현우',
        email: 'son.sillim3@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-3003-0002',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[9].id,
        center_id: centers[2].id,
        join_date: '2024-02-10',
        status: 'active',
        nickname: '손현우',
      },

      // 센터장들
      {
        name: '김예은',
        email: 'gangnam.center@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-9001-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'center_manager').id,
        team_id: null,
        center_id: centers[0].id, // 강남센터
        join_date: '2024-01-01',
        status: 'active',
        nickname: '김예은',
      },
      {
        name: '이동훈',
        email: 'hongdae.center@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-9002-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'center_manager').id,
        team_id: null,
        center_id: centers[1].id, // 홍대센터
        join_date: '2024-01-01',
        status: 'active',
        nickname: '이동훈',
      },
      {
        name: '박소영',
        email: 'sillim.center@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-9003-0001',
        phone_verified: true,
        position_id: positions.find(p => p.code === 'center_manager').id,
        team_id: null,
        center_id: centers[2].id, // 신림센터
        join_date: '2024-01-01',
        status: 'active',
        nickname: '박소영',
      },

      // 회계팀
      {
        name: '최재혁',
        email: 'finance.manager@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-9999-0001',
        phone_verified: true,
        position_id:
          positions.find(p => p.code === 'finance_team')?.id ||
          positions.find(p => p.code === 'admin')?.id,
        team_id: null,
        center_id: centers[0].id, // 임시로 강남센터에 할당
        join_date: '2024-01-01',
        status: 'active',
        nickname: '최재혁',
      },
      {
        name: '정유진',
        email: 'finance.staff@vitalfit.co.kr',
        password: await bcrypt.hash('password123', 10),
        phone: '010-9999-0002',
        phone_verified: true,
        position_id:
          positions.find(p => p.code === 'finance_team')?.id ||
          positions.find(p => p.code === 'admin')?.id,
        team_id: null,
        center_id: centers[0].id, // 임시로 강남센터에 할당
        join_date: '2024-01-15',
        status: 'active',
        nickname: '정유진',
      },
    ];

    // 각 사용자를 개별적으로 생성
    const users = [];
    for (const userInfo of userData) {
      const user = await User.create(userInfo);
      users.push(user);
    }

    console.log(`✅ 사용자 시드 데이터 생성 완료 (${users.length}명 사용자)`);
    return users;
  } catch (error) {
    console.error('❌ 사용자 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 회원 시드 데이터
const seedMembers = async (centers, users) => {
  try {
    console.log('👥 회원 시드 데이터 생성 중...');

    // 기존 회원 데이터 확인
    const existingMembers = await Member.findAll();
    if (existingMembers.length > 0) {
      console.log(`✅ 회원 데이터가 이미 존재합니다 (${existingMembers.length}명 회원)`);
      return existingMembers;
    }

    // 트레이너만 필터링 (관리자 제외)
    const trainers = users.filter(u => u.name !== '관리자');

    const memberData = [];
    const firstNames = [
      '김',
      '이',
      '박',
      '최',
      '정',
      '강',
      '조',
      '윤',
      '장',
      '임',
      '한',
      '오',
      '서',
      '신',
      '권',
      '황',
      '안',
      '송',
      '류',
      '전',
    ];
    const lastNames = [
      '민수',
      '영희',
      '철수',
      '미영',
      '준호',
      '지영',
      '상우',
      '수진',
      '현우',
      '예은',
      '동훈',
      '소영',
      '재혁',
      '유진',
      '태민',
      '하늘',
      '은호',
      '다은',
      '성민',
      '서연',
    ];
    const goals = [
      '근력 증가',
      '체중 감량',
      '체력 향상',
      '건강 관리',
      '바디프로필',
      '재활 훈련',
      '다이어트',
      '근육량 증가',
    ];

    let memberIndex = 1;

    trainers.forEach((trainer, trainerIndex) => {
      // 트레이너별 회원 수 결정
      let memberCount;
      if (trainerIndex < Math.floor(trainers.length * 0.8)) {
        // 80%는 10-12명
        memberCount = 10 + Math.floor(Math.random() * 3); // 10, 11, 12
      } else {
        // 20%는 5-9명 또는 13-15명
        memberCount =
          Math.random() < 0.5
            ? 5 + Math.floor(Math.random() * 5) // 5-9명
            : 13 + Math.floor(Math.random() * 3); // 13-15명
      }

      // 각 트레이너별로 회원 생성
      for (let i = 0; i < memberCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = firstName + lastName;

        memberData.push({
          name: name,
          phone: `010-${String(memberIndex).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          center_id: trainer.center_id,
          trainer_id: trainer.id,
          join_date: `2024-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`, // 1-6월
          expire_date: null, // 추후 결제 시 설정
          total_sessions: 0, // 초기값
          used_sessions: 0, // 초기값
          free_sessions: 0, // 초기값
          status: Math.random() < 0.9 ? 'active' : 'inactive', // 90% 활성
          memo: goals[Math.floor(Math.random() * goals.length)], // 목표를 메모에 저장
        });

        memberIndex++;
      }
    });

    const members = await Member.bulkCreate(memberData);

    console.log(`✅ 회원 시드 데이터 생성 완료 (${members.length}명 회원)`);
    return members;
  } catch (error) {
    console.error('❌ 회원 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 결제 시드 데이터
const seedPayments = async (centers, users, members) => {
  try {
    console.log('💳 결제 시드 데이터 생성 중... (6월, 7월, 8월 결제, 트레이너별 700-1100만원)');

    // 기존 결제 데이터 확인
    const existingPayments = await Payment.findAll();
    if (existingPayments.length > 0) {
      console.log(`✅ 결제 데이터가 이미 존재합니다 (${existingPayments.length}건 결제)`);
      return existingPayments;
    }

    // 트레이너만 필터링 (관리자 제외)
    const trainers = users.filter(u => u.name !== '관리자');

    const paymentData = [];
    const paymentMethods = ['card', 'transfer', 'cash'];
    const sessionPackages = [
      { sessions: 8, amount: 800000, free: 0, name: 'PT 8회' },
      { sessions: 10, amount: 1000000, free: 1, name: 'PT 10+1회' },
      { sessions: 16, amount: 1500000, free: 2, name: 'PT 16+2회' },
      { sessions: 20, amount: 1800000, free: 2, name: 'PT 20+2회' },
      { sessions: 24, amount: 2100000, free: 3, name: 'PT 24+3회' },
      { sessions: 30, amount: 2500000, free: 4, name: 'PT 30+4회' },
    ];

    // 6월, 7월, 8월 데이터 생성
    const months = [
      { month: 6, days: 30 },
      { month: 7, days: 31 },
      { month: 8, days: 31 },
    ];

    months.forEach(({ month, days }) => {
      trainers.forEach(trainer => {
        // 각 트레이너별 회원 찾기
        const trainerMembers = members.filter(m => m.trainer_id === trainer.id);

        // 트레이너별 목표 매출 (700-1100만원)
        const targetRevenue = 7000000 + Math.floor(Math.random() * 4000000); // 700-1100만원
        let currentRevenue = 0;

        // 회원들에게 랜덤하게 결제 분배
        const usedMembers = [];

        while (currentRevenue < targetRevenue && usedMembers.length < trainerMembers.length) {
          // 아직 사용하지 않은 회원 중 랜덤 선택
          const availableMembers = trainerMembers.filter(m => !usedMembers.includes(m.id));
          if (availableMembers.length === 0) break;

          const selectedMember =
            availableMembers[Math.floor(Math.random() * availableMembers.length)];
          usedMembers.push(selectedMember.id);

          // 남은 목표 매출에 맞는 패키지 선택
          const remainingRevenue = targetRevenue - currentRevenue;
          const suitablePackages = sessionPackages.filter(
            pkg => pkg.amount <= remainingRevenue * 1.2
          ); // 20% 여유

          if (suitablePackages.length === 0) break;

          const selectedPackage =
            suitablePackages[Math.floor(Math.random() * suitablePackages.length)];

          // 해당 월 내 랜덤 날짜
          const day = Math.floor(Math.random() * days) + 1;
          const paymentDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          paymentData.push({
            member_id: selectedMember.id,
            trainer_id: trainer.id,
            center_id: trainer.center_id,
            payment_amount: selectedPackage.amount,
            session_count: selectedPackage.sessions,
            free_session_count: selectedPackage.free,
            payment_date: paymentDate,
            payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            notes: selectedPackage.name + ' 결제',
          });

          currentRevenue += selectedPackage.amount;
        }

        // 목표 매출에 못 미치면 일부 회원에게 추가 결제
        while (currentRevenue < targetRevenue * 0.9 && usedMembers.length > 0) {
          const randomMemberId = usedMembers[Math.floor(Math.random() * usedMembers.length)];
          const selectedMember = trainerMembers.find(m => m.id === randomMemberId);

          const remainingRevenue = targetRevenue - currentRevenue;
          const suitablePackages = sessionPackages.filter(
            pkg => pkg.amount <= remainingRevenue * 1.2
          );

          if (suitablePackages.length === 0) break;

          const selectedPackage =
            suitablePackages[Math.floor(Math.random() * suitablePackages.length)];

          // 해당 월 내 다른 날짜
          const day = Math.floor(Math.random() * days) + 1;
          const paymentDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          paymentData.push({
            member_id: selectedMember.id,
            trainer_id: trainer.id,
            center_id: trainer.center_id,
            payment_amount: selectedPackage.amount,
            session_count: selectedPackage.sessions,
            free_session_count: selectedPackage.free,
            payment_date: paymentDate,
            payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            notes: selectedPackage.name + ' 추가결제',
          });

          currentRevenue += selectedPackage.amount;
        }
      });
    });

    const payments = await Payment.bulkCreate(paymentData);

    console.log(`✅ 결제 시드 데이터 생성 완료 (${payments.length}건 결제)`);
    return payments;
  } catch (error) {
    console.error('❌ 결제 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 커미션 비율 시드 데이터
const seedCommissionRates = async () => {
  try {
    console.log('📊 커미션 비율 시드 데이터 생성 중...');

    const commissionRates = await CommissionRate.bulkCreate([
      // === 기본 정책 (전체 지점, 전체 직급 적용) ===
      {
        min_revenue: 0,
        max_revenue: 3000000,
        commission_per_session: 6000,
        monthly_commission: 0,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 300만원 미만 구간',
      },
      {
        min_revenue: 3000000,
        max_revenue: 4000000,
        commission_per_session: 10000,
        monthly_commission: 0,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 300만원 이상 구간',
      },
      {
        min_revenue: 4000000,
        max_revenue: 5000000,
        commission_per_session: 11000,
        monthly_commission: 0,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 400만원 이상 구간',
      },
      {
        min_revenue: 5000000,
        max_revenue: 6000000,
        commission_per_session: 12000,
        monthly_commission: 0,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 500만원 이상 구간',
      },
      {
        min_revenue: 6000000,
        max_revenue: 7000000,
        commission_per_session: 13000,
        monthly_commission: 300000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 600만원 이상 구간',
      },
      {
        min_revenue: 7000000,
        max_revenue: 8000000,
        commission_per_session: 14000,
        monthly_commission: 400000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 700만원 이상 구간',
      },
      {
        min_revenue: 8000000,
        max_revenue: 9000000,
        commission_per_session: 15000,
        monthly_commission: 500000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 800만원 이상 구간',
      },
      {
        min_revenue: 9000000,
        max_revenue: 10000000,
        commission_per_session: 20000,
        monthly_commission: 600000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 900만원 이상 구간',
      },
      {
        min_revenue: 10000000,
        max_revenue: null,
        commission_per_session: 21000,
        monthly_commission: 700000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 1000만원 이상 구간',
      },

      // === 팀장 특별 정책 (position_id=7) ===
      {
        min_revenue: 12000000,
        max_revenue: 15000000,
        commission_per_session: 25000,
        monthly_commission: 800000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: 7, // 팀장
        is_active: true,
        description: '팀장 특별 정책 - 1200만원 이상 구간',
      },
      {
        min_revenue: 15000000,
        max_revenue: null,
        commission_per_session: 27000,
        monthly_commission: 900000,
        effective_date: '2024-01-01',
        center_id: null,
        position_id: 7, // 팀장
        is_active: true,
        description: '팀장 특별 정책 - 1500만원 이상 구간',
      },
    ]);

    console.log(`✅ 커미션 비율 시드 데이터 생성 완료 (${commissionRates.length}개 구간)`);
    return commissionRates;
  } catch (error) {
    console.error('❌ 커미션 비율 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 보너스 규칙 시드 데이터
const seedBonusRules = async () => {
  try {
    console.log('📊 보너스 규칙 시드 데이터 생성 중...');

    const bonusRules = await BonusRule.bulkCreate([
      {
        name: '일 300만 달성',
        target_type: 'daily',
        threshold_amount: 3000000,
        achievement_count: 1,
        bonus_amount: 100000,
        before_11days: 'N',
      },
      {
        name: '주 500만 1회 달성',
        target_type: 'weekly',
        threshold_amount: 5000000,
        achievement_count: 1,
        bonus_amount: 200000,
        before_11days: 'N',
      },
      {
        name: '주 500만 2회 달성',
        target_type: 'weekly',
        threshold_amount: 5000000,
        achievement_count: 2,
        bonus_amount: 300000,
        before_11days: 'N',
      },
      {
        name: '주 500만 2회 달성 (11일 이전)',
        target_type: 'weekly',
        threshold_amount: 5000000,
        achievement_count: 2,
        bonus_amount: 500000,
        before_11days: 'Y',
      },
      {
        name: '주 600만 1회 달성',
        target_type: 'weekly',
        threshold_amount: 6000000,
        achievement_count: 1,
        bonus_amount: 250000,
        before_11days: 'N',
      },
      {
        name: '주 600만 2회 달성',
        target_type: 'weekly',
        threshold_amount: 6000000,
        achievement_count: 2,
        bonus_amount: 400000,
        before_11days: 'N',
      },
      {
        name: '주 600만 2회 달성 (11일 이전)',
        target_type: 'weekly',
        threshold_amount: 6000000,
        achievement_count: 2,
        bonus_amount: 600000,
        before_11days: 'Y',
      },
    ]);

    console.log(`✅ 보너스 규칙 시드 데이터 생성 완료 (${bonusRules.length}개 규칙)`);
    return bonusRules;
  } catch (error) {
    console.error('❌ 보너스 규칙 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 공지사항 시드 데이터
const seedNotices = async users => {
  try {
    console.log('📊 공지사항 시드 데이터 생성 중...');

    const notices = await Notice.bulkCreate([
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '📢 2024년 하반기 운영 방침 안내',
        content:
          '2024년 하반기 운영 방침이 변경되었습니다. 새로운 정책에 대한 자세한 내용은 첨부파일을 참조해주세요. 모든 직원은 필독하시기 바랍니다.',
        is_important: true,
        pin_until: '2024-12-31',
        view_count: 28,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '🎯 7월 매출 목표 및 인센티브 안내',
        content:
          '7월 매출 목표는 전체 2억원입니다. 목표 달성 시 팀별 인센티브가 지급됩니다. 각 센터별 세부 목표는 센터장님을 통해 전달드립니다.',
        is_important: true,
        pin_until: '2024-07-31',
        view_count: 45,
      },
      {
        sender_id: users.find(u => u.name === '김민수').id,
        title: '💪 강남1팀 7월 팀 미팅 안내',
        content:
          '강남1팀 7월 정기 팀 미팅을 다음과 같이 진행합니다.\n일시: 7월 15일(월) 오후 7시\n장소: 강남센터 세미나실\n주요 안건: 7월 목표 점검, 신규 프로그램 논의',
        is_important: false,
        view_count: 8,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '🏥 건강검진 일정 안내',
        content:
          '전 직원 대상 건강검진을 실시합니다.\n일정: 7월 20일 ~ 8월 10일\n장소: 강남세브란스병원\n예약은 각자 진행 후 결과 제출 바랍니다.',
        is_important: true,
        pin_until: '2024-08-10',
        view_count: 22,
      },
      {
        sender_id: users.find(u => u.name === '홍유진').id,
        title: '🎉 홍대센터 신규 장비 도입 완료',
        content:
          '홍대센터에 최신 스미스머신과 케이블크로스오버가 설치되었습니다. 사용법 교육은 7월 중 진행예정이며, 회원들에게 적극 홍보해주세요.',
        is_important: false,
        view_count: 15,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '📚 트레이너 역량강화 교육 실시',
        content:
          '모든 트레이너를 대상으로 역량강화 교육을 실시합니다.\n주제: 최신 운동생리학 트렌드\n일시: 8월 5일(월) 오후 2시\n강사: 스포츠의학 전문의\n참석 필수입니다.',
        is_important: true,
        pin_until: '2024-08-05',
        view_count: 31,
      },
      {
        sender_id: users.find(u => u.name === '민철수').id,
        title: '🌟 신림센터 회원 만족도 조사 결과',
        content:
          '6월 실시한 회원 만족도 조사 결과를 공유합니다. 전체 만족도 4.2/5점으로 우수한 결과를 보였습니다. 개선 사항도 함께 검토하겠습니다.',
        is_important: false,
        view_count: 12,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '🚨 하계휴가 신청 마감 임박',
        content:
          '하계휴가 신청 마감이 7월 25일입니다. 아직 신청하지 않으신 분들은 서둘러 신청해주세요. 휴가 중 업무 인수인계도 미리 준비하시기 바랍니다.',
        is_important: true,
        pin_until: '2024-07-25',
        view_count: 37,
      },
      {
        sender_id: users.find(u => u.name === '정준호').id,
        title: '📱 새로운 PT 예약 시스템 도입',
        content:
          '8월부터 새로운 PT 예약 시스템이 도입됩니다. 기존 시스템보다 편리하고 직관적입니다. 사전 교육은 7월 30일에 진행됩니다.',
        is_important: false,
        view_count: 19,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '🎊 우수 트레이너 시상식 안내',
        content:
          '2024년 상반기 우수 트레이너 시상식을 개최합니다.\n일시: 8월 15일(목) 오후 6시\n장소: 강남센터 대회의실\n수상자는 개별 연락드립니다.',
        is_important: true,
        pin_until: '2024-08-15',
        view_count: 42,
      },
    ]);

    console.log(`✅ 공지사항 시드 데이터 생성 완료 (${notices.length}개 공지)`);
    return notices;
  } catch (error) {
    console.error('❌ 공지사항 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 공지 대상 센터 시드 데이터
const seedNoticeTargetCenters = async (notices, centers) => {
  try {
    console.log('📊 공지 대상 센터 시드 데이터 생성 중...');

    const noticeTargetCenters = await NoticeTargetCenter.bulkCreate([
      // 신규 직원 환영 공지 - 모든 센터
      { notice_id: notices[0].id, center_id: centers[0].id },
      { notice_id: notices[0].id, center_id: centers[1].id },
      { notice_id: notices[0].id, center_id: centers[2].id },

      // 12월 매출 목표 안내 - 강남센터만
      { notice_id: notices[1].id, center_id: centers[0].id },

      // 팀 회의 일정 안내 - 강남센터만
      { notice_id: notices[2].id, center_id: centers[0].id },

      // 연말 보너스 지급 안내 - 모든 센터
      { notice_id: notices[3].id, center_id: centers[0].id },
      { notice_id: notices[3].id, center_id: centers[1].id },
      { notice_id: notices[3].id, center_id: centers[2].id },
    ]);

    console.log(`✅ 공지 대상 센터 시드 데이터 생성 완료 (${noticeTargetCenters.length}개)`);
    return noticeTargetCenters;
  } catch (error) {
    console.error('❌ 공지 대상 센터 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 공지 대상 역할 시드 데이터
const seedNoticeTargetRoles = async notices => {
  try {
    console.log('📊 공지 대상 역할 시드 데이터 생성 중...');

    const noticeTargetRoles = await NoticeTargetRole.bulkCreate([
      // 신규 직원 환영 공지 - 모든 직책
      { notice_id: notices[0].id, role_code: 'team_member' },
      { notice_id: notices[0].id, role_code: 'team_leader' },
      { notice_id: notices[0].id, role_code: 'center_manager' },

      // 12월 매출 목표 안내 - 팀장과 센터장
      { notice_id: notices[1].id, role_code: 'team_leader' },
      { notice_id: notices[1].id, role_code: 'center_manager' },

      // 팀 회의 일정 안내 - 팀원과 팀장
      { notice_id: notices[2].id, role_code: 'team_member' },
      { notice_id: notices[2].id, role_code: 'team_leader' },

      // 연말 보너스 지급 안내 - 모든 직책
      { notice_id: notices[3].id, role_code: 'team_member' },
      { notice_id: notices[3].id, role_code: 'team_leader' },
      { notice_id: notices[3].id, role_code: 'center_manager' },
    ]);

    console.log(`✅ 공지 대상 역할 시드 데이터 생성 완료 (${noticeTargetRoles.length}개)`);
    return noticeTargetRoles;
  } catch (error) {
    console.error('❌ 공지 대상 역할 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// PT 세션 시드 데이터
const seedPTSessions = async (centers, users, members) => {
  try {
    // 기존 PT 세션 데이터 확인
    const existingPTSessions = await PTSession.findAll();
    if (existingPTSessions.length > 0) {
      console.log(`✅ PT 세션 데이터가 이미 존재합니다 (${existingPTSessions.length}건 세션)`);
      return existingPTSessions;
    }

    // 동적으로 PT 세션 생성 (각 회원별 0~12개까지 다양하게)
    const ptSessionData = [];

    // 6월, 7월, 8월 데이터 생성
    const months = [
      { month: 6, days: 30 },
      { month: 7, days: 31 },
      { month: 8, days: 31 },
    ];

    months.forEach(({ month, days }) => {
      members.forEach(member => {
        // 회원별 PT 세션 수 (0~12개 랜덤)
        const sessionCount = Math.floor(Math.random() * 13); // 0~12

        for (let i = 0; i < sessionCount; i++) {
          // 해당 월 내 랜덤 날짜
          const day = Math.floor(Math.random() * days) + 1;
          const sessionDate = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          // 랜덤 시간 (9시~21시)
          const startHour = 9 + Math.floor(Math.random() * 12);
          const startTime = `${String(startHour).padStart(2, '0')}:00:00`;
          const endTime = `${String(startHour + 1).padStart(2, '0')}:00:00`;

          ptSessionData.push({
            member_id: member.id,
            trainer_id: member.trainer_id, // 회원의 담당 트레이너
            center_id: member.center_id, // 회원의 소속 센터
            session_date: sessionDate,
            start_time: startTime,
            end_time: endTime,
            session_type: Math.random() < 0.9 ? 'regular' : 'free', // 90% regular, 10% free
            notes: `PT 세션 ${i + 1}회차`,
            idempotency_key: `pt_session_${member.id}_${month}_${i + 1}`,
          });
        }
      });
    });

    const ptSessions = await PTSession.bulkCreate(ptSessionData);

    console.log(`✅ PT 세션 시드 데이터 생성 완료 (${ptSessions.length}건 세션)`);
    return ptSessions;
  } catch (error) {
    console.error('❌ PT 세션 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 모든 시드 데이터 실행
const seedAllData = async () => {
  try {
    console.log('🌱 시드 데이터 생성을 시작합니다...');

    // 순서대로 시드 데이터 생성 (외래키 의존성 고려)
    const centers = await seedCenters();
    const positions = await seedPositions();
    const commissionRates = await seedCommissionRates();
    const bonusRules = await seedBonusRules();
    const teams = await seedTeams(centers);
    const users = await seedUsers(centers, teams, positions);
    const members = await seedMembers(centers, users);
    const payments = await seedPayments(centers, users, members);
    const ptSessions = await seedPTSessions(centers, users, members);
    const notices = await seedNotices(users);
    const noticeTargetCenters = await seedNoticeTargetCenters(notices, centers);
    const noticeTargetRoles = await seedNoticeTargetRoles(notices);

    console.log('모든 시드 데이터 생성이 완료되었습니다!');
    console.log(`생성된 데이터:
    - 센터: ${centers.length}개
    - 직급: ${positions.length}개 Position
    - 커미션 비율: ${commissionRates.length}개 구간
    - 보너스 규칙: ${bonusRules.length}개 규칙
    - 팀: ${teams.length}개  
    - 사용자: ${users.length}명
    - 회원: ${members.length}명
    - 결제: ${payments.length}건
    - PT 세션: ${ptSessions.length}건
    - 공지사항: ${notices.length}개
    - 공지 대상 센터: ${noticeTargetCenters.length}개
    - 공지 대상 역할: ${noticeTargetRoles.length}개`);
  } catch (error) {
    console.error('시드 데이터 생성 중 오류 발생:', error);
    throw error;
  }
};

module.exports = {
  seedAllData,
  seedCenters,
  seedPositions,
  seedCommissionRates,
  seedBonusRules,
  seedTeams,
  seedUsers,
  seedMembers,
  seedPayments,
  seedPTSessions,
  seedNotices,
  seedNoticeTargetCenters,
  seedNoticeTargetRoles,
};
