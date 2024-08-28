import React from "react";
import p5 from "p5";

class GameOfLifeComponent extends React.Component {
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  constructor(props) {
    super(props);
    this.p5ref = React.createRef();
  }
  render() {
    return <div ref={this.p5ref}></div>;
  }

  componentDidMount(): void {
    this.p5 = new p5(this.sketch, this.p5ref.current as HTMLElement);
  }

  componentWillUnmount(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(
        this.p5ref.current?.offsetWidth || 400,
        this.p5ref.current?.offsetHeight || 400,
      );
      p.background(220);
    };

    p.draw = () => {
      if (p.mouseIsPressed) {
        p.stroke(0);
        p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
      }
    };
  };
}

export default GameOfLifeComponent;
