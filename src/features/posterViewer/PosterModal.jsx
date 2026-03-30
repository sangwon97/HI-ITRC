import React, { useEffect, useState } from 'react';

// 포스터 상세 모달
export default function PosterModal({ poster, onClose, immersive = false }) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  useEffect(() => {
    setIsInfoVisible(false);
  }, [poster?.imageSrc]);

  if (!poster) return null;

  if (immersive) {
    return (
      <div id="poster-mobile-viewer" role="dialog" aria-modal="true">
        <div
          id="poster-mobile-stage"
          className={isInfoVisible ? 'info-visible' : ''}
          onClick={() => setIsInfoVisible((current) => !current)}
        >
          <img src={poster.imageSrc} alt={poster.title} />
          <button
            type="button"
            id="poster-mobile-close"
            aria-label="포스터 닫기"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
            닫기
          </button>
          <div id="poster-mobile-hint">
            {isInfoVisible ? '화면 클릭 시 이미지가 보입니다.' : '포스터 클릭 시 설명이 보입니다.'}
          </div>
          <div id="poster-mobile-info" aria-hidden={isInfoVisible ? 'false' : 'true'}>
            <h3>{poster.title}</h3>
            <p>{poster.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="poster-modal-backdrop" onClick={onClose}>
      <section
        id="poster-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="poster-modal-media">
          <img src={poster.imageSrc} alt={poster.title} />
        </div>
        <div className="poster-modal-content">
          <h3>{poster.title}</h3>
          <p className="poster-modal-description">{poster.description}</p>
          <button type="button" className="poster-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>
      </section>
    </div>
  );
}
