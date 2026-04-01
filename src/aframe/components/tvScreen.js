import { THREE, registerOnce } from '../core.js';
import { registerTvMesh } from '../utils/tvRegistry.js';

const UV = {
  uMin: 0.380738,
  uMax: 0.619262,
  vMin: 0.253628,
  vMax: 0.496372,
};

function loadRotatedTexture(src, maxAnisotropy, onLoad) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;

    const repeatX = 1 / (UV.uMax - UV.uMin);
    const repeatY = 1 / (UV.vMax - UV.vMin);
    tex.repeat.set(repeatX, repeatY);
    tex.offset.set(-UV.uMin * repeatX, -UV.vMin * repeatY);

    onLoad(tex);
  };
  img.onerror = () => console.error('[tv-screen] image load failed:', src);
  img.src = src;
}

registerOnce('tv-screen', {
  schema: {
    imageSrc: { type: 'string' },
    youtubeId: { type: 'string' },
  },

  init() {
    this.handleModelLoaded = () => {
      const mesh = this.el.getObject3D('mesh');
      const renderer = this.el.sceneEl?.renderer;
      if (!mesh || !renderer || !this.data.imageSrc) return;

      this.material?.dispose?.();
      this.texture?.dispose?.();
      this.material = null;
      this.texture = null;

      loadRotatedTexture(
        this.data.imageSrc,
        renderer.capabilities.getMaxAnisotropy(),
        (texture) => {
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0xffffff,
            side: THREE.FrontSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -4,
          });

          this.texture = texture;
          this.material = material;

          mesh.traverse((node) => {
            if (!node.isMesh) return;
            const isScreen =
              node.name.includes('Screen') || node.parent?.name?.includes('Screen');
            if (!isScreen) return;
            node.material = material;
            registerTvMesh(node, { youtubeId: this.data.youtubeId });
          });
        },
      );
    };

    this.el.addEventListener('model-loaded', this.handleModelLoaded);
  },

  remove() {
    this.el.removeEventListener('model-loaded', this.handleModelLoaded);
    this.material?.dispose?.();
    this.texture?.dispose?.();
    this.material = null;
    this.texture = null;
  },
});
