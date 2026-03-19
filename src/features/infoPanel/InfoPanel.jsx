import React from 'react';
import chevronLeftIcon from '../../assets/icons/chevron-left.svg';
import closeIcon from '../../assets/icons/X.svg';
import menuIcon from '../../assets/icons/menu.svg';
import { infoMenuItems } from './infoContent.js';

// 사이드 안내 패널
export default function InfoPanel({
  isOpen,
  activeItemId,
  isModalOpen,
  isMobile = false,
  onTogglePanel,
  onOpenItem,
  onCloseModal,
}) {
  // 현재 선택 안내 항목 조회
  const activeItem = infoMenuItems.find((item) => item.id === activeItemId) || null;
  const handleOpenItem = (itemId) => {
    onOpenItem(itemId);

    if (isMobile && isOpen) {
      onTogglePanel();
    }
  };

  return (
    <>
      {!isMobile && isOpen ? (
        <div
          id="info-panel-backdrop"
          aria-hidden="true"
          onClick={onTogglePanel}
        />
      ) : null}

      {isMobile ? (
        <div id="info-mobile-menu" className={isOpen ? 'open' : 'closed'}>
          <div id="info-mobile-actions" aria-hidden={!isOpen}>
            {infoMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="info-mobile-action"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleOpenItem(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            id="info-panel-toggle"
            className={`${isOpen ? 'open' : 'closed'} mobile`}
            type="button"
            aria-label={isOpen ? '더보기 메뉴 닫기' : '더보기 메뉴 열기'}
            aria-expanded={isOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onTogglePanel}
          >
            <img
              className="info-mobile-toggle-icon"
              src={isOpen ? closeIcon : menuIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      ) : (
        <>
          <button
            id="info-panel-toggle"
            className={isOpen ? 'open' : 'closed'}
            type="button"
            aria-label={isOpen ? '사이드 메뉴 닫기' : '사이드 메뉴 열기'}
            aria-expanded={isOpen}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onTogglePanel}
          >
            {isOpen ? (
              <img className="info-panel-toggle-icon" src={chevronLeftIcon} alt="" aria-hidden="true" />
            ) : (
              <span className="info-panel-toggle-text">메뉴열기</span>
            )}
          </button>

          <aside id="info-panel" className={isOpen ? 'open' : 'closed'} aria-hidden={!isOpen}>
            <div className="info-panel-header">
              <p className="info-panel-eyebrow">Guide</p>
              <h2 className="info-panel-title">행사 안내</h2>
            </div>
            <div className="info-panel-list">
              {infoMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="info-panel-item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleOpenItem(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {isModalOpen && activeItem ? (
        isMobile ? (
          <div id="info-mobile-viewer" role="dialog" aria-modal="true" aria-labelledby="info-mobile-title">
            <div id="info-mobile-stage">
              <button
                type="button"
                id="info-mobile-close"
                aria-label="안내 화면 닫기"
                onClick={onCloseModal}
              >
                닫기
              </button>
              <section id="info-mobile-sheet">
                <p className="poster-mobile-eyebrow">Guide</p>
                <h3 id="info-mobile-title">{activeItem.title}</h3>
                <div className="info-mobile-body">
                  {activeItem.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div id="info-modal-backdrop" onClick={onCloseModal}>
            <section
              id="info-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="info-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="info-modal-header">
                <h3 id="info-modal-title">{activeItem.title}</h3>
              </div>
              <div className="info-modal-body">
                {activeItem.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="info-modal-footer">
                <button type="button" className="info-modal-close" onClick={onCloseModal}>
                  닫기
                </button>
              </div>
            </section>
          </div>
        )
      ) : null}
    </>
  );
}
