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
import { Slider } from "@mui/material";

const sizes = [5, 8, 12, 16, 25, 32, 64];
const sizeMarks = sizes.map((v, i, a) => ({ value: i }));
const speeds = [0.2, 0.5, 1, 2, 5, 10];
const base_framerate = 6;

function VerticalAccessibleSlider(props: {
  value: number;
  changeValue: (value: number) => void;
}) {
  function preventHorizontalKeyboardNavigation(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  }
  const val = sizes.at(props.value);
  return (
    <div className="sizecont">
      <div className="label">
        {val}x{val}
      </div>
      <div className="slider">
        <Slider
          sx={{
            '& input[type="range"]': {
              WebkitAppearance: "slider-vertical",
            },
          }}
          value={props.value}
          onChange={(v) => {
            // @ts-ignore value checked
            const val = v.target?.value || 0;
            if (val !== props.value) {
              props.changeValue(val);
            }
          }}
          orientation="vertical"
          aria-label="Size"
          track={false}
          defaultValue={2}
          step={null}
          min={0}
          max={sizes.length - 1}
          marks={sizeMarks}
          onKeyDown={preventHorizontalKeyboardNavigation}
        />
      </div>
    </div>
  );
}

type GameState = {
  play: boolean;
  speed: number;
  sizeInd: number;
};

const nextSpeed = (curr: number): number => {
  const i = speeds.findIndex((v) => v === curr);
  if (i === -1 || i === speeds.length) {
    return curr;
  } else {
    return speeds.at(i + 1) || curr;
  }
};

const prevSpeed = (curr: number): number => {
  const i = speeds.findIndex((v) => v === curr);
  if (i === -1 || i === 0) {
    return curr;
  } else {
    return speeds.at(i - 1) || curr;
  }
};

// WARN: There is a resize issue on resize update

class GameOfLifeComponent extends React.Component<{}, GameState> {
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  grid: number[][];
  constructor(props: {}) {
    super(props);

    this.makeGrid = this.makeGrid.bind(this);

    this.p5ref = React.createRef();
    this.state = {
      play: true,
      speed: 1,
      sizeInd: 3,
    };
    this.grid = [];

    this.makeGrid(true);
    console.log(this.grid);
  }

  get size(): number {
    return sizes.at(this.state.sizeInd) || 0;
  }

  get step(): number {
    return (this.p5?.width || 0) / this.size;
  }

  makeGrid(random: boolean = false) {
    let grid = [];
    for (let i = 0; i < this.size; i++) {
      let row = [];
      for (let j = 0; j < this.size; j++) {
        row.push(random ? Math.round(Math.random()) : 0);
      }
      grid.push(row);
    }
    this.grid = grid;
  }
  render() {
    return (
      <div className="GameOfLife">
        <div className="top">
          <Pause
            onClick={() => {
              this.setState({ play: false });
              this.pause();
            }}
            className={this.state.play ? "" : "active"}
          />
          <PlayArrow
            onClick={() => {
              this.setState({ play: true });
              this.play();
            }}
            className={this.state.play ? "active" : ""}
          />
          <SkipNext
            onClick={() => {
              this.setState({ play: false });
              this.pause();
              this.nextStep();
            }}
          />
          <KeyboardDoubleArrowLeft
            onClick={() => {
              this.setState({ speed: prevSpeed(this.state.speed) });
            }}
          />
          <div className="speed">
            <div>{this.state.speed}x</div>
          </div>
          <KeyboardDoubleArrowRight
            onClick={() => {
              this.setState({ speed: nextSpeed(this.state.speed) });
            }}
          />
        </div>
        <div className="bottom">
          <div className="side">
            <Casino />
            <Delete />
            <div className="size">
              <VerticalAccessibleSlider
                value={this.state.sizeInd}
                changeValue={(v) => {
                  this.setState({ sizeInd: v });
                }}
              />
            </div>
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

  renderGrid = (p: p5) => {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.grid[i][j] > 0) {
          p.square(i * this.step, j * this.step, this.step);
        }
      }
    }
  };

  pause() {
    this.p5?.frameRate(0);
  }

  play() {
    this.p5?.frameRate(base_framerate * this.state.speed);
  }

  nextStep() {
    this.p5?.draw();
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = this.p5ref.current?.offsetHeight || 400;

      p.frameRate(base_framerate * this.state.speed);

      p.createCanvas(width, height);
      p.background(0);
    };

    p.draw = () => {
      p.clear();
      this.makeGrid(true);
      // if (p.mouseIsPressed) {
      //   p.stroke(0);
      //   p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
      // }
      p.fill(255);
      p.stroke(255);
      this.renderGrid(p);
    };
  };
}

export default GameOfLifeComponent;
