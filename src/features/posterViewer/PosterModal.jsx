import React from 'react';

// 포스터 상세 모달
export default function PosterModal({ poster, onClose }) {
  if (!poster) return null;

  return (
    <div id="poster-modal-backdrop" onClick={onClose}>
      <section id="poster-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="poster-modal-media">
          <img src={poster.imageSrc} alt={poster.title} />
        </div>
        <div className="poster-modal-content">
          <h3>{poster.title}</h3>
          <p>{poster.description}</p>
          <button type="button" className="poster-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>
      </section>
    </div>
  );
}
