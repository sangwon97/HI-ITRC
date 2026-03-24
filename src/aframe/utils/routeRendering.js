// 로드맵 렌더링 유틸
import { THREE } from '../core.js';

export function clearRouteState(state) {
  state.arrowMarkers.length = 0;
  while (state.routeGroup.children.length > 0) {
    state.routeGroup.remove(state.routeGroup.children[0]);
  }
  state.routeMaterials.forEach((material) => material.dispose());
  state.routeGeometries.forEach((geometry) => geometry.dispose());
  state.routeMaterials.length = 0;
  state.routeGeometries.length = 0;
}

export function renderRoute(state, options) {
  const { points, targetPoints, color, lineWidth, arrowGeometry, pointGeometry } = options;
  clearRouteState(state);
  if (points.length < 2) return;

  const lineMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const pointMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const pointCoreMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  state.routeMaterials.push(lineMaterial, arrowMaterial, pointMaterial, pointCoreMaterial);

  targetPoints.forEach((point) => {
    const ring = new THREE.Mesh(pointGeometry, pointMaterial);
    ring.position.copy(point);
    ring.position.y += 0.03;
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 13;
    state.routeGroup.add(ring);

    const coreGeometry = new THREE.CircleGeometry(0.08, 24);
    const core = new THREE.Mesh(coreGeometry, pointCoreMaterial);
    core.position.copy(point);
    core.position.y += 0.031;
    core.rotation.x = -Math.PI / 2;
    core.renderOrder = 13;
    state.routeGroup.add(core);
    state.routeGeometries.push(coreGeometry);
  });

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const deltaX = end.x - start.x;
    const deltaZ = end.z - start.z;
    const horizontal = Math.abs(deltaX) >= Math.abs(deltaZ);
    const distance = horizontal ? Math.abs(deltaX) : Math.abs(deltaZ);
    if (distance < 0.001) continue;

    const lineGeometry = new THREE.BoxGeometry(
      horizontal ? distance + lineWidth : lineWidth,
      0.035,
      horizontal ? lineWidth : distance + lineWidth,
    );
    const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
    lineMesh.position.set((start.x + end.x) * 0.5, Math.max(start.y, end.y), (start.z + end.z) * 0.5);
    lineMesh.renderOrder = 11;
    state.routeGroup.add(lineMesh);
    state.routeGeometries.push(lineGeometry);

    const direction = new THREE.Vector3(horizontal ? Math.sign(deltaX) : 0, 0, horizontal ? 0 : Math.sign(deltaZ));
    const arrowSpacing = 1.8;
    const arrowCount = Math.max(1, Math.floor(distance / arrowSpacing));

    for (let arrowIndex = 0; arrowIndex < arrowCount; arrowIndex += 1) {
      const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
      arrowMesh.position.copy(start);
      arrowMesh.position.y = Math.max(start.y, end.y) + 0.02;
      arrowMesh.rotation.set(
        0,
        horizontal ? (direction.x > 0 ? 0 : Math.PI) : direction.z > 0 ? -Math.PI / 2 : Math.PI / 2,
        0,
      );
      arrowMesh.renderOrder = 12;
      state.routeGroup.add(arrowMesh);
      state.arrowMarkers.push({
        mesh: arrowMesh,
        start,
        direction,
        distance,
        offset: (arrowIndex / arrowCount) * distance,
      });
    }
  }
}

export function updateArrowMarkers(arrowMarkers, speed, time) {
  const seconds = (time || 0) * 0.001 * speed;
  arrowMarkers.forEach(({ mesh, start, direction, distance, offset }) => {
    const progress = (seconds + offset) % distance;
    mesh.position.set(start.x + direction.x * progress, mesh.position.y, start.z + direction.z * progress);
  });
}
