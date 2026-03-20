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

const MOBILE_SCENE_QUERY = '(max-width: 900px), (pointer: coarse)';
const DESKTOP_RENDERER_ATTR =
  'colorManagement: true; antialias: true; maxCanvasWidth: 1920; maxCanvasHeight: 1920;';
const MOBILE_RENDERER_ATTR =
  'colorManagement: true; antialias: false; precision: mediump; maxCanvasWidth: 1280; maxCanvasHeight: 1280;';
const MOBILE_BASE_ASSET_IDS = new Set([
  'Walls',
  'floor',
  'carpet',
  'booths',
  'navmesh',
  'navmeshMovable',
  'minimapFloorArea',
]);

const boothNameGeneratorAttr = `
  csvUrl: BoothName_PosRot.csv;
  charLimit: 16;
  planeWidth: 3.0;
  planeHeight: 1.5;
  fontSizePx: 40
`;

function matchesMobileSceneProfile() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_SCENE_QUERY).matches;
}

function scheduleDeferredSceneTask(task) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(task, { timeout: 1200 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(task, 450);
  return () => window.clearTimeout(timeoutId);
}

const buildAssetMarkup = (items) => items
  .map(({ id, src }) => `<a-asset-item id="${id}" src="${src}"></a-asset-item>`)
  .join('');

const buildPanelMarkup = (items) => items
  .map(
    ({ model, texture }) => `
      <a-entity
        gltf-model="${model}"
        category-texture="src: ${texture}; rig: #rig; nearDistance: 12; checkInterval: 250"
        position="0 0 0">
      </a-entity>`,
  )
  .join('');

const buildTvMarkup = (items) => items
  .map(({ id }) => `<a-entity gltf-model="#${id}" position="0 0 0"></a-entity>`)
  .join('');

const buildNpcMarkup = (items) => items
  .map(({ id, x, z, rotY, boothName, vrm }) => `
    <a-entity
      vrm-model="src: ${vrm}; boothId: ${id}; npcName: ${boothName} 안내원; npcGreeting: 안녕하세요! 저는 ${boothName}의 안내원입니다. 궁금하신 점이 있으시면 언제든지 말씀해 주세요."
      position="${x} 0 ${z}"
      scale="1.1 1.1 1.1"
      rotation="0 ${rotY} 0">
    </a-entity>`)
  .join('');

const mobileBaseAssets = assetItems.filter(({ id }) => MOBILE_BASE_ASSET_IDS.has(id));
const mobileDeferredAssets = assetItems.filter(({ id }) => !MOBILE_BASE_ASSET_IDS.has(id));
const sharedSceneMarkup = `
    <a-entity booth-name-generator="${boothNameGeneratorAttr}"></a-entity>
    <a-entity poster-picker="camera: #player-camera; rig: #rig; maxDistance: 8"></a-entity>
    <a-entity npc-picker="camera: #player-camera; rig: #rig; maxDistance: 5"></a-entity>
    <a-entity tv-picker="camera: #player-camera; rig: #rig; maxDistance: 15"></a-entity>

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

    <a-entity
      id="rig"
      position="-4.79 1.6 -38.41"
      rotation="0 180 0"
      camera-relative-wasd="camera: #player-camera; acceleration: 6.8; enabled: false"
      navmesh-follow="navmesh: #navmesh-whole; walls: #walls-map; height: 1.6">
      <a-entity
        id="player-camera"
        camera
        look-controls="magicWindowTrackingEnabled: false; touchEnabled: false"
        mobile-touch-look="enabled: true; reverseDrag: false"
        show-position>
      </a-entity>
    </a-entity>
`;

const desktopSceneMarkup = `
  <a-scene background="color: #4a4a5a" renderer="${DESKTOP_RENDERER_ATTR}" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
    <a-assets>
      ${buildAssetMarkup([...assetItems, ...tvItems])}
    </a-assets>

    ${sharedSceneMarkup}
    <a-entity tv-screen-manager></a-entity>
    <a-entity gltf-model="#ceiling"></a-entity>
    <a-entity gltf-model="#ceilingPanels"></a-entity>
    ${buildPanelMarkup(verticalPanels)}
    ${buildPanelMarkup(upperPanels)}
    ${buildTvMarkup(tvItems)}
    <a-entity category-manager></a-entity>
    ${buildNpcMarkup(npcItems)}
  </a-scene>
`;

const mobileBaseSceneMarkup = `
  <a-scene background="color: #4a4a5a" renderer="${MOBILE_RENDERER_ATTR}" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
    <a-assets>
      ${buildAssetMarkup(mobileBaseAssets)}
    </a-assets>

    ${sharedSceneMarkup}
  </a-scene>
`;

const mobilePanelAssetMarkup = buildAssetMarkup(mobileDeferredAssets);
const mobileTvAssetMarkup = buildAssetMarkup(tvItems);
const mobilePanelSceneMarkup = `
  <a-entity id="mobile-deferred-panels-root">
    <a-entity gltf-model="#ceiling"></a-entity>
    <a-entity gltf-model="#ceilingPanels"></a-entity>
    ${buildPanelMarkup(verticalPanels)}
    ${buildPanelMarkup(upperPanels)}
    <a-entity category-manager></a-entity>
  </a-entity>
`;
const mobileTvSceneMarkup = `
  <a-entity id="mobile-deferred-tv-root">
    <a-entity tv-screen-manager></a-entity>
    ${buildTvMarkup(tvItems)}
  </a-entity>
`;
const mobileNpcSceneMarkup = `
  <a-entity id="mobile-deferred-npc-root">
    ${buildNpcMarkup(npcItems)}
  </a-entity>
`;
const DEFAULT_ROUTE_START_POINT = { x: -4.79, y: 0, z: -38.41 };

function getDistance2D(from, to) {
  return Math.hypot((to.x || 0) - (from.x || 0), (to.z || 0) - (from.z || 0));
}

function sortBoothsByNearestOrder(startPoint, booths) {
  const remainingBooths = [...booths];
  const orderedBooths = [];
  let currentPoint = startPoint;

  while (remainingBooths.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = getDistance2D(currentPoint, remainingBooths[0].target);

    for (let index = 1; index < remainingBooths.length; index += 1) {
      const candidateDistance = getDistance2D(currentPoint, remainingBooths[index].target);
      if (candidateDistance < nearestDistance) {
        nearestDistance = candidateDistance;
        nearestIndex = index;
      }
    }

    const [nearestBooth] = remainingBooths.splice(nearestIndex, 1);
    orderedBooths.push(nearestBooth);
    currentPoint = nearestBooth.target;
  }

  return orderedBooths;
}

function focusSceneCanvas() {
  document.activeElement?.blur?.();
  window.requestAnimationFrame(() => {
    const canvas = document.querySelector('a-scene canvas');
    canvas?.focus?.();
    window.focus();
  });
}

function TypingStatusText({ text, stepMs = 280 }) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDotCount((current) => (current >= 3 ? 1 : current + 1));
    }, stepMs);

    return () => window.clearTimeout(timerId);
  }, [dotCount, stepMs]);

  return (
    <p className="mobile-scene-status-line" aria-label={`${text}...`}>
      <span>{text}</span>
      <span className="typing-ellipsis" aria-hidden="true">
        {'.'.repeat(dotCount)}
      </span>
    </p>
  );
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
      <p className="route-guide-copy">선택한 카테고리의 로드맵을 제공해드립니다.</p>
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

