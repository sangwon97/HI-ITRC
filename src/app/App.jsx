import React, { useEffect, useRef, useState } from 'react';
import { assetItems, demoRouteOptions, npcItems, tvItems, upperPanels, verticalPanels } from '../features/scene/sceneData.js';
import VideoViewer from '../features/videoViewer/VideoViewer.jsx';
import SplashScreen from '../features/entryGate/SplashScreen.jsx';
import WelcomeModal from '../features/entryGate/WelcomeModal.jsx';
import InfoPanel from '../features/infoPanel/InfoPanel.jsx';
import MiniMap from '../features/minimap/MiniMap.jsx';
import VirtualJoystick from '../features/mobileControls/VirtualJoystick.jsx';
import PosterModal from '../features/posterViewer/PosterModal.jsx';
import NpcModal from '../features/npcViewer/NpcModal.jsx';
import SearchPanel from '../features/search/SearchPanel.jsx';

const boothNameGeneratorAttr = `
  csvUrl: BoothName_PosRot.csv;
  charLimit: 16;
  planeWidth: 3.0;
  planeHeight: 1.5;
  fontSizePx: 40
`;

const assetMarkup = [...assetItems, ...tvItems]
  .map(({ id, src }) => `<a-asset-item id="${id}" src="${src}"></a-asset-item>`)
  .join('');

const verticalMarkup = verticalPanels
  .map(
    ({ model, texture }) => `
      <a-entity
        gltf-model="${model}"
        category-texture="src: ${texture}; rig: #rig; nearDistance: 12; checkInterval: 250"
        position="0 0 0">
      </a-entity>`,
  )
  .join('');

const upperMarkup = upperPanels
  .map(
    ({ model, texture }) => `
      <a-entity
        gltf-model="${model}"
        category-texture="src: ${texture}; rig: #rig; nearDistance: 12; checkInterval: 250"
        position="0 0 0">
      </a-entity>`,
  )
  .join('');

const tvMarkup = tvItems
  .map(({ id }) => `<a-entity gltf-model="#${id}" position="0 0 0"></a-entity>`)
  .join('');

const sceneMarkup = `
  <a-scene background="color: #4a4a5a" renderer="colorManagement: true; antialias: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920;" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
    <a-assets>
      ${assetMarkup}
    </a-assets>

    <a-entity booth-name-generator="${boothNameGeneratorAttr}"></a-entity>
    <a-entity poster-picker="camera: #player-camera; rig: #rig; maxDistance: 8"></a-entity>
    <a-entity npc-picker="camera: #player-camera; rig: #rig; maxDistance: 5"></a-entity>
    <a-entity tv-picker="camera: #player-camera; rig: #rig; maxDistance: 15"></a-entity>
    <a-entity tv-screen-manager></a-entity>

    <a-entity gltf-model="#ceiling"></a-entity>
    <a-entity gltf-model="#ceilingPanels"></a-entity>
    <a-entity id="walls-map" gltf-model="#Walls"></a-entity>
    <a-entity gltf-model="#floor"></a-entity>
    <a-entity gltf-model="#carpet"></a-entity>
    <a-entity gltf-model="#booths"></a-entity>
    <a-entity id="navmesh-whole" gltf-model="#navmesh" visible="false"></a-entity>
    <a-entity id="minimap-floor-map" gltf-model="#minimapFloorArea" visible="false"></a-entity>
    <a-entity id="navmesh-movable" gltf-model="#navmeshMovable" visible="false"></a-entity>
    <a-entity
      id="route-visualizer"
      a-star-route="navmesh: #navmesh-movable; rig: #rig; active: false; color: #ffffff; targetsJson: []; viaJson: []; startPoint: -4.79 0 -38.41; lineWidth: 0.34">
    </a-entity>

    ${verticalMarkup}
    ${upperMarkup}
    ${tvMarkup}

    <a-entity category-manager></a-entity>

    <a-entity
      id="rig"
      position="-4.79 1.6 -38.41"
      rotation="0 180 0"
      camera-relative-wasd="camera: #player-camera; acceleration: 6.8"
      navmesh-follow="navmesh: #navmesh-whole; walls: #walls-map; height: 1.6">
      <a-entity id="player-camera" camera look-controls="magicWindowTrackingEnabled: false" show-position></a-entity>
    </a-entity>

    ${npcItems.map(({ id, x, z, rotY, boothName, vrm }) => `
    <a-entity
      vrm-model="src: ${vrm}; boothId: ${id}; npcName: ${boothName} 안내원; npcGreeting: 안녕하세요! 저는 ${boothName}의 안내원입니다. 궁금하신 점이 있으시면 언제든지 말씀해 주세요."
      position="${x} 0 ${z}"
      scale="1.1 1.1 1.1"
      rotation="0 ${rotY} 0">
    </a-entity>`).join('')}
  </a-scene>
`;

