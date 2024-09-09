import p5 from "p5";
import React from "react";
import "./TuringPattern.scss";
import { Fig1, Fig2, type fig1_vars_type, type Runner } from "./runner";
import { makeImage } from "./utils";

const FRAME_RATE = 15;
const SKIP_FRAMES = 20;
const FRAME_SCALE = 0.95;
const BLUR_SIZE = 5;

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

class TuringPattern<
  L extends string,
  V extends string,
> extends React.Component<{
  runner: Runner<L, V>;
  frame_rate: number;
  skip_frames: number;
}> {
  // INFO: Make this generic and have it accept a runner prop.
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  active: boolean;
  debounceTimeout: NodeJS.Timeout | undefined;

  constructor(props: {
    runner: Runner<L, V>;
    frame_rate: number;
    skip_frames: number;
  }) {
    super(props);
    // Initializers
    this.p5ref = React.createRef();
    this.active = false;

    // Method bindings for this object
    this.calcFrame = this.calcFrame.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
    this.canvasInView = this.canvasInView.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleScrollDebounced = this.handleScrollDebounced.bind(this);
  }
  handleScrollDebounced() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(this.handleScroll, 10); // Adjust the delay as needed
  }

  handleScroll() {
    const inView = this.canvasInView();
    if (this.active && !inView) {
      this.p5!.frameRate(0);
      this.active = false;
    } else if (!this.active && inView) {
      this.p5!.frameRate(this.props.frame_rate);
      this.active = true;
    }
  }

  calcFrame() {
    const { runner } = this.props;
    for (let i = 0; i < this.props.frame_rate; i++) {
      runner.step();
    }
  }

  renderFrame() {
    // console.log("render");
    const { runner } = this.props;
    const p = this.p5!;
    const width = p.width;
    let i = 0;
    for (const layer in runner.grids) {
      // get the image
      const img = makeImage(p, runner.grids[layer], runner.size);
      // put the image on the canvas
      p.image(
        img,
        ((1 - FRAME_SCALE) / 2) * width,
        i * width + ((1 - FRAME_SCALE) / 2) * width,
        width * FRAME_SCALE,
        width * FRAME_SCALE,
      );
      i += 1;
    }
    p.filter(p.BLUR, BLUR_SIZE);
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const layers = Object.keys(this.props.runner.grids).length;
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = width * layers;
      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
      p.frameRate(0);
      window.addEventListener("scroll", this.handleScrollDebounced, {
        passive: true,
      });
    };

    p.draw = () => {
      p.clear();
      this.calcFrame();
      this.renderFrame();
    };
  };

  canvasInView() {
    const canvas = this.p5ref.current!;
    const rect = canvas.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    // Check if any part of the canvas is within the viewport
    return (
      rect.bottom > 0 && // Bottom edge is below the top of the viewport
      rect.top < windowHeight // Top edge is above the bottom of the viewport
    );
  } //

  componentDidMount(): void {
    this.p5 = new p5(this.sketch, this.p5ref.current as HTMLElement);
    // console.log(this.p5);
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

const vars1: fig1_vars_type = {
  Da: 0.005,
  Ra: 0.01,
  Ma: 0.01,
  Sa: 0,
  Ka: 0.0,
  Dh: 0.2,
  Rh: 0.02,
  Mh: 0.02,
};

const vars2: fig1_vars_type = { ...vars1, Ka: 0.25 };

export const Figure1 = () => {
  const runner1 = new Fig1(vars1);
  const runner2 = new Fig1(vars2);
  return (
    <div className="fig fig1">
      <TuringPattern
        runner={runner1}
        frame_rate={FRAME_RATE}
        skip_frames={SKIP_FRAMES}
      />
      <TuringPattern
        runner={runner2}
        frame_rate={FRAME_RATE}
        skip_frames={SKIP_FRAMES}
      />
    </div>
  );
};

export const Figure2 = () => {
  const giraffe = new Fig2(
    {
      Da: 0.015,
      Ra: 0.025,
      Ka: 0.1,
      Ds: 0.03,
      Rs: 0.0025,
      Ms: 0.00075,
      Ss: 0.00225,
      Ks: 20,
      Ry: 0.03,
      My: 0.003,
      Sy: 0.00015,
      Ky: 22,
    },
    { a: 0, aa: 5, s: 3, y: 0 },
    80,
  );
  const leopard = new Fig2(
    {
      Da: 0.01,
      Ra: 0.05,
      Ka: 0.5,
      Ds: 0.1,
      Rs: 0.0035,
      Ms: 0.003,
      Ss: 0.0075,
      Ks: 0.3,
      Ry: 0.03,
      My: 0.003,
      Sy: 0.00007,
      Ky: 22,
    },
    { a: 0, aa: 2, s: 2.5, y: 0 },
    80,
  );
  const cheetah = new Fig2(
    {
      Da: 0.015,
      Ra: 0.025,
      Ka: 0.5,
      Ds: 0.1,
      Rs: 0.0025,
      Ms: 0.00075,
      Ss: 0.00225,
      Ks: 1,
      Ry: 0.03,
      My: 0.003,
      Sy: 0.00015,
      Ky: 22,
    },
    { a: 0, aa: 2, s: 2.5, y: 0 },
    80,
  );
  return (
    <div className="fig fig2">
      <TuringPattern runner={giraffe} frame_rate={30} skip_frames={10} />
      <TuringPattern
        runner={leopard}
        frame_rate={FRAME_RATE}
        skip_frames={20}
      />
      <TuringPattern
        runner={cheetah}
        frame_rate={FRAME_RATE}
        skip_frames={20}
      />
    </div>
  );
};
