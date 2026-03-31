import { registerOnce } from '../core.js';

const proximityNpcInstances = new Set();

function buildNpcAttribute(data) {
  return [
    `src: ${data.src}`,
    `boothId: ${data.boothId}`,
    `npcName: ${data.npcName}`,
    `npcGreeting: ${data.npcGreeting}`,
    `pauseOutsideViewport: ${data.pauseOutsideViewport}`,
  ].join('; ');
}

function getTopPriorityInstances(rigPosition, maxActive) {
  return Array.from(proximityNpcInstances)
    .map((instance) => {
      const entityPosition = instance.el.object3D?.position;
      if (!entityPosition) return null;

      return {
        instance,
        distanceSq: rigPosition.distanceToSquared(entityPosition),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.distanceSq - right.distanceSq)
    .slice(0, maxActive)
    .map(({ instance }) => instance);
}

registerOnce('proximity-npc', {
  schema: {
    rig: { type: 'selector' },
    src: { type: 'string' },
    boothId: { type: 'string', default: '' },
    npcName: { type: 'string', default: 'NPC' },
    npcGreeting: { type: 'string', default: '안녕하세요! 전시장에 오신 것을 환영합니다.' },
    loadDistance: { type: 'number', default: 18 },
    unloadDistance: { type: 'number', default: 24 },
    checkInterval: { type: 'number', default: 500 },
    maxActive: { type: 'int', default: 0 },
    billboardDistance: { type: 'number', default: 22 },
    pauseOutsideViewport: { type: 'boolean', default: false },
  },

  init() {
    this.isLoaded = false;
    this.lastCheck = 0;
    proximityNpcInstances.add(this);
  },

  isWithinMobileBudget(rigPosition) {
    if (!this.data.maxActive || this.data.maxActive <= 0) return true;

    return getTopPriorityInstances(rigPosition, this.data.maxActive).includes(this);
  },

  unloadModel() {
    this.el.removeAttribute('npc-model');
    this.el.removeObject3D('npc');
    this.isLoaded = false;
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
    const shouldBeActive = distanceSq <= loadDistanceSq && this.isWithinMobileBudget(rigPosition);

    if (!this.isLoaded && shouldBeActive) {
      this.el.setAttribute('npc-model', buildNpcAttribute(this.data));
      this.isLoaded = true;
      return;
    }

    if (this.isLoaded && (!shouldBeActive || distanceSq >= unloadDistanceSq)) {
      this.unloadModel();
    }
  },

  remove() {
    proximityNpcInstances.delete(this);
    if (!this.isLoaded) return;
    this.unloadModel();
  },
});
