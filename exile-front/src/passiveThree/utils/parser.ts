import {
  type ParsedTree,
  type Point,
  type RawGggEdge,
  type RawGggNode,
  type RawGggTree,
  type TreeBounds,
  type TreeEdge,
  type TreeGroup,
  type TreeNode,
} from "../types";

export interface ParseTreeOptions {
  activeAscendancyId?: string;
  centerActiveAscendancy?: boolean;
}

interface EdgeMetadata {
  index: number;
  orbit?: number;
  arcCenter?: Point;
}

interface AscendancyMeta {
  internalId: string;
  name?: string;
  offsetX: number;
  offsetY: number;
}

interface AscendancyTranslation {
  ascendancyId: string;
  offsetX: number;
  offsetY: number;
}

interface RawAscendancy {
  id?: string;
  name?: string;
  offsetX?: number;
  offsetY?: number;
}

interface RawClass {
  ascendancies?: RawAscendancy[];
}

const HUB_WORLD_CENTER: Point = {
  x: 0,
  y: 0,
};

export function parseTreeData(
  treeData: RawGggTree | null | undefined,
  allocatedHashes: Array<number | string>,
  options: ParseTreeOptions = {},
): ParsedTree {
  const nodes = new Map<string, TreeNode>();
  const edges: TreeEdge[] = [];
  const groups = new Map<string, TreeGroup>();

  if (!treeData?.nodes) {
    return {
      nodes,
      edges,
      groups,
      bounds: emptyBounds(),
      mainBounds: emptyBounds(),
    };
  }

  const allocatedSet = new Set<string>();

  for (let index = 0; index < allocatedHashes.length; index += 1) {
    allocatedSet.add(String(allocatedHashes[index]));
  }

  const ascendancyMetas = collectAscendancyMetas(treeData);

  const activeAscendancy = resolveActiveAscendancy(
    treeData,
    allocatedSet,
    ascendancyMetas,
    options.activeAscendancyId,
  );

  for (const [rawKey, rawNode] of Object.entries(treeData.nodes)) {
    const node = createTreeNode(
      rawKey,
      rawNode,
      allocatedSet,
      activeAscendancy,
    );

    if (!node) {
      continue;
    }

    if (
      node.isAscendancy &&
      node.ascendancyId !== activeAscendancy?.internalId
    ) {
      continue;
    }

    nodes.set(node.id, node);
  }

  const mainBounds = getBounds(nodes, shouldIncludeInMainBounds);

  const translation =
    activeAscendancy && options.centerActiveAscendancy !== false
      ? createAscendancyTranslation(nodes, activeAscendancy)
      : null;

  if (translation) {
    translateActiveAscendancyNodes(nodes, translation);
  }

  parseVisibleGroups(treeData, nodes, groups, translation);

  const edgeMetadata = createEdgeMetadata(treeData.edges);
  const processedConnections = new Set<string>();

  for (const source of nodes.values()) {
    for (let index = 0; index < source.connections.length; index += 1) {
      const targetId = source.connections[index];
      const target = nodes.get(targetId);

      if (!target) {
        continue;
      }

      const key = edgeKey(source.id, target.id);

      if (processedConnections.has(key)) {
        continue;
      }

      processedConnections.add(key);

      if (!shouldRenderEdge(source, target)) {
        continue;
      }

      const metadata = edgeMetadata.get(key);

      let arcCenter = metadata?.arcCenter;

      if (!arcCenter && source.group === target.group && source.group !== -1) {
        if (source.orbit === target.orbit && source.orbit > 0) {
          const rawGroup = treeData.groups?.[String(source.group)];

          if (
            rawGroup &&
            isFiniteNumber(rawGroup.x) &&
            isFiniteNumber(rawGroup.y)
          ) {
            arcCenter = { x: rawGroup.x, y: rawGroup.y };
          }
        }
      }

      edges.push({
        index: metadata?.index ?? -1,
        from: source.id,
        to: target.id,
        orbit: metadata?.orbit ?? source.orbit,
        arcCenter: getTranslatedArcCenter(
          arcCenter,
          source,
          target,
          translation,
        ),
      });
    }
  }

  return {
    nodes,
    edges,
    groups,
    bounds: getBounds(nodes),
    mainBounds,
  };
}

