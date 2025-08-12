#!/usr/bin/env python3
"""
이미지 합성 스크립트
infovitalfit.png의 왼쪽 하단에 logo-removebg-preview.png와 VitalFit 텍스트를 합성합니다.
"""

from PIL import Image, ImageDraw, ImageFont

def merge_images():
    try:
        # 원본 이미지 경로 (백엔드에서 복사한 깨끗한 이미지)
        original_path = 'public/img/infovitalfit_original.png'
        logo_path = 'public/logo-removebg-preview.png'  # 배경이 제거된 로고 이미지
        output_path = 'public/img/infovitalfit.png'
        
        # 이미지 열기
        bg_img = Image.open(original_path).convert("RGBA")
        logo_img = Image.open(logo_path).convert("RGBA")
        
        print("원본 이미지에서 깔끔하게 시작합니다.")
        print("배경이 제거된 깔끔한 로고 이미지를 사용합니다.")
        
        # 로고 이미지 크기 조정 (적절한 크기로)
        width, height = bg_img.size
        logo_max_width = int(width * 0.25)  # 전체 너비의 25%
        logo_aspect_ratio = logo_img.height / logo_img.width
        logo_new_size = (logo_max_width, int(logo_max_width * logo_aspect_ratio))
        logo_img_resized = logo_img.resize(logo_new_size, Image.LANCZOS)
        
        # 로고 이미지 위치 (아래서부터 1/8 지점에 배치)
        margin_x = 50
        # 아래서부터 1/8 지점 = 하단에서 전체 높이의 1/8 위로
        logo_y = height - int(height * 0.125) - logo_new_size[1]  # 하단에서 12.5% 위로
        
        logo_x = margin_x
        
        # 투명 배경 유지하며 로고 붙이기
        bg_img.paste(logo_img_resized, (logo_x, logo_y), logo_img_resized)
        
        # 로고 밑에 VitalFit 텍스트 추가
        draw = ImageDraw.Draw(bg_img)
        
        # 폰트 설정 (기본 폰트 사용, 크기는 로고 너비에 맞춤)
        try:
            # macOS 기본 폰트 사용
            font_size = int(logo_max_width * 0.2)  # 로고 너비의 20%로 줄임 (기존 30%에서 축소)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            # 폰트를 찾을 수 없는 경우 기본 폰트 사용
            font_size = int(logo_max_width * 0.2)
            font = ImageFont.load_default()
        
        # 파우더블루 색상 (RGB: 176, 224, 230)
        powder_blue = (176, 224, 230)
        
        # 텍스트 위치 (로고 밑에 배치, 이미지 하단 경계 안전하게 고려)
        text = "VitalFit"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # 텍스트를 로고 중앙 아래에 배치, 이미지 하단에서 안전한 여백 확보
        text_x = logo_x + (logo_new_size[0] - text_width) // 2
        text_y = logo_y + logo_new_size[1] + 15  # 로고 밑에 15px 여백 (기존 20px에서 줄임)
        
        # 이미지 하단 경계를 넘지 않도록 안전장치
        safe_margin = 30  # 이미지 하단에서 최소 30px 여백
        if text_y + text_height > height - safe_margin:
            text_y = height - safe_margin - text_height
        
        # 텍스트 그리기
        draw.text((text_x, text_y), text, fill=powder_blue, font=font)
        
        # 결과 이미지 저장
        bg_img.save(output_path, 'PNG')
        print(f"이미지 합성 완료: {output_path}")
        print("로고가 밑에서 시작해서 1/5 지점에 정확히 배치되었습니다.")
        print("로고 밑에 'VitalFit' 텍스트를 파우더블루 색으로 추가했습니다.")
        print("원본 이미지 품질을 완벽하게 유지했습니다.")
        
    except ImportError:
        print("PIL(Pillow) 라이브러리가 설치되어 있지 않습니다.")
        print("설치 명령어: pip3 install Pillow")
        return False
    except Exception as e:
        print(f"오류 발생: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = merge_images()
    if success:
        print("이미지 합성이 성공적으로 완료되었습니다!")
    else:
        print("이미지 합성에 실패했습니다.")
