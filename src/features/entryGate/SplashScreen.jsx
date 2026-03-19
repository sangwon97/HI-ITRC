// 로딩 화면 (입장하기 이후 A-Frame 로딩 중 표시)
import { useRef, useCallback } from 'react';

const VIDEOS = ['videos/splash_video_1.mp4', 'videos/splash_video_2.mp4'];

export default function SplashScreen({ progress }) {
  const indexRef = useRef(0);

  const handleEnded = useCallback((event) => {
    indexRef.current = (indexRef.current + 1) % VIDEOS.length;
    event.target.src = VIDEOS[indexRef.current];
    event.target.play();
  }, []);

  return (
    <div id="splash-screen" role="status" aria-live="polite">
      <video
        className="welcome-bg-video"
        src={VIDEOS[0]}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
      />
      <div className="splash-shell">
        <p className="splash-eyebrow">Virtual Exhibition</p>
        <h1 className="splash-title">ITRC 2026</h1>
        <p className="splash-copy">가상 전시 환경을 준비하고 있습니다.</p>
        <div className="splash-progress-track">
          <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="splash-progress-label">{progress}%</p>
      </div>
    </div>
  );
}
