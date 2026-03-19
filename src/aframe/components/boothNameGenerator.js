// 부스명 생성
import { THREE, registerOnce } from '../core.js';

registerOnce('booth-name-generator', {
  schema: {
    csvUrl: { type: 'string', default: 'BoothName_PosRot.csv' },
    charLimit: { type: 'int', default: 5 },
    planeWidth: { type: 'number', default: 3.0 },
    planeHeight: { type: 'number', default: 1.5 },
    fontSizePx: { type: 'number', default: 120 },
  },
  init() {
    const start = () => {
      const scene = this.el.sceneEl;
      const maxAnisotropy = scene.renderer.capabilities.getMaxAnisotropy();

      const wrapLines = (text, limit) => {
        const lines = [];
        for (let i = 0; i < text.length; i += limit) {
          lines.push(text.substring(i, i + limit));
        }
        return lines;
      };

      const createTextTexture = (text) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.font = `bold ${this.data.fontSizePx}px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const lines = wrapLines(text, this.data.charLimit);
        const lineHeight = this.data.fontSizePx * 1.3;
        let startY = canvas.height / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;

        lines.forEach((line) => {
          ctx.fillText(line, canvas.width / 2, startY);
          startY += lineHeight;
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = maxAnisotropy;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };

      fetch(this.data.csvUrl)
        .then((response) => response.text())
        .then((csvText) => {
          const lines = csvText.split('\n');
          for (let i = 1; i < lines.length; i += 1) {
            const parts = lines[i].trim().split(',');
            if (parts.length < 6) continue;

            const textEl = document.createElement('a-entity');
            textEl.setAttribute('position', {
              x: Number.parseFloat(parts[1]),
              y: Number.parseFloat(parts[2]),
              z: Number.parseFloat(parts[3]),
            });
            textEl.setAttribute('rotation', {
              x: 0,
              y: Number.parseFloat(parts[4]),
              z: 0,
            });

            const geometry = new THREE.PlaneGeometry(this.data.planeWidth, this.data.planeHeight);
            const material = new THREE.MeshBasicMaterial({
              map: createTextTexture(parts[5].trim()),
              transparent: true,
              alphaTest: 0.1,
              side: THREE.DoubleSide,
            });

            textEl.setObject3D('mesh', new THREE.Mesh(geometry, material));
            this.el.appendChild(textEl);
          }
        });
    };

    if (this.el.sceneEl?.renderer) {
      start();
    } else {
      this.el.sceneEl?.addEventListener('renderstart', start, { once: true });
    }
  },
});
