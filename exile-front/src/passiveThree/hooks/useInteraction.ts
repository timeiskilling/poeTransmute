import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import type { TreeNode } from "../types";
import { Camera } from "../renderer/Camera";
import {
  getNodeScreenRadius,
  getNodeWorldRadius,
  isNodeDrawable,
} from "../renderer/NodeRenderer";

const GRID_CELL_SIZE = 512;
const MIN_HIT_RADIUS_PX = 10;

const WHEEL_ZOOM_SENSITIVITY = 0.0012;
const MAX_WHEEL_DELTA_PER_FRAME = 600;

interface UseInteractionOptions {
  onHoveredNodeChange?: (
    nodeId: string | null,
    clientX?: number,
    clientY?: number,
  ) => void;
}

interface IndexedNode {
  id: string;
  x: number;
  y: number;
  node: TreeNode;
}

interface NodeSpatialGrid {
  cells: Map<string, IndexedNode[]>;
  cellSize: number;
  maxHitRadius: number;
}

interface ScreenPoint {
  x: number;
  y: number;
}

interface PendingWheel {
  x: number;
  y: number;
  deltaY: number;
}

export function useInteraction(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  camera: Camera,
  nodes: Map<string, TreeNode>,
  requestRender: () => void,
  options: UseInteractionOptions = {},
): void {
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<ScreenPoint>({ x: 0, y: 0 });

  const canvasRectRef = useRef<DOMRect | null>(null);
  const spatialGridRef = useRef<NodeSpatialGrid | null>(null);

  if (spatialGridRef.current === null) {
    spatialGridRef.current = buildSpatialGrid(nodes);
  }

  const requestRenderRef = useRef(requestRender);
  const onHoveredRef = useRef(options.onHoveredNodeChange);
  const hoveredIdRef = useRef<string | null>(null);

  const interactionRafRef = useRef<number | null>(null);

  const pendingHoverPointRef = useRef<ScreenPoint | null>(null);
  const pendingWheelRef = useRef<PendingWheel | null>(null);

  useEffect(() => {
    spatialGridRef.current = buildSpatialGrid(nodes);
  }, [nodes]);

  useEffect(() => {
    requestRenderRef.current = requestRender;
  }, [requestRender]);

  useEffect(() => {
    onHoveredRef.current = options.onHoveredNodeChange;
  }, [options.onHoveredNodeChange]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateCanvasRect = () => {
      canvasRectRef.current = canvas.getBoundingClientRect();
    };

    const getPoint = (event: PointerEvent | WheelEvent): ScreenPoint => {
      const rect = canvasRectRef.current ?? canvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const setHoveredNode = (nodeId: string | null, x?: number, y?: number) => {
      if (hoveredIdRef.current === nodeId) {
        return;
      }
      hoveredIdRef.current = nodeId;
      onHoveredRef.current?.(nodeId, x, y); 
      requestRenderRef.current();
    };

    const clearHover = () => {
      setHoveredNode(null);
    };

    const canProcessHover = () => {
      return !draggingRef.current;
    };

    const updateHoverNow = (point: ScreenPoint) => {
      if (!canProcessHover()) {
        clearHover();
        return;
      }

      const grid = spatialGridRef.current;
      if (!grid) {
        clearHover();
        return;
      }

      const nodeId = findHoveredNode(grid, camera, point.x, point.y);

      
      const rect = canvasRectRef.current;
      const globalX = rect ? point.x + rect.left : point.x;
      const globalY = rect ? point.y + rect.top : point.y;

      setHoveredNode(nodeId, globalX, globalY);
    };

    const scheduleInteractionFrame = () => {
      if (interactionRafRef.current !== null) {
        return;
      }

      interactionRafRef.current = requestAnimationFrame(() => {
        interactionRafRef.current = null;

        const pendingWheel = pendingWheelRef.current;

        if (pendingWheel) {
          pendingWheelRef.current = null;
          const deltaY = clamp(
            pendingWheel.deltaY,
            -MAX_WHEEL_DELTA_PER_FRAME,
            MAX_WHEEL_DELTA_PER_FRAME,
          );
          const factor = Math.exp(-deltaY * WHEEL_ZOOM_SENSITIVITY);

          camera.zoomTo(pendingWheel.x, pendingWheel.y, factor);

          updateHoverNow({
            x: pendingWheel.x,
            y: pendingWheel.y,
          });

          requestRenderRef.current();
          return;
        }

        const hoverPoint = pendingHoverPointRef.current;
        pendingHoverPointRef.current = null;

        if (hoverPoint) {
          updateHoverNow(hoverPoint);
        }
      });
    };

    const scheduleHoverUpdate = (point: ScreenPoint) => {
      if (!canProcessHover()) {
        clearHover();
        return;
      }

      pendingHoverPointRef.current = point;
      scheduleInteractionFrame();
    };

    const scheduleWheelZoom = (point: ScreenPoint, deltaY: number) => {
      const pendingWheel = pendingWheelRef.current;

      if (pendingWheel) {
        pendingWheel.x = point.x;
        pendingWheel.y = point.y;
        pendingWheel.deltaY += deltaY;
      } else {
        pendingWheelRef.current = {
          x: point.x,
          y: point.y,
          deltaY,
        };
      }

      pendingHoverPointRef.current = null;
      scheduleInteractionFrame();
    };

    const cancelPendingInteraction = () => {
      pendingHoverPointRef.current = null;
      pendingWheelRef.current = null;

      if (interactionRafRef.current !== null) {
        cancelAnimationFrame(interactionRafRef.current);
        interactionRafRef.current = null;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      updateCanvasRect();
      cancelPendingInteraction();

      const point = getPoint(event);

      draggingRef.current = true;
      pointerIdRef.current = event.pointerId;
      lastPointRef.current = point;

      clearHover();

      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = getPoint(event);

      if (draggingRef.current && pointerIdRef.current === event.pointerId) {
        camera.pan(
          point.x - lastPointRef.current.x,
          point.y - lastPointRef.current.y,
        );

        lastPointRef.current = point;
        requestRenderRef.current();
        return;
      }

      scheduleHoverUpdate(point);
    };

    const stopDragging = (event?: PointerEvent) => {
      if (
        event &&
        pointerIdRef.current !== null &&
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }

      const pointerId = pointerIdRef.current;

      if (pointerId !== null && canvas.hasPointerCapture(pointerId)) {
        canvas.releasePointerCapture(pointerId);
      }

      draggingRef.current = false;
      pointerIdRef.current = null;

      canvas.style.cursor = "grab";

      if (event) {
        scheduleHoverUpdate(getPoint(event));
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const point = getPoint(event);
      const deltaY = normalizeWheelDelta(event, canvas.clientHeight);
      scheduleWheelZoom(point, deltaY);
    };

    const onPointerEnter = () => {
      updateCanvasRect();
    };

    const onPointerLeave = () => {
      if (draggingRef.current) {
        return;
      }

      pendingHoverPointRef.current = null;
      clearHover();
    };

    const resizeObserver = new ResizeObserver(updateCanvasRect);

    updateCanvasRect();
    resizeObserver.observe(canvas);

    window.addEventListener("resize", updateCanvasRect);
    window.addEventListener("scroll", updateCanvasRect, true);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";

    return () => {
      cancelPendingInteraction();

      resizeObserver.disconnect();

      window.removeEventListener("resize", updateCanvasRect);
      window.removeEventListener("scroll", updateCanvasRect, true);

      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", stopDragging);
      canvas.removeEventListener("pointercancel", stopDragging);
      canvas.removeEventListener("lostpointercapture", stopDragging);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef, camera]);
}

function buildSpatialGrid(nodes: Map<string, TreeNode>): NodeSpatialGrid {
  const cells = new Map<string, IndexedNode[]>();

  let maxHitRadius = 0;

  for (const node of nodes.values()) {
    if (!isNodeDrawable(node)) {
      continue;
    }

    const indexedNode: IndexedNode = {
      id: node.id,
      x: node.x,
      y: node.y,
      node,
    };

    const cellX = Math.floor(node.x / GRID_CELL_SIZE);
    const cellY = Math.floor(node.y / GRID_CELL_SIZE);
    const key = makeCellKey(cellX, cellY);

    const cell = cells.get(key);

    if (cell) {
      cell.push(indexedNode);
    } else {
      cells.set(key, [indexedNode]);
    }

    const worldRadius = getNodeWorldRadius(node);

    if (worldRadius > maxHitRadius) {
      maxHitRadius = worldRadius;
    }
  }

  return {
    cells,
    cellSize: GRID_CELL_SIZE,
    maxHitRadius,
  };
}

function findHoveredNode(
  grid: NodeSpatialGrid,
  camera: Camera,
  screenX: number,
  screenY: number,
): string | null {
  const zoom = camera.zoom;
  const worldX = (screenX - camera.x) / zoom;
  const worldY = (screenY - camera.y) / zoom;

  const minimumRadiusInWorld = MIN_HIT_RADIUS_PX / zoom;
  const searchRadius = Math.max(grid.maxHitRadius, minimumRadiusInWorld);

  const minCellX = Math.floor((worldX - searchRadius) / grid.cellSize);
  const maxCellX = Math.floor((worldX + searchRadius) / grid.cellSize);

  const minCellY = Math.floor((worldY - searchRadius) / grid.cellSize);
  const maxCellY = Math.floor((worldY + searchRadius) / grid.cellSize);

  let closestId: string | null = null;
  let closestDistanceSquared = Infinity;

  for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
    for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
      const cell = grid.cells.get(makeCellKey(cellX, cellY));

      if (!cell) {
        continue;
      }

      for (let index = 0; index < cell.length; index += 1) {
        const node = cell[index];

        const screenRadius = getNodeScreenRadius(node.node, zoom);

        const radius = Math.max(screenRadius + 6, MIN_HIT_RADIUS_PX) / zoom;

        const dx = node.x - worldX;
        const dy = node.y - worldY;

        const distanceSquared = dx * dx + dy * dy;

        if (
          distanceSquared <= radius * radius &&
          distanceSquared < closestDistanceSquared
        ) {
          closestId = node.id;
          closestDistanceSquared = distanceSquared;
        }
      }
    }
  }

  return closestId;
}

function normalizeWheelDelta(
  event: WheelEvent,
  viewportHeight: number,
): number {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * Math.max(1, viewportHeight);
  }

  return event.deltaY;
}

function makeCellKey(cellX: number, cellY: number): string {
  return `${cellX}:${cellY}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