function createTreeNode(
  rawKey: string,
  rawNode: RawGggNode,
  allocatedSet: Set<string>,
  activeAscendancy: AscendancyMeta | undefined,
): TreeNode | null {
  if (!isFiniteNumber(rawNode.x) || !isFiniteNumber(rawNode.y)) {
    return null;
  }

  const id = getSkillId(rawKey, rawNode);

  if (!id) {
    return null;
  }

  const unlockNodes = uniqueIds(rawNode.unlockConstraint?.nodes);
  const unlockAscendancy = rawNode.unlockConstraint?.ascendancy;
  const isConditional = rawNode.unlockConstraint !== undefined;

  if (
    isConditional &&
    !isConditionalNodeVisible(
      unlockNodes,
      unlockAscendancy,
      allocatedSet,
      activeAscendancy,
    )
  ) {
    return null;
  }

  const out = uniqueIds(rawNode.out);
  const incoming = uniqueIds(rawNode.in);
  const connections = mergeConnections(out, incoming, id);

  const classStartIndex = normalizeNumberArray(rawNode.classStartIndex);
  const name = rawNode.name ?? "";
  const isJewelSocket = rawNode.isJewelSocket === true;
  const ascendancyId = getRawAscendancyId(rawNode);

  return {
    id,
    skill: Number(id),

    internalId: rawNode.id,
    name,
    icon: rawNode.icon,
    stats: cleanStats(rawNode.stats),
    flavourText: normalizeFlavourText(rawNode.flavourText),

    x: rawNode.x,
    y: rawNode.y,

    group: rawNode.group ?? -1,
    orbit: rawNode.orbit ?? 0,
    orbitIndex: rawNode.orbitIndex ?? 0,

    out,
    in: incoming,
    connections,

    edgeIndexes: normalizeNumberArray(rawNode.edges),

    isAllocated: allocatedSet.has(id),

    isNotable: rawNode.isNotable === true,
    isKeystone: rawNode.isKeystone === true,
    isMastery: rawNode.isMastery === true,
    isJewelSocket,
    isGenericAttribute: rawNode.isGenericAttribute === true,

    isClassStart: classStartIndex.length > 0,
    isAscendancyStart: rawNode.isAscendancyStart === true,
    isAscendancy: ascendancyId !== undefined,

    isOnlyImage: rawNode.isOnlyImage === true,
    noRadius:
      rawNode.noRadius === true ||
      (isJewelSocket && name.includes("SinisterJewelSocket")),

    ascendancyId,

    classStartIndex: classStartIndex.length > 0 ? classStartIndex : undefined,

    activeEffectImage: rawNode.activeEffectImage,

    isConditional,
    unlockNodes,
    unlockAscendancy,

    raw: rawNode,
  };
}

function collectAscendancyMetas(
  treeData: RawGggTree,
): Map<string, AscendancyMeta> {
  const result = new Map<string, AscendancyMeta>();

  const rawClasses = (
    treeData as RawGggTree & {
      classes?: RawClass[];
    }
  ).classes;

  for (const rawClass of rawClasses ?? []) {
    for (const rawAscendancy of rawClass.ascendancies ?? []) {
      if (!rawAscendancy.id) {
        continue;
      }

      result.set(rawAscendancy.id, {
        internalId: rawAscendancy.id,
        name: rawAscendancy.name,
        offsetX: rawAscendancy.offsetX ?? 0,
        offsetY: rawAscendancy.offsetY ?? 0,
      });
    }
  }

  return result;
}

function resolveActiveAscendancy(
  treeData: RawGggTree,
  allocatedSet: Set<string>,
  metas: Map<string, AscendancyMeta>,
  requestedId: string | undefined,
): AscendancyMeta | undefined {
  if (requestedId) {
    const requested = requestedId.trim().toLowerCase();

    for (const meta of metas.values()) {
      if (
        meta.internalId.toLowerCase() === requested ||
        meta.name?.toLowerCase() === requested
      ) {
        return meta;
      }
    }

    return {
      internalId: requestedId,
      offsetX: 0,
      offsetY: 0,
    };
  }

  if (!treeData.nodes) {
    return undefined;
  }

  const usage = new Map<string, number>();

  for (const [rawKey, rawNode] of Object.entries(treeData.nodes)) {
    const skillId = getSkillId(rawKey, rawNode);
    const ascendancyId = getRawAscendancyId(rawNode);

    if (!skillId || !ascendancyId || !allocatedSet.has(skillId)) {
      continue;
    }

    usage.set(ascendancyId, (usage.get(ascendancyId) ?? 0) + 1);
  }

  let selectedId: string | undefined;
  let selectedCount = 0;

  for (const [ascendancyId, count] of usage) {
    if (count > selectedCount) {
      selectedId = ascendancyId;
      selectedCount = count;
    }
  }

  if (!selectedId) {
    return undefined;
  }

  return (
    metas.get(selectedId) ?? {
      internalId: selectedId,
      offsetX: 0,
      offsetY: 0,
    }
  );
}

