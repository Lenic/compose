import Deferred from '@lenic/deferred';

const seqence = (concurrent = 1) => {
  const queue = [];
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
    const res = next();
    res.then(endProcessingFunc, endProcessingFunc);
    res.then(defer.resolve, defer.reject);
  };

  const plugin = (next) => {
    const defer = new Deferred();

    queue.push({ next, defer });
    exec();

    return defer.promise;
  };

  return plugin;
};

export default seqence;
