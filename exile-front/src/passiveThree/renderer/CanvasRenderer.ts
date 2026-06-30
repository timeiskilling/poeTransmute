import type { TreeNode } from "../types";
import { Camera } from "./Camera";
import { RenderScene } from "./RenderScene";
import { PoeTreeSprites } from "./PoeTreeSprites";
import { getNodeScreenRadius, isNodeDrawable } from "./NodeRenderer";

const BACKGROUND_COLOR = "#111217";
const ATLAS_TARGET_PIXEL_RATIO = 2;
const ATLAS_MAX_DIMENSION = 4096;
const ATLAS_MAX_PIXELS = 12_000_000;
const ATLAS_MIN_PIXEL_RATIO = 0.65;
const ATLAS_PADDING_PX = 96;
const FRAME_DETAIL_RADIUS_PX = 3;

const OVERVIEW_ENTER_MULTIPLIER = 1.35;
const OVERVIEW_EXIT_MULTIPLIER = 1.6;
const OVERVIEW_FIT_PADDING = 80;

const NODE_MARGIN_PX = 36;

type RenderMode = "atlas" | "vector";

export interface CanvasRenderInput {
  scene: RenderScene;
  hoveredNodeId?: string | null;
}

export interface CanvasSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: Camera;
  private readonly ctx: CanvasRenderingContext2D;

  private readonly atlasCanvas: HTMLCanvasElement;
  private readonly atlasCtx: CanvasRenderingContext2D;
  private readonly atlasCamera = new Camera();
  private sprites: PoeTreeSprites | null = null;

  private width = 0;
  private height = 0;
  private pixelRatio = 1;

  private renderMode: RenderMode = "atlas";

  private atlasValid = false;
  private atlasScene: RenderScene | null = null;

  private atlasWorldMinX = 0;
  private atlasWorldMaxX = 0;
  private atlasWorldMinY = 0;
  private atlasWorldMaxY = 0;

  private nodeBufferCapacity = 0;

  private allocatedNodeIndices = new Int32Array(0);
  private unallocatedNodeIndices = new Int32Array(0);

  private allocatedJewelIndices = new Int32Array(0);
  private unallocatedJewelIndices = new Int32Array(0);

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.camera = camera;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas 2D context is unavailable");
    }

    this.ctx = context;

    this.atlasCanvas = document.createElement("canvas");

    const atlasContext = this.atlasCanvas.getContext("2d", {
      alpha: true,
    });

    if (!atlasContext) {
      throw new Error("Overview atlas context is unavailable");
    }

    this.atlasCtx = atlasContext;
  }

  setSprites(sprites: PoeTreeSprites | null): void {
    if (this.sprites === sprites) {
      return;
    }

    this.sprites = sprites;
    this.invalidateAtlas();
  }

  getSize(): CanvasSize {
    return {
      width: this.width,
      height: this.height,
      pixelRatio: this.pixelRatio,
    };
  }

  resize(
    width: number,
    height: number,
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
  ): boolean {
    const nextWidth = Math.max(1, Math.round(width));
    const nextHeight = Math.max(1, Math.round(height));
    const nextPixelRatio = Math.max(1, Math.min(pixelRatio, 2));

    const changed =
      nextWidth !== this.width ||
      nextHeight !== this.height ||
      nextPixelRatio !== this.pixelRatio;

    if (!changed) {
      return false;
    }

    this.width = nextWidth;
    this.height = nextHeight;
    this.pixelRatio = nextPixelRatio;

    this.canvas.width = Math.round(nextWidth * nextPixelRatio);
    this.canvas.height = Math.round(nextHeight * nextPixelRatio);

    this.camera.pixelRatio = nextPixelRatio;

    this.invalidateAtlas();

    return true;
  }

  render({ scene, hoveredNodeId = null }: CanvasRenderInput): void {
    if (this.width <= 0 || this.height <= 0) {
      return;
    }

    const mode = this.resolveRenderMode(scene);

    if (mode === "atlas") {
      this.renderOverview(scene, hoveredNodeId);
      return;
    }

    this.renderVectorScene(scene, hoveredNodeId);
  }

  dispose(): void {
    this.invalidateAtlas();

    this.atlasCanvas.width = 1;
    this.atlasCanvas.height = 1;
  }

  private resolveRenderMode(scene: RenderScene): RenderMode {
    this.renderMode = "vector";
    return this.renderMode;
  }

  private renderOverview(
    scene: RenderScene,
    hoveredNodeId: string | null,
  ): void {
    this.ensureAtlas(scene);

    if (!this.atlasValid) {
      this.renderVectorScene(scene, hoveredNodeId);
      return;
    }

    this.clearMainCanvas();

    const ctx = this.ctx;

    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const atlasWorldWidth = this.atlasWorldMaxX - this.atlasWorldMinX;
    const atlasWorldHeight = this.atlasWorldMaxY - this.atlasWorldMinY;

    /*
     * Основний static layer:
     * один drawImage замість тисяч lineTo/arc/stroke.
     */
    ctx.drawImage(
      this.atlasCanvas,
      this.camera.x + this.atlasWorldMinX * this.camera.zoom,
      this.camera.y + this.atlasWorldMinY * this.camera.zoom,
      atlasWorldWidth * this.camera.zoom,
      atlasWorldHeight * this.camera.zoom,
    );

    /*
     * Ключова оптимізація:
     * не scene.project(), який обходить усі nodes/edges.
     * Лише allocated nodes та active rails.
     */
    scene.projectOverviewOverlay(this.camera, this.width, this.height);

    this.drawRailLayer(
      ctx,
      scene,
      scene.visibleActiveEdgeIndices,
      scene.visibleActiveEdgeCount,
      true,
      this.camera,
    );

    this.drawAllocatedOverviewNodes(ctx, scene, this.camera);

    /*
     * Hover може належати непрокачаній ноді.
     * Проєктуємо лише одну ноду вручну, без повного scene.project().
     */
    if (hoveredNodeId !== null) {
      this.drawOverviewHoveredNode(ctx, scene, hoveredNodeId);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private renderVectorScene(
    scene: RenderScene,
    hoveredNodeId: string | null,
  ): void {
    this.clearMainCanvas();

    const ctx = this.ctx;

    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    scene.project(this.camera, this.width, this.height);

    this.drawRailLayer(
      ctx,
      scene,
      scene.visibleInactiveEdgeIndices,
      scene.visibleInactiveEdgeCount,
      false,
      this.camera,
    );

    this.drawRailLayer(
      ctx,
      scene,
      scene.visibleActiveEdgeIndices,
      scene.visibleActiveEdgeCount,
      true,
      this.camera,
    );

    this.drawAllNodes(ctx, scene, hoveredNodeId, this.camera);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private ensureAtlas(scene: RenderScene): void {
    if (this.atlasValid && this.atlasScene === scene) {
      return;
    }

    this.buildAtlas(scene);
  }

  private buildAtlas(scene: RenderScene): void {
    const referenceZoom = this.getOverviewFitZoom(scene);

    if (!Number.isFinite(referenceZoom) || referenceZoom <= 0) {
      this.invalidateAtlas();
      return;
    }

    const bounds = this.getAtlasWorldBounds(scene, referenceZoom);

    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;

    if (
      !Number.isFinite(worldWidth) ||
      !Number.isFinite(worldHeight) ||
      worldWidth <= 0 ||
      worldHeight <= 0
    ) {
      this.invalidateAtlas();
      return;
    }

    const logicalWidth = Math.max(1, worldWidth * referenceZoom);
    const logicalHeight = Math.max(1, worldHeight * referenceZoom);

    const atlasPixelRatio = this.getAtlasPixelRatio(
      logicalWidth,
      logicalHeight,
    );

    if (atlasPixelRatio < ATLAS_MIN_PIXEL_RATIO) {
      this.invalidateAtlas();
      return;
    }

    const physicalWidth = Math.max(
      1,
      Math.round(logicalWidth * atlasPixelRatio),
    );

    const physicalHeight = Math.max(
      1,
      Math.round(logicalHeight * atlasPixelRatio),
    );

    this.atlasCanvas.width = physicalWidth;
    this.atlasCanvas.height = physicalHeight;

    this.atlasWorldMinX = bounds.minX;
    this.atlasWorldMaxX = bounds.maxX;
    this.atlasWorldMinY = bounds.minY;
    this.atlasWorldMaxY = bounds.maxY;

    this.atlasCamera.zoom = referenceZoom;
    this.atlasCamera.x = -bounds.minX * referenceZoom;
    this.atlasCamera.y = -bounds.minY * referenceZoom;
    this.atlasCamera.pixelRatio = atlasPixelRatio;

    const ctx = this.atlasCtx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, physicalWidth, physicalHeight);

    ctx.setTransform(atlasPixelRatio, 0, 0, atlasPixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    scene.project(this.atlasCamera, logicalWidth, logicalHeight);

    this.drawRailLayer(
      ctx,
      scene,
      scene.visibleEdgeIndices,
      scene.visibleEdgeCount,
      false,
      this.atlasCamera,
    );

    this.drawStaticNodes(ctx, scene, this.atlasCamera);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.atlasScene = scene;
    this.atlasValid = true;
  }

  private getAtlasWorldBounds(
    scene: RenderScene,
    referenceZoom: number,
  ): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    let minX = scene.bounds.minX;
    let maxX = scene.bounds.maxX;
    let minY = scene.bounds.minY;
    let maxY = scene.bounds.maxY;

    for (let edgeIndex = 0; edgeIndex < scene.edgeCount; edgeIndex += 1) {
      minX = Math.min(minX, scene.edgeMinX[edgeIndex]);
      maxX = Math.max(maxX, scene.edgeMaxX[edgeIndex]);

      minY = Math.min(minY, scene.edgeMinY[edgeIndex]);
      maxY = Math.max(maxY, scene.edgeMaxY[edgeIndex]);
    }

    const worldPadding = ATLAS_PADDING_PX / referenceZoom;

    return {
      minX: minX - worldPadding,
      maxX: maxX + worldPadding,
      minY: minY - worldPadding,
      maxY: maxY + worldPadding,
    };
  }

  private getAtlasPixelRatio(
    logicalWidth: number,
    logicalHeight: number,
  ): number {
    const maxByWidth = ATLAS_MAX_DIMENSION / logicalWidth;
    const maxByHeight = ATLAS_MAX_DIMENSION / logicalHeight;

    const maxByPixels = Math.sqrt(
      ATLAS_MAX_PIXELS / (logicalWidth * logicalHeight),
    );

    return Math.min(
      ATLAS_TARGET_PIXEL_RATIO,
      maxByWidth,
      maxByHeight,
      maxByPixels,
    );
  }

  private drawRailLayer(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    edgeIndices: Int32Array,
    edgeCount: number,
    activeLayer: boolean,
    camera: Camera,
  ): void {
    if (edgeCount === 0) {
      return;
    }

    ctx.beginPath();

    for (let index = 0; index < edgeCount; index += 1) {
      this.appendConnectionPath(ctx, scene, edgeIndices[index], camera);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeLayer) {
      const outerWidth = clamp(0.8 + camera.zoom * 16, 1.15, 1.75);
      const innerWidth = Math.max(0.45, outerWidth * 0.35);

      ctx.strokeStyle = "#d8af57";
      ctx.lineWidth = outerWidth;
      ctx.stroke();

      ctx.strokeStyle = "#fff0a3";
      ctx.lineWidth = innerWidth;
      ctx.stroke();

      return;
    }

    ctx.strokeStyle = "#5c4f34";
    ctx.lineWidth = Math.max(1.2, camera.zoom * 5);
    ctx.stroke();
  }

  private appendConnectionPath(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    edgeIndex: number,
    camera: Camera,
  ): void {
    const fromIndex = scene.edgeFrom[edgeIndex];
    const toIndex = scene.edgeTo[edgeIndex];

    const startX = scene.screenX[fromIndex];
    const startY = scene.screenY[fromIndex];

    const endX = scene.screenX[toIndex];
    const endY = scene.screenY[toIndex];

    const arcWorldX = scene.edgeArcX[edgeIndex];
    const radius = scene.edgeRadius[edgeIndex] * camera.zoom;

    if (!Number.isFinite(arcWorldX) || radius < 0.5) {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      return;
    }

    ctx.moveTo(startX, startY);

    ctx.arc(
      arcWorldX * camera.zoom + camera.x,
      scene.edgeArcY[edgeIndex] * camera.zoom + camera.y,
      radius,
      scene.edgeStartAngle[edgeIndex],
      scene.edgeEndAngle[edgeIndex],
      scene.edgeIsNegativeDelta[edgeIndex] === 1,
    );
  }

  private drawStaticNodes(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    camera: Camera,
  ): void {
    this.ensureNodeBuffers(scene.nodes.length);

    let nodeCount = 0;
    let jewelCount = 0;

    for (
      let visibleIndex = 0;
      visibleIndex < scene.visibleNodeCount;
      visibleIndex += 1
    ) {
      const nodeIndex = scene.visibleNodeIndices[visibleIndex];
      const node = scene.nodes[nodeIndex];

      if (!shouldDrawNode(node)) {
        continue;
      }

      this.unallocatedNodeIndices[nodeCount] = nodeIndex;
      nodeCount += 1;

      if (node.isJewelSocket) {
        this.unallocatedJewelIndices[jewelCount] = nodeIndex;
        jewelCount += 1;
      }
    }

    this.drawNodeBatch(
      ctx,
      scene,
      this.unallocatedNodeIndices,
      nodeCount,
      false,
      camera,
    );

    this.drawJewelRings(
      ctx,
      scene,
      this.unallocatedJewelIndices,
      jewelCount,
      false,
      camera,
    );
  }

  private drawAllocatedOverviewNodes(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    camera: Camera,
  ): void {
    this.ensureNodeBuffers(scene.nodes.length);

    let nodeCount = 0;
    let jewelCount = 0;

    for (
      let visibleIndex = 0;
      visibleIndex < scene.visibleActiveNodeCount;
      visibleIndex += 1
    ) {
      const nodeIndex = scene.visibleActiveNodeIndices[visibleIndex];
      const node = scene.nodes[nodeIndex];

      if (!shouldDrawNode(node)) {
        continue;
      }

      this.allocatedNodeIndices[nodeCount] = nodeIndex;
      nodeCount += 1;

      if (node.isJewelSocket) {
        this.allocatedJewelIndices[jewelCount] = nodeIndex;
        jewelCount += 1;
      }
    }
    this.drawNodeBatch(
      ctx,
      scene,
      this.allocatedNodeIndices,
      nodeCount,
      true,
      camera,
    );

    if (!this.sprites) {
      this.drawJewelRings(
        ctx,
        scene,
        this.allocatedJewelIndices,
        jewelCount,
        true,
        camera,
      );
    }
  }

  private drawAllNodes(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    hoveredNodeId: string | null,
    camera: Camera,
  ): void {
    this.ensureNodeBuffers(scene.nodes.length);

    let allocatedNodeCount = 0;
    let unallocatedNodeCount = 0;

    let allocatedJewelCount = 0;
    let unallocatedJewelCount = 0;

    let hoveredNodeIndex = -1;

    for (
      let visibleIndex = 0;
      visibleIndex < scene.visibleNodeCount;
      visibleIndex += 1
    ) {
      const nodeIndex = scene.visibleNodeIndices[visibleIndex];
      const node = scene.nodes[nodeIndex];

      if (!shouldDrawNode(node)) {
        continue;
      }

      if (node.id === hoveredNodeId) {
        hoveredNodeIndex = nodeIndex;
        continue;
      }

      if (scene.allocated[nodeIndex] === 1) {
        this.allocatedNodeIndices[allocatedNodeCount] = nodeIndex;
        allocatedNodeCount += 1;

        if (node.isJewelSocket) {
          this.allocatedJewelIndices[allocatedJewelCount] = nodeIndex;
          allocatedJewelCount += 1;
        }

        continue;
      }

      this.unallocatedNodeIndices[unallocatedNodeCount] = nodeIndex;
      unallocatedNodeCount += 1;

      if (node.isJewelSocket) {
        this.unallocatedJewelIndices[unallocatedJewelCount] = nodeIndex;
        unallocatedJewelCount += 1;
      }
    }

    this.drawNodeBatch(
      ctx,
      scene,
      this.unallocatedNodeIndices,
      unallocatedNodeCount,
      false,
      camera,
    );

    this.drawNodeBatch(
      ctx,
      scene,
      this.allocatedNodeIndices,
      allocatedNodeCount,
      true,
      camera,
    );

    if (!this.sprites) {
      this.drawJewelRings(
        ctx,
        scene,
        this.allocatedJewelIndices,
        allocatedJewelCount,
        true,
        camera,
      );
    }

    if (hoveredNodeIndex !== -1) {
      this.drawHoveredNode(ctx, scene, hoveredNodeIndex, camera);
    }
  }

  private drawOverviewHoveredNode(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    hoveredNodeId: string,
  ): void {
    const nodeIndex = scene.getNodeIndex(hoveredNodeId);

    if (nodeIndex === undefined) {
      return;
    }

    const node = scene.nodes[nodeIndex];

    if (!shouldDrawNode(node)) {
      return;
    }

    const x = scene.worldX[nodeIndex] * this.camera.zoom + this.camera.x;
    const y = scene.worldY[nodeIndex] * this.camera.zoom + this.camera.y;

    if (
      x < -NODE_MARGIN_PX ||
      x > this.width + NODE_MARGIN_PX ||
      y < -NODE_MARGIN_PX ||
      y > this.height + NODE_MARGIN_PX
    ) {
      return;
    }

    scene.screenX[nodeIndex] = x;
    scene.screenY[nodeIndex] = y;

    this.drawHoveredNode(ctx, scene, nodeIndex, this.camera);
  }

  private drawNodeBatch(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    nodeIndices: Int32Array,
    count: number,
    allocated: boolean,
    camera: Camera,
  ): void {
    if (count === 0) {
      return;
    }

    ctx.fillStyle = allocated ? "#e2ad40" : "#302a22";
    ctx.strokeStyle = allocated ? "#fff2c0" : "#aa874d";
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let index = 0; index < count; index += 1) {
      const nodeIndex = nodeIndices[index];
      const node = scene.nodes[nodeIndex];

      const radius = getNodeScreenRadius(node, camera.zoom);
      const useFrame = this.sprites !== null;

      if (useFrame || radius <= 0) {
        continue;
      }

      const x = scene.screenX[nodeIndex];
      const y = scene.screenY[nodeIndex];

      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.stroke();

    if (!this.sprites) {
      return;
    }

    ctx.save();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    for (let index = 0; index < count; index += 1) {
      const nodeIndex = nodeIndices[index];
      const node = scene.nodes[nodeIndex];

      const radius = getNodeScreenRadius(node, camera.zoom);

      if (radius < 1.5) {
        
        continue;
      }

      const x = scene.screenX[nodeIndex];
      const y = scene.screenY[nodeIndex];

      this.sprites.drawNodeIcon(ctx, node, x, y, radius, allocated);
      this.sprites.drawNodeFrame(ctx, node, x, y, radius, allocated);
    }

    ctx.restore();
  }

  private drawJewelRings(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    nodeIndices: Int32Array,
    count: number,
    allocated: boolean,
    camera: Camera,
  ): void {
    if (count === 0) {
      return;
    }

    ctx.beginPath();

    for (let index = 0; index < count; index += 1) {
      const nodeIndex = nodeIndices[index];
      const node = scene.nodes[nodeIndex];

      const radius = getNodeScreenRadius(node, camera.zoom);

      if (radius <= 0) {
        continue;
      }

      const x = scene.screenX[nodeIndex];
      const y = scene.screenY[nodeIndex];

      ctx.moveTo(x + radius, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.strokeStyle = allocated ? "#fff1b4" : "#6e5d44";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawHoveredNode(
    ctx: CanvasRenderingContext2D,
    scene: RenderScene,
    nodeIndex: number,
    camera: Camera,
  ): void {
    const node = scene.nodes[nodeIndex];

    if (!shouldDrawNode(node)) {
      return;
    }

    const x = scene.screenX[nodeIndex];
    const y = scene.screenY[nodeIndex];

    const radius = getNodeScreenRadius(node, camera.zoom);

    if (radius <= 0) {
      return;
    }

    const allocated = scene.allocated[nodeIndex] === 1;

    if (this.sprites && radius >= FRAME_DETAIL_RADIUS_PX) {
      ctx.save();

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.shadowColor = "#f1c65f";
      ctx.shadowBlur = 15; 
      ctx.fillStyle = "rgba(241, 198, 95, 0.2)"; 
      ctx.fill();

      this.sprites.drawNodeIcon(ctx, node, x, y, radius, allocated);
      this.sprites.drawNodeFrame(ctx, node, x, y, radius, allocated);

      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      ctx.fillStyle = allocated ? "#e2ad40" : "#302a22";
      ctx.strokeStyle = allocated ? "#fff2c0" : "#f1c65f";
      
      ctx.lineWidth = 2;

      ctx.fill();
      ctx.stroke();
    }
  }

  private getOverviewFitZoom(scene: RenderScene): number {
    const bounds = scene.mainBounds;

    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;

    if (
      !Number.isFinite(treeWidth) ||
      !Number.isFinite(treeHeight) ||
      treeWidth <= 0 ||
      treeHeight <= 0
    ) {
      return 0;
    }

    const usableWidth = Math.max(1, this.width - OVERVIEW_FIT_PADDING * 2);

    const usableHeight = Math.max(1, this.height - OVERVIEW_FIT_PADDING * 2);

    return Math.min(usableWidth / treeWidth, usableHeight / treeHeight);
  }

  private clearMainCanvas(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private invalidateAtlas(): void {
    this.atlasValid = false;
    this.atlasScene = null;

    this.atlasWorldMinX = 0;
    this.atlasWorldMaxX = 0;
    this.atlasWorldMinY = 0;
    this.atlasWorldMaxY = 0;
  }

  private ensureNodeBuffers(capacity: number): void {
    if (capacity <= this.nodeBufferCapacity) {
      return;
    }

    this.nodeBufferCapacity = capacity;

    this.allocatedNodeIndices = new Int32Array(capacity);
    this.unallocatedNodeIndices = new Int32Array(capacity);

    this.allocatedJewelIndices = new Int32Array(capacity);
    this.unallocatedJewelIndices = new Int32Array(capacity);
  }
}

function shouldDrawNode(node: TreeNode): boolean {
  if (node.isAscendancyStart || node.isAscendancy) return true;
  return !(
    node.isOnlyImage ||
    node.noRadius ||
    node.isClassStart ||
    node.isMastery
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
