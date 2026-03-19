import React, { useEffect, useRef } from 'react';
import { collectTopFacingTriangles, drawMiniMapFrame } from './utils.js';

// 미니맵 표시
export default function MiniMap({ route, searchMarkers }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const THREE = window.THREE;
    if (!canvas || !ctx || !THREE) return undefined;

    let frameId = 0;
    let disposed = false;
    const miniMapData = {
      wholeTriangles: [],
      floorAreaTriangles: [],
      movableTriangles: [],
      bounds: null,
    };

    // 전용 미니맵 레이어 면 데이터 생성
    const collectMap = () => {
      const wholeEntity = document.getElementById('navmesh-whole');
      const floorAreaEntity = document.getElementById('minimap-floor-map');
      const movableEntity = document.getElementById('navmesh-movable');
      const wholeRoot = wholeEntity?.getObject3D('mesh');
      const floorAreaRoot = floorAreaEntity?.getObject3D('mesh');
      const movableRoot = movableEntity?.getObject3D('mesh');
      if (!wholeRoot || !floorAreaRoot || !movableRoot) return false;

      const wholeResult = collectTopFacingTriangles(wholeRoot, THREE);
      const floorAreaResult = collectTopFacingTriangles(floorAreaRoot, THREE);
      const movableResult = collectTopFacingTriangles(movableRoot, THREE);
      if (!wholeResult || !floorAreaResult || !movableResult) return false;

      miniMapData.wholeTriangles = wholeResult.triangles;
      miniMapData.floorAreaTriangles = floorAreaResult.triangles;
      miniMapData.movableTriangles = movableResult.triangles;
      miniMapData.bounds = {
        minX: Math.min(wholeResult.bounds.minX, floorAreaResult.bounds.minX, movableResult.bounds.minX),
        maxX: Math.max(wholeResult.bounds.maxX, floorAreaResult.bounds.maxX, movableResult.bounds.maxX),
        minZ: Math.min(wholeResult.bounds.minZ, floorAreaResult.bounds.minZ, movableResult.bounds.minZ),
        maxZ: Math.max(wholeResult.bounds.maxZ, floorAreaResult.bounds.maxZ, movableResult.bounds.maxZ),
      };
      return true;
    };

    // 플레이어 위치와 시야각의 매 프레임 재렌더링
    const draw = () => {
      if (disposed) return;

      if (!miniMapData.bounds && !collectMap()) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

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
        wholeTriangles: miniMapData.wholeTriangles,
        floorAreaTriangles: miniMapData.floorAreaTriangles,
        movableTriangles: miniMapData.movableTriangles,
        bounds: miniMapData.bounds,
        playerPosition: rig?.position || null,
        heading,
        route,
        searchMarkers,
      });

      frameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [route, searchMarkers]);

  return (
    <div id="utility-tab-content" className="mini-map-content">
      <canvas ref={canvasRef} width="200" height="200" />
    </div>
  );
}
