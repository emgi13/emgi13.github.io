import { getPBC, getRoot, Laplace, rngWithMinMax } from "./utils";

// INFO: Eq 1

const _spots_ai: VariableType<ActivInhibChems, ActivInhibParams> = {
  a: {
    D: 0.005,
    r: 0.01,
    u: 0.01,
    s: 0,
    k: 0,
  },
  h: {
    D: 0.2,
    r: 0.02,
    u: 0.02,
    s: 0,
    k: 0,
  },
};

const _stripes_ai = {
  ..._spots_ai,
  a: {
    ..._spots_ai.a,
    k: 0.25,
  },
};

export const ActivInhibParams = {
  spots: _spots_ai,
  stripes: _stripes_ai,
};

export class ActivInhibRunner implements ActivInhibProps {
  flucPerc: number;
  size: { width: number; height: number };
  seed: string;
  dx: number;
  dt: number;
  grids: { a: Float32Array; h: Float32Array };
  range: { a: { min: number; max: number }; h: { min: number; max: number } };
  vars: {
    a: {
      D: number;
      r: number;
      u: number;
      s: number;
      k: number;
    };
    h: {
      D: number;
      r: number;
      u: number;
      s: number;
      k: number;
    };
  };
  profile: boolean;
  stopAfter: number;
  frameNo: number;
  active: boolean;
  aspectRatio: number;
  constructor(params?: Partial<ActivInhibProps>) {
    this.flucPerc = params?.flucPerc || 7;
    this.stopAfter = params?.stopAfter || 2000;
    this.frameNo = 0;
    this.active = true;
    this.size = params?.size || { width: 50, height: 50 };
    this.seed = params?.seed || `${Math.random()}`;
    this.dx = params?.dx || 1;
    this.dt = params?.dt || 1;
    this.profile = params?.profile || false;
    this.aspectRatio = this.size.width / this.size.height;
    this.vars = params?.vars || _stripes_ai;
    this.range = {
      a: { min: Infinity, max: -Infinity },
      h: { min: Infinity, max: -Infinity },
    };
    // binds
    this.step = this.step.bind(this);
    this.prof = this.prof.bind(this);
    // profiler
    if (this.profile) this.prof();
    // make init grid
    this.grids = this.initGrid;
  }

  prof() {
    console.log(this);
    console.time("init");
    for (let i = 0; i < 1_000; i++) {
      this.grids = this.initGrid;
    }
    console.timeEnd("init");
    console.time("run");
    for (let i = 0; i < 1_000; i++) {
      this.step();
    }
    console.timeEnd("run");
  }

  get initGrid(): { a: Float32Array; h: Float32Array } {
    // Find the steady state solution
    const { a: va, h: vh } = this.vars;
    const aa_func = (a: number) => {
      return (
        (va.r * a * a * vh.u) / (1 + va.k * a * a) / (vh.r * a * a) -
        va.u * a +
        va.s
      );
    };
    const aa = getRoot(aa_func, 0.2, 1e-3, 1e-10);
    const hh = (vh.r * aa * aa) / vh.u;

    const rng = rngWithMinMax(
      this.seed,
      (100 - this.flucPerc) / 100,
      (100 + this.flucPerc) / 100,
    );

    const { width, height } = this.size;

    const a_grid: Float32Array = new Float32Array(width * height);
    const h_grid: Float32Array = new Float32Array(width * height);

    for (let i = 0; i < height * width; i++) {
      const a = aa * rng();
      const h = hh * rng();

      if (a > this.range.a.max) {
        this.range.a.max = a;
      } else if (a < this.range.a.min) {
        this.range.a.min = a;
      }

      if (h > this.range.h.max) {
        this.range.h.max = h;
      } else if (h < this.range.h.min) {
        this.range.a.min = h;
      }

      a_grid[i] = a;
      h_grid[i] = h;
    }

    return { a: a_grid, h: h_grid };
  }