function createAscendancyTranslation(
  nodes: Map<string, TreeNode>,
  activeAscendancy: AscendancyMeta,
): AscendancyTranslation | null {
  let startNode: TreeNode | undefined;

  for (const node of nodes.values()) {
    if (
      node.isAscendancyStart &&
      node.ascendancyId === activeAscendancy.internalId
    ) {
      startNode = node;
      break;
    }
  }

  if (!startNode) {
    return null;
  }

  const worldAnchorX = startNode.x + activeAscendancy.offsetX;
  const worldAnchorY = startNode.y + activeAscendancy.offsetY;

  return {
    ascendancyId: activeAscendancy.internalId,
    offsetX: HUB_WORLD_CENTER.x - worldAnchorX,
    offsetY: HUB_WORLD_CENTER.y - worldAnchorY,
  };
}

function translateActiveAscendancyNodes(
  nodes: Map<string, TreeNode>,
  translation: AscendancyTranslation,
): void {
  for (const node of nodes.values()) {
    if (node.isAscendancy && node.ascendancyId === translation.ascendancyId) {
      node.x += translation.offsetX;
      node.y += translation.offsetY;
    }
  }
}

function getTranslatedArcCenter(
  arcCenter: Point | undefined,
  source: TreeNode,
  target: TreeNode,
  translation: AscendancyTranslation | null,
): Point | undefined {
  if (!arcCenter || !translation) {
    return arcCenter;
  }

  const isTranslatedAscendancyEdge =
    source.isAscendancy &&
    target.isAscendancy &&
    source.ascendancyId === translation.ascendancyId &&
    target.ascendancyId === translation.ascendancyId;

  if (!isTranslatedAscendancyEdge) {
    return arcCenter;
  }

  return {
    x: arcCenter.x + translation.offsetX,
    y: arcCenter.y + translation.offsetY,
  };
}

function parseVisibleGroups(
  treeData: RawGggTree,
  nodes: Map<string, TreeNode>,
  groups: Map<string, TreeGroup>,
  translation: AscendancyTranslation | null,
): void {
  if (!treeData.groups) {
    return;
  }

  for (const [id, rawGroup] of Object.entries(treeData.groups)) {
    const visibleNodeIds: string[] = [];

    for (const rawNodeId of rawGroup.nodes ?? []) {
      const nodeId = String(rawNodeId);

      if (nodes.has(nodeId)) {
        visibleNodeIds.push(nodeId);
      }
    }

    if (visibleNodeIds.length === 0) {
      continue;
    }

    let x = rawGroup.x;
    let y = rawGroup.y;

    if (
      translation &&
      groupBelongsToTranslatedAscendancy(
        visibleNodeIds,
        nodes,
        translation.ascendancyId,
      )
    ) {
      x += translation.offsetX;
      y += translation.offsetY;
    }

    groups.set(id, {
      id,
      x,
      y,
      orbits: rawGroup.orbits ?? [],
      nodes: visibleNodeIds,
    });
  }
}

function groupBelongsToTranslatedAscendancy(
  nodeIds: readonly string[],
  nodes: Map<string, TreeNode>,
  activeAscendancyId: string,
): boolean {
  for (let index = 0; index < nodeIds.length; index += 1) {
    const node = nodes.get(nodeIds[index]);

    if (
      !node ||
      !node.isAscendancy ||
      node.ascendancyId !== activeAscendancyId
    ) {
      return false;
    }
  }

  return nodeIds.length > 0;
}

function createEdgeMetadata(
  rawEdges: RawGggEdge[] | undefined,
): Map<string, EdgeMetadata> {
  const metadata = new Map<string, EdgeMetadata>();

  for (let index = 0; index < (rawEdges?.length ?? 0); index += 1) {
    const edge = rawEdges![index];

    const from = String(edge.from);
    const to = String(edge.to);

    if (!from || !to) {
      continue;
    }

    const arcCenter =
      isFiniteNumber(edge.orbitX) && isFiniteNumber(edge.orbitY)
        ? {
            x: edge.orbitX,
            y: edge.orbitY,
          }
        : undefined;

    const key = edgeKey(from, to);
    const previous = metadata.get(key);

    /*
     * Якщо export містить дубль, пріоритет має variant з arcCenter.
     */
    if (!previous || (!previous.arcCenter && arcCenter)) {
      metadata.set(key, {
        index,
        orbit: edge.orbit,
        arcCenter,
      });
    }
  }

  return metadata;
}

function shouldRenderEdge(source: TreeNode, target: TreeNode): boolean {
  if (source.isClassStart || target.isClassStart) {
    return false;
  }

  if (source.isMastery || target.isMastery) {
    return false;
  }

  if (
    source.isOnlyImage ||
    target.isOnlyImage ||
    source.noRadius ||
    target.noRadius
  ) {
    return false;
  }

  if (source.isAscendancy !== target.isAscendancy) {
    return false;
  }

  if (
    source.isAscendancy &&
    target.isAscendancy &&
    source.ascendancyId !== target.ascendancyId
  ) {
    return false;
  }

  return true;
}

