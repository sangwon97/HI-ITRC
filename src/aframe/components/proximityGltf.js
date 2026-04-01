import { registerOnce } from '../core.js';

registerOnce('proximity-gltf', {
  schema: {
    rig: { type: 'selector' },
    src: { type: 'string' },
    loadDistance: { type: 'number', default: 24 },
    unloadDistance: { type: 'number', default: 30 },
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
      this.el.setAttribute('gltf-model', this.data.src);
      this.isLoaded = true;
      return;
    }

    if (this.isLoaded && distanceSq >= unloadDistanceSq) {
      this.el.removeAttribute('gltf-model');
      this.el.removeObject3D('mesh');
      this.isLoaded = false;
    }
  },

  remove() {
    if (!this.isLoaded) return;
    this.el.removeAttribute('gltf-model');
    this.el.removeObject3D('mesh');
    this.isLoaded = false;
  },
});
