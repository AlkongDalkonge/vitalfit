import { useState, useEffect } from 'react';
import { noticeService } from '../services/noticeService';
import { toast } from 'react-toastify';

const NoticeCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    receiver_type: 'all',
    receiver_id: null,
    receiver_role: '',
    is_important: false,
    pin_until: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [centers, setCenters] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // 센터 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadCenters();
    }
  }, [isOpen]);

  // 센터 목록 조회
  const loadCenters = async () => {
    try {
      const response = await noticeService.getCenters();
      if (response.success) {
        setCenters(response.data);
      }
    } catch (error) {
      console.error('센터 목록 조회 실패:', error);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // receiver_type이 변경되면 선택된 센터 초기화
    if (name === 'receiver_type') {
      setSelectedCenters([]);
      setSelectedRoles([]);
    }
  };

  // 센터 체크박스 변경 핸들러
  const handleCenterChange = (centerId, checked) => {
    if (checked) {
      setSelectedCenters(prev => [...prev, centerId]);
    } else {
      setSelectedCenters(prev => prev.filter(id => id !== centerId));
    }
  };

  //수신자: 직급별
  const handleRoleChange = (roleCode, checked) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleCode]);
    } else {
      setSelectedRoles(prev => prev.filter(code => code !== roleCode));
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = e => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      receiver_type: 'all',
      receiver_id: null,
      receiver_role: '',
      is_important: false,
      pin_until: '',
    });
    setSelectedFile(null);
    setSelectedCenters([]);
    setSelectedRoles([]);
    setError(null);
  };

  // 모달 닫기
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 폼 제출
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // FormData 생성
      const submitData = new FormData();

      // 필수 필드
      submitData.append('sender_id', 1); // TODO: 실제 사용자 ID로 변경
      submitData.append('title', formData.title.trim());
      submitData.append('content', formData.content.trim());
      submitData.append('receiver_type', formData.receiver_type);

      // 전체 공지 여부 설정
      submitData.append('is_for_all', formData.receiver_type === 'all');

      // 선택 필드
      if (formData.receiver_type === 'center' && selectedCenters.length > 0) {
        // 센터별 선택 시 선택된 센터 ID들 전송
        selectedCenters.forEach(centerId => {
          submitData.append('target_centers[]', centerId);
        });
      } else if (formData.receiver_type === 'role' && selectedRoles.length > 0) {
        // 직급별 선택 시 선택된 직급 전송
        selectedRoles.forEach(roleId => {
          submitData.append('target_roles[]', roleId);
        });
      } else if (formData.receiver_id) {
        submitData.append('receiver_id', formData.receiver_id);
      }
      submitData.append('is_important', formData.is_important);
      if (formData.pin_until) {
        submitData.append('pin_until', formData.pin_until);
      }

      // 파일 첨부
      if (selectedFile) {
        submitData.append('attachment', selectedFile);
      }

      // API 호출
      const response = await noticeService.createNotice(submitData);

      if (response.success) {
        // 성공 시
        onSuccess && onSuccess(response.data);
        handleClose();
        toast.success('공지사항 등록에 성공했습니다.');
      } else {
        setError(response.message || '공지사항 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('공지사항 등록 오류:', err);
      setError('서버와의 연결에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">공지사항 작성</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* 제목 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {/* 내용 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="공지사항 내용을 입력하세요"
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              required
              disabled={loading}
            />
          </div>

          {/* 수신자 타입 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수신자 <span className="text-red-500">*</span>
            </label>
            <select
              name="receiver_type"
              value={formData.receiver_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="all">전체</option>
              <option value="center">센터별</option>
              <option value="role">직급별</option>
            </select>
          </div>

          {/* 센터 선택 (센터별일 때) */}
          {formData.receiver_type === 'center' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                센터 선택 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                {centers.map(center => (
                  <label key={center.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCenters.includes(center.id)}
                      onChange={e => handleCenterChange(center.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">{center.name}</span>
                  </label>
                ))}
              </div>
              {selectedCenters.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  선택된 센터: {selectedCenters.length}개
                </div>
              )}
            </div>
          )}

          {/* 수신자 역할 (직급별일 때) */}
          {formData.receiver_type === 'role' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직급 선택 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 border border-gray-300 rounded-md p-3">
                {[
                  { label: '팀원', value: 'team_member' },
                  { label: '팀장', value: 'team_leader' },
                  { label: '센터장', value: 'center_manager' },
                ].map(role => (
                  <label key={role.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.value)}
                      onChange={e => handleRoleChange(role.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">{role.label}</span>
                  </label>
                ))}
              </div>
              {selectedRoles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  선택된 직급: {selectedRoles.length}개
                </div>
              )}
            </div>
          )}

          {/* 옵션들 */}
          <div className="mb-4 space-y-3">
            {/* 중요 공지 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_important"
                name="is_important"
                checked={formData.is_important}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="is_important" className="ml-2 text-sm text-gray-700">
                중요 공지로 설정
              </label>
            </div>

            {/* 상단 고정 종료일 */}
            {formData.is_important && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상단 고정 종료일
                </label>
                <input
                  type="date"
                  name="pin_until"
                  value={formData.pin_until}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* 파일 첨부 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">파일 첨부</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z"
              disabled={loading}
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={
                loading ||
                !formData.title.trim() ||
                !formData.content.trim() ||
                (formData.receiver_type === 'center' && selectedCenters.length === 0) ||
                (formData.receiver_type === 'role' && selectedRoles.length === 0)
              }
            >
              {loading ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeCreateModal;
