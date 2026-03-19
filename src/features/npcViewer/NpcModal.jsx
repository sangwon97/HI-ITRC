import React, { useState } from 'react';
import { getNpcData } from './npcData.js';

// NPC 클릭 시 표시되는 대화 모달
export default function NpcModal({ npc, onClose }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!npc) return null;

  const centerData = getNpcData(npc.boothId);

  const handleQuestion = (index) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <div id="npc-modal-backdrop" onClick={onClose}>
      <section
        id="npc-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="npc-modal-header">
          <div className="npc-modal-avatar-icon" aria-hidden="true">👤</div>
          <div>
            <p className="npc-modal-name">{npc.npcName}</p>
            <p className="npc-modal-greeting">{npc.npcGreeting}</p>
          </div>
        </div>

        {/* 센터 소개 */}
        {centerData && (
          <div className="npc-modal-intro">
            <h4 className="npc-modal-section-title">센터 소개</h4>
            <p className="npc-modal-intro-text">{centerData.intro}</p>
          </div>
        )}

        {/* 예상 질문 */}
        {centerData && (
          <div className="npc-modal-faq">
            <h4 className="npc-modal-section-title">궁금하신 점이 있으신가요?</h4>
            <ul className="npc-faq-list">
              {centerData.faqs.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className={`npc-faq-question ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => handleQuestion(index)}
                  >
                    {item.question}
                  </button>
                  {activeIndex === index && (
                    <p className="npc-faq-answer">{item.answer}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="npc-modal-close" onClick={onClose}>
          닫기
        </button>
      </section>
    </div>
  );
}
