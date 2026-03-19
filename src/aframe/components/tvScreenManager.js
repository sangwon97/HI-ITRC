// CNU TV 스크린 GLB에 썸네일 이미지를 적용하고 클릭 대상으로 등록하는 컴포넌트.
// categoryManager.js와 동일한 패턴: renderstart 이후 엔티티 동적 생성 → model-loaded → MeshBasicMaterial 신규 생성
import { THREE, registerOnce } from '../core.js';
import { registerTvMesh } from '../utils/tvRegistry.js';
import { tvScreenMap } from '../../features/scene/sceneData.js';

// 이미지를 canvas에 90° 회전 후 CanvasTexture로 반환.
// Screen GLB의 UV가 텍스처 전체가 아닌 일부 영역만 참조하므로
// repeat/offset으로 해당 UV 범위가 이미지 전체에 대응하도록 역산한다.
// U: 0.380738~0.619262 / V: 0.253628~0.496372
const UV = {
  uMin: 0.380738, uMax: 0.619262,
  vMin: 0.253628, vMax: 0.496372,
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
  img.onerror = () => console.error('[tvScreenManager] image load failed:', src);
  img.src = src;
}

registerOnce('tv-screen-manager', {
  init() {
    const start = () => {
      const maxAnisotropy = this.el.sceneEl.renderer.capabilities.getMaxAnisotropy();

      Object.entries(tvScreenMap).forEach(([glbPath, { imageSrc, youtubeId }]) => {
        const screenEntity = document.createElement('a-entity');
        screenEntity.setAttribute('gltf-model', glbPath);
        screenEntity.setAttribute('position', '0 0 0');

        screenEntity.addEventListener('model-loaded', () => {
          const mesh = screenEntity.getObject3D('mesh');
          if (!mesh) return;

          loadRotatedTexture(imageSrc, maxAnisotropy, (tex) => {
            const mat = new THREE.MeshBasicMaterial({
              map: tex,
              color: 0xffffff,
              side: THREE.FrontSide,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -4,
            });

            mesh.traverse((node) => {
              if (!node.isMesh) return;
              const isScreen =
                node.name.includes('Screen') || node.parent?.name?.includes('Screen');
              if (!isScreen) return;
              node.material = mat;
              registerTvMesh(node, { youtubeId });
            });
          });
        });

        this.el.appendChild(screenEntity);
      });
    };

    if (this.el.sceneEl?.renderer) {
      start();
    } else {
      this.el.sceneEl?.addEventListener('renderstart', start, { once: true });
    }
  },
});
