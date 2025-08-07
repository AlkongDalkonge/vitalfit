-- 센터 테스트 데이터
INSERT INTO centers (
  name, 
  address, 
  phone, 
  description, 
  weekday_hours, 
  saturday_hours, 
  sunday_hours, 
  holiday_hours, 
  has_parking, 
  parking_fee, 
  parking_info, 
  directions, 
  status,
  created_at,
  updated_at
) VALUES 
(
  '강남점', 
  '서울특별시 강남구 테헤란로 123', 
  '02-1234-5678', 
  '강남 중심가에 위치한 프리미엄 피트니스 센터입니다. 최신 운동기구와 개인 트레이닝 서비스를 제공합니다.', 
  '06:00-23:00', 
  '08:00-21:00', 
  '09:00-20:00', 
  '09:00-18:00', 
  true, 
  '2시간 무료', 
  '지하 1층 전용 주차장 50대 수용 가능', 
  '지하철 2호선 강남역 3번 출구에서 도보 5분', 
  'active',
  NOW(),
  NOW()
),
(
  '홍대점', 
  '서울특별시 마포구 와우산로 456', 
  '02-2345-6789', 
  '젊은 에너지가 넘치는 홍대에서 운영하는 24시간 피트니스 센터입니다.', 
  '24시간', 
  '24시간', 
  '24시간', 
  '06:00-22:00', 
  false, 
  null, 
  '인근 공영주차장 이용', 
  '지하철 2호선 홍익대입구역 9번 출구에서 도보 3분', 
  'active',
  NOW(),
  NOW()
),
(
  '잠실점', 
  '서울특별시 송파구 올림픽로 789', 
  '02-3456-7890', 
  '롯데월드 인근에 위치한 대형 피트니스 센터입니다. 수영장과 사우나 시설을 갖추고 있습니다.', 
  '05:30-24:00', 
  '06:00-23:00', 
  '07:00-22:00', 
  '휴무', 
  true, 
  '3시간 무료', 
  '지상 및 지하 주차장 총 100대 수용', 
  '지하철 2,8호선 잠실역 1번 출구에서 도보 10분', 
  'active',
  NOW(),
  NOW()
);

-- 센터 이미지 테스트 데이터 (실제 이미지 파일이 없으므로 플레이스홀더 URL 사용)
INSERT INTO center_images (
  center_id,
  image_name,
  image_url,
  is_main,
  sort_order,
  created_at,
  updated_at
) VALUES
-- 강남점 이미지
(1, 'gangnam-main.jpg', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', true, 1, NOW(), NOW()),
(1, 'gangnam-gym.jpg', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', false, 2, NOW(), NOW()),
(1, 'gangnam-pool.jpg', 'https://images.unsplash.com/photo-1544966505-07ad86beaf8c?w=800', false, 3, NOW(), NOW()),

-- 홍대점 이미지
(2, 'hongdae-main.jpg', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', true, 1, NOW(), NOW()),
(2, 'hongdae-cardio.jpg', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', false, 2, NOW(), NOW()),

-- 잠실점 이미지
(3, 'jamsil-main.jpg', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', true, 1, NOW(), NOW()),
(3, 'jamsil-weights.jpg', 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800', false, 2, NOW(), NOW()),
(3, 'jamsil-pool.jpg', 'https://images.unsplash.com/photo-1544966505-07ad86beaf8c?w=800', false, 3, NOW(), NOW()),
(3, 'jamsil-sauna.jpg', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', false, 4, NOW(), NOW());