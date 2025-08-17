import React, { useState, useRef, useCallback } from 'react';

const WebcamCapture = ({ onCapture, onClose }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user', // 전면 카메라 (노트북 웹캠)
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      alert('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 비디오 크기에 맞춰 캔버스 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스에서 이미지 데이터 URL 가져오기
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
  }, []);

  const retakeImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const confirmImage = useCallback(() => {
    if (capturedImage) {
      // Data URL을 File 객체로 변환
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
          onClose();
        });
    }
  }, [capturedImage, onCapture, onClose, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // 컴포넌트 마운트 시 카메라 시작
  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">웹캠으로 사진 찍기</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <div className="space-y-4">
          {!capturedImage ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg"
              />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>카메라 시작 중...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <img
                src={capturedImage}
                alt="촬영된 사진"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-center space-x-3">
            {!capturedImage ? (
              <button
                onClick={captureImage}
                disabled={!isStreaming}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                사진 찍기
              </button>
            ) : (
              <>
                <button
                  onClick={retakeImage}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  다시 찍기
                </button>
                <button
                  onClick={confirmImage}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  사용하기
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {!capturedImage ? '웹캠으로 프로필 사진을 찍어보세요!' : '사진이 마음에 드시나요?'}
          </p>
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default WebcamCapture;
