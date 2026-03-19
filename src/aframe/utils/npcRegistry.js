// NPC 클릭 대상 레지스트리
const npcMeshes = new Set();

export function registerNpcMesh(mesh, npcInfo) {
  if (!mesh) return;
  mesh.userData.npcInfo = npcInfo;
  npcMeshes.add(mesh);
}

export function getNpcMeshes() {
  return Array.from(npcMeshes).filter((mesh) => mesh?.parent);
}
