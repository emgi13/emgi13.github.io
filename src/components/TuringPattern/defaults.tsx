import TuringPattern from ".";
import {
  ActivInhibParams,
  ActivInhibRunner,
  AnimalParams,
  AnimalRunner,
  DragonflyRunner,
} from "./runner.ts";

export const TuringSpots = () => (
  <TuringPattern
    makeRunner={() =>
      new ActivInhibRunner({
        vars: ActivInhibParams.spots,
        size: { width: 40, height: 50 },
      })
    }
    invert
    frameRate={30}
    skipFrames={10}
    perRow={2}
  />
);

export const TuringStripes = () => (
  <TuringPattern
    makeRunner={() =>
      new ActivInhibRunner({
        vars: ActivInhibParams.stripes,
        stopAfter: 20000,
        size: { width: 40, height: 50 },
      })
    }
    blurRadius={2}
    frameRate={30}
    skipFrames={25}
    perRow={2}
  />
);

export const TuringGiraffe = () => (
  <TuringPattern
    makeRunner={() =>
      new AnimalRunner({
        vars: AnimalParams.giraffe,
        stopAfter: 3000,
        size: { width: 60, height: 120 },
      })
    }
    invert
    blurRadius={2}
    frameRate={30}
    skipFrames={10}
    perRow={3}
  />
);

export const TuringLeopard = () => (
  <TuringPattern
    makeRunner={() =>
      new AnimalRunner({
        vars: AnimalParams.leopard,
        stopAfter: 6000,
        randProb: 0.004,
        randA: 2,
        initConc: { a: 0, s: 2.5, y: 0 },
        size: { width: 60, height: 120 },
      })
    }
    invert
    blurRadius={3}
    frameRate={30}
    skipFrames={10}
    perRow={3}
  />
);

export const TuringCheetah = () => (
  <TuringPattern
    makeRunner={() =>
      new AnimalRunner({
        vars: AnimalParams.cheetah,
        stopAfter: 2000,
        randProb: 0.06,
        randA: 2.0,
        initConc: { a: 0, s: 2.5, y: 0 },
        size: { width: 60, height: 100 },
      })
    }
    invert
    blurRadius={2}
    frameRate={30}
    skipFrames={15}
    perRow={3}
  />
);

export const TuringDragonfly = () => (
  <TuringPattern
    makeRunner={() => new DragonflyRunner({ size: { width: 50, height: 30 } })}
    invert
    blurRadius={2}
    frameRate={30}
    skipFrames={50}
    perRow={2}
  />
);
