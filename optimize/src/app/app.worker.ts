/// <reference lib="webworker" />

import('@jasonrhansen/cut-optimizer-2d-web').then(wasm => {
  // We need to wait for the wasm to be asynchronously imported
  // before optimize will work. Send a message to say it's ready.
  postMessage({ type: 'ready' });

  // Start listening for optimize requests
  addEventListener('message', ({ data }) => {
    optimize(wasm, data);
  });
});

const optimize = (wasm, message) => {
  const opt = new wasm.Optimizer();
  console.log(opt);

  console.log(message);

  if ('cutWidth' in message) {
    opt.setCutWidth(message.cutWidth);
  }

  if ('randomSeed' in message) {
    opt.setRandomSeed(message.randomSeed);
  }

  for (let stockPiece of message.stockPieces) {
    opt.addStockPiece(
      stockPiece.width,
      stockPiece.length,
      patternDirectionFromString(wasm, stockPiece.patternDirection)
    );
  }

  for (let i in message.cutPieces) {
    const cutPiece = message.cutPieces[i];
    opt.addCutPiece(
      +i,
      cutPiece.width,
      cutPiece.length,
      true,
      patternDirectionFromString(wasm, cutPiece.patternDirection)
    );
  }

  const progressCallback = (progress: number) => {
    postMessage({ type: 'progress', progress: progress });
  };

  let solution = null;
  if (message.method === 'guillotine') {
    solution = opt.optimizeGuillotine(progressCallback);
  } else if (message.method === 'nested') {
    solution = opt.optimizeNested(progressCallback);
  }
  console.log(solution);
  if (solution !== null) {
    if ('error' in solution) {
      postMessage({ type: 'error', message: solution.error });
    }
    postMessage({ type: 'finished', solution: solution });
  } else {
    postMessage({ type: 'error', message: 'unable to optimize' });
  }
};

const patternDirectionFromString = (wasm, patternDir: string) => {
  if (patternDir === 'ParallelToLength') {
    return wasm.PatternDirection.ParallelToLength;
  } else if (patternDir === 'ParallelToWidth') {
    return wasm.PatternDirection.ParallelToWidth;
  } else {
    return wasm.PatternDirection.None;
  }
};
