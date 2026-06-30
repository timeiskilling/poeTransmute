import { type TreeBounds } from "../types";

export interface WorldViewport {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class Camera {
  public x = 0;
  public y = 0;
  public zoom = 0.015;

  public pixelRatio = 1;

  public readonly minZoom = 0.005;
  public readonly maxZoom = 2.5;

  worldToScreen(worldX: number, worldY: number) {
    return {
      x: worldX * this.zoom + this.x,
      y: worldY * this.zoom + this.y,
    };
  }

  screenToWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - this.x) / this.zoom,
      y: (screenY - this.y) / this.zoom,
    };
  }

  apply(ctx: CanvasRenderingContext2D) {
    const scale = this.zoom * this.pixelRatio;

    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      this.x * this.pixelRatio,
      this.y * this.pixelRatio,
    );
  }

  reset(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  pan(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  zoomTo(screenX: number, screenY: number, factor: number) {
    if (!Number.isFinite(factor) || factor <= 0) {
      return;
    }

    const worldPoint = this.screenToWorld(screenX, screenY);

    const nextZoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);

    this.zoom = nextZoom;

    
    this.x = screenX - worldPoint.x * nextZoom;
    this.y = screenY - worldPoint.y * nextZoom;
  }

  zoomAt(screenX: number, screenY: number, factor: number) {
    this.zoomTo(screenX, screenY, factor);
  }

  fitToBounds(bounds: TreeBounds, width: number, height: number, padding = 96) {
    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;

    if (
      !Number.isFinite(treeWidth) ||
      !Number.isFinite(treeHeight) ||
      treeWidth <= 0 ||
      treeHeight <= 0
    ) {
      return;
    }

    const usableWidth = Math.max(1, width - padding * 2);
    const usableHeight = Math.max(1, height - padding * 2);

    const zoomX = usableWidth / treeWidth;
    const zoomY = usableHeight / treeHeight;

    this.zoom = clamp(Math.min(zoomX, zoomY), this.minZoom, this.maxZoom);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    this.x = width / 2 - centerX * this.zoom;
    this.y = height / 2 - centerY * this.zoom;
  }

  getViewport(width: number, height: number): WorldViewport {
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(width, height);

    return {
      left: topLeft.x,
      right: bottomRight.x,
      top: topLeft.y,
      bottom: bottomRight.y,
    };
  }

  isVisible(
    worldX: number,
    worldY: number,
    width: number,
    height: number,
    margin = 0,
  ) {
    const viewport = this.getViewport(width, height);

    return (
      worldX >= viewport.left - margin &&
      worldX <= viewport.right + margin &&
      worldY >= viewport.top - margin &&
      worldY <= viewport.bottom + margin
    );
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
