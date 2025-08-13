import { useState, useEffect } from 'react';
import { noticeService } from '../services/noticeService';

const NoticeEditModal = ({ isOpen, onClose, onSuccess, notice }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    receiver_type: 'all',
    receiver_role: '',
    is_important: false,
    pin_until: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        receiver_type: notice.receiver_type || 'all',
        is_important: notice.is_important || false,
      });

      // 기존 첨부파일 정보 설정 (배열로 처리)
      if (notice.attachment_name && notice.attachment_url) {
        setCurrentAttachments([
          {
            id: 'current-1',
            name: notice.attachment_name,
            url: notice.attachment_url,
          },
        ]);
      } else {
        setCurrentAttachments([]);
      }
      setNewFiles([]);
      setFilesToRemove([]);
    }
  }, [notice]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const filesWithIds = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      name: file.name,
    }));
    setNewFiles(prev => [...prev, ...filesWithIds]);
  };

  const handleRemoveCurrentFile = fileId => {
    setFilesToRemove(prev => [...prev, fileId]);
    setCurrentAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const handleRemoveNewFile = fileId => {
    setNewFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // 기본 폼 데이터 추가
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // 파일 처리
      if (filesToRemove.length > 0) {
        // 삭제할 파일들 (현재는 1개만 지원하므로 전체 삭제)
        formDataToSend.append('remove_attachment', 'true');
      }

      // 새 파일들 추가 (현재 백엔드는 1개만 지원하므로 첫 번째만)
      if (newFiles.length > 0) {
        formDataToSend.append('attachment', newFiles[0].file);
      }

      const response = await noticeService.updateNotice(notice.id, formDataToSend);
      if (response.success) {
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      alert('수정 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">공지사항 수정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">받는사람</label>
            <select
              name="receiver_type"
              value={formData.receiver_type}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="center">센터별</option>
              <option value="role">직급별</option>
              <option value="team">팀별</option>
            </select>
          </div>

          {/* 첨부파일 섹션 */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">첨부파일</label>

            {/* 기존 파일들 표시 */}
            {currentAttachments.map(file => (
              <div key={file.id} className="mb-3 p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">현재 파일:</span>
                    <span className="ml-2 text-sm font-medium">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCurrentFile(file.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {/* 새 파일들 표시 */}
            {newFiles.map(file => (
              <div key={file.id} className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-blue-600">새 파일:</span>
                    <span className="ml-2 text-sm font-medium">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(file.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}

            {/* 파일 입력 */}
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <p className="text-xs text-gray-500 mt-1">
              지원 형식: PDF, Word, Excel, PowerPoint, 텍스트, 이미지 파일
            </p>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_important"
                checked={formData.is_important}
                onChange={handleChange}
                className="mr-2"
              />
              중요 공지
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEditModal;
