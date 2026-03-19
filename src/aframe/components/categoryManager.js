import { registerOnce } from '../core.js';
import { categoryMap, npcItems } from '../../features/scene/sceneData.js';

const boothAnchorMap = new Map(npcItems.map(({ id, x, z }) => [id, { x, z }]));

registerOnce('category-manager', {
  init() {
    Object.entries(categoryMap).forEach(([glbPath, imgPath]) => {
      const boothIdMatch = imgPath.match(/(S\d+B\d+)P\d+\.webp$/);
      const boothId = boothIdMatch?.[1] ?? null;
      const anchor = boothId ? boothAnchorMap.get(boothId) : null;
      const panelEntity = document.createElement('a-entity');
      panelEntity.setAttribute('position', '0 0 0');
      panelEntity.setAttribute(
        'distance-poster',
        `rig: #rig; model: ${glbPath}; texture: ${imgPath}; anchorX: ${anchor?.x ?? 0}; anchorZ: ${anchor?.z ?? 0}; nearDistance: 8; checkInterval: 250`,
      );
      this.el.appendChild(panelEntity);
    });
  },
});
