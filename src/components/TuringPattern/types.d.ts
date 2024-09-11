declare type VariableType<
  Chemicals extends string,
  Parameters extends string,
> = { [CK in Chemicals]: { [PK in Parameters]: number } };

declare interface Runner<Chemicals extends string, Parameters extends string> {
  // Canvas Size
  size: { width: number; height: number };
  // Seed
  seed: string;
  // controllers
  step: () => void;
  // calc params
  dx: number;
  dt: number;
  // Grids
  grids: { [CK in Chemicals]: Float32Array };
  // variables
  vars: VariableType<Chemicals, Parameters>;
  profile: boolean;
  range: { [CK in Chemicals]: { min: number; max: number } };
  stopAfter: number;
  frameNo: number;
  active: boolean;
  aspectRatio: number;
}

declare type ActivInhibChems = "a" | "h";
declare type ActivInhibParams = "D" | "r" | "u" | "s" | "k";

declare interface ActivInhibProps
  extends Runner<ActivInhibChems, ActivInhibParams> {
  flucPerc: number;
}

declare type AnimalChems = "a" | "s" | "y";
declare type AnimalParams = "D" | "r" | "u" | "s" | "k";

declare interface AnimalProps extends Runner<AnimalChems, AnimalParams> {
  initConc: { [K in AnimalChems]: number };
  randA: number;
  randProb: number;
}

declare type DragonflyChems = "a" | "s" | "b" | "h";
declare type DragonflyParams = "D" | "r" | "s" | "k";

declare interface DragonflyProps
  extends Runner<DragonflyChems, DragonflyParams> {
  flucPerc: number;
  growAfter: number;
  waitTill: number;
}

declare interface TuringPatternProps {
  // Frame post processing
  blurRadius: number;
  frameScale: number;
  invert: boolean;
  // runner
  makeRunner: () => Runner<any, any>;
  // Render Speeds
  frameRate: number;
  skipFrames: number;
  perRow: number;
}
