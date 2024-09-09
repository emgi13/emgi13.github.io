import { getPBC, getRoot, Laplace, rngWithMinMax } from "./utils";

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

// INFO: Figure 1 : Eq 1

type Fig1_layers = "a" | "h";

type Fig1_vars = "Da" | "Ra" | "Ma" | "Ka" | "Sa" | "Dh" | "Rh" | "Mh";

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

// INFO: Fig2 : Eq 8

type Fig2_layers = "a" | "s" | "y";

type Fig2_vars =
  | "Da"
  | "Ra"
  | "Ka"
  | "Ds"
  | "Ss"
  | "Ks"
  | "Rs"
  | "Ms"
  | "Ry"
  | "Ky"
  | "My"
  | "Sy";

export type fig2_vars_type = {
  Da: number;
  Ra: number;
  Ka: number;
  Ds: number;
  Ss: number;
  Ks: number;
  Rs: number;
  Ms: number;
  Ry: number;
  Ky: number;
  My: number;
  Sy: number;
};

export class Fig2 implements Runner<Fig2_layers, Fig2_vars> {
  size: number;
  dt: number;
  seed: number;
  grids: { a: number[][]; s: number[][]; y: number[][] };
  vars: fig2_vars_type;
  steady: { a: number; s: number; y: number };
  fluc: number;
  dx: number;
  constructor(
    vars: fig2_vars_type,
    init_val: { a: number; aa: number; s: number; y: number },
    size: number = 50,
    seed: number = 2938109238102,
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
    this.steady = { a: 0, s: 0, y: 0 };

    const rng = rngWithMinMax(this.seed, 0, 3000);

    // INFO: make the initial grid
    let a_grid = [];
    let s_grid = [];
    let y_grid = [];
    for (let i = 0; i < this.size; i++) {
      let a_row = [];
      let s_row = [];
      let y_row = [];
      for (let j = 0; j < this.size; j++) {
        if (rng() < 10) {
          a_row.push(init_val.aa);
        } else {
          a_row.push(init_val.a);
        }
        s_row.push(init_val.s);
        y_row.push(init_val.y);
      }
      a_grid.push(a_row);
      s_grid.push(s_row);
      y_grid.push(y_row);
    }
    this.grids = { a: a_grid, s: s_grid, y: y_grid };
    this.step = this.step.bind(this);
  }
  step() {
    const vars = this.vars;
    let a_grid = structuredClone(this.grids.a);
    let s_grid = structuredClone(this.grids.s);
    let y_grid = structuredClone(this.grids.y);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const a = this.grids.a[i][j];
        const s = this.grids.s[i][j];
        const y = this.grids.y[i][j];
        a_grid[i][j] +=
          this.dt *
          (vars.Da *
            Laplace((x, y) => getPBC(this.grids.a, x, y), i, j, this.dx) +
            vars.Ra * ((a * a * s) / (1 + vars.Ka * a * a) - a));
        s_grid[i][j] +=
          this.dt *
          (vars.Ds *
            Laplace((x, y) => getPBC(this.grids.s, x, y), i, j, this.dx) +
            vars.Ss / (1 + vars.Ks * y) -
            (vars.Rs * a * a * s) / (1 + vars.Ka * a * a) -
            vars.Ms * s);
        y_grid[i][j] +=
          this.dt *
          ((vars.Ry * y * y) / (1 + vars.Ky * y * y) -
            vars.My * y +
            vars.Sy * a);
      }
    }
    this.grids = { a: a_grid, s: s_grid, y: y_grid };
  }
}
