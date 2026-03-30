import { registerOnce } from '../core.js';

function buildVrmAttribute(data) {
  return [
    `src: ${data.src}`,
    `boothId: ${data.boothId}`,
    `npcName: ${data.npcName}`,
    `npcGreeting: ${data.npcGreeting}`,
  ].join('; ');
}

registerOnce('proximity-vrm', {
  schema: {
    rig: { type: 'selector' },
    src: { type: 'string' },
    boothId: { type: 'string', default: '' },
    npcName: { type: 'string', default: 'NPC' },
    npcGreeting: { type: 'string', default: '안녕하세요! 전시장에 오신 것을 환영합니다.' },
    loadDistance: { type: 'number', default: 18 },
    unloadDistance: { type: 'number', default: 24 },
    checkInterval: { type: 'number', default: 500 },
  },

  init() {
    this.isLoaded = false;
    this.lastCheck = 0;
  },

  tick(time) {
    if (time - this.lastCheck < this.data.checkInterval) return;
    this.lastCheck = time;

    const rigPosition = this.data.rig?.object3D?.position;
    const entityPosition = this.el.object3D?.position;
    if (!rigPosition || !entityPosition) return;

    const distanceSq = rigPosition.distanceToSquared(entityPosition);
    const loadDistanceSq = this.data.loadDistance * this.data.loadDistance;
    const unloadDistanceSq = this.data.unloadDistance * this.data.unloadDistance;

    if (!this.isLoaded && distanceSq <= loadDistanceSq) {
      this.el.setAttribute('vrm-model', buildVrmAttribute(this.data));
      this.isLoaded = true;
      return;
    }

    if (this.isLoaded && distanceSq >= unloadDistanceSq) {
      this.el.removeAttribute('vrm-model');
      this.el.removeObject3D('vrm');
      this.isLoaded = false;
    }
  },

  remove() {
    if (!this.isLoaded) return;
    this.el.removeAttribute('vrm-model');
    this.el.removeObject3D('vrm');
    this.isLoaded = false;
  },
});
