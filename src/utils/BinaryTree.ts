export type BinaryTreeDao<T> = {
  elem: T;
  children: [null | BinaryTreeDao<T>, null | BinaryTreeDao<T>];
};

export class BinaryTree<T> {
  elem: T;
  children: [null | BinaryTree<T>, null | BinaryTree<T>];

  constructor(
    elem: T,
    children: [null | BinaryTree<T>, null | BinaryTree<T>] = [null, null],
  ) {
    this.elem = elem;
    this.children = children;
  }

  static toDto<T, U>(
    tree: BinaryTree<T>,
    elementToDto: (elem: T) => U,
  ): BinaryTreeDao<U> {
    const elemDto = elementToDto(tree.elem);
    const left = tree.children[0]
      ? BinaryTree.toDto(tree.children[0], elementToDto)
      : null;
    const right = tree.children[1]
      ? BinaryTree.toDto(tree.children[1], elementToDto)
      : null;
    return { elem: elemDto, children: [left, right] };
  }

  static fromDto<T, U>(
    dao: BinaryTreeDao<U>,
    elementFromDao: (elem: U) => T,
  ): BinaryTree<T> {
    const elem = elementFromDao(dao.elem);
    const left = dao.children[0]
      ? BinaryTree.fromDto(dao.children[0], elementFromDao)
      : null;
    const right = dao.children[1]
      ? BinaryTree.fromDto(dao.children[1], elementFromDao)
      : null;
    return new BinaryTree(elem, [left, right]);
  }

  static async fromDtoAsync<T, U>(
    dao: BinaryTreeDao<U>,
    elementFromDao: (elem: U) => Promise<T>,
  ): Promise<BinaryTree<T>> {
    const elemPromise = elementFromDao(dao.elem);
    const leftPromise = dao.children[0]
      ? BinaryTree.fromDtoAsync(dao.children[0], elementFromDao)
      : Promise.resolve(null);
    const rightPromise = dao.children[1]
      ? BinaryTree.fromDtoAsync(dao.children[1], elementFromDao)
      : Promise.resolve(null);
    const [elem, left, right] = await Promise.all([
      elemPromise,
      leftPromise,
      rightPromise,
    ]);
    return new BinaryTree(elem, [left, right]);
  }

  reduce<A>(fn: (acc: A, elem: T) => A, initialValue: A): A {
    let acc = fn(initialValue, this.elem);
    const [left, right] = this.children;
    if (left !== null) {
      acc = left.reduce(fn, acc);
    }
    if (right !== null) {
      acc = right.reduce(fn, acc);
    }
    return acc;
  }

  scanmap<U, C>(
    fn: (elem: T, context: C) => U,
    context: C,
    nextContext: (elem: T, context: C, childIndex: 0 | 1) => C,
  ): BinaryTree<U> {
    const newElem = fn(this.elem, context);
    const [left, right] = this.children;
    const nextLeft =
      left === null
        ? null
        : left.scanmap(fn, nextContext(this.elem, context, 0), nextContext);
    const nextRight =
      right === null
        ? null
        : right.scanmap(fn, nextContext(this.elem, context, 1), nextContext);
    return new BinaryTree<U>(newElem, [nextLeft, nextRight]);
  }

  numLeafs(): number {
    const [left, right] = this.children;
    if (left === null && right === null) return 1;
    return (left?.numLeafs() ?? 0) + (right?.numLeafs() ?? 0);
  }

  listLeaf(): T[] {
    const [left, right] = this.children;
    if (left === null && right === null) return [this.elem];
    return (left?.listLeaf() ?? []).concat(right?.listLeaf() ?? []);
  }

  findHeight(findFn: (elem: T) => boolean): number | null {
    if (findFn(this.elem)) return 0;
    const [left, right] = this.children;
    if (left !== null) {
      const leftHeight = left.findHeight(findFn);
      if (leftHeight !== null) return leftHeight + 1;
    }
    if (right !== null) {
      const rightHeight = right.findHeight(findFn);
      if (rightHeight !== null) return rightHeight + 1;
    }
    return null;
  }
}
