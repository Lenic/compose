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

const seqence = <R, T>(): ComposePlugin<R, T> => {
  const queue: QueueItem<R, T>[] = [];

  let processing = false;

  const exec = () => {
    if (processing) return;

    const item = queue.shift();
    if (!item) return;

    processing = true;
    const endProcessingFunc = () => {
      processing = false;
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