function focusSceneCanvas() {
  document.activeElement?.blur?.();
  window.requestAnimationFrame(() => {
    const canvas = document.querySelector('a-scene canvas');
    canvas?.focus?.();
    window.focus();
  });
}

// 상단 카테고리 동선 선택 패널 본문
function RoutePanelContent({ activePath, onTogglePath }) {
  const chipListRef = useRef(null);

  useEffect(() => {
    const activeChip = chipListRef.current?.querySelector('.route-chip.active');
    activeChip?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activePath]);

  return (
    <div id="utility-tab-content" className="route-content">
      <p className="route-guide-copy">클릭하면 로드맵을 볼 수 있어요!</p>
      <div ref={chipListRef} className="route-chip-list">
        {demoRouteOptions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`route-chip ${key} ${activePath === key ? 'active' : ''}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onTogglePath(key);
              focusSceneCanvas();
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const Scene = React.memo(function Scene() {
  return <div className="scene-host" dangerouslySetInnerHTML={{ __html: sceneMarkup }} />;
});

// 오늘 하루 팝업 숨김 여부 키
function getTodayDismissKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const date = `${today.getDate()}`.padStart(2, '0');
  return `itrc-welcome-dismissed-${year}-${month}-${date}`;
}

// CSV 텍스트의 행 단위 객체 변환
function parseCsvRows(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim());

  return lines
    .map((line) => line.split(','))
    .filter((columns) => columns.length === headers.length)
    .map((columns) =>
      Object.fromEntries(headers.map((header, index) => [header, columns[index].trim()])),
    );
}

export default function App() {
  // 'welcome' → 'loading' → 'ready'
  const [sceneStage, setSceneStage] = useState(() =>
    window.localStorage.getItem(getTodayDismissKey()) ? 'loading' : 'welcome',
  );
  const [splashProgress, setSplashProgress] = useState(0);
  const [activePath, setActivePath] = useState(null);
  const [activeUtilityTab, setActiveUtilityTab] = useState('map');
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [activeInfoItemId, setActiveInfoItemId] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [selectedTv, setSelectedTv] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(true);
  const [searchEntries, setSearchEntries] = useState([]);
  const [searchCoordinateMap, setSearchCoordinateMap] = useState({});
  const [miniMapRoute, setMiniMapRoute] = useState({
    active: false,
    points: [],
    targetPoints: [],
    color: '#ffffff',
  });

  useEffect(() => {
    // 선택 카테고리 기준 A* 로드맵 데이터 갱신
    const routeEntity = document.getElementById('route-visualizer');
    if (!routeEntity) return;

    const selectedRoute = demoRouteOptions.find(({ key }) => key === activePath);

    if (!selectedRoute) {
      routeEntity.setAttribute('a-star-route', 'active', false);
      return;
    }

    routeEntity.setAttribute('a-star-route', 'active', true);
    routeEntity.setAttribute('a-star-route', 'color', selectedRoute.color);
    routeEntity.setAttribute(
      'a-star-route',
      'targetsJson',
      JSON.stringify(selectedRoute.booths.map(({ target }) => target)),
    );
  }, [activePath]);

  useEffect(() => {
    // 브라우저 전체화면 상태 동기화
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // A-Frame 포스터 클릭 이벤트와 React 모달 상태 연결
    const handlePosterSelect = (event) => {
      setSelectedPoster(event.detail);
    };

    window.addEventListener('poster-select', handlePosterSelect);
    return () => window.removeEventListener('poster-select', handlePosterSelect);
  }, []);

  useEffect(() => {
    const handleNpcSelect = (event) => setSelectedNpc(event.detail);
    window.addEventListener('npc-select', handleNpcSelect);
    return () => window.removeEventListener('npc-select', handleNpcSelect);
  }, []);

  useEffect(() => {
    const handleTvSelect = (event) => setSelectedTv(event.detail);
    window.addEventListener('tv-select', handleTvSelect);
    return () => window.removeEventListener('tv-select', handleTvSelect);
  }, []);

  useEffect(() => {
    // 로드맵 경로와 미니맵 상태 연결
    const handleRouteUpdated = (event) => {
      setMiniMapRoute({
        active: Boolean(event.detail?.active),
        points: Array.isArray(event.detail?.points) ? event.detail.points : [],
        targetPoints: Array.isArray(event.detail?.targetPoints) ? event.detail.targetPoints : [],
        color: event.detail?.color || '#ffffff',
      });
    };

    window.addEventListener('route-updated', handleRouteUpdated);
    return () => window.removeEventListener('route-updated', handleRouteUpdated);
  }, []);

  useEffect(() => {
    // loading 단계: 진행 바 시뮬레이션 + 모든 GLB model-loaded 감지 후 전환
    if (sceneStage !== 'loading') return;

    let progressValue = 0;
    let finished = false;

    const finishLoading = () => {
      if (finished) return;
      finished = true;
      setSplashProgress(100);
      window.setTimeout(() => setSceneStage('ready'), 300);
    };

    const progressTimer = window.setInterval(() => {
      progressValue = Math.min(progressValue + (progressValue < 72 ? 6 : 3), 94);
      setSplashProgress(progressValue);
    }, 90);

    const fallbackTimer = window.setTimeout(finishLoading, 30000);

    const attachSceneListener = () => {
      const scene = document.querySelector('a-scene');
      if (!scene) return false;

      const onSceneLoaded = () => {
        let pending = 0;
        let renderStarted = false;
        const trackedEls = new Set();

        const tryFinish = () => {
          if (pending > 0 || !renderStarted) return;
          requestAnimationFrame(() => requestAnimationFrame(() => finishLoading()));
        };

        const trackEntity = (el) => {
          if (trackedEls.has(el)) return;
          trackedEls.add(el);
          if (el.getObject3D('mesh')) return; // 이미 로드 완료
          pending++;
          const onDone = () => { pending--; tryFinish(); };
          el.addEventListener('model-loaded', onDone, { once: true });
          el.addEventListener('model-error', onDone, { once: true });
        };

        // 정적 gltf-model 엔티티 추적
        Array.from(document.querySelectorAll('[gltf-model]')).forEach(trackEntity);

        // renderstart 후 tvScreenManager 등이 동적 생성한 엔티티도 추적
        scene.addEventListener('renderstart', () => {
          renderStarted = true;
          window.setTimeout(() => {
            Array.from(document.querySelectorAll('[gltf-model]')).forEach(trackEntity);
            tryFinish();
          }, 100);
        }, { once: true });
      };

      if (scene.hasLoaded) {
        onSceneLoaded();
      } else {
        scene.addEventListener('loaded', onSceneLoaded, { once: true });
      }
      return true;
    };

    if (!attachSceneListener()) {
      const pollTimer = window.setInterval(() => {
        if (attachSceneListener()) window.clearInterval(pollTimer);
      }, 100);
      return () => {
        window.clearInterval(progressTimer);
        window.clearTimeout(fallbackTimer);
        window.clearInterval(pollTimer);
      };
    }

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [sceneStage]);

  useEffect(() => {
    // 부스 검색용 CSV와 이동 좌표 CSV 로드
    const loadSearchData = async () => {
      try {
        const [boothResponse, coordResponse] = await Promise.all([
          fetch('BoothName_PosRot.csv'),
          fetch('threejs_objects_export.csv'),
        ]);
        const [boothText, coordText] = await Promise.all([boothResponse.text(), coordResponse.text()]);

        const boothRows = parseCsvRows(boothText).map((row) => ({
          objectName: row['Object Name'],
          boothName: row['Booth Name'],
          univName: row['Univ Name'],
        }));

        const coordinateRows = parseCsvRows(coordText);
        const coordinateMap = Object.fromEntries(
          coordinateRows.map((row) => [
            row['Booth Name'],
            {
              x: Number(row['Pos X']),
              z: Number(row['Pos Z']),
              rotationY: Number(row['Rotation Y (Degrees)']),
            },
          ]),
        );

        setSearchEntries(boothRows);
        setSearchCoordinateMap(coordinateMap);
      } catch (error) {
        console.error('Failed to load search data', error);
      } finally {
        setIsSearchLoading(false);
      }
    };

    loadSearchData();
  }, []);

  const handleToggle = (key) => {
    setActivePath((current) => (current === key ? null : key));
  };

  // 페이지 전체화면 전환과 React 오버레이 유지
  const handleFullscreenToggle = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
      focusSceneCanvas();
    } catch (error) {
      console.error('Failed to toggle fullscreen', error);
    }
  };

  // 사이드 메뉴 상세 모달 열기
  const handleOpenInfoItem = (itemId) => {
    setActiveInfoItemId(itemId);
  };

  // 사이드 메뉴 상세 모달 닫기
  const handleCloseInfoModal = () => {
    setActiveInfoItemId(null);
  };

  // 입장하기 → 로딩 단계 전환
  const handleEnterExhibition = () => {
    setSceneStage('loading');
  };

  // 오늘 하루 숨김 + 바로 로딩 단계 전환
  const handleDismissWelcomeToday = () => {
    window.localStorage.setItem(getTodayDismissKey(), 'true');
    setSceneStage('loading');
  };

  // 검색 결과 기준 rig 좌표 이동
  const handleSelectSearchResult = (result) => {
    const destination = searchCoordinateMap[result.objectName];
    const rig = document.getElementById('rig')?.object3D;
    if (!destination || !rig) return;

    rig.position.set(destination.x, rig.position.y, destination.z);
    rig.rotation.y = (destination.rotationY * Math.PI) / 180;
    setSearchQuery('');
    focusSceneCanvas();
  };

  const filteredSearchResults = searchQuery
    ? searchEntries
        .filter(
          (entry) =>
            entry.boothName.includes(searchQuery) || entry.univName.includes(searchQuery),
        )
        .slice(0, 8)
    : [];

  const miniMapSearchMarkers = filteredSearchResults
    .map((entry) => {
      const destination = searchCoordinateMap[entry.objectName];
      if (!destination) return null;

      return {
        x: destination.x,
        z: destination.z,
      };
    })
    .filter(Boolean);

  return (
    <>
      {/* 1단계: welcome 화면 (씬 미마운트) */}
      {sceneStage === 'welcome' && (
        <WelcomeModal
          open={true}
          onEnter={handleEnterExhibition}
          onDismissToday={handleDismissWelcomeToday}
        />
      )}

      {/* 2단계: 로딩 화면 (씬 마운트 시작) */}
      {sceneStage === 'loading' && <SplashScreen progress={splashProgress} />}

      {/* 씬은 loading 이후부터 마운트 */}
      {sceneStage !== 'welcome' && <Scene />}

      {/* 3단계: 전시장 UI (씬 로드 완료 후) */}
      {sceneStage === 'ready' && (
        <>
          <div id="top-utility-row">
            <SearchPanel
              query={searchQuery}
              results={filteredSearchResults}
              isLoading={isSearchLoading}
              onChange={setSearchQuery}
              onSelect={handleSelectSearchResult}
              onClear={() => setSearchQuery('')}
              onFocus={() =>
                setActiveUtilityTab((current) => (current === 'route' ? 'map' : current))
              }
            />
            <div id="utility-tab-shell">
              <div id="utility-tab-list">
                <button
                  type="button"
                  className={`utility-tab ${activeUtilityTab === 'route' ? 'active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearchQuery('');
                    setActiveUtilityTab((current) => (current === 'route' ? null : 'route'));
                  }}
                >
                  로드맵
                </button>
                <button
                  type="button"
                  className={`utility-tab ${activeUtilityTab === 'map' ? 'active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setActiveUtilityTab((current) => (current === 'map' ? null : 'map'))}
                >
                  미니맵
                </button>
              </div>
              {activeUtilityTab === 'route' ? (
                <RoutePanelContent activePath={activePath} onTogglePath={handleToggle} />
              ) : null}
              {activeUtilityTab === 'map' ? (
                <MiniMap route={miniMapRoute} searchMarkers={miniMapSearchMarkers} />
              ) : null}
            </div>
          </div>
          <button
            id="fullscreen-toggle"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleFullscreenToggle}
          >
            {isFullscreen ? '전체화면 닫기' : '전체화면'}
          </button>
          <InfoPanel
            isOpen={isInfoPanelOpen}
            activeItemId={activeInfoItemId}
            isModalOpen={Boolean(activeInfoItemId)}
            onTogglePanel={() => setIsInfoPanelOpen((current) => !current)}
            onOpenItem={handleOpenInfoItem}
            onCloseModal={handleCloseInfoModal}
          />
          <PosterModal poster={selectedPoster} onClose={() => setSelectedPoster(null)} />
          <NpcModal npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
          <VideoViewer tv={selectedTv} onClose={() => setSelectedTv(null)} />
          <VirtualJoystick />
        </>
      )}
    </>
  );
}
