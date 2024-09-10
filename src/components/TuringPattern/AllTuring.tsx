import TuringPattern from "./index.tsx";
import { FigA, FigB, FigC, FigD, FigE } from "./runner.ts";

export const AllTuringReact = () => {
  return (
    <div id="all-turing">
      <TuringPattern
        makeRunner={FigA}
        invert
        frameRate={30}
        skipFrames={20}
        blurRadius={0}
        frameScale={0.9}
      />
      <TuringPattern
        makeRunner={FigE}
        blurRadius={2}
        frameRate={30}
        skipFrames={25}
        frameScale={0.9}
        invert={false}
      />
      <TuringPattern
        makeRunner={FigB}
        invert
        blurRadius={2}
        frameRate={30}
        skipFrames={10}
        frameScale={0.9}
      />
      <TuringPattern
        makeRunner={FigC}
        invert
        blurRadius={3}
        frameRate={30}
        skipFrames={10}
        frameScale={0.9}
      />
      <TuringPattern
        makeRunner={FigD}
        invert
        blurRadius={2}
        frameRate={30}
        skipFrames={15}
        frameScale={0.9}
      />
    </div>
  );
};
