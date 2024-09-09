import p5 from "p5";
import React from "react";
import "./TuringPattern.scss";
import type { Runner } from "./runner";

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

export class TuringPattern<
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
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const height = this.p5ref.current?.offsetWidth || 400;
      const width = this.p5ref.current?.offsetHeight || 400;
      p.frameRate(12);
      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
    };

    p.draw = () => { };
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
