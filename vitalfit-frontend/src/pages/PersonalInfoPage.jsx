import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';
import { teamAPI, centerAPI } from '../utils/api';
import ImageExpandModal from '../components/ImageExpandModal';
import WebcamCapture from '../components/WebcamCapture';
import AccountImageUploader from '../components/AccountImageUploader';
import AccountInfoSection from '../components/AccountInfoSection';

const PersonalInfoPage = () => {
  const { user, refreshUserInfo } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // 모든 팀 데이터 저장
  const [centers, setCenters] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [centersLoading, setCentersLoading] = useState(true);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 이미지 확대 모달 상태
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    imageName: '',
    title: '',
  });

  // 웹캠 모달 상태
  const [showWebcam, setShowWebcam] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nickname: '',
    phone: '',
    gender: '',
    position_id: '',
    team_id: '',
    center_id: '',
    license: '',
    experience: '',
    education: '',
    instagram: '',
  });

  // 계좌 정보 관련 상태
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBank, setAccountBank] = useState('');
  const [accountImage, setAccountImage] = useState('');
  const [accountImageFile, setAccountImageFile] = useState(null);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  // 센터 선택에 따라 팀 필터링
  const filterTeamsByCenter = centerId => {
    if (!centerId) {
      // 센터가 선택되지 않은 경우 모든 팀 표시
      setTeams(allTeams);
      return;
    }

    // 해당 센터에 속한 팀들만 필터링 (center_id 기준)
    const filteredTeams = allTeams.filter(team => {
      // center_id가 숫자인지 확인하고 비교
      const teamCenterId = Number(team.center_id);
      const selectedCenterId = Number(centerId);
      return teamCenterId === selectedCenterId;
    });

    setTeams(filteredTeams);

    // 현재 선택된 팀이 필터링된 팀 목록에 없으면 팀 선택 초기화
    if (formData.team_id && !filteredTeams.find(team => team.id == formData.team_id)) {
      setFormData(prev => ({ ...prev, team_id: '' }));
    }
  };

  useEffect(() => {
    if (user) {
      const newFormData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '', // gender 필드 복원
        nickname: user.nickname || '',
        position_id: user.position_id || '',
        team_id: user.team_id || '',
        center_id: user.center_id || '',
        license: user.license || '',
        experience: user.experience || '',
        education: user.education || '',
        instagram: user.instagram || '',
      };

      // formData 상태 업데이트
      setFormData(prev => {
        return newFormData;
      });

      // 센터가 선택된 경우 팀 필터링 적용
      if (newFormData.center_id && centers.length > 0 && allTeams.length > 0) {
        filterTeamsByCenter(newFormData.center_id);
      }

      // 계좌 정보 설정
      if (user.account_number) {
        setAccountNumber(user.account_number);
      } else {
        setAccountNumber('');
      }

      if (user.account_bank) {
        setAccountBank(user.account_bank);
      } else {
        setAccountBank('');
      }

      if (user.account_image_url) {
        const imageUrl = user.account_image_url.startsWith('http')
          ? user.account_image_url
          : `http://localhost:3001${user.account_image_url}`;
        setAccountImage(imageUrl);
      } else {
        setAccountImage('');
      }

      if (user.profile_image_url) {
        const imageUrl = user.profile_image_url.startsWith('http')
          ? user.profile_image_url
          : `http://localhost:3001${user.profile_image_url}`;
        setPreviewImage(imageUrl);
      } else {
        setPreviewImage(
          'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
        );
      }
      setLoading(false);
    }
  }, [user, centers, allTeams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 팀 데이터 로드
        setTeamsLoading(true);
        const teamsRes = await teamAPI.getAllTeams();
        const teamsData = teamsRes.data?.teams || teamsRes.teams || [];

        setAllTeams(teamsData);
        setTeams(teamsData);
        setTeamsLoading(false);

        // 센터 데이터 로드
        setCentersLoading(true);
        const centersRes = await fetch('http://localhost:3001/api/users/centers');
        const centersData = await centersRes.json();
        const centersList = centersData?.data || [];

        setCenters(centersList);
        setCentersLoading(false);

        // 직책 데이터 로드
        setPositionsLoading(true);
        const positionsRes = await fetch('http://localhost:3001/api/positions');
        const positionsData = await positionsRes.json();
        const positionsList = positionsData.data || positionsData || [];

        setPositions(positionsList);
        setPositionsLoading(false);

        // 데이터 로딩 완료 후 센터별 팀 필터링 적용
        if (formData.center_id) {
          filterTeamsByCenter(formData.center_id);
        }
      } catch (err) {
        setTeamsLoading(false);
        setCentersLoading(false);
        setPositionsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = e => {
    const { name, value } = e.target;

    try {
      // 성별 필드 특별 처리
      if (name === 'gender') {
        // 성별 값 검증
        if (value && !['male', 'female', ''].includes(value)) {
          toast.error('올바르지 않은 성별 값입니다.');
          return;
        }
      }

      setFormData(prev => ({ ...prev, [name]: value }));

      // 센터가 변경되면 팀 목록 필터링
      if (name === 'center_id') {
        filterTeamsByCenter(value);
      }
    } catch (error) {
      toast.error('입력 처리 중 오류가 발생했습니다.');
    }
  };

  const handlePhotoClick = () => {
    // 이미지가 있고 기본 이미지가 아닌 경우 확대
    if (
      previewImage &&
      previewImage !==
        'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
    ) {
      openImageModal(previewImage, '프로필 이미지', '프로필');
    } else {
      // 이미지가 없거나 기본 이미지인 경우 파일 선택
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handlePhotoChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formDataObj = new FormData();
    formDataObj.append('profile_image_url', file);

    try {
      setUploadProgress(0);
      await userAPI.uploadProfileImage(user.id, formDataObj, progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        refreshUserInfo();
      }
      toast.success('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      toast.error(
        `이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploadProgress(0);
    }
  };

  // 웹캠으로 촬영한 이미지 처리
  const handleWebcamCapture = async file => {
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const formDataObj = new FormData();
    formDataObj.append('profile_image_url', file);

    try {
      setUploadProgress(0);
      await userAPI.uploadProfileImage(user.id, formDataObj, progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        refreshUserInfo();
      }
      toast.success('웹캠으로 촬영한 프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      toast.error(
        `이미지 업로드에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setUploadProgress(0);
    }
  };

  // 프로필 이미지 삭제
  const handlePhotoDelete = async () => {
    try {
      await userAPI.deleteProfileImage();
      setPreviewImage(
        'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
      );
      toast.success('프로필 이미지가 삭제되었습니다.');
      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        refreshUserInfo();
      }
    } catch (error) {
      toast.error(
        `프로필 이미지 삭제에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleSave = async () => {
    try {
      // 필수 필드 검증
      if (!formData.position_id || formData.position_id === '') {
        toast.error('직책을 선택해주세요.');
        return;
      }

      if (!formData.center_id || formData.center_id === '') {
        toast.error('센터를 선택해주세요.');
        return;
      }

      // 성별 필드 상태 확인
      const genderSelect = document.querySelector('select[name="gender"]');

      // 데이터 전처리
      let processedFormData = { ...formData };

      // 성별 빈 문자열을 null로 변환
      if (processedFormData.gender === '') {
        processedFormData.gender = null;
      }

      // 선택적 필드만 빈 문자열을 null로 변환 (필수 필드는 빈 문자열 유지)
      if (processedFormData.team_id === '') {
        processedFormData.team_id = null;
      }

      // 필수 필드들은 빈 문자열로 유지 (백엔드에서 검증)

      // 계좌번호는 별도로 처리하지 않음 (계좌 정보는 별도 API로 저장)

      // 필수 필드들과 선택적 필드들은 항상 포함 (null 값이어도)
      const alwaysIncludeFields = [
        'position_id',
        'center_id',
        'team_id',
        'gender',
        'phone',
        'license',
        'instagram',
      ];

      const cleanFormData = Object.fromEntries(
        Object.entries(processedFormData).filter(([key, value]) => {
          // 항상 포함해야 하는 필드들
          if (alwaysIncludeFields.includes(key)) {
            return true;
          }

          // 다른 필드는 빈 값이 아닐 때만 포함
          const shouldInclude = value !== '' && value !== null && value !== undefined;
          return shouldInclude;
        })
      );

      const response = await userAPI.updateMyAccount(cleanFormData);

      // 경력/학력 데이터 별도 저장 (JSON 형태로)
      try {
        // 경력 데이터 저장
        if (formData.experience && typeof formData.experience === 'object') {
          await userAPI.updateExperience({
            experience: JSON.stringify(formData.experience),
          });
        }

        // 학력 데이터 저장
        if (formData.education && typeof formData.education === 'object') {
          await userAPI.updateEducation({
            education: JSON.stringify(formData.education),
          });
        }
      } catch (error) {
        toast.warning('개인정보는 저장되었지만 경력/학력 정보 저장에 실패했습니다.');
      }

      // 계좌 정보 저장 (빈 값이어도 기존 데이터를 지우기 위해 항상 저장)

      // 계좌 정보가 있거나 기존에 저장된 데이터가 있으면 저장
      if (accountNumber.trim() || accountBank.trim() || accountImageFile || accountImage) {
        try {
          let accountImageUrl = null;
          let accountImageName = null;

          // 계좌 이미지가 있으면 먼저 업로드
          if (accountImageFile) {
            const formData = new FormData();
            formData.append('account_image', accountImageFile);

            const uploadResponse = await userAPI.uploadAccountImage(formData);

            if (uploadResponse.data.success) {
              accountImageUrl = uploadResponse.data.data.image_url;
              accountImageName = uploadResponse.data.data.image_name;

              // 로컬 이미지 URL을 서버 URL로 교체
              setAccountImage(accountImageUrl);
            }
          }

          // 계좌 정보 업데이트 (이미지가 없어도 계좌번호만이라도 저장)
          const accountData = {
            account_number: accountNumber.trim() || null,
            account_bank: accountBank.trim() || null,
            account_image_name: accountImageName,
            account_image_url: accountImageUrl,
          };

          await userAPI.updateAccountInfo(accountData);

          // 계좌 정보 저장 성공 후 상태 업데이트
          setAccountImageFile(null);

          // 새로 업로드된 이미지가 있으면 로컬 상태 업데이트
          if (accountImageUrl) {
            setAccountImage(accountImageUrl);
          }

          // 계좌번호와 은행명 상태 업데이트
          setAccountNumber(accountNumber.trim() || '');
          setAccountBank(accountBank.trim() || '');
        } catch (uploadError) {
          toast.warning('개인정보는 저장되었지만 계좌 정보 저장에 실패했습니다.');
        }
      }

      if (response.data && response.data.user) {
        const updatedUser = response.data.user;

        setFormData(prev => {
          const newFormData = {
            ...prev,
            name: updatedUser.name || prev.name,
            email: updatedUser.email || prev.email,
            phone: updatedUser.phone || prev.phone,
            gender: updatedUser.gender !== undefined ? updatedUser.gender : prev.gender,
            nickname: updatedUser.nickname || prev.nickname,
            position_id: updatedUser.position_id || prev.position_id,
            team_id: updatedUser.team_id || prev.team_id,
            center_id: updatedUser.center_id || prev.center_id,
            license: updatedUser.license || prev.license,
            experience: updatedUser.experience || prev.experience,
            education: updatedUser.education || prev.education,
            instagram: updatedUser.instagram || prev.instagram,
          };
          return newFormData;
        });

        if (updatedUser.profile_image_url) {
          const imageUrl = updatedUser.profile_image_url.startsWith('http')
            ? updatedUser.profile_image_url
            : `http://localhost:3001${updatedUser.profile_image_url}`;
          setPreviewImage(imageUrl);
        } else {
          setPreviewImage(
            'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
          );
        }
      }

      toast.success('개인정보가 업데이트되었습니다.');

      if (refreshUserInfo && typeof refreshUserInfo === 'function') {
        try {
          await refreshUserInfo();

          // 사용자 정보 새로고침 후 formData 강제 업데이트
          setTimeout(() => {
            if (refreshUserInfo && typeof refreshUserInfo === 'function') {
              refreshUserInfo();
            }
          }, 100);
        } catch (error) {
          // 에러 처리
        }
      }
    } catch (err) {
      let errorMessage = '업데이트에 실패했습니다.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(`업데이트 실패: ${errorMessage}`);
    }
  };

  // 이미지 확대 모달 열기
  const openImageModal = (imageUrl, imageName, title) => {
    // 이미지 확대 모달만 열기 (저장 로직 호출하지 않음)
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

  // 계좌 정보 관련 함수들
  const handleAccountImageChange = file => {
    if (!file) {
      setAccountImageFile(null);
      setAccountImage('');
      return;
    }

    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const maxSize = 5 * 1024 * 1024;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('허용되지 않는 파일 형식입니다. JPG, JPEG, PNG 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
      return;
    }

    setAccountImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAccountImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccountInfo = async () => {
    try {
      if (!accountNumber.trim()) {
        toast.error('계좌번호를 입력해주세요.');
        return;
      }

      if (!accountImageFile) {
        toast.error('통장사본을 업로드해주세요.');
        return;
      }

      // 통장사본 이미지 업로드
      const formData = new FormData();
      formData.append('account_image', accountImageFile);

      try {
        // 이미지 업로드 API 호출 (기존 프로필 이미지 업로드와 유사)
        const uploadResponse = await userAPI.uploadAccountImage(formData);

        if (uploadResponse.data && uploadResponse.data.account_image_url) {
          // 계좌 정보 업데이트 (이미지 URL 포함)
          await userAPI.updateAccountInfo({
            account_number: accountNumber,
            account_image_name: accountImageFile.name,
            account_image_url: uploadResponse.data.account_image_url,
          });

          toast.success('계좌 정보가 저장되었습니다.');
          setShowAccountInfo(false);
        }
      } catch (uploadError) {
        toast.error('통장사본 업로드에 실패했습니다.');
      }
    } catch (error) {
      toast.error('계좌 정보 저장에 실패했습니다.');
    }
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
      {/* 최상단 제목 */}
      <div className="w-full max-w-7xl mx-auto pt-0 px-6 pb-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">개인정보</h1>
          <p className="text-lg text-gray-600">자신의 정보를 관리하세요</p>
        </div>
      </div>

      {/* 프로필 사진 섹션 - 맨 위 중앙 */}
      <section className="w-full flex flex-col items-center gap-5 mb-7">
        <div className="flex items-center gap-7">
          {/* 프로필 사진 */}
          <div
            className="relative w-36 h-36 rounded-full outline outline-1 outline-gray-200 overflow-hidden cursor-pointer"
            onClick={() => {
              if (
                previewImage &&
                previewImage !==
                  'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0'
              ) {
                openImageModal(previewImage, '프로필 이미지', '프로필');
              }
            }}
          >
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-5xl font-bold text-gray-400">
                😊
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoChange}
              accept=".jpg,.jpeg,.png"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">{uploadProgress}%</div>
              </div>
            )}
          </div>

          {/* 사진 관련 링크들 */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              사진등록
            </button>
            <button
              type="button"
              onClick={() => setShowWebcam(true)}
              className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
            >
              웹캠등록
            </button>
            {previewImage &&
              previewImage !==
                'https://lh3.googleusercontent.com/pw/AP1GczPHYKy-ftX95akuneOtJAq_BTm0oNlL8mLTK7gUbZJqkYXHB1RDR-gseWYT7G9cVjTsIZyconxHncd5Ph1RASfAHtI75Abk4G9eH9HNtkLAUvHcBfloZzlYUNfcxHPQaTLMmbuZfqZ4I0Pkqf4jS43E=w200-h200-s-no-gm?authuser=0' && (
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  사진삭제
                </button>
              )}
          </div>
        </div>
      </section>

      {/* 개인정보 폼 섹션 - 가운데 */}
      <section className="w-full max-w-3xl mx-auto mb-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* name */}
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="이름"
            className="p-2.5 border rounded text-sm"
          />

          {/* email - disabled */}
          <input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일"
            className="p-2.5 border rounded bg-gray-100 cursor-not-allowed text-sm"
            disabled
          />

          {/* nickname */}
          <input
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="닉네임"
            className="p-2.5 border rounded text-sm"
          />

          {/* phone */}
          <input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="전화번호"
            className="p-2.5 border rounded text-sm"
          />

          {/* gender */}
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            className="p-2.5 border rounded text-sm"
          >
            <option value="">성별 미지정</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          {/* position_id */}
          <select
            name="position_id"
            value={formData.position_id}
            onChange={handleInputChange}
            className="p-2.5 border rounded text-sm"
          >
            <option value="">직책 선택</option>
            {positionsLoading ? (
              <option value="" disabled>
                직책 목록 로딩 중...
              </option>
            ) : (
              positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))
            )}
          </select>

          {/* center_id */}
          <select
            name="center_id"
            value={formData.center_id}
            onChange={handleInputChange}
            className="p-2.5 border rounded text-sm"
          >
            <option value="">센터 선택</option>
            {centersLoading ? (
              <option value="" disabled>
                센터 목록 로딩 중...
              </option>
            ) : (
              centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))
            )}
          </select>

          {/* team_id */}
          <select
            name="team_id"
            value={formData.team_id}
            onChange={handleInputChange}
            className="p-2.5 border rounded text-sm"
            disabled={teamsLoading}
          >
            <option value="">팀 선택</option>
            {teamsLoading ? (
              <option value="" disabled>
                팀 목록 로딩 중...
              </option>
            ) : teams.length === 0 ? (
              <option value="" disabled>
                {formData.center_id ? '해당 센터에 팀이 없습니다' : '센터를 먼저 선택해주세요'}
              </option>
            ) : (
              teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      {/* 자격증/경력/학력/인스타 섹션 - 이력 탭용 (UI 비활성화) */}
      {/* <section className="w-full max-w-3xl mx-auto mb-7">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">이력 정보</h3>
        <div className="grid grid-cols-1 gap-5">
          <textarea
            name="license"
            value={formData.license}
            onChange={handleInputChange}
            placeholder="자격증 정보를 입력하세요"
            className="p-2.5 border rounded text-sm"
            rows="3"
          />
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            placeholder="경력 사항을 입력하세요"
            className="p-2.5 border rounded text-sm"
            rows="3"
          />
          <textarea
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            placeholder="학력 정보를 입력하세요"
            className="p-2.5 border rounded text-sm"
            rows="3"
          />
          <input
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="인스타그램 계정을 입력하세요"
            className="p-2.5 border rounded text-sm"
          />
        </div>
      </section> */}

      {/* 계좌 정보 섹션 */}
      <section className="w-full max-w-3xl mx-auto mb-7">
        <AccountInfoSection
          accountNumber={accountNumber}
          accountBank={accountBank}
          accountImage={accountImage}
          accountImageFile={accountImageFile}
          onAccountNumberChange={setAccountNumber}
          onAccountBankChange={setAccountBank}
          onAccountImageChange={handleAccountImageChange}
          onImageClick={imageUrl => openImageModal(imageUrl, '통장사본', '계좌')}
        />
      </section>

      {/* 저장 버튼 섹션 - 맨 아래 중앙 */}
      <section className="w-full flex justify-center">
        <button
          type="button"
          onClick={handleSave}
          className="w-96 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white py-2 px-4 rounded-[10px] hover:from-cyan-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          저장
        </button>
      </section>

      {/* 이미지 확대 모달 */}
      <ImageExpandModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        imageName={imageModal.imageName}
        title={imageModal.title}
      />

      {/* 웹캠 모달 */}
      {showWebcam && (
        <WebcamCapture onCapture={handleWebcamCapture} onClose={() => setShowWebcam(false)} />
      )}
    </div>
  );
};

export default PersonalInfoPage;
