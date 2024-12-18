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
const sizeMarks = sizes.map((_v, i, _a) => ({ value: i }));
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

  componentDidUpdate(
    _prevProps: Readonly<{}>,
    prevState: Readonly<GameState>,
    _snapshot?: any,
  ): void {
    const { state } = this;
    if (state.sizeInd !== prevState.sizeInd) {
      this.makeGrid(true);
      this.renderGrid();
    }
    if (state.play) {
      this.play();
    } else {
      this.pause();
    }
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
              this.nextStep();
              this.renderGrid();
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
            <Casino
              onClick={() => {
                this.makeGrid(true);
                this.renderGrid();
              }}
            />
            <Delete
              onClick={() => {
                this.makeGrid(false);
                this.renderGrid();
              }}
            />
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

  renderGrid = () => {
    const p = this.p5!;
    p.clear();
    p.fill(255);
    p.stroke(255);
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
    const { grid } = this;
    const val = (i: number, j: number): number => {
      if (i < 0 || i >= this.size || j < 0 || j >= this.size) return 0;
      return grid[i][j];
    };
    let newGrid = structuredClone(grid);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const n =
          val(i - 1, j - 1) +
          val(i - 1, j) +
          val(i - 1, j + 1) +
          val(i, j - 1) +
          val(i, j + 1) +
          val(i + 1, j + 1) +
          val(i + 1, j) +
          val(i + 1, j - 1);
        if (val(i, j) > 0) {
          newGrid[i][j] = n < 2 || n > 3 ? 0 : 1;
        } else {
          newGrid[i][j] = n === 3 ? 1 : 0;
        }
      }
    }
    this.grid = newGrid;
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const width = this.p5ref.current?.offsetWidth || 400;
      const height = this.p5ref.current?.offsetHeight || 400;

      p.frameRate(base_framerate * this.state.speed);

      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
    };

    p.draw = () => {
      this.nextStep();
      this.renderGrid();
    };

    p.touchStarted = () => {
      const x = p.mouseX;
      const y = p.mouseY;
      const w = p.width;
      const h = p.height;
      if (x < 0 || x >= w) return true;
      if (y < 0 || y >= h) return true;
      const i = Math.floor(x / this.step);
      const j = Math.floor(y / this.step);
      this.grid[i][j] = 1 - this.grid[i][j];
      this.renderGrid();
      return false;
    };
  };
}

export default GameOfLifeComponent;
