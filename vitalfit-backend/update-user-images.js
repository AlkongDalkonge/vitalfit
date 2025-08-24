const { User } = require('./src/models');
const bcrypt = require('bcrypt');

async function updateUserImages() {
  try {
    console.log('🔄 사용자 이미지 데이터 업데이트를 시작합니다...');

    // 1. admin 사용자 업데이트
    const adminUser = await User.findOne({
      where: { email: 'admin@vitalfit.co.kr' }
    });

    if (adminUser) {
      console.log('✅ admin 사용자를 찾았습니다. 이미지 데이터를 업데이트합니다...');
      
      await adminUser.update({
        license: JSON.stringify({
          items: [
            {
              image_name: 'admin_license_1.jpg',
              image_url: '/img/admin_license_1.jpg',
              uploaded_at: '2024-01-01T09:00:00Z',
              licenseName: '체육지도사 2급',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2020-03-15',
            },
            {
              image_name: 'admin_license_2.jpg',
              image_url: '/img/admin_license_2.jpg',
              uploaded_at: '2024-01-01T09:00:00Z',
              licenseName: '생활스포츠지도사 2급',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2019-06-20',
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
          image_name: 'admin_instagram.jpg',
          image_url: '/img/admin_instagram.jpg',
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
        account_image_name: 'admin_account.jpg',
        account_image_url: '/img/admin_account.jpg',
      });

      console.log('✅ admin 사용자 이미지 데이터 업데이트 완료');
    } else {
      console.log('❌ admin 사용자를 찾을 수 없습니다.');
    }

    // 2. 이영희 사용자 업데이트
    const leeUser = await User.findOne({
      where: { email: 'lee.gangnam1@vitalfit.co.kr' }
    });

    if (leeUser) {
      console.log('✅ 이영희 사용자를 찾았습니다. 이미지 데이터를 업데이트합니다...');
      
      await leeUser.update({
        license: JSON.stringify({
          items: [
            {
              image_name: 'lee_license_1.jpg',
              image_url: '/uploads/licenses/lee_license_1.jpg',
              uploaded_at: '2024-02-01T11:00:00Z',
              licenseName: '개인트레이너 자격증',
              issuingOrganization: '한국체육진흥원',
              issueDate: '2023-03-15',
            },
            {
              image_name: 'lee_license_2.jpg',
              image_url: '/uploads/licenses/lee_license_2.jpg',
              uploaded_at: '2024-02-01T11:00:00Z',
              licenseName: '필라테스 지도사 자격증',
              issuingOrganization: '한국필라테스협회',
              issueDate: '2022-11-20',
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
          image_name: 'lee_instagram.jpg',
          image_url: '/uploads/instagram/lee_instagram.jpg',
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
        account_image_name: 'lee_account.jpg',
        account_image_url: '/uploads/accounts/lee_account.jpg',
      });

      console.log('✅ 이영희 사용자 이미지 데이터 업데이트 완료');
    } else {
      console.log('❌ 이영희 사용자를 찾을 수 없습니다.');
    }

    console.log('🎉 모든 사용자 이미지 데이터 업데이트가 완료되었습니다!');
    process.exit(0);

  } catch (error) {
    console.error('❌ 업데이트 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateUserImages();
