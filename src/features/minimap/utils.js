// 미니맵 계산 유틸
function getMiniMapViewport(bounds, canvasWidth, canvasHeight, padding) {
  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxZ - bounds.minZ || 1;
  const scaleX = (canvasWidth - padding * 2) / width;
  const scaleY = (canvasHeight - padding * 2) / height;
  const offsetX = padding;
  const offsetY = padding;

  return {
    width,
    height,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
  };
}

export function projectMiniMapPoint(x, z, bounds, canvasWidth, canvasHeight, padding) {
  const viewport = getMiniMapViewport(bounds, canvasWidth, canvasHeight, padding);

  return {
    x: canvasWidth - (viewport.offsetX + (x - bounds.minX) * viewport.scaleX),
    y: canvasHeight - (viewport.offsetY + (z - bounds.minZ) * viewport.scaleY),
  };
}

export function drawMiniMapFrame(ctx, options) {
  const {
    canvas,
    bounds,
    playerPosition,
    heading,
    route,
    searchMarkers = [],
    backgroundImage = null,
  } = options;
  const padding = 0;
  const viewport = getMiniMapViewport(bounds, canvas.width, canvas.height, padding);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (backgroundImage?.complete && backgroundImage.naturalWidth > 0) {
    ctx.drawImage(
      backgroundImage,
      canvas.width,
      0,
      -canvas.width,
      canvas.height,
    );
  } else {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(22, 34, 61, 0.94)');
    gradient.addColorStop(1, 'rgba(10, 18, 34, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

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
    ctx.strokeStyle = 'rgba(31, 184, 59, 0.92)';
    ctx.lineWidth = 1.5;
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  });

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
    const player = projectMiniMapPoint(
      playerPosition.x,
      playerPosition.z,
      bounds,
      canvas.width,
      canvas.height,
      padding,
    );

    ctx.beginPath();
    ctx.fillStyle = '#ff4d6d';
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.lineWidth = 2;
    ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    if (Number.isFinite(heading)) {
      const radius = 45;
      const spread = 1.5;
      const startAngle = -heading - spread * 0.5;
      const endAngle = -heading + spread * 0.5;

      const glow = ctx.createRadialGradient(player.x, player.y, 4, player.x, player.y, radius);
      glow.addColorStop(0, 'rgba(255, 77, 109, 0.56)');
      glow.addColorStop(0.2, 'rgba(255, 110, 138, 0.42)');
      glow.addColorStop(0.5, 'rgba(255, 148, 166, 0.26)');
      glow.addColorStop(0.76, 'rgba(255, 148, 166, 0.14)');
      glow.addColorStop(1, 'rgba(255, 148, 166, 0)');

      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.arc(player.x, player.y, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = glow;
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(player.x, player.y, 2, player.x, player.y, radius * 0.62);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      innerGlow.addColorStop(0.35, 'rgba(255, 110, 138, 0.18)');
      innerGlow.addColorStop(1, 'rgba(255, 148, 166, 0)');

      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.arc(player.x, player.y, radius * 0.62, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = innerGlow;
      ctx.fill();
    }
  }
}
