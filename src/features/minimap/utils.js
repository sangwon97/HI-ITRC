// 미니맵 계산 유틸
export function projectMiniMapPoint(x, z, bounds, canvasWidth, canvasHeight, padding) {
  if (!bounds) return { x: 0, y: 0 };

  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxZ - bounds.minZ || 1;
  const scale = Math.min(
    (canvasWidth - padding * 2) / width,
    (canvasHeight - padding * 2) / height,
  );
  const offsetX = (canvasWidth - width * scale) * 0.5;
  const offsetY = (canvasHeight - height * scale) * 0.5;

  return {
    x: canvasWidth - (offsetX + (x - bounds.minX) * scale),
    y: canvasHeight - (offsetY + (z - bounds.minZ) * scale),
  };
}

// 알파값 재조정 스타일 반환
function overrideStyleAlpha(fillStyle, nextAlpha) {
  return fillStyle.replace(/rgba\((.+),\s*[^,]+\)$/u, `rgba($1, ${nextAlpha})`);
}

// 머티리얼 색상 추출
function getMaterialStyle(material, fallbackAlpha = 1) {
  const sourceMaterial = Array.isArray(material) ? material[0] : material;
  if (!sourceMaterial?.color) {
    return `rgba(148, 163, 184, ${fallbackAlpha})`;
  }

  const color = sourceMaterial.color;
  const alpha = sourceMaterial.transparent
    ? Math.max(0.08, Math.min(sourceMaterial.opacity ?? fallbackAlpha, 1))
    : fallbackAlpha;

  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

export function collectTopFacingTriangles(root, THREE) {
  const triangles = [];
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  };
  let count = 0;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const normal = new THREE.Vector3();

  root.updateWorldMatrix(true, true);
  root.traverse((node) => {
    if (!node.isMesh || !node.geometry?.attributes?.position) return;

    const positions = node.geometry.attributes.position;
    const indexArray = node.geometry.index?.array || null;
    const triangleCount = indexArray ? indexArray.length / 3 : positions.count / 3;
    const fillStyle = getMaterialStyle(node.material);

    for (let i = 0; i < triangleCount; i += 1) {
      const ai = indexArray ? indexArray[i * 3] : i * 3;
      const bi = indexArray ? indexArray[i * 3 + 1] : i * 3 + 1;
      const ci = indexArray ? indexArray[i * 3 + 2] : i * 3 + 2;

      a.fromBufferAttribute(positions, ai);
      b.fromBufferAttribute(positions, bi);
      c.fromBufferAttribute(positions, ci);
      node.localToWorld(a);
      node.localToWorld(b);
      node.localToWorld(c);

      ab.subVectors(b, a);
      ac.subVectors(c, a);
      normal.crossVectors(ab, ac).normalize();

      if (Math.abs(normal.y) < 0.6) continue;

      const triangle = [
        { x: a.x, z: a.z },
        { x: b.x, z: b.z },
        { x: c.x, z: c.z },
      ];
      triangle.fillStyle = fillStyle;
      triangles.push(triangle);
      count += 1;

      triangle.forEach((point) => {
        bounds.minX = Math.min(bounds.minX, point.x);
        bounds.maxX = Math.max(bounds.maxX, point.x);
        bounds.minZ = Math.min(bounds.minZ, point.z);
        bounds.maxZ = Math.max(bounds.maxZ, point.z);
      });
    }
  });

  return count > 0 ? { triangles, bounds } : null;
}

