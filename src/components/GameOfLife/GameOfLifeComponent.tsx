import React from "react";
import p5 from "p5";
import "./styles.scss";
import {
  Pause,
  PlayArrow,
  SkipNext,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Casino,
  Delete,
} from "@mui/icons-material";

type GameState = {
  play: boolean;
};

class GameOfLifeComponent extends React.Component<{}, GameState> {
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  constructor(props: {}) {
    super(props);
    this.p5ref = React.createRef();
    this.state = {
      play: true,
    };
  }
  render() {
    return (
      <div className="GameOfLife">
        <div className="top">
          <Pause
            onClick={() => {
              this.setState({ play: false });
            }}
            className={this.state.play ? "" : "active"}
          />
          <PlayArrow
            onClick={() => {
              this.setState({ play: true });
            }}
            className={this.state.play ? "active" : ""}
          />
          <SkipNext
            onClick={() => {
              this.setState({ play: false });
            }}
          />
          <KeyboardDoubleArrowLeft />
          <div className="speed"></div>
          <KeyboardDoubleArrowRight />
        </div>
        <div className="bottom">
          <div className="side">
            <Casino />
            <Delete />
            <div className="size"></div>
          </div>
          <div className="main">
            <div className="canvas-cont" ref={this.p5ref}></div>
          </div>
        </div>
      </div>
    );
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
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = this.p5ref.current?.offsetHeight || 400;

      p.createCanvas(width, height);
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
