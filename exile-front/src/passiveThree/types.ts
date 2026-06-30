export type NodeId = string;

export interface Point {
  x: number;
  y: number;
}

export interface TreeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface TreeGroup {
  id: string;
  x: number;
  y: number;
  orbits: number[];
  nodes: NodeId[];
}

export interface TreeNode {
  id: NodeId;
  skill: number;

  internalId?: string;

  name: string;
  icon?: string;
  stats: string[];
  flavourText?: string[];

  x: number;
  y: number;

  group: number;
  orbit: number;
  orbitIndex: number;

  out: NodeId[];
  in: NodeId[];
  connections: NodeId[];
  edgeIndexes: number[];

  isAllocated: boolean;

  isNotable: boolean;
  isKeystone: boolean;
  isMastery: boolean;
  isJewelSocket: boolean;
  isGenericAttribute: boolean;

  isClassStart: boolean;

  /*
   * Diamond/root node усередині ascendancy panel.
   * Саме ця нода використовується разом із offsetX/offsetY
   * для точного переносу panel у центральний hub.
   */
  isAscendancyStart: boolean;

  isAscendancy: boolean;

  isOnlyImage: boolean;
  noRadius: boolean;

  /*
   * Internal GGG id, наприклад Witch1, Monk2, Ranger3.
   */
  ascendancyId?: string;

  classStartIndex?: number[];

  activeEffectImage?: string;

  isConditional: boolean;
  unlockNodes: NodeId[];
  unlockAscendancy?: string;

  raw: unknown;
}

export interface TreeEdge {
  index: number;
  from: NodeId;
  to: NodeId;

  orbit?: number;
  arcCenter?: Point;
}

export interface ParsedTree {
  nodes: Map<NodeId, TreeNode>;
  edges: TreeEdge[];
  groups: Map<string, TreeGroup>;

  bounds: TreeBounds;
  mainBounds: TreeBounds;
}

/* -------------------------------------------------------------------------- */
/* Raw GGG data.json types                                                    */
/* -------------------------------------------------------------------------- */

export interface RawGggUnlockConstraint {
  nodes?: number[];
  ascendancy?: string;
}

export interface RawGggAscendancy {
  /*
   * Internal id: Witch1, Ranger2, Monk3...
   */
  id: string;

  /*
   * Display name: Infernalist, Invoker, Deadeye...
   */
  name?: string;

  /*
   * Дані для переносу panel у центр дерева.
   */
  offsetX?: number;
  offsetY?: number;

  [key: string]: unknown;
}

export interface RawGggClass {
  name?: string;
  ascendancies?: RawGggAscendancy[];

  [key: string]: unknown;
}

export interface RawGggTree {
  nodes?: Record<string, RawGggNode>;
  edges?: RawGggEdge[];
  groups?: Record<string, RawGggGroup>;

  /*
   * Тут лежать ascendancy offsetX/offsetY.
   */
  classes?: RawGggClass[];

  min_x?: number;
  min_y?: number;
  max_x?: number;
  max_y?: number;
}

export interface RawGggNode {
  id?: string;
  skill?: number;

  name?: string;
  icon?: string;
  stats?: string[];
  flavourText?: string[] | string;

  x?: number;
  y?: number;

  group?: number;
  orbit?: number;
  orbitIndex?: number;

  out?: Array<string | number>;
  in?: Array<string | number>;
  edges?: number[];

  isNotable?: boolean;
  isKeystone?: boolean;
  isMastery?: boolean;
  isJewelSocket?: boolean;
  isGenericAttribute?: boolean;

  /*
   * Root/diamond node усередині ascendancy panel.
   */
  isAscendancyStart?: boolean;

  classStartIndex?: number[];

  /*
   * Internal id, наприклад Witch1.
   */
  ascendancyId?: string;

  isOnlyImage?: boolean;
  noRadius?: boolean;

  activeEffectImage?: string;

  unlockConstraint?: RawGggUnlockConstraint;

  [key: string]: unknown;
}

export interface RawGggEdge {
  from: string | number;
  to: string | number;

  orbit?: number;
  orbitX?: number;
  orbitY?: number;
}

export interface RawGggGroup {
  x: number;
  y: number;
  orbits?: number[];
  nodes?: Array<string | number>;
}
