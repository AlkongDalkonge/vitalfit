import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { noticeService } from '../services/noticeService';
import NoticeEditModal from './NoticeEditModal';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 댓글 작성 관련 상태
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 공지사항 상세 조회
  const fetchNotice = async () => {
    try {
      setLoading(true);
      const response = await noticeService.getNoticeById(id);
      if (response.success) {
        setNotice(response.data);
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

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      setCommentLoading(true);
      const response = await noticeService.getComments(id);
      if (response.success) {
        setComments(response.data.comments || []);
      }
    } catch (err) {
      console.error('댓글 조회 오류:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (id) {
      fetchNotice();
      fetchComments();
    }
  }, [id]);

  // 날짜 포맷팅
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // 댓글 작성
  const handleSubmitComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await noticeService.createComment(id, {
        content: newComment.trim(),
        user_id: 1, // TODO: 실제 사용자 ID로 변경
      });

      if (response.success) {
        setNewComment('');
        fetchComments(); // 댓글 목록 새로고침
      }
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async parentId => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const response = await noticeService.createComment(id, {
        content: replyContent.trim(),
        user_id: 1, // TODO: 실제 사용자 ID로 변경
        parent_id: parentId,
      });

      if (response.success) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments(); // 댓글 목록 새로고침
      }
    } catch (err) {
      console.error('대댓글 작성 오류:', err);
      alert('대댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 파일 다운로드
  const handleDownloadFile = async () => {
    try {
      const response = await noticeService.downloadFile(id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = notice.attachment_name || '첨부파일';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('파일 다운로드 오류:', err);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 뒤로가기
  const handleGoBack = () => {
    navigate('/notice');
  };

  // 공지사항 삭제
  const handleDeleteNotice = async () => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await noticeService.deleteNotice(id);
      if (response.success) {
        alert('공지사항이 삭제되었습니다.');
        navigate('/notice');
      } else {
        alert(response.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('공지사항 삭제 오류:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 공지사항 수정
  const handleEditNotice = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchNotice();
  };

  // 댓글 렌더링 (재귀적으로 대댓글도 표시)
  const renderComment = (comment, depth = 0) => {
    const maxDepth = 3;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          {/* 댓글 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">사용자{comment.user_id}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              {depth > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">대댓글</span>
              )}
            </div>
          </div>

          {/* 댓글 내용 */}
          <div className="text-gray-700 mb-3">{comment.content}</div>

          {/* 댓글 액션 */}
          <div className="flex gap-2">
            {depth < maxDepth && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                답글
              </button>
            )}
          </div>

          {/* 대댓글 작성 폼 */}
          {replyingTo === comment.id && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="대댓글을 입력하세요..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  등록
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 대댓글 표시 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">공지사항을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 font-medium">오류가 발생했습니다</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button
            onClick={handleGoBack}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </button>
      </div>

      {/* 공지사항 상세 */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* 공지사항 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {notice?.is_important && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">중요</span>
                )}
                <h1 className="text-2xl font-bold text-gray-800">{notice?.title}</h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>작성자: 사용자{notice?.sender_id}</span>
                <span>
                  받는사람:{' '}
                  {notice?.is_for_all
                    ? '전체'
                    : notice?.receiver_type === 'center'
                      ? '센터별'
                      : notice?.receiver_type === 'role'
                        ? '직급별'
                        : '기타'}
                </span>
                <span>작성일: {formatDate(notice?.createdAt)}</span>
                <span>조회수: {notice?.view_count || 0}</span>
              </div>
            </div>

            {/* 수정/삭제 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleEditNotice}
                className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                수정
              </button>
              <button
                onClick={handleDeleteNotice}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>

        {/* 공지사항 내용 */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {notice?.content}
            </div>
          </div>

          {/* 첨부파일 */}
          {notice?.attachment_url && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">첨부파일</h3>
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {notice?.attachment_name}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* 댓글 헤더 */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">댓글 {comments.length}개</h2>
          </div>

          {/* 댓글 작성 폼 */}
          <div className="p-6 border-b bg-gray-50">
            <form onSubmit={handleSubmitComment}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>

          {/* 댓글 목록 */}
          <div className="p-6">
            {commentLoading ? (
              <div className="text-center py-8 text-gray-500">댓글을 불러오는 중...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">첫 번째 댓글을 작성해보세요!</div>
            ) : (
              <div>{comments.map(comment => renderComment(comment))}</div>
            )}
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      <NoticeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        notice={notice}
      />
    </div>
  );
};

export default NoticeDetailPage;
