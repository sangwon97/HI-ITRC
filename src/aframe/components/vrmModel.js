// VRM 캐릭터 로더 컴포넌트
// THREE.Cache를 활성화해 동일 파일은 네트워크에서 1번만 다운로드
import { MeshoptDecoder } from 'meshoptimizer';
import { THREE, registerOnce } from '../core.js';
import { registerNpcMesh } from '../utils/npcRegistry.js';

THREE.Cache.enabled = true;

registerOnce('vrm-model', {
  schema: {
    src: { type: 'string' },
    headOffset: { type: 'number', default: 0 },
    npcName: { type: 'string', default: 'NPC' },
    npcGreeting: { type: 'string', default: '안녕하세요! 전시장에 오신 것을 환영합니다.' },
    boothId: { type: 'string', default: '' },
  },

  init() {
    const GLTFLoader = THREE.GLTFLoader;
    if (!GLTFLoader) {
      console.error('[vrm-model] THREE.GLTFLoader를 찾을 수 없습니다.');
      return;
    }

    const VRMLoaderPlugin = window.THREE_VRM?.VRMLoaderPlugin;
    if (!VRMLoaderPlugin) {
      console.error('[vrm-model] window.THREE_VRM.VRMLoaderPlugin를 찾을 수 없습니다.');
      return;
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder?.(MeshoptDecoder);
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      this.data.src,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          console.error('[vrm-model] VRM 데이터를 찾을 수 없습니다.');
          return;
        }

        vrm.scene.rotation.y = Math.PI;

        const humanoid = vrm.humanoid;
        if (humanoid) {
          const leftArm   = humanoid.getRawBoneNode('leftUpperArm');
          const rightArm  = humanoid.getRawBoneNode('rightUpperArm');
          const leftFore  = humanoid.getRawBoneNode('leftLowerArm');
          const rightFore = humanoid.getRawBoneNode('rightLowerArm');
          const d = THREE.MathUtils.degToRad;
          if (leftArm)  { leftArm.rotation.z  =  d(75); leftArm.rotation.x  = d(6); }
          if (rightArm) { rightArm.rotation.z  = -d(75); rightArm.rotation.x = d(6); }
          if (leftFore)  { leftFore.rotation.x  = d(8);  leftFore.rotation.z  = -d(4); }
          if (rightFore) { rightFore.rotation.x = d(8);  rightFore.rotation.z =  d(4); }
          this._chest = humanoid.getRawBoneNode('upperChest') || humanoid.getRawBoneNode('chest');
        }

        const npcInfo = {
          npcName: this.data.npcName,
          npcGreeting: this.data.npcGreeting,
          boothId: this.data.boothId,
        };
        vrm.scene.traverse((node) => {
          if (node.isMesh) registerNpcMesh(node, npcInfo);
        });

        this.el.setObject3D('vrm', vrm.scene);
        this.vrm = vrm;
      },
      undefined,
      (error) => {
        console.error('[vrm-model] 로드 실패:', error);
      },
    );
  },

  tick(time) {
    if (!this._chest) return;
    // 약 4초 주기의 미세한 가슴 팽창으로 호흡감 연출
    this._chest.rotation.x = Math.sin(time * 0.00157) * 0.018;
  },

  remove() {
    if (this.vrm) {
      this.el.removeObject3D('vrm');
      this.vrm = null;
    }
  },
});
