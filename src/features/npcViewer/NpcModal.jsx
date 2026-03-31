import React, { useEffect, useState } from 'react';
import { getNpcData } from './npcData.js';

// NPC 클릭 시 표시되는 대화 모달
export default function NpcModal({ npc, onClose, isMobile = false }) {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setActiveIndex(null);
  }, [npc?.boothId]);

  if (!npc) return null;

  const centerData = getNpcData(npc.boothId);

  const handleQuestion = (index) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  if (isMobile) {
    const activeFaq = activeIndex != null ? centerData?.faqs?.[activeIndex] : null;

    return (
      <div id="npc-mobile-viewer" role="dialog" aria-modal="true" aria-labelledby="npc-mobile-title">
        <div id="npc-mobile-stage">
          <button
            type="button"
            id="npc-mobile-close"
            aria-label="NPC 도움말 닫기"
            onClick={onClose}
          >
            닫기
          </button>
          <section id="npc-mobile-sheet">
            <div className="npc-mobile-chat-header">
              <h3 id="npc-mobile-title" className="npc-mobile-chat-name">
                {npc.npcName}
              </h3>
            </div>

            <div className="npc-mobile-chat-thread">
              <article className="npc-chat-row npc-chat-row-npc">
                <div className="npc-chat-avatar" aria-hidden="true">NPC</div>
                <div className="npc-chat-bubble npc">
                  <p>{npc.npcGreeting}</p>
                </div>
              </article>

              {centerData ? (
                <article className="npc-chat-row npc-chat-row-npc">
                  <div className="npc-chat-avatar" aria-hidden="true">NPC</div>
                  <div className="npc-chat-bubble npc feature">
                    <p className="npc-chat-bubble-label">센터 소개</p>
                    <p>{centerData.intro}</p>
                  </div>
                </article>
              ) : null}

              {activeFaq ? (
                <>
                  <article className="npc-chat-row npc-chat-row-user">
                    <div className="npc-chat-bubble user">
                      <p>{activeFaq.question}</p>
                    </div>
                  </article>
                  <article className="npc-chat-row npc-chat-row-npc">
                    <div className="npc-chat-avatar" aria-hidden="true">NPC</div>
                    <div className="npc-chat-bubble npc">
                      <p>{activeFaq.answer}</p>
                    </div>
                  </article>
                </>
              ) : null}
            </div>

            {centerData ? (
              <div className="npc-mobile-quick-panel">
                <p className="npc-mobile-quick-title">질문을 선택해 보세요</p>
                <div className="npc-mobile-quick-list">
                  {centerData.faqs.map((item, index) => (
                    <button
                      key={item.question}
                      type="button"
                      className={`npc-mobile-quick-chip ${activeIndex === index ? 'active' : ''}`}
                      onClick={() => handleQuestion(index)}
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    );
  }

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
