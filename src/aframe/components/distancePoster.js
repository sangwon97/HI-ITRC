import { THREE, registerOnce } from '../core.js';
import { registerPosterMesh } from '../utils/posterRegistry.js';
import { posterInfoByImage } from '../../features/scene/sceneData.js';

const imageCache = new Map();
const materialCache = new Map();
const placeholderMaterial = new THREE.MeshBasicMaterial({
  color: 0x666666,
  side: THREE.FrontSide,
});
const posterPreviewPlateColor = 0x7dd3fc;

function isMobileTextureProfile() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
}

function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function createScaledTexture(image, sceneEl, maxDimension) {
  const mobileProfile = isMobileTextureProfile();
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(
    sceneEl.renderer?.capabilities?.getMaxAnisotropy?.() ?? 1,
    mobileProfile || maxDimension <= 128 ? 1 : 2,
  );
  return texture;
}

function loadPosterMaterial(src, sceneEl, quality) {
  const cacheKey = `${src}:${quality}`;
  if (materialCache.has(cacheKey)) {
    return materialCache.get(cacheKey);
  }

  const mobileProfile = isMobileTextureProfile();
  const maxDimension = quality === 'high'
    ? (mobileProfile ? 512 : 1024)
    : (mobileProfile ? 64 : 128);
  const promise = loadImage(src).then((image) => {
    const texture = createScaledTexture(image, sceneEl, maxDimension);
    return new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      side: THREE.FrontSide,
    });
  });

  materialCache.set(cacheKey, promise);
  return promise;
}

function ensurePosterPreviewPlate(node) {
  if (node.userData.posterPreviewPlate || !node.geometry) return;

  const plate = new THREE.Mesh(
    node.geometry,
    new THREE.MeshBasicMaterial({
      color: posterPreviewPlateColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.52,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );

  plate.visible = false;
  plate.renderOrder = 7;
  plate.scale.setScalar(1.08);
  plate.position.z = -0.012;
  plate.userData.isPosterPreviewPlate = true;

  node.add(plate);
  node.userData.posterPreviewPlate = plate;
}

registerOnce('distance-poster', {
  schema: {
    rig: { type: 'selector' },
    model: { type: 'string' },
    texture: { type: 'string' },
    anchorX: { type: 'number', default: 0 },
    anchorZ: { type: 'number', default: 0 },
    nearDistance: { type: 'number', default: 8 },
    checkInterval: { type: 'number', default: 250 },
  },

  init() {
    this.posterInfo = posterInfoByImage[this.data.texture];
    this._lastCheck = 0;
    this._quality = 'placeholder';
    this._loadToken = 0;
    this._meshNodes = [];
    this._anchor = { x: this.data.anchorX, z: this.data.anchorZ };
    this._onModelLoaded = this.handleModelLoaded.bind(this);
    this.el.addEventListener('model-loaded', this._onModelLoaded);
    this.el.setAttribute('gltf-model', this.data.model);
  },

  handleModelLoaded() {
    const mesh = this.el.getObject3D('mesh');
    if (!mesh) return;

    const posterMetadata = {
      title: this.posterInfo?.title || '포스터 안내',
      description: this.posterInfo?.description || '포스터 상세 설명입니다.',
      imageSrc: this.data.texture,
    };

    this._meshNodes = [];
    mesh.traverse((node) => {
      if (!node.isMesh || node.userData.isPosterFrame || node.userData.isPosterPreviewPlate) return;
      node.userData.posterInfo = posterMetadata;
      registerPosterMesh(node, posterMetadata);
      ensurePosterPreviewPlate(node);
      this._meshNodes.push(node);
    });

    // Use the actual poster model position in world space so quality switches
    // based on the poster the user is standing near, not a guessed booth anchor.
    mesh.updateMatrixWorld(true);
    const worldBounds = new THREE.Box3().setFromObject(mesh);
    if (!worldBounds.isEmpty()) {
      const center = new THREE.Vector3();
      worldBounds.getCenter(center);
      this._anchor = { x: center.x, z: center.z };
    }

    this.applyQuality(this._quality);
  },

  applyMaterial(material) {
    this._meshNodes.forEach((node) => {
      node.material = material;
    });
  },

  applyQuality(quality) {
    this._quality = quality;
    if (!this._meshNodes.length) return;

    if (quality === 'placeholder') {
      this.applyMaterial(placeholderMaterial);
      return;
    }

    const loadToken = ++this._loadToken;
    loadPosterMaterial(this.data.texture, this.el.sceneEl, quality)
      .then((material) => {
        if (loadToken !== this._loadToken || this._quality !== quality) return;
        this.applyMaterial(material);
      })
      .catch((error) => {
        console.error('[distance-poster] 텍스처 로드 실패:', error);
      });
  },

  tick(time) {
    if (time - this._lastCheck < this.data.checkInterval) return;
    this._lastCheck = time;

    const rig = this.data.rig?.object3D;
    if (!rig) return;

    const anchor = this._anchor || { x: this.data.anchorX, z: this.data.anchorZ };
    const distance = Math.hypot(rig.position.x - anchor.x, rig.position.z - anchor.z);
    const nextQuality = distance <= this.data.nearDistance ? 'high' : 'low';
    if (nextQuality !== this._quality) {
      this.applyQuality(nextQuality);
    }
  },

  remove() {
    this.el.removeEventListener('model-loaded', this._onModelLoaded);
  },
});