const Scene = React.memo(function Scene({ markup }) {
  return <div className="scene-host" dangerouslySetInnerHTML={{ __html: markup }} />;
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
  const [isMobileScene] = useState(() => matchesMobileSceneProfile());
  // 'welcome' → 'loading' → 'ready'
  const [sceneStage, setSceneStage] = useState(() =>
    !isMobileScene && window.localStorage.getItem(getTodayDismissKey()) ? 'loading' : 'welcome',
  );
  const [mobileDeferredStatus, setMobileDeferredStatus] = useState(() =>
    matchesMobileSceneProfile() ? 'idle' : 'complete',
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
  const [routeStartPoint, setRouteStartPoint] = useState(DEFAULT_ROUTE_START_POINT);
  const [miniMapRoute, setMiniMapRoute] = useState({
    active: false,
    points: [],
    targetPoints: [],
    color: '#ffffff',
  });
  const sceneMarkup = isMobileScene ? mobileBaseSceneMarkup : desktopSceneMarkup;
  const isMobileDeferredBlocking =
    isMobileScene && sceneStage === 'ready' && mobileDeferredStatus !== 'complete';
  const isSceneInteractive =
    sceneStage === 'ready' && (!isMobileScene || mobileDeferredStatus === 'complete');

  useEffect(() => {
    const rigEntity = document.getElementById('rig');
    if (!rigEntity) return;

    rigEntity.setAttribute('camera-relative-wasd', 'enabled', isSceneInteractive);
  }, [isSceneInteractive, sceneStage]);

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
    const orderedBooths = sortBoothsByNearestOrder(routeStartPoint, selectedRoute.booths);
    routeEntity.setAttribute(
      'a-star-route',
      'targetsJson',
      JSON.stringify(orderedBooths.map(({ target }) => target)),
    );
    routeEntity.setAttribute(
      'a-star-route',
      'startPoint',
      `${routeStartPoint.x} ${routeStartPoint.y} ${routeStartPoint.z}`,
    );
  }, [activePath, routeStartPoint]);

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

    const progressTimer = isMobileScene
      ? null
      : window.setInterval(() => {
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
        if (progressTimer) window.clearInterval(progressTimer);
        window.clearTimeout(fallbackTimer);
        window.clearInterval(pollTimer);
      };
    }

    return () => {
      if (progressTimer) window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [isMobileScene, sceneStage]);

  useEffect(() => {
    if (!isMobileScene) {
      setMobileDeferredStatus('complete');
      return;
    }

    if (sceneStage !== 'ready') {
      setMobileDeferredStatus('idle');
      return;
    }

    const scene = document.querySelector('a-scene');
    const assets = scene?.querySelector('a-assets');
    if (!scene || !assets) return;

    if (scene.querySelector('#mobile-deferred-npc-root')) {
      setMobileDeferredStatus('complete');
      return;
    }

    let cancelled = false;
    const stageTimers = [];
    const stageDefinitions = [
      {
        rootId: 'mobile-deferred-panels-root',
        status: 'loading-panels',
        assetMarkup: mobilePanelAssetMarkup,
        markup: mobilePanelSceneMarkup,
        nextDelay: 900,
      },
      {
        rootId: 'mobile-deferred-tv-root',
        status: 'loading-tv',
        assetMarkup: mobileTvAssetMarkup,
        markup: mobileTvSceneMarkup,
        nextDelay: 1400,
      },
      {
        rootId: 'mobile-deferred-npc-root',
        status: 'loading-npc',
        assetMarkup: '',
        markup: mobileNpcSceneMarkup,
        nextDelay: 1200,
      },
    ];

    const scheduleStage = (index) => {
      if (cancelled || index >= stageDefinitions.length) return;

      const stage = stageDefinitions[index];
      setMobileDeferredStatus(stage.status);

      if (stage.assetMarkup) {
        assets.insertAdjacentHTML('beforeend', stage.assetMarkup);
      }

      window.requestAnimationFrame(() => {
        if (cancelled || scene.querySelector(`#${stage.rootId}`)) return;

        scene.insertAdjacentHTML('beforeend', stage.markup);

        const nextTimer = window.setTimeout(() => {
          if (cancelled) return;

          if (index === stageDefinitions.length - 1) {
            setMobileDeferredStatus('complete');
            return;
          }

          scheduleStage(index + 1);
        }, stage.nextDelay);

        stageTimers.push(nextTimer);
      });
    };

    const cancelScheduledTask = scheduleDeferredSceneTask(() => {
      if (cancelled) return;
      scheduleStage(0);
    });

    return () => {
      cancelled = true;
      cancelScheduledTask();
      stageTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [isMobileScene, sceneStage]);

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
    const rigPosition = document.getElementById('rig')?.object3D?.position;

    setActivePath((current) => {
      const nextPath = current === key ? null : key;

      if (nextPath && rigPosition) {
        setRouteStartPoint({
          x: rigPosition.x,
          y: 0,
          z: rigPosition.z,
        });
      }

      return nextPath;
    });
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

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredSearchResults = normalizedSearchQuery
    ? searchEntries
        .filter(
          (entry) =>
            String(entry.boothName || '').toLowerCase().includes(normalizedSearchQuery) ||
            String(entry.univName || '').toLowerCase().includes(normalizedSearchQuery) ||
            String(entry.objectName || '').toLowerCase().includes(normalizedSearchQuery),
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
          showDismissToday={!isMobileScene}
          onEnter={handleEnterExhibition}
          onDismissToday={handleDismissWelcomeToday}
        />
      )}

      {/* 2단계: 로딩 화면 (씬 마운트 시작) */}
      {sceneStage === 'loading' && !isMobileScene && (
        <SplashScreen progress={splashProgress} showVideo={!isMobileScene} />
      )}

      {/* 씬은 loading 이후부터 마운트 */}
      {sceneStage !== 'welcome' && <Scene markup={sceneMarkup} />}

      {/* 3단계: 전시장 UI (씬 로드 완료 후) */}
      {sceneStage === 'ready' && (
        <>
          {isMobileDeferredBlocking ? (
            <div id="mobile-scene-status">
              <TypingStatusText text="ITRC 2026 입장중" />
            </div>
          ) : null}
          {isSceneInteractive ? (
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
              {!isMobileScene ? (
                <button
                  id="fullscreen-toggle"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleFullscreenToggle}
                >
                  {isFullscreen ? '전체화면 닫기' : '전체화면'}
                </button>
              ) : null}
              <InfoPanel
                isOpen={isInfoPanelOpen}
                activeItemId={activeInfoItemId}
                isModalOpen={Boolean(activeInfoItemId)}
                isMobile={isMobileScene}
                onTogglePanel={() => setIsInfoPanelOpen((current) => !current)}
                onOpenItem={handleOpenInfoItem}
                onCloseModal={handleCloseInfoModal}
              />
              <PosterModal
                poster={selectedPoster}
                immersive={isMobileScene}
                onClose={() => setSelectedPoster(null)}
              />
              <NpcModal npc={selectedNpc} onClose={() => setSelectedNpc(null)} />
              <VideoViewer tv={selectedTv} onClose={() => setSelectedTv(null)} />
              <VirtualJoystick />
            </>
          ) : null}
        </>
      )}
    </>
  );
}