export function drawMiniMapFrame(ctx, options) {
  const {
    canvas,
    wholeTriangles,
    floorAreaTriangles,
    movableTriangles,
    bounds,
    playerPosition,
    heading,
    route,
    searchMarkers = [],
  } = options;
  const padding = 18;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(22, 34, 61, 0.94)');
  gradient.addColorStop(1, 'rgba(10, 18, 34, 0.9)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  wholeTriangles.forEach((triangle) => {
    const p0 = projectMiniMapPoint(triangle[0].x, triangle[0].z, bounds, canvas.width, canvas.height, padding);
    const p1 = projectMiniMapPoint(triangle[1].x, triangle[1].z, bounds, canvas.width, canvas.height, padding);
    const p2 = projectMiniMapPoint(triangle[2].x, triangle[2].z, bounds, canvas.width, canvas.height, padding);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fillStyle = triangle.fillStyle
      ? overrideStyleAlpha(triangle.fillStyle, 0.22)
      : 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  });

  floorAreaTriangles.forEach((triangle) => {
    const p0 = projectMiniMapPoint(triangle[0].x, triangle[0].z, bounds, canvas.width, canvas.height, padding);
    const p1 = projectMiniMapPoint(triangle[1].x, triangle[1].z, bounds, canvas.width, canvas.height, padding);
    const p2 = projectMiniMapPoint(triangle[2].x, triangle[2].z, bounds, canvas.width, canvas.height, padding);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fillStyle = triangle.fillStyle
      ? overrideStyleAlpha(triangle.fillStyle, 0.35)
      : 'rgba(125, 211, 252, 0.90)';
    ctx.fill();
  });

  movableTriangles.forEach((triangle) => {
    const p0 = projectMiniMapPoint(triangle[0].x, triangle[0].z, bounds, canvas.width, canvas.height, padding);
    const p1 = projectMiniMapPoint(triangle[1].x, triangle[1].z, bounds, canvas.width, canvas.height, padding);
    const p2 = projectMiniMapPoint(triangle[2].x, triangle[2].z, bounds, canvas.width, canvas.height, padding);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fillStyle = triangle.fillStyle
      ? overrideStyleAlpha(triangle.fillStyle, 0.5)
      : 'rgba(96, 165, 250, 0.5)';
    ctx.fill();
  });

  // 검색 결과 마커 표시
  searchMarkers.forEach((marker) => {
    const point = projectMiniMapPoint(
      marker.x,
      marker.z,
      bounds,
      canvas.width,
      canvas.height,
      padding,
    );

    ctx.beginPath();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
    ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 1.5;
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 로드맵 경로선 표시
  if (route?.active && Array.isArray(route.points) && route.points.length > 1) {
    ctx.beginPath();
    route.points.forEach((point, index) => {
      const projected = projectMiniMapPoint(
        point.x,
        point.z,
        bounds,
        canvas.width,
        canvas.height,
        padding,
      );
      if (index === 0) {
        ctx.moveTo(projected.x, projected.y);
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    });
    ctx.strokeStyle = route.color || '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    route.targetPoints?.forEach((point) => {
      const projected = projectMiniMapPoint(
        point.x,
        point.z,
        bounds,
        canvas.width,
        canvas.height,
        padding,
      );

      ctx.beginPath();
      ctx.fillStyle = route.color || '#ffffff';
      ctx.arc(projected.x, projected.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (playerPosition) {
    const player = projectMiniMapPoint(playerPosition.x, playerPosition.z, bounds, canvas.width, canvas.height, padding);

    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (Number.isFinite(heading)) {
      const radius = 45;
      const spread = 1.5;
      const startAngle = -heading - spread * 0.5;
      const endAngle = -heading + spread * 0.5;

      const glow = ctx.createRadialGradient(player.x, player.y, 4, player.x, player.y, radius);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
      glow.addColorStop(0.2, 'rgba(219, 234, 254, 0.46)');
      glow.addColorStop(0.5, 'rgba(147, 197, 253, 0.3)');
      glow.addColorStop(0.76, 'rgba(96, 165, 250, 0.18)');
      glow.addColorStop(1, 'rgba(96, 165, 250, 0)');

      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.arc(player.x, player.y, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = glow;
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(player.x, player.y, 2, player.x, player.y, radius * 0.62);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      innerGlow.addColorStop(0.35, 'rgba(224, 242, 254, 0.2)');
      innerGlow.addColorStop(1, 'rgba(186, 230, 253, 0)');

      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.arc(player.x, player.y, radius * 0.62, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = innerGlow;
      ctx.fill();
    }
  }
}
