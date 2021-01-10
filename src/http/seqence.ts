import Deferred from "@lenic/deferred";

import type { ComposePlugin, ComposeResult } from "./core";

interface QueueItem<R, T> {
  next: (config?: T) => ComposeResult<R>;
  defer: Deferred<R>;
}

const promiseWrapper = <R>(arg: ComposeResult<R>) => {
  return new Promise<R>((resolve, reject) => {
    try {
      resolve(arg);
    } catch (e) {
      reject(e);
    }
  });
};

const seqence = <R, T>(concurrent = 1): ComposePlugin<R, T> => {
  const queue: QueueItem<R, T>[] = [];
  const processState = new Array(concurrent).fill(false);

  const exec = () => {
    const vacantIndex = processState.findIndex((v) => !v);
    if (vacantIndex < 0) return;

    const item = queue.shift();
    if (!item) return;

    processState[vacantIndex] = true;
    const endProcessingFunc = () => {
      processState[vacantIndex] = false;
      exec();
    };

    const { next, defer } = item;
    promiseWrapper(next())
      .then(defer.resolve, defer.reject)
      .then(endProcessingFunc, endProcessingFunc);
  };

  const plugin: ComposePlugin<R, T> = (next) => {
    const defer = new Deferred<R>();

    queue.push({ next, defer });
    exec();

    return defer.promise;
  };

  return plugin;
};

export default seqence;
