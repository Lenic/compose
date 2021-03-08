import Deferred from "@lenic/deferred";

import type { ComposePlugin, NextFunction } from "./core";

interface QueueItem<R, T> {
  defer: Deferred<R>;
  next: NextFunction<Promise<R>, T>;
}

const seqence = <R, T>(concurrent = 1): ComposePlugin<Promise<R>, T> => {
  const queue: QueueItem<R, T>[] = [];
  const processState = new Array(concurrent).fill(false);

  const exec = () => {
    const index = processState.findIndex((v) => !v);
    if (index < 0) return;

    const item = queue.shift();
    if (!item) return;

    processState[index] = true;
    const endProcessingFunc = () => {
      processState[index] = false;
      exec();
    };

    const { next, defer } = item;
    next()
      .then(defer.resolve, defer.reject)
      .then(endProcessingFunc, endProcessingFunc);
  };

  const plugin: ComposePlugin<Promise<R>, T> = (next) => {
    const defer = new Deferred<R>();

    queue.push({ next, defer });
    exec();

    return defer.promise;
  };

  return plugin;
};

export default seqence;
