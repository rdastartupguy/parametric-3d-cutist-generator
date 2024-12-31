import { Injectable } from '@angular/core';
import { Subject, Observable, of } from 'rxjs';

import { CutPiece, StockPiece, OptimizeMethod } from './models';

import { CUT_PIECES, STOCK_PIECES } from './mock-data';

const MULTIPLIER = 1;

@Injectable({
  providedIn: 'root',
})
export class OptimizerService {
  optimizeMethod: OptimizeMethod;
  cutWidth: number;
  randomSeed: number;
  stockPieces: StockPiece[];
  cutPieces: CutPiece[];

  private worker: Worker;

  constructor() {
    // localStorage.clear();
    this.loadFromLocalStorage();
  }

  getCutPieces(): Observable<CutPiece[]> {
    return of(this.cutPieces);
  }

  addCutPiece(cutPiece: CutPiece) {
    this.cutPieces.push(cutPiece);
  }

  clearCutPieces() {
    this.cutPieces = [];
  }

  getStockPieces(): Observable<StockPiece[]> {
    return of(this.stockPieces);
  }

  addStockPiece(stockPiece: StockPiece) {
    this.stockPieces.push(stockPiece);
  }

  clearStockPieces() {
    this.stockPieces = [];
  }

  initWorker(): Observable<Worker> {
    if (this.worker !== undefined) {
      return of(this.worker);
    } else {
      const worker = new Worker('./app.worker', { type: 'module' });
      const subject = new Subject<any>();
      worker.onmessage = inMessage => {
        // The worker will send a ready message when it has
        // finished asynchronously loading the wasm for the optimizer.
        if (inMessage.data.type === 'ready') {
          this.worker = worker;
          subject.next(worker);
        }
      };
      return subject;
    }
  }

  optimize(): Observable<any> {
    this.saveToLocalStorage();
    const subject = new Subject<any>();
    this.initWorker().subscribe((worker: Worker) => {
      worker.onmessage = inMessage => {
        const data = inMessage.data;
        if (data.type === 'error') {
          subject.error(data.message);
        } else {
          if ('solution' in data) {
            let solution = data.solution;
            if ('stockPieces' in solution) {
              for (let stockPiece of solution.stockPieces) {
                stockPiece.width /= MULTIPLIER;
                stockPiece.length /= MULTIPLIER;
                for (let cutPiece of stockPiece.cutPieces) {
                  cutPiece.x /= MULTIPLIER;
                  cutPiece.y /= MULTIPLIER;
                  cutPiece.width /= MULTIPLIER;
                  cutPiece.length /= MULTIPLIER;
                }
                for (let wastePiece of stockPiece.wastePieces) {
                  wastePiece.x /= MULTIPLIER;
                  wastePiece.y /= MULTIPLIER;
                  wastePiece.width /= MULTIPLIER;
                  wastePiece.length /= MULTIPLIER;
                }
              }
            }
          }
          subject.next(data);
        }
      };

      worker.postMessage({
        method: this.optimizeMethod,
        cutWidth: this.cutWidth * MULTIPLIER,
        randomSeed: this.randomSeed,
        stockPieces: this.stockPieces
          .filter(sp => sp.enabled)
          .map(sp => {
            return {
              width: Math.round(sp.width * MULTIPLIER),
              length: Math.round(sp.length * MULTIPLIER),
              patternDirection: sp.patternDirection,
            };
          }),
        cutPieces: this.cutPieces
          .filter(dp => dp.enabled)
          .map(dp => {
            return {
              width: Math.round(dp.width * MULTIPLIER),
              length: Math.round(dp.length * MULTIPLIER),
              patternDirection: dp.patternDirection,
            };
          }),
      });
    });

    return subject;
  }

  cancel() {
    if (this.worker !== undefined) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('optimizeMethod', this.optimizeMethod.toString());
    localStorage.setItem('cutWidth', this.cutWidth.toString());
    localStorage.setItem('randomSeed', this.randomSeed.toString());
    localStorage.setItem('stockPieces', JSON.stringify(this.stockPieces));
    localStorage.setItem('cutPieces', JSON.stringify(this.cutPieces));
  }

  loadFromLocalStorage() {
    this.optimizeMethod = OptimizeMethod[localStorage.getItem('optimizeMethod')] || OptimizeMethod.Guillotine;
    this.cutWidth = parseFloat(localStorage.getItem('cutWidth')) || 1;
    this.randomSeed = parseInt(localStorage.getItem('randomSeed')) || 93872348232;
    this.stockPieces = JSON.parse(localStorage.getItem('stockPieces')) || STOCK_PIECES;
    this.cutPieces = JSON.parse(localStorage.getItem('cutPieces')) || CUT_PIECES;
  }
}
