import p5 from "p5";
import React from "react";
import "./TuringPattern.scss";

// INFO: get Periodic Boundary Conditions
function getPBC(grid: number[][], i: number, j: number): number {
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
const getSlope = (f: (x: number) => number, dx: number) => (x: number) => {
  return (f(x + dx) - f(x)) / dx;
};

// INFO: Newton-Rapson root finding
// WARN: Change to bisection method as soon as you find a root interval.
function getRoot(
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

//
function Laplace(
  getter: (i: number, j: number) => number,
  i: number,
  j: number,
  dx: number,
) {
  const sum =
    getter(i - i, j) + getter(i + 1, j) + getter(i, j - 1) + getter(i, j + 1);
  return (sum - 4 * getter(i, j)) / (dx * dx);
}

// INFO: interface creation
// add specific classes for each figure,
// customize the runner,
// add interface after to modify the props
// sliders and other props for modification of values
// -- These props will be modified by an interface that will
// -- have all the values
// do not randomize on stop button press
// add seed variable for user to set the random seed for each.
// in the website add references to the three pdfs
// runner should not appear on the top of the page,
// runners for each section instead.

interface Pattern {
  grids: number[][][];
  size: number;
  layers: number;
  evolvers: ((i: number, j: number) => number)[];
}

export class TuringPattern extends React.Component {
  // INFO: Make this generic and have it accept a runner prop.
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  grid: number[][];
  constructor(props: { gridSize: number }) {
    super(props);

    // Initializers
    this.p5ref = React.createRef();
    this.grid = [];
  }

  makeInitGrid() {
    this.makeInitGridFig1();
  }

  makeInitGridFig1() {
    const aa = 0;
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const height = this.p5ref.current?.offsetWidth || 400;
      const width = this.p5ref.current?.offsetHeight || 400;
      p.frameRate(12);
      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
    };

    p.draw = () => {
      p.clear();
      p.fill(255);
      p.stroke(255);
    };
  };

  componentDidMount(): void {
    this.p5 = new p5(this.sketch, this.p5ref.current as HTMLElement);
  }

  componentWillUnmount(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  render() {
    return (
      <div className="TuringPatterns">
        <div className="canvas-cont" ref={this.p5ref}></div>
      </div>
    );
  }
}
