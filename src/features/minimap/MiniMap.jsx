import React, { useEffect, useRef } from 'react';
import { drawMiniMapFrame } from './utils.js';

const MINIMAP_BOUNDS = {
  minX: -24.299,
  maxX: 17.1636,
  minZ: -31.7873,
  maxZ: 32.0701,
};

// 미니맵 표시
export default function MiniMap({ route, searchMarkers }) {
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const THREE = window.THREE;
    if (!canvas || !ctx || !THREE) return undefined;

    let frameId = 0;
    let disposed = false;

    // 플레이어 위치와 시야각의 매 프레임 재렌더링
    const draw = () => {
      if (disposed) return;

      const rig = document.getElementById('rig')?.object3D;
      const camera = document.getElementById('player-camera')?.object3D;
      let heading = null;

      if (camera) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        if (forward.lengthSq() > 1e-6) {
          forward.normalize();
          heading = Math.atan2(-forward.z, forward.x);
        }
      }

      drawMiniMapFrame(ctx, {
        canvas,
        bounds: MINIMAP_BOUNDS,
        playerPosition: rig?.position || null,
        heading,
        route,
        searchMarkers,
        backgroundImage: backgroundImageRef.current,
      });

      frameId = window.requestAnimationFrame(draw);
    };

    if (!backgroundImageRef.current) {
      const minimapImage = new Image();
      minimapImage.src = 'imgs/minimap.png';
      backgroundImageRef.current = minimapImage;
    }

    draw();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [route, searchMarkers]);

  return (
    <div id="utility-tab-content" className="mini-map-content">
      <canvas ref={canvasRef} width="240" height="320" />
    </div>
  );
}
