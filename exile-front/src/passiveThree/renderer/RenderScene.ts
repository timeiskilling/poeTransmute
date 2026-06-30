import type { ParsedTree, TreeBounds, TreeNode } from "../types";
import { isNodeDrawable } from "./NodeRenderer";
import { Camera } from "./Camera";
const NODE_MARGIN_PX = 36;
const EDGE_MARGIN_PX = 64;
export class RenderScene {
  public readonly nodes: readonly TreeNode[];
  public readonly nodeIndexById: Map<string, number>;
  public readonly bounds: TreeBounds;
  public readonly mainBounds: TreeBounds;
  public readonly worldX: Float32Array;
  public readonly worldY: Float32Array;
  public readonly screenX: Float32Array;
  public readonly screenY: Float32Array;
  public readonly allocated: Uint8Array;
  public readonly drawable: Uint8Array;
  public readonly nodeVisible: Uint8Array;
  /* * Усі allocated drawable nodes. * Перебудовується лише при updateAllocated(). */ public readonly activeNodeIndices: Int32Array;
  public activeNodeCount = 0;
  /* * Visible allocated nodes для atlas overview overlay. * Заповнюється projectOverviewOverlay(). */ public readonly visibleActiveNodeIndices: Int32Array;
  public visibleActiveNodeCount = 0;
  public readonly edgeFrom: Int32Array;
  public readonly edgeTo: Int32Array;
  public readonly edgeArcX: Float32Array;
  public readonly edgeArcY: Float32Array;
  public readonly edgeRadius: Float32Array;
  public readonly edgeStartAngle: Float32Array;
  public readonly edgeEndAngle: Float32Array;
  public readonly edgeIsNegativeDelta: Uint8Array;
  /* * Conservative world-space bounds edge. * Для arc це bounds повного кола. Це може допустити трохи * зайвих edge у culling, але не відріже видиму дугу. */ public readonly edgeMinX: Float32Array;
  public readonly edgeMaxX: Float32Array;
  public readonly edgeMinY: Float32Array;
  public readonly edgeMaxY: Float32Array;
  public readonly edgeActive: Uint8Array;
  public readonly edgeCount: number;
  /* * Повний список active edges. * Перебудовується тільки при updateAllocated(). */ public readonly activeEdgeIndices: Int32Array;
  public activeEdgeCount = 0;
  public readonly visibleNodeIndices: Int32Array;
  public visibleNodeCount = 0;
  public readonly visibleEdgeIndices: Int32Array;
  public visibleEdgeCount = 0;
  public readonly visibleActiveEdgeIndices: Int32Array;
  public visibleActiveEdgeCount = 0;
  public readonly visibleInactiveEdgeIndices: Int32Array;
  public visibleInactiveEdgeCount = 0;
  constructor(tree: ParsedTree) {
    this.nodes = Array.from(tree.nodes.values());
    this.nodeIndexById = new Map<string, number>();
    this.bounds = copyBounds(tree.bounds);
    this.mainBounds = copyBounds(tree.mainBounds);
    const nodeCount = this.nodes.length;
    this.worldX = new Float32Array(nodeCount);
    this.worldY = new Float32Array(nodeCount);
    this.screenX = new Float32Array(nodeCount);
    this.screenY = new Float32Array(nodeCount);
    this.allocated = new Uint8Array(nodeCount);
    this.drawable = new Uint8Array(nodeCount);
    this.nodeVisible = new Uint8Array(nodeCount);
    this.activeNodeIndices = new Int32Array(nodeCount);
    this.visibleActiveNodeIndices = new Int32Array(nodeCount);
    this.visibleNodeIndices = new Int32Array(nodeCount);
    for (let index = 0; index < nodeCount; index += 1) {
      const node = this.nodes[index];
      this.nodeIndexById.set(node.id, index);
      this.worldX[index] = node.x;
      this.worldY[index] = node.y;
      this.allocated[index] = node.isAllocated ? 1 : 0;
      this.drawable[index] = isNodeDrawable(node) ? 1 : 0;
    }
    const edgeCapacity = tree.edges.length;
    this.edgeFrom = new Int32Array(edgeCapacity);
    this.edgeTo = new Int32Array(edgeCapacity);
    this.edgeArcX = new Float32Array(edgeCapacity);
    this.edgeArcY = new Float32Array(edgeCapacity);
    this.edgeRadius = new Float32Array(edgeCapacity);
    this.edgeStartAngle = new Float32Array(edgeCapacity);
    this.edgeEndAngle = new Float32Array(edgeCapacity);
    this.edgeIsNegativeDelta = new Uint8Array(edgeCapacity);
    this.edgeMinX = new Float32Array(edgeCapacity);
    this.edgeMaxX = new Float32Array(edgeCapacity);
    this.edgeMinY = new Float32Array(edgeCapacity);
    this.edgeMaxY = new Float32Array(edgeCapacity);
    this.edgeActive = new Uint8Array(edgeCapacity);
    this.edgeArcX.fill(Number.NaN);
    this.edgeArcY.fill(Number.NaN);
    let edgeWriteIndex = 0;
    for (
      let sourceIndex = 0;
      sourceIndex < tree.edges.length;
      sourceIndex += 1
    ) {
      const edge = tree.edges[sourceIndex];
      const fromIndex = this.nodeIndexById.get(edge.from);
      const toIndex = this.nodeIndexById.get(edge.to);
      if (fromIndex === undefined || toIndex === undefined) {
        continue;
      }
      this.edgeFrom[edgeWriteIndex] = fromIndex;
      this.edgeTo[edgeWriteIndex] = toIndex;
      const startX = this.worldX[fromIndex];
      const startY = this.worldY[fromIndex];
      const endX = this.worldX[toIndex];
      const endY = this.worldY[toIndex];
      if (edge.arcCenter) {
        const centerX = edge.arcCenter.x;
        const centerY = edge.arcCenter.y;
        const radius = Math.hypot(startX - centerX, startY - centerY);
        this.edgeArcX[edgeWriteIndex] = centerX;
        this.edgeArcY[edgeWriteIndex] = centerY;
        this.edgeRadius[edgeWriteIndex] = radius;
        const startAngle = Math.atan2(startY - centerY, startX - centerX);
        const endAngle = Math.atan2(endY - centerY, endX - centerX);
        this.edgeStartAngle[edgeWriteIndex] = startAngle;
        this.edgeEndAngle[edgeWriteIndex] = endAngle;
        let delta = endAngle - startAngle;
        while (delta <= -Math.PI) {
          delta += Math.PI * 2;
        }
        while (delta > Math.PI) {
          delta -= Math.PI * 2;
        }
        const isNegative = delta < 0;
        this.edgeIsNegativeDelta[edgeWriteIndex] = isNegative ? 1 : 0;

        this.edgeMinX[edgeWriteIndex] = centerX - radius;
        this.edgeMaxX[edgeWriteIndex] = centerX + radius;
        this.edgeMinY[edgeWriteIndex] = centerY - radius;
        this.edgeMaxY[edgeWriteIndex] = centerY + radius;
      } else {
        this.edgeMinX[edgeWriteIndex] = Math.min(startX, endX);
        this.edgeMaxX[edgeWriteIndex] = Math.max(startX, endX);
        this.edgeMinY[edgeWriteIndex] = Math.min(startY, endY);
        this.edgeMaxY[edgeWriteIndex] = Math.max(startY, endY);
      }
      edgeWriteIndex += 1;
    }
    this.edgeCount = edgeWriteIndex;
    this.activeEdgeIndices = new Int32Array(this.edgeCount);
    this.visibleEdgeIndices = new Int32Array(this.edgeCount);
    this.visibleActiveEdgeIndices = new Int32Array(this.edgeCount);
    this.visibleInactiveEdgeIndices = new Int32Array(this.edgeCount);
    this.refreshAllocationIndexes();
  }
  updateAllocated(allocatedHashes: Array<number | string>): void {
    this.allocated.fill(0);
    for (let index = 0; index < allocatedHashes.length; index += 1) {
      const nodeIndex = this.nodeIndexById.get(String(allocatedHashes[index]));
      if (nodeIndex !== undefined) {
        this.allocated[nodeIndex] = 1;
      }
    }
    this.refreshAllocationIndexes();
  }
  getNodeIndex(nodeId: string): number | undefined {
    return this.nodeIndexById.get(nodeId);
  }
  isNodeAllocated(index: number): boolean {
    return this.allocated[index] === 1;
  }
  isEdgeActive(index: number): boolean {
    return this.edgeActive[index] === 1;
  }
  project(camera: Camera, viewportWidth: number, viewportHeight: number): void {
    this.visibleNodeCount = 0;
    this.visibleEdgeCount = 0;
    this.visibleActiveEdgeCount = 0;
    this.visibleInactiveEdgeCount = 0;
    const zoom = camera.zoom;
    const offsetX = camera.x;
    const offsetY = camera.y;
    const nodeMinX = -NODE_MARGIN_PX;
    const nodeMaxX = viewportWidth + NODE_MARGIN_PX;
    const nodeMinY = -NODE_MARGIN_PX;
    const nodeMaxY = viewportHeight + NODE_MARGIN_PX;
    const worldEdgeMargin = EDGE_MARGIN_PX / zoom;
    const viewportLeft = -offsetX / zoom - worldEdgeMargin;
    const viewportRight = (viewportWidth - offsetX) / zoom + worldEdgeMargin;
    const viewportTop = -offsetY / zoom - worldEdgeMargin;
    const viewportBottom = (viewportHeight - offsetY) / zoom + worldEdgeMargin;

    for (let index = 0; index < this.nodes.length; index += 1) {
      
      const screenX = this.worldX[index] * zoom + offsetX;
      const screenY = this.worldY[index] * zoom + offsetY;

      this.screenX[index] = screenX;
      this.screenY[index] = screenY;

      const visible =
        screenX >= nodeMinX &&
        screenX <= nodeMaxX &&
        screenY >= nodeMinY &&
        screenY <= nodeMaxY;

      this.nodeVisible[index] = visible ? 1 : 0;

      if (visible && this.drawable[index] === 1) {
        this.visibleNodeIndices[this.visibleNodeCount] = index;
        this.visibleNodeCount += 1;
      }
    }
    for (let edgeIndex = 0; edgeIndex < this.edgeCount; edgeIndex += 1) {
      if (
        this.edgeMaxX[edgeIndex] < viewportLeft ||
        this.edgeMinX[edgeIndex] > viewportRight ||
        this.edgeMaxY[edgeIndex] < viewportTop ||
        this.edgeMinY[edgeIndex] > viewportBottom
      ) {
        continue;
      }
      this.visibleEdgeIndices[this.visibleEdgeCount] = edgeIndex;
      this.visibleEdgeCount += 1;
      if (this.edgeActive[edgeIndex] === 1) {
        this.visibleActiveEdgeIndices[this.visibleActiveEdgeCount] = edgeIndex;
        this.visibleActiveEdgeCount += 1;
      } else {
        this.visibleInactiveEdgeIndices[this.visibleInactiveEdgeCount] =
          edgeIndex;
        this.visibleInactiveEdgeCount += 1;
      }
    }
  }
  /* * Легкий projection для overview atlas. * * Тут немає обходу всіх tree nodes/edges: * тільки allocated nodes та active rails. */ projectOverviewOverlay(
    camera: Camera,
    viewportWidth: number,
    viewportHeight: number,
  ): void {
    this.visibleActiveNodeCount = 0;
    this.visibleActiveEdgeCount = 0;
    const zoom = camera.zoom;
    const offsetX = camera.x;
    const offsetY = camera.y;
    const nodeMinX = -NODE_MARGIN_PX;
    const nodeMaxX = viewportWidth + NODE_MARGIN_PX;
    const nodeMinY = -NODE_MARGIN_PX;
    const nodeMaxY = viewportHeight + NODE_MARGIN_PX;
    /* * Спочатку проєктуємо всі active nodes. * Це також гарантує screenX/screenY для endpoint active rails, * навіть коли endpoint лежить поза viewport. */ for (
      let activeIndex = 0;
      activeIndex < this.activeNodeCount;
      activeIndex += 1
    ) {
      const nodeIndex = this.activeNodeIndices[activeIndex];
      const screenX = this.worldX[nodeIndex] * zoom + offsetX;
      const screenY = this.worldY[nodeIndex] * zoom + offsetY;
      this.screenX[nodeIndex] = screenX;
      this.screenY[nodeIndex] = screenY;
      const visible =
        screenX >= nodeMinX &&
        screenX <= nodeMaxX &&
        screenY >= nodeMinY &&
        screenY <= nodeMaxY;
      this.nodeVisible[nodeIndex] = visible ? 1 : 0;
      if (visible) {
        this.visibleActiveNodeIndices[this.visibleActiveNodeCount] = nodeIndex;
        this.visibleActiveNodeCount += 1;
      }
    }
    const worldEdgeMargin = EDGE_MARGIN_PX / zoom;
    const viewportLeft = -offsetX / zoom - worldEdgeMargin;
    const viewportRight = (viewportWidth - offsetX) / zoom + worldEdgeMargin;
    const viewportTop = -offsetY / zoom - worldEdgeMargin;
    const viewportBottom = (viewportHeight - offsetY) / zoom + worldEdgeMargin;
    for (
      let activeIndex = 0;
      activeIndex < this.activeEdgeCount;
      activeIndex += 1
    ) {
      const edgeIndex = this.activeEdgeIndices[activeIndex];
      if (
        this.edgeMaxX[edgeIndex] < viewportLeft ||
        this.edgeMinX[edgeIndex] > viewportRight ||
        this.edgeMaxY[edgeIndex] < viewportTop ||
        this.edgeMinY[edgeIndex] > viewportBottom
      ) {
        continue;
      }
      this.visibleActiveEdgeIndices[this.visibleActiveEdgeCount] = edgeIndex;
      this.visibleActiveEdgeCount += 1;
    }
  }
  private refreshAllocationIndexes(): void {
    this.activeNodeCount = 0;
    this.activeEdgeCount = 0;
    for (let nodeIndex = 0; nodeIndex < this.nodes.length; nodeIndex += 1) {
      if (this.allocated[nodeIndex] === 1 && this.drawable[nodeIndex] === 1) {
        this.activeNodeIndices[this.activeNodeCount] = nodeIndex;
        this.activeNodeCount += 1;
      }
    }
    for (let edgeIndex = 0; edgeIndex < this.edgeCount; edgeIndex += 1) {
      const active =
        this.allocated[this.edgeFrom[edgeIndex]] === 1 &&
        this.allocated[this.edgeTo[edgeIndex]] === 1;
      this.edgeActive[edgeIndex] = active ? 1 : 0;
      if (active) {
        this.activeEdgeIndices[this.activeEdgeCount] = edgeIndex;
        this.activeEdgeCount += 1;
      }
    }
  }
}
function copyBounds(bounds: TreeBounds): TreeBounds {
  return {
    minX: bounds.minX,
    maxX: bounds.maxX,
    minY: bounds.minY,
    maxY: bounds.maxY,
  };
}
