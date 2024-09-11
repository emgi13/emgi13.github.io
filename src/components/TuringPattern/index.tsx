import React from "react";
import p5 from "p5";
import "./styles.scss";
import { makeImage } from "./utils";
import { AnimalRunner } from "./runner";

const defaultRunner = () => new AnimalRunner();

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
class TuringPattern extends React.Component<TuringPatternProps> {
  static defaultProps: TuringPatternProps = {
    frameRate: 15,
    skipFrames: 60,
    blurRadius: 0,
    frameScale: 0.9,
    makeRunner: defaultRunner,
    invert: false,
    perRow: 1,
  };
  p5ref: React.RefObject<HTMLDivElement>;
  p5: p5 | undefined;
  active: boolean;
  debounceTimeout: NodeJS.Timeout | undefined;
  runner: Runner<any, any>;
  constructor(props: TuringPatternProps) {
    super(props);
    this.p5ref = React.createRef();
    this.runner = this.props.makeRunner();
    this.active = false;

    // binds
    this.handleScroll = this.handleScroll.bind(this);
    this.handleScrollDebounced = this.handleScrollDebounced.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
  }

  handleTouch() {
    this.runner = this.props.makeRunner();
    this.active = true;
    this.p5?.frameRate(this.props.frameRate);
    this.p5?.loop();
  }

  handleScrollDebounced() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(this.handleScroll, 100); // Adjust the delay as needed
  }

  handleScroll() {
    const inView = this.canvasInView();
    if (this.active && !inView) {
      this.p5!.frameRate(0);
      this.active = false;
      console.log("Render paused");
    } else if (!this.active && inView) {
      this.p5!.frameRate(this.props.frameRate);
      this.active = true;
      console.log("Render resumed");
    }
  }

  canvasInView() {
    const canvas = this.p5ref.current!;
    const rect = canvas.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    return (
      rect.bottom > 0 && // Bottom edge is below the top of the viewport
      rect.top < windowHeight // Top edge is above the bottom of the viewport
    );
  }

  componentDidMount(): void {
    this.p5 = new p5(this.sketch, this.p5ref.current as HTMLElement);
    this.p5ref.current?.addEventListener("click", this.handleTouch);
    // console.log(this.p5);
  }

  componentWillUnmount(): void {
    if (this.p5) {
      this.p5.remove();
    }
  }

  calcFrame() {
    // console.time("calcFrame");
    const { runner } = this;
    for (let i = 0; i < this.props.skipFrames; i++) {
      runner.step();
    }
    // console.timeEnd("calcFrame");
  }

  renderFrame() {
    // console.log("render");
    const { runner } = this;
    const { perRow } = this.props;
    const p = this.p5!;
    const width = p.width / perRow;
    const height = width / runner.aspectRatio;
    let i = 0;
    const texts: { str: string; x: number; y: number }[] = [];
    for (const layer in runner.grids) {
      const y = Math.floor(i / perRow);
      const x = i % perRow;
      // get the image
      const img = makeImage(
        p,
        runner.grids[layer],
        runner.size,
        runner.range[layer],
      );
      const w_gap = ((1 - this.props.frameScale) / 2) * width;
      const h_gap = ((1 - this.props.frameScale) / 2) * height;
      // put the image on the canvas
      p.image(
        img,
        x * width + w_gap,
        y * height + h_gap,
        width * this.props.frameScale,
        height * this.props.frameScale,
      );
      texts.push({
        str: layer,
        x: (x + 1) * width - w_gap,
        y: y * height + h_gap,
      });
      i += 1;
    }
    p.filter(p.BLUR, this.props.blurRadius);
    if (this.props.invert) p.filter(p.INVERT);
    const text_padding = 2;
    for (const text of texts) {
      const text_width = p.textWidth(text.str) + 2 * text_padding;
      const text_height = p.textSize() + 2 * text_padding;
      p.fill(0, 0, 0, 150);
      p.rect(text.x - text_width, text.y, text_width, text_height);
      p.fill("white");
      p.text(text.str, text.x - text_padding, text.y + text_padding);
    }
    if (!runner.active) p.noLoop();
  }

  sketch = (p: p5) => {
    p.setup = () => {
      const { size } = this.runner;
      const { perRow } = this.props;
      const layers = Object.keys(this.runner.grids).length;
      const width = this.p5ref.current?.offsetWidth || 400;
      const ww = width / perRow;
      const height =
        ((ww * size.height) / size.width) * Math.ceil(layers / perRow);
      p.createCanvas(width, height);
      p.background(0, 0, 0, 0);
      p.frameRate(0);
      p.fill("white");
      p.textAlign(p.RIGHT, p.TOP);
      p.textSize(20);
      p.stroke(0, 0, 0, 0);
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

  render(): React.ReactNode {
    return (
      <div className="TuringPatterns">
        <div className="canvas-cont" ref={this.p5ref}></div>
      </div>
    );
  }
}

export default TuringPattern;
