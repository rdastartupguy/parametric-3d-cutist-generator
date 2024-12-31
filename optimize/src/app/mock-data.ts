import { StockPiece, CutPiece, PatternDirection } from "./models";

export const STOCK_PIECES: StockPiece[] = [
  {
    enabled: true,
    width: 48,
    length: 96,
    patternDirection: PatternDirection.ParallelToLength
  },
  {
    enabled: true,
    width: 48,
    length: 96,
    patternDirection: PatternDirection.ParallelToWidth
  },
  {
    enabled: true,
    width: 48,
    length: 120,
    patternDirection: PatternDirection.ParallelToLength
  },
  {
    enabled: true,
    width: 48,
    length: 120,
    patternDirection: PatternDirection.ParallelToWidth
  }
];

export const CUT_PIECES: CutPiece[] = [
  {
    enabled: true,
    width: 15,
    length: 34,
    label: '',
    patternDirection: PatternDirection.ParallelToWidth
  },
  {
    enabled: true,
    width: 30,
    length: 60,
    label: '',
    patternDirection: PatternDirection.ParallelToWidth
  },
  {
    enabled: true,
    width: 15,
    length: 10,
    label: '',
    patternDirection: PatternDirection.ParallelToWidth
  },
  {
    enabled: true,
    width: 15,
    length: 10,
    label: '',
    patternDirection: PatternDirection.ParallelToWidth
  }
 
];
