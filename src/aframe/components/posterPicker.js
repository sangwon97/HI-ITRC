// 포스터 클릭 감지
import { THREE, registerOnce } from '../core.js';
import { getPosterMeshes } from '../utils/posterRegistry.js';
import { getNpcMeshes } from '../utils/npcRegistry.js';

registerOnce('poster-picker', {
  schema: {
    camera: { type: 'selector' },
    rig: { type: 'selector' },
    maxDistance: { type: 'number', default: 8 },
  },
  init() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._lastTap = null;

    this.handlePick = (event) => {
      this.pick(event.clientX, event.clientY);
    };

    this.handleDoubleTap = (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch) return;
      const now = Date.now();
      const last = this._lastTap;
      if (last && now - last.time < 450 &&
          Math.abs(touch.clientX - last.x) < 35 &&
          Math.abs(touch.clientY - last.y) < 35) {
        this.pick(touch.clientX, touch.clientY);
        this._lastTap = null;
      } else {
        this._lastTap = { time: now, x: touch.clientX, y: touch.clientY };
      }
    };

    // 실제 캔버스 생성 후 이벤트 바인딩
    const bindCanvas = () => {
      this.canvas = this.el.sceneEl?.canvas;
      if (!this.canvas) return;
      this.canvas.addEventListener('dblclick', this.handlePick);
      this.canvas.addEventListener('touchend', this.handleDoubleTap, { passive: true });
    };

    if (this.el.sceneEl?.canvas) {
      bindCanvas();
    } else {
      this.el.sceneEl?.addEventListener('render-target-loaded', bindCanvas, { once: true });
    }
  },
  // 화면 좌표 기준 클릭 포스터 탐색
  getHit(clientX, clientY) {
    const canvas = this.canvas;
    const cameraObject = this.data.camera?.getObject3D('camera') || this.el.sceneEl?.camera;
    if (!canvas || !cameraObject) return null;

    const rect = canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, cameraObject);

    const hits = this.raycaster.intersectObjects(getPosterMeshes(), true);
    const hit = hits.find((item) => item.object?.userData?.posterInfo);
    if (!hit) return null;

    const rigPosition = this.data.rig?.object3D?.position;
    if (rigPosition && hit.point.distanceTo(rigPosition) > this.data.maxDistance) {
      return null;
    }

    return hit;
  },
  // 선택 포스터 정보의 React 전달 (NPC가 더 가까우면 무시)
  pick(clientX, clientY) {
    const hit = this.getHit(clientX, clientY);
    if (!hit) return;

    const npcHits = this.raycaster.intersectObjects(getNpcMeshes(), true);
    const closestNpc = npcHits.find((item) => item.object?.userData?.npcInfo);
    if (closestNpc && closestNpc.distance < hit.distance) return;

    window.dispatchEvent(
      new CustomEvent('poster-select', {
        detail: hit.object.userData.posterInfo,
      }),
    );
  },
  remove() {
    if (!this.canvas) return;
    this.canvas.removeEventListener('dblclick', this.handlePick);
    this.canvas.removeEventListener('touchend', this.handleDoubleTap);
  },
});
