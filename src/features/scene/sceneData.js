// 전시장 모델, 경로, 패널, 포스터 설명용 정적 데이터 모음
export { posterInfoByImage } from './posterInfo.js';

// CNU TV 스크린: GLB 경로 → { 썸네일 이미지, YouTube ID }
export const tvScreenMap = {
  'models/TVs/TV_CNU1_Screen.glb': {
    imageSrc: 'imgs/Thumbnail/thumb_52yXsZbhpfA.webp',
    youtubeId: '52yXsZbhpfA',
  },
  // 'models/TVs/TV_CNU2_Screen.glb': {
  //   imageSrc: 'imgs/Thumbnail/thumb_5Fc9BvkS6a8.webp',
  //   youtubeId: '5Fc9BvkS6a8',
  // },
};

export const tvItems = [
  { id: 'tv-cnu1', src: 'models/TVs/TV_CNU1.glb' },
  { id: 'tv-side', src: 'models/TVs/TV_Side.glb' },
];

export const npcItems = [
  { id: 'S1B1', x: -1.8625, z: -31.492,  rotY: -90, boothName: '범용 인공지능 연구센터',    vrm: 'npc/npc.vrm' },
  { id: 'S1B2', x: -1.8625, z: -25.9935, rotY: -90, boothName: '초지능연구센터',            vrm: 'npc/npc.vrm' },
  { id: 'S1B3', x:  1.8603, z: -25.9923, rotY:  90, boothName: '스마트ICT융합인재양성센터', vrm: 'npc/npc.vrm' },
  { id: 'S1B4', x:  1.8603, z: -31.4944, rotY:  90, boothName: '지능화혁신G5-AICT연구센터', vrm: 'npc/npc.vrm' },
  { id: 'S1B5', x: -7.6637, z: -31.7873, rotY:  90, boothName: '스마트ICT융합인재양성센터', vrm: 'npc/npc.vrm' },
  { id: 'S1B6', x: -7.4632, z: -27.449,  rotY:  61.985, boothName: '지능화혁신G5-AICT연구센터', vrm: 'npc/npc.vrm' },
  { id: 'S1B7', x: -7.6637, z: -20.7867, rotY:  90, boothName: '경남지능화혁신사업단',      vrm: 'npc/npc.vrm' },
];
export const assetItems = [
  { id: 'ceiling', src: 'models/Ceiling.glb' },
  { id: 'ceilingPanels', src: 'models/CeilingPanels.glb' },
  { id: 'Walls', src: 'models/Walls.glb' },
  { id: 'floor', src: 'models/Floor.glb' },
  { id: 'carpet', src: 'models/Carpet.glb' },
  { id: 'booths', src: 'models/WholeBooth.glb' },
  { id: 'navmesh', src: 'models/NavMesh_WholeMap.glb' },
  { id: 'navmeshMovable', src: 'models/NavMesh_Movable.glb' },
  { id: 'minimapFloorArea', src: 'models/MinimapMesh_FloorArea.glb' },
  { id: 'PV_NextGenAI', src: 'models/Panels/Panel_Vertical_NextGenAI.glb' },
  { id: 'PV_AI_Platform', src: 'models/Panels/Panel_Vertical_AI_Platform_Service.glb' },
  { id: 'PV_Bio_Healthcare', src: 'models/Panels/Panel_Vertical_Bio_Healthcare.glb' },
  { id: 'PV_Cloud_Security', src: 'models/Panels/Panel_Vertical_Cloud_Security.glb' },
  { id: 'PV_Communications_Satellite', src: 'models/Panels/Panel_Vertical_Communications_Satellite.glb' },
  { id: 'PV_ICT_Industry', src: 'models/Panels/Panel_Vertical_ICT_Industry.glb' },
  { id: 'PV_ImmersiveSW', src: 'models/Panels/Panel_Vertical_ImmersiveSW.glb' },
  { id: 'PV_Quantum_Tech', src: 'models/Panels/Panel_Vertical_Quantum_Technology.glb' },
  { id: 'PV_Robot_Mobility', src: 'models/Panels/Panel_Vertical_Robot_Mobility.glb' },
  { id: 'PV_Semiconductor', src: 'models/Panels/Panel_Vertical_Semiconductor.glb' },
  { id: 'PU_NextGenAI', src: 'models/Panels/Panel_Upper_NextGenAI.glb' },
  { id: 'PU_AI_Platform', src: 'models/Panels/Panel_Upper_AI_Platform_Service.glb' },
  { id: 'PU_Bio_Healthcare', src: 'models/Panels/Panel_Upper_Bio_Healthcare.glb' },
  { id: 'PU_Cloud_Security', src: 'models/Panels/Panel_Upper_Cloud_Security.glb' },
  { id: 'PU_Communications_Satellite', src: 'models/Panels/Panel_Upper_Communications_Satellite.glb' },
  { id: 'PU_ICT_Industry', src: 'models/Panels/Panel_Upper_ICT_Industry.glb' },
  { id: 'PU_ImmersiveSW', src: 'models/Panels/Panel_Upper_ImmersiveSW.glb' },
  { id: 'PU_Quantum_Tech', src: 'models/Panels/Panel_Upper_Quantum_Technology.glb' },
  { id: 'PU_Robot_Mobility', src: 'models/Panels/Panel_Upper_Robot_Mobility.glb' },
  { id: 'PU_Semiconductor', src: 'models/Panels/Panel_Upper_Semiconductor.glb' },
];

