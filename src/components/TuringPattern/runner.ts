import { getPBC, getRoot, Laplace } from "./utils";
import seedrandom from "seedrandom";

export interface Runner<L extends string, V extends string> {
  grids: { [Layer in L]: number[][] };
  size: number;
  step: () => void;
  vars: { [Variable in V]: number };
  seed: number;
  steady: { [Layer in L]: number };
  fluc: number;
  dx: number;
  dt: number;
}

type Fig1_layers = "a" | "h";

type Fig1_vars = "Da" | "Ra" | "Ma" | "Ka" | "Sa" | "Dh" | "Rh" | "Mh";

const rngWithMinMax = (seed: number, min: number, max: number) => {
  const rng = seedrandom(`${seed}`);
  return () => min + (max - min) * rng();
};

export type fig1_vars_type = {
  Da: number;
  Ra: number;
  Ma: number;
  Ka: number;
  Sa: number;
  Dh: number;
  Rh: number;
  Mh: number;
};

export class Fig1 implements Runner<Fig1_layers, Fig1_vars> {
  size: number;
  seed: number;
  grids: { a: number[][]; h: number[][] };
  vars: fig1_vars_type;
  steady: { a: number; h: number };
  fluc: number;
  dx: number;
  dt: number;
  constructor(
    vars: fig1_vars_type,
    size: number = 50,
    seed: number = 1,
    fluc: number = 3,
    dx: number = 1,
    dt: number = 1,
  ) {
    this.size = size;
    this.seed = seed;
    this.vars = vars;
    this.fluc = fluc;
    this.dx = dx;
    this.dt = dt;

    // INFO: Find the steady state solution
    const aa_func = (a: number) => {
      return (
        (this.vars.Ra * a * a * this.vars.Mh) /
        (1 + this.vars.Ka * a * a) /
        (this.vars.Rh * a * a) -
        this.vars.Ma * a +
        this.vars.Sa
      );
    };

    const aa = getRoot(aa_func, 0.2, 1e-3, 1e-10);

    const hh = (this.vars.Rh * aa * aa) / this.vars.Mh;

    this.steady = { a: aa, h: hh };
    // console.log("Steady", this.steady);

    const rng = rngWithMinMax(seed, (100 - fluc) / 100, (100 + fluc) / 100);

    // INFO: make the initial grid
    let a_grid = [];
    let h_grid = [];
    for (let i = 0; i < this.size; i++) {
      let a_row = [];
      let h_row = [];
      for (let j = 0; j < this.size; j++) {
        a_row.push(this.steady.a * rng());
        h_row.push(this.steady.h * rng());
      }
      a_grid.push(a_row);
      h_grid.push(h_row);
    }
    this.grids = { a: a_grid, h: h_grid };
    // console.info("Grids", this.grids);
    this.step = this.step.bind(this);
  }
  step() {
    let a_grid = structuredClone(this.grids.a);
    let h_grid = structuredClone(this.grids.h);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const a = this.grids.a[i][j];
        const h = this.grids.h[i][j];
        a_grid[i][j] +=
          this.dt *
          (this.vars.Da *
            Laplace((x, y) => getPBC(this.grids.a, x, y), i, j, this.dx) +
            (this.vars.Ra * a * a) / (1 + this.vars.Ka * a * a) / h -
            this.vars.Ma * a +
            this.vars.Sa);
        h_grid[i][j] +=
          this.dt *
          (this.vars.Dh *
            Laplace((x, y) => getPBC(this.grids.h, x, y), i, j, this.dx) +
            this.vars.Rh * a * a -
            this.vars.Mh * h);
      }
    }
    this.grids = { a: a_grid, h: h_grid };
  }
}
