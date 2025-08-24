import { useEffect, useState } from 'react';
import { noticeService } from '../services/noticeService';
import NoticeCreateModal from './NoticeCreateModal';
import { useNavigate } from 'react-router-dom';

const NoticePage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('전체');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const goToNoticeDetail = id => {
    navigate(`/notice/${id}`);
  };

  // 공지사항 목록 조회
  const fetchNotices = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await noticeService.getNotices({
        page,
        limit: 10,
        searchType,
        search: search.trim(),
      });

      if (response.success) {
        setNotices(response.data.notices);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setError(response.message || '공지사항을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('공지사항 조회 오류:', err);
      setError('서버와의 연결에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchNotices(1, '');
  }, []);

  // 검색 실행
  const handleSearch = () => {
    fetchNotices(1, searchTerm);
  };

  // 페이지 변경
  const handlePageChange = page => {
    fetchNotices(page, searchTerm);
  };

  // 날짜 포맷팅
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 모달 열기
  const handleCreateNotice = () => {
    setIsCreateModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  // 공지사항 등록 성공 후 처리
  const handleCreateSuccess = () => {
    // 목록 새로고침 (현재 페이지, 검색어 유지)
    fetchNotices(pagination.currentPage, searchTerm);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pt-0 px-6 pb-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">공지사항을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="max-w-7xl mx-auto pt-0 px-6 pb-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">오류가 발생했습니다</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={() => fetchNotices(1, '')}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-0 px-6 pb-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 py-0">
          <h2 className="text-xl font-extrabold text-gray-800">알림/공지</h2>
          <div className="text-sm text-gray-600">
            총 {pagination.totalItems}건 (페이지 {pagination.currentPage}/{pagination.totalPages})
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="flex gap-4 items-center w-full max-w-3xl">
            <select
              className="border border-gray-300 rounded-md p-2 text-sm"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              <option value="전체">전체</option>
              <option value="제목">제목</option>
              <option value="내용">내용</option>
            </select>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // 폼 전송 막기
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              검색
            </button>
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">등록된 공지사항이 없습니다.</div>
        ) : (
          <>
            <table className="min-w-full text-sm text-gray-700 border">
              <thead className="bg-gray-100 text-center [&>tr>th]:align-middle">
                <tr>
                  <th className="px-4 py-2 border w-[8%]"></th>
                  <th className="px-4 py-2 border w-[47%]">제목</th>
                  <th className="px-4 py-2 border w-[12%]">작성자</th>
                  <th className="px-4 py-2 border w-[10%]">조회수</th>
                  <th className="px-4 py-2 border w-[15%]">작성일</th>
                  <th className="px-4 py-2 border w-[8%]">첨부</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice, index) => (
                  <tr key={notice.id} className="border-t hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-2 border text-center">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 border" onClick={() => goToNoticeDetail(notice.id)}>
                      <div className="flex items-center gap-2">
                        {notice.is_important && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            중요
                          </span>
                        )}
                        <span className={notice.is_important ? 'font-semibold' : ''}>
                          {notice.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border text-center">사용자{notice.sender_id}</td>
                    <td className="px-4 py-2 border text-center">{notice.view_count || 0}</td>
                    <td className="px-4 py-2 border text-center">{formatDate(notice.createdAt)}</td>
                    <td className="px-4 py-2 border text-center">
                      {notice.attachment_url && <span className="text-blue-600">📎</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이징 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* 공지사항 작성 모달 */}
      <NoticeCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />

      {/* 공지사항 작성 버튼 - 우측 하단 */}
      <div className="flex justify-end mt-4 mb-0">
        <button
          onClick={handleCreateNotice}
          data-layer="Button"
          data-property-1="Default"
          className="Button w-40 h-11 p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[10px] inline-flex justify-center items-center gap-2.5 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-transparent before:to-transparent before:pointer-events-none"
        >
          <div
            data-layer="Primary Button"
            className="PrimaryButton justify-start text-white text-sm font-medium font-['Nunito'] leading-normal drop-shadow-xl"
          >
            공지사항 작성
          </div>
        </button>
      </div>
    </div>
  );
};

export default NoticePage;
