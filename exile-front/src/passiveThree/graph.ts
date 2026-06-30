import { type ParsedTree, type TreeNode } from "./types";

export class TreeGraph {
  private readonly tree: ParsedTree;
  constructor(tree: ParsedTree) {
    this.tree = tree;
  }

  getNode(id: string): TreeNode | undefined {
    return this.tree.nodes.get(id);
  }

  getNodes(): TreeNode[] {
    return [...this.tree.nodes.values()];
  }

  getEdges() {
    return this.tree.edges;
  }

  getGroups() {
    return this.tree.groups;
  }

  getBounds() {
    return this.tree.bounds;
  }
}
