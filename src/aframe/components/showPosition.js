// 디버그 좌표 표시
import { THREE, registerOnce } from '../core.js';

registerOnce('show-position', {
  tick() {
    const pos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(pos);
    const ui = document.getElementById('debug-ui');
    if (ui) {
      ui.innerHTML = `X: ${pos.x.toFixed(2)} <br>Y: ${pos.y.toFixed(2)} <br>Z: ${pos.z.toFixed(2)}`;
    }
  },
});
