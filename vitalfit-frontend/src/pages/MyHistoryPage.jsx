import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';
import { fetchUrlThumbnail } from '../utils/instagramUtils';
import ImageExpandModal from '../components/ImageExpandModal';
import MediaSection from '../components/MediaSection';
import CareerSection from '../components/CareerSection';
import LicenseSection from '../components/LicenseSection';
import InstagramSection from '../components/InstagramSection';

// API 기본 URL 환경 변수
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const MyHistoryPage = ({ onReAuthRequired }) => {
  const { user, refreshUserInfo } = useAuth();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    license: '',
    experience: '',
    education: '',
    instagram: '',
    licenseData: {
      items: [
        {
          image_name: '',
          image_url: '',
          uploaded_at: '',
          isLocal: false,
          licenseName: '',
          issuingOrganization: '',
          issueDate: '',
          additionalInfo: '',
        },
      ],
    },
    experienceData: {
      items: [
        {
          startDate: '',
          endDate: '',
          content: '',
          status: '',
        },
      ],
    },
    educationData: {
      items: [
        {
          startDate: '',
          endDate: '',
          content: '',
          status: '',
        },
      ],
    },
    instagramData: {
      image_name: '',
      image_url: '',
      uploaded_at: '',
      isLocal: false,
      accountName: '',
      instagramLink: '',
      description: '',
    },
  });

  // 이미지 확대 모달 상태
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    imageName: '',
    title: '',
  });

  // 자격증, 경력, 학력, 인스타그램 데이터 파싱
  const parseAdditionalData = (data, fieldName) => {
    if (!data) {
      if (fieldName === 'experience' || fieldName === 'education') {
        return {
          items: [
            {
              startDate: '',
              endDate: '',
              content: '',
              status: fieldName === 'education' ? '' : undefined,
            },
          ],
        };
      } else if (fieldName === 'license') {
        return {
          items: [
            {
              image_name: '',
              image_url: '',
              uploaded_at: '',
              isLocal: false,
              licenseName: '',
              issuingOrganization: '',
              issueDate: '',
            },
          ],
        };
      } else {
        return {
          image_name: '',
          image_url: '',
          uploaded_at: '',
          isLocal: false,
          accountName: '',
          instagramLink: '',
          description: '',
        };
      }
    }

    try {
      const parsed = JSON.parse(data);

      if (fieldName === 'experience' || fieldName === 'education') {
        // 경력, 학력은 items 구조
        return {
          items: parsed.items || [
            {
              startDate: '',
              endDate: '',
              content: '',
              status: fieldName === 'education' ? '' : undefined,
            },
          ],
        };
      } else {
        // 자격증, 인스타그램은 이미지 + 내용 구조
        if (fieldName === 'license') {
          return {
            items: (parsed.items || []).map(item => ({
              ...item,
              image_url: item.image_url || '',
            })) || [
              {
                image_name: '',
                image_url: '',
                uploaded_at: '',
                isLocal: false,
                licenseName: '',
                issuingOrganization: '',
                issueDate: '',
              },
            ],
          };
        } else {
          // 인스타그램은 단일 구조
          return {
            image_name: parsed.image_name || '',
            image_url: parsed.image_url || '',
            uploaded_at: parsed.uploaded_at || '',
            isLocal: false,
            accountName: parsed.accountName || '',
            instagramLink: parsed.instagramLink || '',
            description: parsed.description || '',
          };
        }
      }
    } catch (error) {
      console.error(`${fieldName} 파싱 실패:`, error);
      if (fieldName === 'experience' || fieldName === 'education') {
        return {
          items: [
            {
              startDate: '',
              endDate: '',
              content: '',
              status: fieldName === 'education' ? '' : undefined,
            },
          ],
        };
      } else {
        return {
          image_name: '',
          image_url: '',
          uploaded_at: '',
          isLocal: false,
          accountName: fieldName === 'instagram' ? '' : undefined,
          instagramLink: fieldName === 'instagram' ? '' : undefined,
          description: fieldName === 'instagram' ? '' : undefined,
          licenseName: fieldName === 'license' ? '' : undefined,
          issuingOrganization: fieldName === 'license' ? '' : undefined,
          issueDate: fieldName === 'license' ? '' : undefined,
        };
      }
    }
  };

  // 자격증, 경력, 학력, 인스타그램 데이터 직렬화 함수
  const serializeAdditionalData = (data, fieldName) => {
    // TEXT 타입이므로 제한 없음
    if (fieldName === 'experience' || fieldName === 'education') {
      // 경력, 학력은 items 구조
      return JSON.stringify({
        items: data.items || [],
      });
    } else {
      // 자격증, 인스타그램은 이미지 + 내용 구조
      if (fieldName === 'license') {
        return JSON.stringify({
          items: (data.items || []).map(item => ({
            image_name: item.image_name || '',
            image_url: item.image_url || '',
            uploaded_at: item.uploaded_at || '',
            licenseName: item.licenseName || '',
            issuingOrganization: item.issuingOrganization || '',
            issueDate: item.issueDate || '',
          })),
        });
      } else {
        // 인스타그램은 단일 구조
        return JSON.stringify({
          image_name: data.image_name || '',
          image_url: data.image_url || '',
          uploaded_at: data.uploaded_at || '',
          accountName: data.accountName || '',
          instagramLink: data.instagramLink || '',
          description: data.description || '',
        });
      }
    }
  };

  // 자격증, 경력, 학력, 인스타그램 이미지 업로드 핸들러
  const handleAdditionalImageUpload = async (fieldName, file, itemIndex = 0) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
    const maxSize = 8 * 1024 * 1024; // 8MB
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG, PDF 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 8MB까지 업로드 가능합니다.');
      return;
    }

    try {
      // 먼저 FileReader로 로컬 미리보기 추가 (센터 이미지와 동일한 방식)
      const reader = new FileReader();
      reader.onload = e => {
        const previewUrl = e.target.result;
        setFormData(prev => {
          const currentData = prev[`${fieldName}Data`] || {};
          const currentItems = Array.isArray(currentData.items) ? currentData.items : [];

          return {
            ...prev,
            [`${fieldName}Data`]: {
              ...currentData,
              items:
                fieldName === 'license'
                  ? currentItems.map((item, index) =>
                      index === itemIndex
                        ? {
                            ...item,
                            image_name: file.name,
                            image_url: previewUrl,
                            uploaded_at: new Date().toISOString(),
                            isLocal: true,
                          }
                        : item
                    )
                  : currentItems,
              ...(fieldName !== 'license' && {
                image_name: file.name,
                image_url: previewUrl,
                uploaded_at: new Date().toISOString(),
                isLocal: true,
              }),
            },
          };
        });
      };
      reader.readAsDataURL(file);

      // FormData 생성
      const formData = new FormData();
      formData.append('additional_image_url', file);
      formData.append('field', fieldName);

      // 서버에 업로드
      const response = await userAPI.uploadAdditionalImage(formData);
      const result = response.data;

      if (result.success) {
        // 업로드 성공 시 로컬 이미지를 서버 URL로 교체
        // 이미지 URL을 절대 경로로 변환 (API_BASE_URL 제거)
        const absoluteImageUrl = result.data.image_url.startsWith('http')
          ? result.data.image_url
          : result.data.image_url;

        setFormData(prev => {
          const currentData = prev[`${fieldName}Data`] || {};
          const currentItems = Array.isArray(currentData.items) ? currentData.items : [];

          return {
            ...prev,
            [`${fieldName}Data`]: {
              ...currentData,
              items:
                fieldName === 'license'
                  ? currentItems.map((item, index) =>
                      index === itemIndex
                        ? {
                            ...item,
                            image_name: result.data.image_name,
                            image_url: absoluteImageUrl,
                            uploaded_at: result.data.uploaded_at,
                            isLocal: false,
                          }
                        : item
                    )
                  : currentItems,
              ...(fieldName !== 'license' && {
                image_name: result.data.image_name,
                image_url: absoluteImageUrl,
                uploaded_at: result.data.uploaded_at,
                isLocal: false,
              }),
            },
          };
        });

        toast.success('이미지가 추가되었습니다.');
      } else {
        // 업로드 실패 시 로컬 이미지 제거
        setFormData(prev => ({
          ...prev,
          [`${fieldName}Data`]: {
            ...prev[`${fieldName}Data`],
            items:
              fieldName === 'license'
                ? prev[`${fieldName}Data`].items.map((item, index) =>
                    index === itemIndex
                      ? { ...item, image_name: '', image_url: '', uploaded_at: '', isLocal: false }
                      : item
                  )
                : prev[`${fieldName}Data`].items,
            ...(fieldName !== 'license' && {
              image_name: '',
              image_url: '',
              uploaded_at: '',
              isLocal: false,
            }),
          },
        }));
        toast.error('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error(
        `이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`
      );

      // 에러 발생 시 로컬 이미지 제거
      setFormData(prev => ({
        ...prev,
        [`${fieldName}Data`]: {
          ...prev[`${fieldName}Data`],
          items:
            fieldName === 'license'
              ? prev[`${fieldName}Data`].items.map((item, index) =>
                  index === itemIndex
                    ? { ...item, image_name: '', image_url: '', uploaded_at: '', isLocal: false }
                    : item
                )
              : prev[`${fieldName}Data`].items,
          ...(fieldName !== 'license' && {
            image_name: '',
            image_url: '',
            uploaded_at: '',
            isLocal: false,
          }),
        },
      }));
    }
  };

  // 이미지 삭제 핸들러
  const handleAdditionalImageDelete = (fieldName, itemIndex = 0) => {
    // 이미지 정보 제거 (센터 이미지와 동일한 방식)
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        items:
          fieldName === 'license'
            ? prev[`${fieldName}Data`].items.map((item, index) =>
                index === itemIndex
                  ? { ...item, image_name: '', image_url: '', uploaded_at: '', isLocal: false }
                  : item
              )
            : prev[`${fieldName}Data`].items,
        ...(fieldName !== 'license' && {
          image_name: '',
          image_url: '',
          uploaded_at: '',
          isLocal: false,
        }),
      },
    }));

    toast.success('이미지가 삭제되었습니다.');
  };

  // 자격증, 경력, 학력, 인스타그램 내용 변경 핸들러
  const handleAdditionalContentChange = (fieldName, content) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        content,
      },
    }));
  };

  // 경력, 학력 항목 추가 핸들러
  const handleAddItem = fieldName => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        items: [
          ...prev[`${fieldName}Data`].items,
          {
            startDate: '',
            endDate: '',
            content: '',
            status: fieldName === 'education' ? '' : undefined,
          },
        ],
      },
    }));
  };

  // 경력, 학력 항목 삭제 핸들러
  const handleRemoveItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        items: prev[`${fieldName}Data`].items.filter((_, i) => i !== index),
      },
    }));
  };

  // 경력, 학력 항목 내용 변경 핸들러
  const handleItemContentChange = (fieldName, index, content) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        items: prev[`${fieldName}Data`].items.map((item, i) =>
          i === index ? { ...item, content } : item
        ),
      },
    }));
  };

  // 경력, 학력 항목 날짜 변경 핸들러
  const handleItemDateChange = (fieldName, index, dateType, value) => {
    setFormData(prev => ({
      ...prev,
      [`${fieldName}Data`]: {
        ...prev[`${fieldName}Data`],
        items: prev[`${fieldName}Data`].items.map((item, i) =>
          i === index ? { ...item, [dateType]: value } : item
        ),
      },
    }));
  };

  // 자격증 항목 추가 핸들러
  const handleAddLicenseItem = () => {
    setFormData(prev => {
      const currentLicenseData = prev.licenseData || {};
      const currentItems = Array.isArray(currentLicenseData.items) ? currentLicenseData.items : [];

      return {
        ...prev,
        licenseData: {
          ...currentLicenseData,
          items: [
            ...currentItems,
            {
              image_name: '',
              image_url: '',
              uploaded_at: '',
              isLocal: false,
              licenseName: '',
              issuingOrganization: '',
              issueDate: '',
              additionalInfo: '',
            },
          ],
        },
      };
    });
  };

  // 자격증 항목 삭제 핸들러
  const handleRemoveLicenseItem = index => {
    setFormData(prev => {
      const currentLicenseData = prev.licenseData || {};
      const currentItems = Array.isArray(currentLicenseData.items) ? currentLicenseData.items : [];

      return {
        ...prev,
        licenseData: {
          ...currentLicenseData,
          items: currentItems.filter((_, i) => i !== index),
        },
      };
    });
  };

  // 자격증 항목 내용 변경 핸들러
  const handleLicenseContentChange = (index, field, value) => {
    setFormData(prev => {
      const currentLicenseData = prev.licenseData || {};
      const currentItems = Array.isArray(currentLicenseData.items) ? currentLicenseData.items : [];

      return {
        ...prev,
        licenseData: {
          ...currentLicenseData,
          items: currentItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        },
      };
    });
  };

  // 인스타그램 항목 내용 변경 핸들러
  const handleInstagramContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      instagramData: {
        ...prev.instagramData,
        [field]: value,
      },
    }));
  };

  const openInstagramLink = url => {
    if (!url || url.trim() === '') {
      toast.warning('인스타그램 링크를 먼저 입력해주세요.');
      return;
    }

    let instagramUrl = url.trim();
    if (!instagramUrl.startsWith('http://') && !instagramUrl.startsWith('https://')) {
      instagramUrl = 'https://' + instagramUrl;
    }

    if (!instagramUrl.includes('instagram.com')) {
      toast.error('올바른 인스타그램 링크를 입력해주세요.');
      return;
    }

    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  const fetchInstagramThumbnail = async url => {
    if (!url || url.trim() === '') {
      toast.warning('인스타그램 링크를 먼저 입력해주세요.');
      return;
    }

    try {
      toast.info('썸네일을 가져오는 중...');

      // instagramUtils의 fetchUrlThumbnail 함수 사용
      const result = await fetchUrlThumbnail(url);

      if (result.success) {
        // 썸네일 정보를 formData에 저장
        setFormData(prev => ({
          ...prev,
          instagramData: {
            ...prev.instagramData,
            image_url: result.thumbnail,
            image_name: `${result.title || 'instagram_thumbnail'}.jpg`,
            uploaded_at: new Date().toISOString(),
            isLocal: false,
          },
        }));

        toast.success('썸네일을 성공적으로 가져왔습니다!');
      } else {
        toast.error(result.error || '썸네일을 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('썸네일 가져오기 실패:', error);
      toast.error('썸네일을 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 이미지 확대 모달 열기
  const openImageModal = (imageUrl, imageName, title) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      imageName,
      title,
    });
  };

  // 이미지 확대 모달 닫기
  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      imageName: '',
      title: '',
    });
  };

  // 실제 저장 로직을 별도 함수로 분리
  const performSave = async () => {
    try {
      // 각 필드별로 데이터 직렬화
      const updateData = {
        license: serializeAdditionalData(formData.licenseData, 'license'),
        experience: serializeAdditionalData(formData.experienceData, 'experience'),
        education: serializeAdditionalData(formData.educationData, 'education'),
        instagram: serializeAdditionalData(formData.instagramData, 'instagram'),
      };

      // 사용자 정보 업데이트
      await userAPI.updateMyAccount(updateData);

      toast.success('저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error(`저장에 실패했습니다: ${error.response?.data?.message || error.message}`);
    }
  };

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      try {
        setFormData(prev => ({
          ...prev,
          license: user.license || '',
          experience: user.experience || '',
          education: user.education || '',
          instagram: user.instagram || '',
          // 추가 데이터 파싱 (안전하게 처리)
          licenseData: parseAdditionalData(user.license, 'license'),
          experienceData: parseAdditionalData(user.experience, 'experience'),
          educationData: parseAdditionalData(user.education, 'education'),
          instagramData: parseAdditionalData(user.instagram, 'instagram'),
        }));
      } catch (error) {
        console.error('사용자 데이터 파싱 오류:', error);
        // 오류 발생 시 기본값으로 설정
        setFormData(prev => ({
          ...prev,
          license: user.license || '',
          experience: user.experience || '',
          education: user.education || '',
          instagram: user.instagram || '',
          licenseData: {
            items: [
              {
                image_name: '',
                image_url: '',
                uploaded_at: '',
                isLocal: false,
                licenseName: '',
                issuingOrganization: '',
                issueDate: '',
              },
            ],
          },
          experienceData: {
            items: [
              {
                startDate: '',
                endDate: '',
                content: '',
                status: '',
              },
            ],
          },
          educationData: {
            items: [
              {
                startDate: '',
                endDate: '',
                content: '',
                status: '',
              },
            ],
          },
          instagramData: {
            image_name: '',
            image_url: '',
            uploaded_at: '',
            isLocal: false,
            accountName: '',
            instagramLink: '',
            description: '',
          },
        }));
      }
      setLoading(false);
    }
  }, [user]);

  // 저장 핸들러 (재인증 확인 후 실제 저장 실행)
  const handleSave = async () => {
    // 저장할 때마다 재인증 요구
    if (onReAuthRequired) {
      onReAuthRequired(async () => {
        try {
          await performSave();
        } catch (error) {
          console.error('재인증 후 저장 실패:', error);
        }
      });
      return;
    }

    // 재인증이 필요하지 않은 경우 바로 저장
    await performSave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        사용자 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">나의 이력</h1>
          <p className="text-gray-600">
            경력, 학력, 자격증, 인스타그램 등 나의 성장 기록을 관리하세요
          </p>
        </div>

        <div className="space-y-4">
          {/* 자격증 섹션 */}
          <LicenseSection
            title="자격증"
            fieldName="license"
            data={formData.licenseData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onImageExpand={openImageModal}
            onContentChange={handleLicenseContentChange}
            onAddItem={handleAddLicenseItem}
            onRemoveItem={handleRemoveLicenseItem}
          />

          {/* 경력 섹션 */}
          <CareerSection
            title="경력"
            fieldName="experience"
            data={formData.experienceData}
            onContentChange={handleAdditionalContentChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemContentChange={handleItemContentChange}
            onItemDateChange={handleItemDateChange}
          />

          {/* 학력 섹션 */}
          <CareerSection
            title="학력"
            fieldName="education"
            data={formData.educationData}
            onContentChange={handleAdditionalContentChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemContentChange={handleItemContentChange}
            onItemDateChange={handleItemDateChange}
          />

          {/* 인스타그램 섹션 */}
          <InstagramSection
            title="인스타그램"
            fieldName="instagram"
            data={formData.instagramData}
            onImageUpload={handleAdditionalImageUpload}
            onImageDelete={handleAdditionalImageDelete}
            onImageExpand={openImageModal}
            onContentChange={handleInstagramContentChange}
            onInstagramLink={openInstagramLink}
            fetchInstagramThumbnail={fetchInstagramThumbnail}
            maxLength={200}
          />
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleSave}
            className="w-96 mt-1 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-2 px-4 rounded-[10px] hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            저장
          </button>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      <ImageExpandModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        imageName={imageModal.imageName}
        title={imageModal.title}
      />
    </div>
  );
};

export default MyHistoryPage;