function shouldIncludeInMainBounds(node: TreeNode): boolean {
  return !(
    node.isAscendancy ||
    node.isOnlyImage ||
    node.noRadius ||
    node.isClassStart
  );
}

function isConditionalNodeVisible(
  unlockNodes: readonly string[],
  unlockAscendancy: string | undefined,
  allocatedSet: Set<string>,
  activeAscendancy: AscendancyMeta | undefined,
): boolean {
  for (let index = 0; index < unlockNodes.length; index += 1) {
    if (!allocatedSet.has(unlockNodes[index])) {
      return false;
    }
  }

  if (!unlockAscendancy) {
    return true;
  }

  if (!activeAscendancy) {
    return false;
  }

  const target = unlockAscendancy.toLowerCase();

  return (
    activeAscendancy.internalId.toLowerCase() === target ||
    activeAscendancy.name?.toLowerCase() === target
  );
}

function getRawAscendancyId(rawNode: RawGggNode): string | undefined {
  const record = rawNode as Record<string, unknown>;

  return (
    getOptionalString(record.ascendancyId) ??
    getOptionalString(record.ascendancyName) ??
    getOptionalString(record.ascendancy)
  );
}

function getSkillId(rawKey: string, rawNode: RawGggNode): string | null {
  const skill = rawNode.skill ?? Number(rawKey);

  return Number.isFinite(skill) ? String(skill) : null;
}

function uniqueIds(values: Array<string | number> | undefined): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  const result = new Set<string>();

  for (let index = 0; index < values.length; index += 1) {
    result.add(String(values[index]));
  }

  return [...result];
}

function mergeConnections(
  out: readonly string[],
  incoming: readonly string[],
  ownId: string,
): string[] {
  const result = new Set<string>();

  for (let index = 0; index < out.length; index += 1) {
    if (out[index] !== ownId) {
      result.add(out[index]);
    }
  }

  for (let index = 0; index < incoming.length; index += 1) {
    if (incoming[index] !== ownId) {
      result.add(incoming[index]);
    }
  }

  return [...result];
}

function normalizeNumberArray(value: number[] | number | undefined): number[] {
  if (Array.isArray(value)) {
    const result: number[] = [];

    for (let index = 0; index < value.length; index += 1) {
      if (Number.isFinite(value[index])) {
        result.push(value[index]);
      }
    }

    return result;
  }

  return Number.isFinite(value) ? [value] : [];
}

function normalizeFlavourText(
  value: string[] | string | undefined,
): string[] | undefined {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function cleanStats(stats: string[] | undefined): string[] {
  if (!stats || stats.length === 0) {
    return [];
  }

  const result = new Array<string>(stats.length);

  for (let index = 0; index < stats.length; index += 1) {
    result[index] = stats[index].replace(/\[(?:[^|\]]*\|)?([^\]]+)\]/g, "$1");
  }

  return result;
}

function getBounds(
  nodes: Map<string, TreeNode>,
  predicate?: (node: TreeNode) => boolean,
): TreeBounds {
  const bounds = createEmptyBounds();

  for (const node of nodes.values()) {
    if (predicate && !predicate(node)) {
      continue;
    }

    extendBounds(bounds, node.x, node.y);
  }

  return normalizeBounds(bounds);
}

function edgeKey(from: string, to: string): string {
  const numericFrom = Number(from);
  const numericTo = Number(to);

  if (Number.isFinite(numericFrom) && Number.isFinite(numericTo)) {
    return numericFrom < numericTo
      ? `${numericFrom}|${numericTo}`
      : `${numericTo}|${numericFrom}`;
  }

  return from < to ? `${from}|${to}` : `${to}|${from}`;
}

function createEmptyBounds(): TreeBounds {
  return {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };
}

function emptyBounds(): TreeBounds {
  return {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  };
}

function extendBounds(bounds: TreeBounds, x: number, y: number): void {
  if (x < bounds.minX) {
    bounds.minX = x;
  }

  if (x > bounds.maxX) {
    bounds.maxX = x;
  }

  if (y < bounds.minY) {
    bounds.minY = y;
  }

  if (y > bounds.maxY) {
    bounds.maxY = y;
  }
}

function isBoundsEmpty(bounds: TreeBounds): boolean {
  return !Number.isFinite(bounds.minX);
}

function normalizeBounds(bounds: TreeBounds): TreeBounds {
  return isBoundsEmpty(bounds) ? emptyBounds() : bounds;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
