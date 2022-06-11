import type { ComposeInstance, ComposePlugin, ComposePluginCore, ComposePluginFullConfig } from './types';

import { ComposeDirection } from './types';

interface Ref<T> {
  value: T;
}

interface NextFunctionWrapper<R, T> {
  (value: Ref<T>): R;
}

export const composeFunc = <R, T>(
  direction: ComposeDirection,
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => {
  let func: NextFunctionWrapper<R, T>;

  const exec = (value: T) => {
    if (!func) {
      const orderedPlugins = plugins
        .map((v) => {
          if (typeof v === 'function') {
            return {
              desc: '',
              order: 0,
              executor: v
            } as ComposePluginFullConfig<R, T>;
          }
          return v;
        })
        .sort((x, y) => {
          const diff = x.order - y.order;

          if (!diff) return 0;
          return diff > 0 ? 1 : -1;
        })
        .map((v) => v.executor);

      const defaultReducer = (options: Ref<T>) => defaultAction(options.value);
      const reducer = (acc: NextFunctionWrapper<R, T>, x: ComposePluginCore<R, T>) => (options: Ref<T>) => {
        const action = (config?: T): R => {
          if (typeof config !== 'undefined') {
            options.value = config;
          }

          return acc(options);
        };

        return x(action, options.value);
      };

      if (direction === ComposeDirection.LEFT_TO_RIGHT) {
        func = orderedPlugins.reduceRight<NextFunctionWrapper<R, T>>(reducer, defaultReducer);
      } else {
        func = orderedPlugins.reduce<NextFunctionWrapper<R, T>>(reducer, defaultReducer);
      }
    }

    return func({ value });
  };

  const instance = exec as ComposeInstance<R, T>;
  instance.exec = exec;
  instance.add = (pluginsOrCallback) => {
    let resultList: ComposePlugin<R, T>[];

    if (typeof pluginsOrCallback === 'function') {
      resultList = pluginsOrCallback(plugins);

      if (resultList === plugins) return instance;
    } else {
      if (!pluginsOrCallback.length) return instance;

      resultList = [...plugins, ...pluginsOrCallback];
    }

    return composeFunc(direction, defaultAction, resultList);
  };

  return instance;
};

export const compose = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => composeFunc(ComposeDirection.LEFT_TO_RIGHT, defaultAction, plugins);

export const composeRight = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => composeFunc(ComposeDirection.RIGHT_TO_LEFT, defaultAction, plugins);