  step(): void {
    if (this.frameNo > this.stopAfter) {
      this.active = false;
    }
    this.frameNo += 1;
    let a_min = Infinity;
    let a_max = -Infinity;
    let h_min = Infinity;
    let h_max = -Infinity;

    const { width, height } = this.size;
    const a_grid = new Float32Array(width * height);
    const h_grid = new Float32Array(width * height);

    const { a: va, h: vh } = this.vars;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const a = this.grids.a[i + j * width];
        const h = this.grids.h[i + j * width];

        const LapA = Laplace((x, y) => getPBC(this.grids.a, this.size, x, y));
        const LapH = Laplace((x, y) => getPBC(this.grids.h, this.size, x, y));

        const aa =
          a +
          this.dt *
            (va.D * LapA(i, j, this.dx) +
              (va.r * a * a) / (1 + va.k * a * a) / h -
              va.u * a +
              va.s);
        const hh =
          h + this.dt * (vh.D * LapH(i, j, this.dx) + vh.r * a * a - vh.u * h);

        if (aa < a_min) {
          a_min = aa;
        } else if (aa > a_max) {
          a_max = aa;
        }

        if (hh < h_min) {
          h_min = hh;
        } else if (hh > h_max) {
          h_max = hh;
        }

        a_grid[i + j * width] = aa;
        h_grid[i + j * width] = hh;
      }
    }

    this.grids = { a: a_grid, h: h_grid };
    this.range = {
      a: { min: a_min, max: a_max },
      h: { min: h_min, max: h_max },
    };
  }
}

// INFO: Eq 8

const _giraffe_params: VariableType<AnimalChems, AnimalParams> = {
  a: {
    D: 0.015,
    r: 0.025,
    u: 0,
    s: 0,
    k: 0.1,
  },
  s: {
    D: 0.03,
    r: 0.0025,
    u: 0.00075,
    s: 0.00225,
    k: 20.0,
  },
  y: {
    D: 0,
    r: 0.03,
    u: 0.003,
    s: 0.00015,
    k: 22.0,
  },
};

const _leopard_params: VariableType<AnimalChems, AnimalParams> = {
  a: {
    D: 0.01,
    r: 0.05,
    u: 0,
    s: 0,
    k: 0.5,
  },
  s: {
    D: 0.1,
    r: 0.0035,
    u: 0.003,
    s: 0.0075,
    k: 0.3,
  },
  y: {
    D: 0,
    r: 0.03,
    u: 0.003,
    s: 0.00007,
    k: 22.0,
  },
};

const _cheetah_params: VariableType<AnimalChems, AnimalParams> = {
  a: {
    D: 0.015,
    r: 0.025,
    u: 0,
    s: 0,
    k: 0.5,
  },
  s: {
    D: 0.1,
    r: 0.0025,
    u: 0.00075,
    s: 0.00225,
    k: 1.0,
  },
  y: {
    D: 0,
    r: 0.03,
    u: 0.003,
    s: 0.00015,
    k: 22.0,
  },
};

export const AnimalParams = {
  giraffe: _giraffe_params,
  leopard: _leopard_params,
  cheetah: _cheetah_params,
};

export class AnimalRunner implements AnimalProps {
  size: { width: number; height: number };
  seed: string;
  dx: number;
  dt: number;
  profile: boolean;
  initConc: { a: number; s: number; y: number };
  randA: number;
  randProb: number;
  grids: { a: Float32Array; s: Float32Array; y: Float32Array };
  vars: VariableType<AnimalChems, AnimalParams>;
  range: {
    a: { min: number; max: number };
    s: { min: number; max: number };
    y: { min: number; max: number };
  };
  stopAfter: number;
  frameNo: number;
  active: boolean;
  aspectRatio: number;
  constructor(params?: Partial<AnimalProps>) {
    this.stopAfter = params?.stopAfter || 2_500;
    this.frameNo = 0;
    this.active = true;
    this.size = params?.size || { width: 80, height: 80 };
    this.seed = params?.seed || `${Math.random()}`;
    this.dx = params?.dx || 1;
    this.dt = params?.dt || 1;
    this.initConc = params?.initConc || { a: 0, s: 3, y: 0 };
    this.randA = params?.randA || 5;
    this.randProb = params?.randProb || 0.0008;
    this.aspectRatio = this.size.width / this.size.height;
    this.profile = params?.profile || false;
    this.vars = params?.vars || _giraffe_params;
    this.range = {
      a: { min: 0, max: 5 },
      s: { min: 0, max: 5 },
      y: { min: 0, max: 5 },
    };
    // binds
    this.step = this.step.bind(this);
    this.prof = this.prof.bind(this);
    // profiler
    if (this.profile) this.prof();
    // make init grid
    this.grids = this.initGrid;
  }

  prof() {
    console.log(this);
    console.time("init");
    for (let i = 0; i < 1_000; i++) {
      this.grids = this.initGrid;
    }
    console.timeEnd("init");
    console.time("run");
    for (let i = 0; i < 1_000; i++) {
      this.step();
    }
    console.timeEnd("run");
  }

