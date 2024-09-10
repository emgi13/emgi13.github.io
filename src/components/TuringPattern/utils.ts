import type p5 from "p5";
import seedrandom from "seedrandom";

// INFO: get Periodic Boundary Conditions
export const getPBC = (
  grid: Float32Array,
  size: { width: number; height: number },
  i: number,
  j: number,
): number => {
  const { width, height } = size;
  return grid[((i + width) % width) + ((j + height) % height) * width];
};

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
    // console.log(x, f(x), g(x));
    x -= f(x) / g(x);
    i += 1;
    if (i > 100) {
      throw new Error("Root Calculation : Iterations exceded");
    }
  }
  return x;
}

export const Laplace =
  (getter: (i: number, j: number) => number) =>
  (i: number, j: number, dx: number) => {
    const sum =
      getter(i - 1, j) + getter(i + 1, j) + getter(i, j - 1) + getter(i, j + 1);
    return (sum - 4 * getter(i, j)) / (dx * dx);
  };

// let mins: number[] = [];
// let maxs: number[] = [];

export function makeImage(
  p: p5,
  grid: Float32Array,
  size: { width: number; height: number },
  range: { min: number; max: number },
): p5.Image {
  // Create an image object
  const { width, height } = size;
  const img = p.createImage(width, height);
  img.loadPixels();

  const { min, max } = range;

  // Set pixel values based on the 2D array
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const brightness = p.map(grid[i + j * width], min, max, 0, 255);
      const index = (i + j * width) * 4; // Calculate pixel index
      img.pixels[index] = brightness; // Red
      img.pixels[index + 1] = brightness; // Green
      img.pixels[index + 2] = brightness; // Blue
      img.pixels[index + 3] = 255; // Alpha
    }
  }

  img.updatePixels(); // Update the image with new pixel data
  return img;
}

export const rngWithMinMax = (seed: string, min: number, max: number) => {
  const rng = seedrandom(seed);
  return () => min + (max - min) * rng();
};
