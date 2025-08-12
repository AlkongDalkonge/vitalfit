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
    const centers = await Center.bulkCreate([
      {
        name: '바이탈핏 강남센터',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'gangnam@vitalfit.co.kr',
        kakao_id: 'vitalfit_gangnam',
        instagram: 'vitalfit_gangnam',
        store_image_name: 'gangnam_store.jpg',
        store_image_url: '/uploads/stores/gangnam_store.jpg',
        business_hours: '06:00 - 22:00',
        is_active: true,
      },
      {
        name: '바이탈핏 홍대센터',
        address: '서울시 마포구 홍익로 456',
        phone: '02-2345-6789',
        email: 'hongdae@vitalfit.co.kr',
        kakao_id: 'vitalfit_hongdae',
        instagram: 'vitalfit_hongdae',
        store_image_name: 'hongdae_store.jpg',
        store_image_url: '/uploads/stores/hongdae_store.jpg',
        business_hours: '06:00 - 22:00',
        is_active: true,
      },
      {
        name: '바이탈핏 신림센터',
        address: '서울시 관악구 신림동 789',
        phone: '02-3456-7890',
        email: 'sillim@vitalfit.co.kr',
        kakao_id: 'vitalfit_sillim',
        instagram: 'vitalfit_sillim',
        store_image_name: 'sillim_store.jpg',
        store_image_url: '/uploads/stores/sillim_store.jpg',
        business_hours: '06:00 - 22:00',
        is_active: true,
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
      {
        name: '팀A',
        center_id: centers[0].id, // 강남센터
        leader_id: null, // 추후 User 생성 후 업데이트
      },
      {
        name: '팀B',
        center_id: centers[0].id, // 강남센터
        leader_id: null,
      },
      {
        name: '팀A',
        center_id: centers[1].id, // 홍대센터
        leader_id: null,
      },
      {
        name: '팀B',
        center_id: centers[1].id, // 홍대센터
        leader_id: null,
      },
      {
        name: '팀A',
        center_id: centers[2].id, // 신림센터
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
    const users = await User.bulkCreate([
      {
        name: '관리자',
        email: 'admin@vitalfit.co.kr',
        password: '$2b$10$hashedpassword', // 실제로는 해시된 비밀번호
        phone: '010-0000-0000',
        phone_verified: true,
        gender: 'male',
        position_id: positions.find(p => p.code === 'admin').id,
        team_id: null,
        center_id: centers[0].id,
        join_date: '2024-01-01',
        status: 'active',
        nickname: 'Admin',
      },
      {
        name: '김센터장',
        email: 'kim.center@vitalfit.co.kr',
        password: '$2b$10$hashedpassword',
        phone: '010-1111-1111',
        phone_verified: true,
        gender: 'female',
        position_id: positions.find(p => p.code === 'center_manager').id,
        team_id: null,
        center_id: centers[0].id,
        join_date: '2024-01-01',
        status: 'active',
        nickname: '김센터장',
      },
      {
        name: '이팀장',
        email: 'lee.team@vitalfit.co.kr',
        password: '$2b$10$hashedpassword',
        phone: '010-2222-2222',
        phone_verified: true,
        gender: 'male',
        position_id: positions.find(p => p.code === 'team_leader').id,
        team_id: teams[0].id,
        center_id: centers[0].id,
        join_date: '2024-01-15',
        status: 'active',
        nickname: '이팀장',
      },
      {
        name: '박트레이너',
        email: 'park.trainer@vitalfit.co.kr',
        password: '$2b$10$hashedpassword',
        phone: '010-3333-3333',
        phone_verified: true,
        gender: 'male',
        position_id: positions.find(p => p.code === 'trainer').id,
        team_id: teams[0].id,
        center_id: centers[0].id,
        join_date: '2024-02-01',
        status: 'active',
        nickname: '박트레이너',
      },
      {
        name: '최시니어',
        email: 'choi.senior@vitalfit.co.kr',
        password: '$2b$10$hashedpassword',
        phone: '010-4444-4444',
        phone_verified: true,
        gender: 'female',
        position_id: positions.find(p => p.code === 'senior').id,
        team_id: teams[1].id,
        center_id: centers[0].id,
        join_date: '2024-01-10',
        status: 'active',
        nickname: '최시니어',
      },
    ]);

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
    const members = await Member.bulkCreate([
      {
        name: '홍길동',
        email: 'hong@example.com',
        phone: '010-5555-5555',
        phone_verified: true,
        birth_date: '1990-01-01',
        gender: 'male',
        center_id: centers[0].id,
        trainer_id: users.find(u => u.name === '박트레이너').id,
        join_date: '2024-03-01',
        status: 'active',
        emergency_contact: '010-6666-6666',
        address: '서울시 강남구',
        medical_history: '없음',
        goals: '근력 증가',
      },
      {
        name: '김영희',
        email: 'kim@example.com',
        phone: '010-7777-7777',
        phone_verified: true,
        birth_date: '1985-05-15',
        gender: 'female',
        center_id: centers[0].id,
        trainer_id: users.find(u => u.name === '최시니어').id,
        join_date: '2024-03-15',
        status: 'active',
        emergency_contact: '010-8888-8888',
        address: '서울시 서초구',
        medical_history: '없음',
        goals: '체중 감량',
      },
    ]);

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
    const payments = await Payment.bulkCreate([
      {
        member_id: members[0].id,
        trainer_id: users.find(u => u.name === '박트레이너').id,
        center_id: centers[0].id,
        product_name: 'PT 10회',
        sessions: 10,
        amount: 1000000,
        payment_date: '2024-03-01',
        payment_method: 'card',
        status: 'completed',
      },
      {
        member_id: members[1].id,
        trainer_id: users.find(u => u.name === '최시니어').id,
        center_id: centers[0].id,
        product_name: 'PT 20회',
        sessions: 20,
        amount: 1800000,
        payment_date: '2024-03-15',
        payment_method: 'transfer',
        status: 'completed',
      },
    ]);

    console.log(`✅ 결제 시드 데이터 생성 완료 (${payments.length}건 결제)`);
    return payments;
  } catch (error) {
    console.error('❌ 결제 시드 데이터 생성 실패:', error);
    throw error;
  }
};

// 커미션 비율 시드 데이터
const seedCommissionRates = async (centers, positions) => {
  try {
    console.log('📊 커미션 비율 시드 데이터 생성 중...');

    const commissionRates = await CommissionRate.bulkCreate([
      // === 기본 정책 (전체 지점, 전체 직급 적용) ===
      {
        min_revenue: 3000000,
        max_revenue: 4000000,
        commission_per_session: 10000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 300만~400만원 구간',
      },
      {
        min_revenue: 4000000,
        max_revenue: 5000000,
        commission_per_session: 11000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 400만~500만원 구간',
      },
      {
        min_revenue: 5000000,
        max_revenue: 6000000,
        commission_per_session: 12000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 500만~600만원 구간',
      },
      {
        min_revenue: 6000000,
        max_revenue: 7000000,
        commission_per_session: 13000,
        monthly_commission: 300000,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 600만~700만원 구간 (월 커미션 시작)',
      },
      {
        min_revenue: 7000000,
        max_revenue: 8000000,
        commission_per_session: 14000,
        monthly_commission: 400000,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 700만~800만원 구간',
      },
      {
        min_revenue: 8000000,
        max_revenue: 9000000,
        commission_per_session: 15000,
        monthly_commission: 500000,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 800만~900만원 구간',
      },
      {
        min_revenue: 9000000,
        max_revenue: 10000000,
        commission_per_session: 20000,
        monthly_commission: 600000,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 900만~1000만원 구간',
      },
      {
        min_revenue: 10000000,
        max_revenue: null,
        commission_per_session: 21000,
        monthly_commission: 700000,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: null,
        is_active: true,
        description: '기본 정책 - 1000만원 이상 구간',
      },

      // === 강남센터 특별 정책 ===
      {
        min_revenue: 8000000,
        max_revenue: 9000000,
        commission_per_session: 16000,
        monthly_commission: 550000,
        effective_date: '2024-06-01',
        center_id: centers.find(c => c.name.includes('강남센터'))?.id,
        position_id: null,
        is_active: true,
        description: '강남센터 특별 정책 - 800만~900만원 구간 (기본보다 +1000원)',
      },
      {
        min_revenue: 9000000,
        max_revenue: null,
        commission_per_session: 22000,
        monthly_commission: 750000,
        effective_date: '2024-06-01',
        center_id: centers.find(c => c.name.includes('강남센터'))?.id,
        position_id: null,
        is_active: true,
        description: '강남센터 특별 정책 - 900만원 이상 구간 (기본보다 +1000원)',
      },

      // === 시니어 이상 직급 특별 정책 ===
      {
        min_revenue: 5000000,
        max_revenue: 6000000,
        commission_per_session: 6000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: positions.find(p => p.code === 'senior').id,
        is_active: true,
        description: '시니어 직급 특별 정책 - 팀원 관리 업무로 인한 개인 매출 감소 보상',
      },
      {
        min_revenue: 5000000,
        max_revenue: 6000000,
        commission_per_session: 6000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: positions.find(p => p.code === 'team_leader').id,
        is_active: true,
        description: '팀장 직급 특별 정책 - 팀원 관리 업무로 인한 개인 매출 감소 보상',
      },

      // === 연습생/교육생 특별 정책 (낮은 커미션) ===
      {
        min_revenue: 3000000,
        max_revenue: 5000000,
        commission_per_session: 8000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: positions.find(p => p.code === 'trainee').id,
        is_active: true,
        description: '연습생 특별 정책 - 교육 기간 중 낮은 커미션율 적용',
      },
      {
        min_revenue: 3000000,
        max_revenue: 5000000,
        commission_per_session: 9000,
        monthly_commission: 0,
        effective_date: '2024-06-01',
        center_id: null,
        position_id: positions.find(p => p.code === 'student').id,
        is_active: true,
        description: '교육생 특별 정책 - 교육 기간 중 낮은 커미션율 적용',
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

    // 기존 보너스 규칙 데이터 확인
    const existingBonusRules = await BonusRule.findAll();
    if (existingBonusRules.length > 0) {
      console.log(`✅ 보너스 규칙 데이터가 이미 존재합니다 (${existingBonusRules.length}개 규칙)`);
      return existingBonusRules;
    }

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
        title: '신규 직원 환영 공지',
        content: '새로 입사하신 직원분들을 환영합니다. 교육 일정은 추후 안내드리겠습니다.',
        is_important: true,
        pin_until: '2024-12-31',
        view_count: 0,
      },
      {
        sender_id: users.find(u => u.name === '김센터장').id,
        title: '12월 매출 목표 안내',
        content: '12월 매출 목표는 센터별로 다음과 같습니다. 목표 달성을 위해 노력해주세요.',
        is_important: true,
        pin_until: '2024-12-25',
        view_count: 5,
      },
      {
        sender_id: users.find(u => u.name === '이팀장').id,
        title: '팀 회의 일정 안내',
        content: '이번 주 팀 회의는 금요일 오후 6시에 진행됩니다.',
        is_important: false,
        view_count: 3,
      },
      {
        sender_id: users.find(u => u.name === '관리자').id,
        title: '연말 보너스 지급 안내',
        content: '연말 보너스 지급 기준과 일정에 대해 안내드립니다.',
        is_important: true,
        pin_until: '2024-12-30',
        view_count: 12,
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
const seedPTSessions = async (centers, users, members, payments) => {
  try {
    const ptSessions = await PTSession.bulkCreate([
      {
        member_id: members[0].id,
        trainer_id: users.find(u => u.name === '박트레이너').id,
        payment_id: payments[0].id,
        center_id: centers[0].id,
        session_date: '2024-03-02',
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'completed',
        trainer_notes: '첫 PT 세션, 기본 동작 교육',
        member_feedback: '만족',
        rating: 5,
      },
      {
        member_id: members[1].id,
        trainer_id: users.find(u => u.name === '최시니어').id,
        payment_id: payments[1].id,
        center_id: centers[0].id,
        session_date: '2024-03-16',
        start_time: '14:00:00',
        end_time: '15:00:00',
        status: 'completed',
        trainer_notes: '유산소 운동 위주',
        member_feedback: '좋음',
        rating: 4,
      },
    ]);

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

    // 커미션 비율과 보너스 규칙은 선택적으로 실행
    let commissionRates = [];
    let bonusRules = [];

    try {
      commissionRates = await seedCommissionRates(centers, positions);
    } catch (error) {
      console.log('⚠️ 커미션 비율 시드데이터 건너뜀:', error.message);
    }

    try {
      bonusRules = await seedBonusRules();
    } catch (error) {
      console.log('⚠️ 보너스 규칙 시드데이터 건너뜀:', error.message);
    }

    const teams = await seedTeams(centers);
    const users = await seedUsers(centers, teams, positions);
    const members = await seedMembers(centers, users);
    const payments = await seedPayments(centers, users, members);
    const ptSessions = await seedPTSessions(centers, users, members, payments);
    const notices = await seedNotices(users);
    const noticeTargetCenters = await seedNoticeTargetCenters(notices, centers);
    const noticeTargetRoles = await seedNoticeTargetRoles(notices);

    console.log('🎉 모든 시드 데이터 생성이 완료되었습니다!');
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
    console.error('💥 시드 데이터 생성 중 오류 발생:', error);
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