  get initGrid(): { a: Float32Array; s: Float32Array; y: Float32Array } {
    // Find the steady state solution
    const rng = rngWithMinMax(this.seed, 0, 1);

    const { width, height } = this.size;

    const { a, s, y } = this.initConc;

    const a_grid: Float32Array = new Float32Array(width * height);
    const s_grid: Float32Array = new Float32Array(width * height);
    const y_grid: Float32Array = new Float32Array(width * height);

    for (let i = 0; i < height * width; i++) {
      a_grid[i] = a;
      s_grid[i] = s;
      y_grid[i] = y;
    }

    for (let i = 0; i < width * height * this.randProb; i++) {
      const x = Math.floor(width * rng());
      const y = Math.floor(height * rng());
      a_grid[x + y * width] = this.randA;
    }

    return { a: a_grid, s: s_grid, y: y_grid };
  }

  step(): void {
    if (this.frameNo > this.stopAfter) {
      this.active = false;
      return;
    }
    this.frameNo += 1;
    const { width, height } = this.size;
    const a_grid = new Float32Array(width * height);
    const s_grid = new Float32Array(width * height);
    const y_grid = new Float32Array(width * height);

    let a_min = Infinity;
    let a_max = -Infinity;
    let s_min = Infinity;
    let s_max = -Infinity;
    let y_min = Infinity;
    let y_max = -Infinity;

    const { a: va, s: vs, y: vy } = this.vars;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const a = this.grids.a[i + j * width];
        const s = this.grids.s[i + j * width];
        const y = this.grids.y[i + j * width];

        const LapA = Laplace((x, y) => getPBC(this.grids.a, this.size, x, y));
        const LapS = Laplace((x, y) => getPBC(this.grids.s, this.size, x, y));

        const aa =
          a +
          this.dt *
            (va.D * LapA(i, j, this.dx) +
              va.r * ((a * a * s) / (1 + va.k * a * a) - a));
        const ss =
          s +
          this.dt *
            (vs.D * LapS(i, j, this.dx) +
              vs.s / (1 + vs.k * y) -
              (vs.r * a * a * s) / (1 + va.k * a * a) -
              vs.u * s);
        const yy =
          y +
          this.dt * ((vy.r * y * y) / (1 + vy.k * y * y) - vy.u * y + vy.s * a);

        a_grid[i + j * width] = aa;
        s_grid[i + j * width] = ss;
        y_grid[i + j * width] = yy;

        if (aa < a_min) {
          a_min = aa;
        } else if (aa > a_max) {
          a_max = aa;
        }

        if (ss < s_min) {
          s_min = ss;
        } else if (ss > s_max) {
          s_max = ss;
        }

        if (yy < y_min) {
          y_min = yy;
        } else if (y > y_max) {
          y_max = yy;
        }
      }
    }

    this.grids = { a: a_grid, s: s_grid, y: y_grid };
    this.range = {
      a: { min: a_min, max: a_max },
      s: { min: s_min, max: s_max },
      y: { min: y_min, max: y_max },
    };
  }
}

// INFO: Eq 9-10

export const DragonflyParam: VariableType<DragonflyChems, DragonflyParams> = {
  a: {
    D: 0.01,
    r: 0.0025,
    s: 0.00025,
    k: 0.1,
  },
  s: {
    D: 0.2,
    r: 0.003,
    s: 0.003,
    k: 0,
  },
  b: {
    D: 0.0075,
    r: 0.01875,
    s: 0.00187,
    k: 0.2,
  },
  h: {
    D: 0.15,
    r: 0.0375,
    s: 0,
    k: 0,
  },
};

