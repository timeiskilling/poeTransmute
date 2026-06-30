import type { TreeNode } from "../types";

export type NodeVisualKind =
  | "normal"
  | "attribute"
  | "notable"
  | "keystone"
  | "mastery"
  | "jewel"
  | "ascendancyStart"
  | "ascendancyNormal"
  | "ascendancyNotable"
  | "classStart";

const CONFIG: Record<
  NodeVisualKind,
  { base: number; min: number; max: number; hit: number }
> = {
  normal: { base: 12, min: 13, max: 190, hit: 24 },
  attribute: { base: 25, min: 13, max: 190, hit: 24 },

  notable: { base: 14, min: 12, max: 210, hit: 34 },
  keystone: { base: 25, min: 17, max: 230, hit: 44 },
  jewel: { base: 25, min: 17, max: 210, hit: 36 },

  ascendancyStart: { base: 12, min: 12, max: 250, hit: 48 },
  ascendancyNormal: { base: 25, min: 17, max: 210, hit: 30 },
  ascendancyNotable: { base: 25, min: 17, max: 210, hit: 48 },

  mastery: { base: 23, min: 17, max: 200, hit: 32 },
  classStart: { base: 31, min: 17, max: 210, hit: 40 },
};

export function getNodeVisualKind(node: TreeNode): NodeVisualKind {
  if (node.isClassStart) return "classStart";
  if (node.isMastery) return "mastery";
  if (node.isAscendancyStart) return "ascendancyStart";
  if (node.isAscendancy)
    return node.isNotable ? "ascendancyNotable" : "ascendancyNormal";
  if (node.isKeystone) return "keystone";
  if (node.isJewelSocket) return "jewel";
  if (node.isNotable) return "notable";
  if (node.isGenericAttribute) return "attribute";

  return "normal";
}

export function getNodeWorldRadius(node: TreeNode): number {
  return CONFIG[getNodeVisualKind(node)].base;
}

export function getNodeScreenRadius(node: TreeNode, zoom: number): number {
  const c = CONFIG[getNodeVisualKind(node)];
  const scaled = c.base * zoom;

  
  
  return scaled < c.min ? c.min : scaled > c.max ? c.max : scaled;
}

export function getNodeHitRadius(node: TreeNode): number {
  return CONFIG[getNodeVisualKind(node)].hit;
}

export function isNodeDrawable(node: TreeNode): boolean {
  return !(
    node.isOnlyImage ||
    node.noRadius ||
    node.isClassStart ||
    node.isMastery
  );
}

export function isNodeImportantAtOverview(node: TreeNode): boolean {
  const kind = getNodeVisualKind(node);
  return (
    kind === "notable" ||
    kind === "keystone" ||
    kind === "jewel" ||
    kind === "ascendancyStart" ||
    kind === "ascendancyNotable"
  );
}
