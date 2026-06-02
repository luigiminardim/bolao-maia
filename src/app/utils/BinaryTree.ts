export class BinaryTree<T> {
  elem: T;
  children: [null | BinaryTree<T>, null | BinaryTree<T>];

  constructor(elem: T, children: [null | BinaryTree<T>, null | BinaryTree<T>]) {
    this.elem = elem;
    this.children = children;
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