export class DragonflyRunner implements DragonflyProps {
  flucPerc: number;
  size: { width: number; height: number };
  seed: string;
  dx: number;
  dt: number;
  grids: { a: Float32Array; s: Float32Array; b: Float32Array; h: Float32Array };
  range: {
    a: { min: number; max: number };
    s: { min: number; max: number };
    b: { min: number; max: number };
    h: { min: number; max: number };
  };
  vars: {
    a: {
      D: number;
      r: number;
      s: number;
      k: number;
    };
    s: {
      D: number;
      r: number;
      s: number;
      k: number;
    };
    b: {
      D: number;
      r: number;
      s: number;
      k: number;
    };
    h: {
      D: number;
      r: number;
      s: number;
      k: number;
    };
  };
  profile: boolean;
  stopAfter: number;
  frameNo: number;
  active: boolean;
  growAfter: number;
  global_rng: () => number;
  waitTill: number;
  aspectRatio: number;
  constructor(params?: Partial<DragonflyProps>) {
    this.flucPerc = params?.flucPerc || 7;
    this.stopAfter = params?.stopAfter || 50000;
    this.frameNo = 0;
    this.active = true;
    this.size = params?.size || { width: 50, height: 50 };
    this.seed = params?.seed || `${Math.random()}`;
    this.dx = params?.dx || 1;
    this.dt = params?.dt || 1;
    this.profile = params?.profile || false;
    this.vars = params?.vars || DragonflyParam;
    this.growAfter = 500;
    this.waitTill = 16000;
    this.global_rng = rngWithMinMax(this.seed, 0, 1);
    this.aspectRatio = this.size.width / this.size.height;
    this.range = {
      a: { min: Infinity, max: -Infinity },
      s: { min: Infinity, max: -Infinity },
      b: { min: Infinity, max: -Infinity },
      h: { min: Infinity, max: -Infinity },
    };
    // binds
    this.step = this.step.bind(this);
    this.prof = this.prof.bind(this);
    // profiler
    if (this.profile) this.prof();
    // make init grid
    this.grids = this.initGrid;
  }

  prof() {
    console.log(this);
    console.time("init");
    for (let i = 0; i < 1_000; i++) {
      this.grids = this.initGrid;
    }
    console.timeEnd("init");
    console.time("run");
    for (let i = 0; i < 1_000; i++) {
      this.step();
    }
    console.timeEnd("run");
  }

  get initGrid(): {
    a: Float32Array;
    s: Float32Array;
    b: Float32Array;
    h: Float32Array;
  } {
    // Find the steady state solution
    const { a: va, s: vs, b: vb } = this.vars;

    const aa = vs.s / vs.r + va.s / va.r;
    const bb_func = (bb: number) =>
      Math.pow(vs.s, 2) * (1 + vb.s) * Math.pow(1 + va.k * bb * bb, 2) -
      Math.pow(vs.r, 2) * Math.pow(aa, 4) * bb * (1 + vb.k * aa * bb * bb);
    const bb = getRoot(bb_func, 0.5, 1e-6, 1e-8);
    const ss = Math.sqrt((bb * (1 + vb.k * aa * bb * bb)) / (1 + vb.s));
    const hh = bb * bb;

    const rng = rngWithMinMax(
      this.seed,
      (100 - this.flucPerc) / 100,
      (100 + this.flucPerc) / 100,
    );

    const { width, height } = this.size;

    const a_grid: Float32Array = new Float32Array(width * height);
    const s_grid: Float32Array = new Float32Array(width * height);
    const b_grid: Float32Array = new Float32Array(width * height);
    const h_grid: Float32Array = new Float32Array(width * height);

    for (let i = 0; i < height * width; i++) {
      const a = aa * rng();
      const s = ss * rng();
      const b = bb * rng();
      const h = hh * rng();

      if (a > this.range.a.max) {
        this.range.a.max = a;
      } else if (a < this.range.a.min) {
        this.range.a.min = a;
      }

      if (s > this.range.s.max) {
        this.range.s.max = s;
      } else if (s < this.range.s.min) {
        this.range.s.min = s;
      }

      if (b > this.range.b.max) {
        this.range.b.max = b;
      } else if (b < this.range.b.min) {
        this.range.b.min = b;
      }

      if (h > this.range.h.max) {
        this.range.h.max = h;
      } else if (h < this.range.h.min) {
        this.range.a.min = h;
      }

      a_grid[i] = a;
      s_grid[i] = s;
      b_grid[i] = b;
      h_grid[i] = h;
    }

    return { a: a_grid, s: s_grid, b: b_grid, h: h_grid };
  }

