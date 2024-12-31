export class StockPiece {
  enabled: boolean;
  width: number;
  length: number;
  patternDirection: PatternDirection;
}

export class CutPiece {
  enabled: boolean;
  width: number;
  length: number;
  label:string;
  patternDirection: PatternDirection;
}

export enum PatternDirection {
  None = "None",
  ParallelToWidth = "ParallelToWidth",
  ParallelToLength = "ParallelToLength"
}

export enum OptimizeMethod {
  Guillotine = "guillotine",
  Nested = "nested"
}