export const demoRouteOptions = [
  {
    key: 'iot',
    label: 'IoT',
    color: '#dc2626',
    booths: [
      { id: 'S2B2', target: { x: -2.9259, y: 0, z: -9.9768 } },
      { id: 'S2B5', target: { x: 2.8874, y: 0, z: -9.9791 } },
      { id: 'S5B2', target: { x: 7.1178, y: 0, z: -9.9763 } },
    ],
  },
  {
    key: 'metaverse',
    label: '메타버스',
    color: '#16a34a',
    booths: [
      { id: 'S3B5', target: { x: -6.6612, y: 0, z: 3.0684 } },
      { id: 'S3B6', target: { x: -6.6612, y: 0, z: 8.5669 } },
      { id: 'S3B7', target: { x: -6.6612, y: 0, z: 14.069 } },
      { id: 'S9B1', target: { x: -19.8544, y: 0, z: 9.8886 } },
    ],
  },
  {
    key: 'robot',
    label: '로봇',
    color: '#2563eb',
    booths: [
      { id: 'S6B5', target: { x: 17.1636, y: 0, z: 4.5881 } },
      { id: 'S6B6', target: { x: 17.1636, y: 0, z: 10.0866 } },
      { id: 'S7B7', target: { x: 17.1636, y: 0, z: 21.0615 } },
      { id: 'S7B8', target: { x: 17.1636, y: 0, z: 26.56 } },
      { id: 'S7B9', target: { x: 17.1636, y: 0, z: 32.0654 } },
    ],
  },
  {
    key: 'semiconductor',
    label: '반도체',
    color: '#9333ea',
    booths: [
      { id: 'S1B1', target: { x: -2.9259, y: 0, z: -31.492 } },
      { id: 'S1B2', target: { x: -2.9259, y: 0, z: -25.9935 } },
      { id: 'S1B6', target: { x: -6.6612, y: 0, z: -26.2887 } },
    ],
  },
  {
    key: 'bigdata',
    label: '빅데이터',
    color: '#f59e0b',
    booths: [
      { id: 'S3B1', target: { x: -2.9259, y: 0, z: 5.6764 } },
      { id: 'S3B2', target: { x: -2.9259, y: 0, z: 11.1749 } },
      { id: 'S4B1', target: { x: -2.9259, y: 0, z: 21.0815 } },
      { id: 'S4B2', target: { x: -2.9259, y: 0, z: 26.5704 } },
    ],
  },
  {
    key: 'ai',
    label: '인공지능',
    color: '#ec4899',
    booths: [
      { id: 'S1B2', target: { x: -2.9259, y: 0, z: -25.9935 } },
      { id: 'S1B6', target: { x: -6.6612, y: 0, z: -26.2887 } },
      { id: 'S1B7', target: { x: -6.6612, y: 0, z: -20.7867 } },
      { id: 'S6B3', target: { x: 12.8674, y: 0, z: 11.1831 } },
    ],
  },
  {
    key: 'security',
    label: '보안',
    color: '#0ea5e9',
    booths: [
      { id: 'S1B3', target: { x: 2.8874, y: 0, z: -25.9923 } },
      { id: 'S1B4', target: { x: 2.8874, y: 0, z: -31.4944 } },
      { id: 'S2B7', target: { x: -6.6612, y: 0, z: -9.8009 } },
    ],
  },
  {
    key: 'cloud',
    label: '클라우드',
    color: '#14b8a6',
    booths: [
      { id: 'S1B4', target: { x: 2.8874, y: 0, z: -31.4944 } },
      { id: 'S5B5', target: { x: 12.8674, y: 0, z: -9.9787 } },
      { id: 'S6B4', target: { x: 12.8674, y: 0, z: 5.6811 } },
    ],
  },
];

