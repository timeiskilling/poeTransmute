import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PoeTreeSprites } from "./renderer/PoeTreeSprites";
import type { RawGggTree } from "./types";
import { parseTreeData } from "./utils/parser";

import { useInteraction } from "./hooks/useInteraction";
import { Camera } from "./renderer/Camera";
import { CanvasRenderer } from "./renderer/CanvasRenderer";
import { RenderScene } from "./renderer/RenderScene";

interface PassiveTreeProps {
  treeData: RawGggTree | null;
  allocatedHashes: Array<number | string>;
  activeAscendancyId?: string;
}

interface ConditionalVisibilityDependencies {
  unlockNodeIds: readonly string[];
  hasConditionalNodes: boolean;
}

export function PassiveTree({
  treeData,
  allocatedHashes,
  activeAscendancyId,
}: PassiveTreeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cameraRef = useRef(new Camera());
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const spritesRef = useRef<PoeTreeSprites | null>(null);

  const renderRafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const fitRafRef = useRef<number | null>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoveredNodeIdRef = useRef<string | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const conditionalDependencies = useMemo(
    () => collectConditionalDependencies(treeData),
    [treeData],
  );

  const conditionalVisibilityKey = useMemo(
    () =>
      createConditionalVisibilityKey(
        allocatedHashes,
        activeAscendancyId,
        conditionalDependencies,
      ),
    [allocatedHashes, activeAscendancyId, conditionalDependencies],
  );

  /*
   * Повний parse лише коли змінюється структура дерева:
   * treeData, ascendancy або visible conditional nodes.
   */
  const tree = useMemo(
    () =>
      parseTreeData(treeData, allocatedHashes, {
        activeAscendancyId,
      }),
    [treeData, activeAscendancyId, conditionalVisibilityKey],
  );

  const scene = useMemo(() => new RenderScene(tree), [tree]);

  const treeRef = useRef(tree);
  const sceneRef = useRef(scene);

  treeRef.current = tree;
  sceneRef.current = scene;

  const renderNow = useCallback(() => {
    rendererRef.current?.render({
      scene: sceneRef.current,
      hoveredNodeId: hoveredNodeIdRef.current,
    });
  }, []);

  const requestRender = useCallback(() => {
    if (renderRafRef.current !== null) {
      return;
    }

    renderRafRef.current = requestAnimationFrame(() => {
      renderRafRef.current = null;
      renderNow();
    });
  }, [renderNow]);

  useEffect(() => {
    let disposed = false;

    void PoeTreeSprites.load()
      .then((sprites) => {
        if (disposed) {
          return;
        }

        spritesRef.current = sprites;
        rendererRef.current?.setSprites(sprites);
        requestRender();
      })
      .catch((error) => {
        console.error("Не вдалося завантажити PoE tree sprites", error);
      });

    return () => {
      disposed = true;
    };
  }, [requestRender]);

  const fitTreeToViewport = useCallback(() => {
    const renderer = rendererRef.current;
    const currentTree = treeRef.current;

    if (!renderer || currentTree.nodes.size === 0) {
      return;
    }

    const { width, height } = renderer.getSize();

    if (width < 2 || height < 2) {
      return;
    }

    cameraRef.current.fitToBounds(currentTree.mainBounds, width, height, 80);
  }, []);

  const syncCanvas = useCallback(
    (width: number, height: number, shouldFitTree: boolean) => {
      const renderer = rendererRef.current;

      if (!renderer || width < 2 || height < 2) {
        return;
      }

      renderer.resize(width, height);

      if (shouldFitTree) {
        fitTreeToViewport();
      }

      renderNow();
    },
    [fitTreeToViewport, renderNow],
  );

  /*
   * Звичайна зміна passive allocation:
   * без parser pass і без нової RenderScene.
   */
  useEffect(() => {
    scene.updateAllocated(allocatedHashes);
    requestRender();
  }, [allocatedHashes, requestRender, scene]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return;
    }

    const renderer = new CanvasRenderer(canvas, cameraRef.current);

    rendererRef.current = renderer;

    let pendingWidth = 0;
    let pendingHeight = 0;

    const scheduleResize = (width: number, height: number) => {
      pendingWidth = width;
      pendingHeight = height;

      if (resizeRafRef.current !== null) {
        return;
      }

      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;

        syncCanvas(pendingWidth, pendingHeight, false);
      });
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      scheduleResize(entry.contentRect.width, entry.contentRect.height);
    });

    const initialRect = container.getBoundingClientRect();

    observer.observe(container);
    scheduleResize(initialRect.width, initialRect.height);

    return () => {
      observer.disconnect();

      if (resizeRafRef.current !== null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }

      renderer.dispose();

      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
    };
  }, [syncCanvas]);

  useLayoutEffect(() => {
    if (!treeData || tree.nodes.size === 0) {
      return;
    }

    if (fitRafRef.current !== null) {
      cancelAnimationFrame(fitRafRef.current);
    }

    fitRafRef.current = requestAnimationFrame(() => {
      fitRafRef.current = null;

      const renderer = rendererRef.current;

      if (!renderer) {
        return;
      }

      const { width, height } = renderer.getSize();

      syncCanvas(width, height, true);
    });

    return () => {
      if (fitRafRef.current !== null) {
        cancelAnimationFrame(fitRafRef.current);
        fitRafRef.current = null;
      }
    };
  }, [syncCanvas, tree, treeData]);

  useEffect(() => {
    return () => {
      if (renderRafRef.current !== null) {
        cancelAnimationFrame(renderRafRef.current);
        renderRafRef.current = null;
      }
    };
  }, []);

  const handleHoveredNodeChange = useCallback(
    (nodeId: string | null, x?: number, y?: number) => {
      if (nodeId && x !== undefined && y !== undefined) {
        setHoverInfo({ id: nodeId, x, y });
      } else {
        setHoverInfo(null);
      }
    },
    [],
  );

  useInteraction(canvasRef, cameraRef.current, tree.nodes, requestRender, {
    onHoveredNodeChange: handleHoveredNodeChange,
  });

  const hoveredNode = hoverInfo ? tree.nodes.get(hoverInfo.id) : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#111217",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      />

      {hoveredNode && hoverInfo && (
        <div
          style={{
            position: "fixed", 
            left: hoverInfo.x + 20, 
            top: hoverInfo.y + 20, 
            zIndex: 99999, 
            maxWidth: 360,
            padding: "12px 14px",
            pointerEvents: "none", 
            color: "#f2dfad",
            background: "rgba(20, 17, 14, .96)",
            border: "1px solid #6b5836",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          <strong>{hoveredNode.name || `Skill ${hoveredNode.skill}`}</strong>

          {hoveredNode.stats.length > 0 && (
            <div
              style={{
                marginTop: 8,
                whiteSpace: "pre-line",
                fontSize: 12,
                color: "#d3c3a0",
              }}
            >
              {hoveredNode.stats.join("\n")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function collectConditionalDependencies(
  treeData: RawGggTree | null,
): ConditionalVisibilityDependencies {
  if (!treeData?.nodes) {
    return {
      unlockNodeIds: [],
      hasConditionalNodes: false,
    };
  }

  const unlockNodeIds = new Set<string>();
  let hasConditionalNodes = false;

  for (const rawNode of Object.values(treeData.nodes)) {
    const constraint = rawNode.unlockConstraint;

    if (!constraint) {
      continue;
    }

    hasConditionalNodes = true;

    for (const nodeId of constraint.nodes ?? []) {
      unlockNodeIds.add(String(nodeId));
    }
  }

  return {
    unlockNodeIds: [...unlockNodeIds].sort(),
    hasConditionalNodes,
  };
}

function createConditionalVisibilityKey(
  allocatedHashes: Array<number | string>,
  activeAscendancyId: string | undefined,
  dependencies: ConditionalVisibilityDependencies,
): string {
  if (!dependencies.hasConditionalNodes) {
    return "";
  }

  const allocatedSet = new Set<string>();

  for (let index = 0; index < allocatedHashes.length; index += 1) {
    allocatedSet.add(String(allocatedHashes[index]));
  }

  let key = activeAscendancyId ?? "";

  for (let index = 0; index < dependencies.unlockNodeIds.length; index += 1) {
    const nodeId = dependencies.unlockNodeIds[index];
    key += allocatedSet.has(nodeId) ? "|1" : "|0";
  }

  return key;
}