  step(): void {
    if (this.frameNo > this.stopAfter) {
      this.active = false;
    }
    this.frameNo += 1;
    let a_min = Infinity;
    let a_max = -Infinity;
    let s_min = Infinity;
    let s_max = -Infinity;
    let b_min = Infinity;
    let b_max = -Infinity;
    let h_min = Infinity;
    let h_max = -Infinity;

    const { width, height } = this.size;
    const a_grid = new Float32Array(width * height);
    const s_grid = new Float32Array(width * height);
    const b_grid = new Float32Array(width * height);
    const h_grid = new Float32Array(width * height);

    const { a: va, s: vs, b: vb, h: vh } = this.vars;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const a = this.grids.a[i + j * width];
        const s = this.grids.s[i + j * width];
        const b = this.grids.b[i + j * width];
        const h = this.grids.h[i + j * width];

        const LapA = Laplace((x, y) => getPBC(this.grids.a, this.size, x, y));
        const LapS = Laplace((x, y) => getPBC(this.grids.s, this.size, x, y));
        const LapB = Laplace((x, y) => getPBC(this.grids.b, this.size, x, y));
        const LapH = Laplace((x, y) => getPBC(this.grids.h, this.size, x, y));

        const aa =
          a +
          this.dt *
            (va.D * LapA(i, j, this.dx) +
              va.r * ((s * a * a) / (1 + va.k * b * b) - a) +
              va.s);

        const ss =
          s +
          this.dt *
            (vs.D * LapS(i, j, this.dx) -
              (vs.r * s * a * a) / (1 + va.k * b * b) +
              vs.s);

        const bb =
          b +
          this.dt *
            (vb.D * LapB(i, j, this.dx) +
              vb.r *
                (((s * s) / (1 + vb.k * a * b * b)) * ((b * b) / h + vb.s) -
                  b));

        const hh =
          h + this.dt * (vh.D * LapH(i, j, this.dx) + vh.r * (b * b - h));

        if (aa < a_min) {
          a_min = aa;
        } else if (aa > a_max) {
          a_max = aa;
        }

        if (ss < s_min) {
          s_min = ss;
        } else if (ss > s_max) {
          s_max = ss;
        }

        if (bb < b_min) {
          b_min = bb;
        } else if (bb > b_max) {
          b_max = bb;
        }

        if (hh < h_min) {
          h_min = hh;
        } else if (hh > h_max) {
          h_max = hh;
        }

        a_grid[i + j * width] = aa;
        s_grid[i + j * width] = ss;
        b_grid[i + j * width] = bb;
        h_grid[i + j * width] = hh;
      }
    }

    // add row and column at random

    if (this.frameNo > this.waitTill && this.frameNo % this.growAfter === 0) {
      const currentAspectRatio = width / height;
      let heightProb;
      if (currentAspectRatio > this.aspectRatio) {
        heightProb = 1 / (8 * currentAspectRatio + 1);
      } else {
        heightProb = 1 / (currentAspectRatio / 8 + 1);
      }
      if (this.global_rng() > heightProb) {
        const ww = width;
        const hh = height + 1;
        const y = Math.floor(height * this.global_rng());
        const a_new = new Float32Array(ww * hh);
        const s_new = new Float32Array(ww * hh);
        const b_new = new Float32Array(ww * hh);
        const h_new = new Float32Array(ww * hh);
        for (let j = 0; j < hh; j++) {
          for (let i = 0; i < ww; i++) {
            const ii = i;
            const jj = j > y ? j - 1 : j;
            a_new[i + j * ww] = a_grid[ii + jj * width];
            s_new[i + j * ww] = s_grid[ii + jj * width];
            b_new[i + j * ww] = b_grid[ii + jj * width];
            h_new[i + j * ww] = h_grid[ii + jj * width];
          }
        }
        this.grids = { a: a_new, s: s_new, b: b_new, h: h_new };
        this.size = { width: ww, height: hh };
      } else {
        const ww = width + 1;
        const hh = height;
        const x = Math.floor(width * this.global_rng());
        const a_new = new Float32Array(ww * hh);
        const s_new = new Float32Array(ww * hh);
        const b_new = new Float32Array(ww * hh);
        const h_new = new Float32Array(ww * hh);
        for (let j = 0; j < hh; j++) {
          for (let i = 0; i < ww; i++) {
            const ii = i > x ? i - 1 : i;
            const jj = j;
            a_new[i + j * ww] = a_grid[ii + jj * width];
            s_new[i + j * ww] = s_grid[ii + jj * width];
            b_new[i + j * ww] = b_grid[ii + jj * width];
            h_new[i + j * ww] = h_grid[ii + jj * width];
          }
        }
        this.grids = { a: a_new, s: s_new, b: b_new, h: h_new };
        this.size = { width: ww, height: hh };
      }
    } else {
      this.grids = { a: a_grid, s: s_grid, b: b_grid, h: h_grid };
    }

    this.range = {
      a: { min: a_min, max: a_max },
      s: { min: s_min, max: s_max },
      b: { min: b_min, max: b_max },
      h: { min: h_min, max: h_max },
    };
  }
}
