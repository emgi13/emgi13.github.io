import p5 from "p5";
import React from "react";
import "./TuringPattern.scss";
import { Fig1, type Runner } from "./runner";
import { makeImage } from "./utils";

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
> extends React.Component<{ runner: Runner<L, V> }> {
  // INFO: Make this generic and have it accept a runner prop.
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  constructor(props: { runner: Runner<L, V> }) {
    super(props);
    // Initializers
    this.p5ref = React.createRef();

    // Method bindings for this object
    this.calcFrame = this.calcFrame.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
  }

  calcFrame() {
    const { runner } = this.props;
    const SKIP_FRAMES = 5;
    for (let i = 0; i < SKIP_FRAMES; i++) {
      runner.step();
    }
  }

  renderFrame() {
    const { runner } = this.props;
    const width = this.p5!.width;
    let i = 0;
    for (const layer in runner.grids) {
      // get the image
      const img = makeImage(this.p5!, runner.grids[layer], runner.size);
      // put the image on the canvas
      this.p5!.image(img, 0, i * width, width, width);
      i += 1;
    }
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const layers = Object.keys(this.props.runner.grids).length;
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = width * layers;
      p.frameRate(12);
      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
    };

    p.draw = () => {
      p.clear();
      this.calcFrame();
      this.renderFrame();
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

export const Figure1 = () => {
  const runner = new Fig1();
  return <TuringPattern runner={runner} />;
};
