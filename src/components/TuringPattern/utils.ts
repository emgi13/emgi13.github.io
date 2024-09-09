import type p5 from "p5";

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
  let i = 0;
  const g = getSlope(f, dx);
  while (Math.abs(f(x)) > dy) {
    console.log(x, f(x), g(x));
    x -= f(x) / g(x);
    i += 1;
    if (i > 100) {
      throw new Error("Root Calculation : Iterations exceded");
    }
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
    getter(i - 1, j) + getter(i + 1, j) + getter(i, j - 1) + getter(i, j + 1);
  return (sum - 4 * getter(i, j)) / (dx * dx);
}

export function findMinMax(
  matrix: number[][],
): { min: number; max: number } | null {
  if (matrix.length === 0 || matrix[0].length === 0) {
    return null; // Return null if the input is an empty array
  }

  let min = Infinity;
  let max = -Infinity;

  for (const row of matrix) {
    for (const num of row) {
      if (num < min) {
        min = num;
      }
      if (num > max) {
        max = num;
      }
    }
  }

  return { min, max };
}

export function makeImage(
  p: p5,
  grid: number[][],
  size: number,
  invert: boolean = true,
): p5.Image {
  // Create an image object
  let img = p.createImage(size, size);
  img.loadPixels();

  // get min max values
  const { min, max } = findMinMax(grid)!;

  // Set pixel values based on the 2D array
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let brightness = p.map(grid[i][j], min, max, 0, 255);
      if (invert) brightness = 255 - brightness;
      let index = (j + i * size) * 4; // Calculate pixel index
      img.pixels[index] = brightness; // Red
      img.pixels[index + 1] = brightness; // Green
      img.pixels[index + 2] = brightness; // Blue
      img.pixels[index + 3] = 255; // Alpha
    }
  }

  img.updatePixels(); // Update the image with new pixel data
  return img;
}
