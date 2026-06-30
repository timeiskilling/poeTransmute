import { type TreeEdge, type TreeNode } from "../types";
import { Camera } from "./Camera";

interface DrawEdgesOptions {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  edges: TreeEdge[];
  nodes: Map<string, TreeNode>;
  viewportWidth: number;
  viewportHeight: number;
}

export function drawEdges({
  ctx,
  camera,
  edges,
  nodes,
  viewportWidth,
  viewportHeight,
}: DrawEdgesOptions): void {
  const zoom = camera.zoom;
  const camX = camera.x;
  const camY = camera.y;

  const isLowDetail = zoom < 0.04;

  const margin = 100;
  const viewMinX = -margin;
  const viewMaxX = viewportWidth + margin;
  const viewMinY = -margin;
  const viewMaxY = viewportHeight + margin;

  const PI = Math.PI;
  const PI2 = PI * 2;

  const activeLineWidth = zoom < 0.015 ? 1 : 2.5 * (zoom / 0.015);
  const inactiveLineWidth = zoom < 0.015 ? 0.5 : 1 * (zoom / 0.015);

  drawLayer(false);
  drawLayer(true);

  function drawLayer(allocatedLayer: boolean) {
    ctx.beginPath();
    for (let i = 0, len = edges.length; i < len; i++) {
      const edge = edges[i];

      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);

      if (!from || !to) continue;
      if ((from.isAllocated && to.isAllocated) !== allocatedLayer) continue;

      const startX = from.x * zoom + camX;
      const startY = from.y * zoom + camY;
      const endX = to.x * zoom + camX;
      const endY = to.y * zoom + camY;

      if (
        (startX < viewMinX && endX < viewMinX) ||
        (startX > viewMaxX && endX > viewMaxX) ||
        (startY < viewMinY && endY < viewMinY) ||
        (startY > viewMaxY && endY > viewMaxY)
      ) {
        continue;
      }

      if (isLowDetail || !edge.arcCenter) {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        continue;
      }

      const centerX = edge.arcCenter.x * zoom + camX;
      const centerY = edge.arcCenter.y * zoom + camY;
      const dx = startX - centerX;
      const dy = startY - centerY;
      const radiusSquared = dx * dx + dy * dy;

      if (radiusSquared < 1) {
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        continue;
      }

      const radius = Math.sqrt(radiusSquared);

      const startAngle = Math.atan2(dy, dx);
      const endAngle = Math.atan2(endY - centerY, endX - centerX);

      let delta = endAngle - startAngle;

      if (delta <= -PI) delta += PI2;
      else if (delta > PI) delta -= PI2;

      ctx.moveTo(startX, startY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, delta < 0);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 0;

    if (allocatedLayer) {
      ctx.strokeStyle = "#f0bd54";
      ctx.lineWidth = activeLineWidth;
    } else {
      ctx.strokeStyle = "#5c5144";
      ctx.lineWidth = inactiveLineWidth;
    }

    ctx.stroke();
  }
}
