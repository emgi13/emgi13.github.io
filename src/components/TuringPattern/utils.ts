// INFO: get Periodic Boundary Conditions
export function getPBC(grid: number[][], i: number, j: number): number {
  const width = grid.length;
  const height = grid.at(0)!.length;
  let x = i;
  if (x < 0) x += width;
  x %= width;
  let y = j;
  if (y < 0) y += height;
  y %= height;
  return grid[x][y];
}

// INFO: Implement the Newton-Rapson method of root finding for
// calculating the steady state conditions
// then apply 3-10% pertubations to the steady state
// as the computational paper suggested
export const getSlope =
  (f: (x: number) => number, dx: number) => (x: number) => {
    return (f(x + dx) - f(x)) / dx;
  };

// INFO: Newton-Rapson root finding
// WARN: Change to bisection method as soon as you find a root interval.
export function getRoot(
  f: (x: number) => number,
  x0: number,
  dx: number,
  dy: number,
): number {
  let x = x0;
  const g = getSlope(f, dx);
  while (Math.abs(x) > dy) {
    x -= f(x) / g(x);
  }
  return x;
}

export function Laplace(
  getter: (i: number, j: number) => number,
  i: number,
  j: number,
  dx: number,
) {
  const sum =
    getter(i - i, j) + getter(i + 1, j) + getter(i, j - 1) + getter(i, j + 1);
  return (sum - 4 * getter(i, j)) / (dx * dx);
}