export const verticalPanels = [
  { model: '#PV_NextGenAI', texture: 'imgs/Panels/Vertical/Panel_Vertical_NextGenAI.webp' },
  { model: '#PV_AI_Platform', texture: 'imgs/Panels/Vertical/Panel_Vertical_AI_Platform.webp' },
  { model: '#PV_Bio_Healthcare', texture: 'imgs/Panels/Vertical/Panel_Vertical_Bio_Healthcare.webp' },
  { model: '#PV_Cloud_Security', texture: 'imgs/Panels/Vertical/Panel_Vertical_Cloud_Security.webp' },
  { model: '#PV_Communications_Satellite', texture: 'imgs/Panels/Vertical/Panel_Vertical_Communications_Satellite.webp' },
  { model: '#PV_ICT_Industry', texture: 'imgs/Panels/Vertical/Panel_Vertical_ICT_Industry.webp' },
  { model: '#PV_ImmersiveSW', texture: 'imgs/Panels/Vertical/Panel_Vertical_ImmersiveSW.webp' },
  { model: '#PV_Quantum_Tech', texture: 'imgs/Panels/Vertical/Panel_Vertical_Quantum_Tech.webp' },
  { model: '#PV_Robot_Mobility', texture: 'imgs/Panels/Vertical/Panel_Vertical_Robot_Mobility.webp' },
  { model: '#PV_Semiconductor', texture: 'imgs/Panels/Vertical/Panel_Vertical_Semiconductor.webp' },
];

export const upperPanels = [
  { model: '#PU_NextGenAI', texture: 'imgs/Panels/Upper/Panel_Upper_NextGenAI.webp' },
  { model: '#PU_AI_Platform', texture: 'imgs/Panels/Upper/Panel_Upper_AI_Platform.webp' },
  { model: '#PU_Bio_Healthcare', texture: 'imgs/Panels/Upper/Panel_Upper_Bio_Healthcare.webp' },
  { model: '#PU_Cloud_Security', texture: 'imgs/Panels/Upper/Panel_Upper_Cloud_Security.webp' },
  { model: '#PU_Communications_Satellite', texture: 'imgs/Panels/Upper/Panel_Upper_Communications_Satellite.webp' },
  { model: '#PU_ICT_Industry', texture: 'imgs/Panels/Upper/Panel_Upper_ICT_Industry.webp' },
  { model: '#PU_ImmersiveSW', texture: 'imgs/Panels/Upper/Panel_Upper_ImmersiveSW.webp' },
  { model: '#PU_Quantum_Tech', texture: 'imgs/Panels/Upper/Panel_Upper_Quantum_Tech.webp' },
  { model: '#PU_Robot_Mobility', texture: 'imgs/Panels/Upper/Panel_Upper_Robot_Mobility.webp' },
  { model: '#PU_Semiconductor', texture: 'imgs/Panels/Upper/Panel_Upper_Semiconductor.webp' },
];

export const categoryMap = {
  'models/Posters/AI_Bigdata/AI_Bigdata_B1P1.glb': 'imgs/Posters/S1B1P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B1P2.glb': 'imgs/Posters/S1B1P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B1P3.glb': 'imgs/Posters/S1B1P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B1P4.glb': 'imgs/Posters/S1B1P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B1P5.glb': 'imgs/Posters/S1B1P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B2P1.glb': 'imgs/Posters/S1B2P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B2P2.glb': 'imgs/Posters/S1B2P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B2P3.glb': 'imgs/Posters/S1B2P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B2P4.glb': 'imgs/Posters/S1B2P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B2P5.glb': 'imgs/Posters/S1B2P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B3P1.glb': 'imgs/Posters/S1B3P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B3P2.glb': 'imgs/Posters/S1B3P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B3P3.glb': 'imgs/Posters/S1B3P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B3P4.glb': 'imgs/Posters/S1B3P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B3P5.glb': 'imgs/Posters/S1B3P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B4P1.glb': 'imgs/Posters/S1B4P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B4P2.glb': 'imgs/Posters/S1B4P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B4P3.glb': 'imgs/Posters/S1B4P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B4P4.glb': 'imgs/Posters/S1B4P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B4P5.glb': 'imgs/Posters/S1B4P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B5P1.glb': 'imgs/Posters/S1B5P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B5P2.glb': 'imgs/Posters/S1B5P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B5P3.glb': 'imgs/Posters/S1B5P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B5P4.glb': 'imgs/Posters/S1B5P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B5P5.glb': 'imgs/Posters/S1B5P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B6P1.glb': 'imgs/Posters/S1B6P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B6P2.glb': 'imgs/Posters/S1B6P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B6P3.glb': 'imgs/Posters/S1B6P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B6P4.glb': 'imgs/Posters/S1B6P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B6P5.glb': 'imgs/Posters/S1B6P5.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B7P1.glb': 'imgs/Posters/S1B7P1.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B7P2.glb': 'imgs/Posters/S1B7P2.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B7P3.glb': 'imgs/Posters/S1B7P3.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B7P4.glb': 'imgs/Posters/S1B7P4.webp',
  'models/Posters/AI_Bigdata/AI_Bigdata_B7P5.glb': 'imgs/Posters/S1B7P5.webp',
};
