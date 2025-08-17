-- 사용자 모델의 필드 타입을 TEXT로 변경하는 마이그레이션 스크립트
-- PostgreSQL에서 실행

-- 1. license 필드를 TEXT로 변경
ALTER TABLE users 
ALTER COLUMN license TYPE TEXT;

-- 2. education 필드를 TEXT로 변경  
ALTER TABLE users 
ALTER COLUMN education TYPE TEXT;

-- 3. instagram 필드를 TEXT로 변경
ALTER TABLE users 
ALTER COLUMN instagram TYPE TEXT;

-- 변경사항 확인
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('license', 'education', 'instagram', 'experience')
ORDER BY column_name;
