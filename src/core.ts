import type { ComposeInstance, ComposePlugin, ComposePluginCore, ComposePluginFullConfig, NextFunction } from './types';

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

  return {
    add(pluginsOrCallback) {
      let resultList: ComposePlugin<R, T>[];

      if (typeof pluginsOrCallback === 'function') {
        resultList = pluginsOrCallback(plugins);

        if (resultList === plugins) return this;
      } else {
        if (!pluginsOrCallback.length) return this;

        resultList = [...plugins, ...pluginsOrCallback];
      }

      return composeFunc(direction, defaultAction, resultList);
    },
    exec(value) {
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
          .sort((x, y) => x.order - y.order)
          .map((v) => v.executor);

        const method =
          direction === ComposeDirection.LEFT_TO_RIGHT ? orderedPlugins.reduceRight : orderedPlugins.reduce;

        func = method.call(
          orderedPlugins,
          (acc: NextFunctionWrapper<R, T>, x: ComposePluginCore<R, T>) => {
            return (options: Ref<T>) => {
              const action: NextFunction<R, T> = (config?: T) => {
                if (typeof config !== 'undefined') {
                  options.value = config;
                }

                return acc(options);
              };

              return x(action, options.value);
            };
          },
          (options: Ref<T>) => defaultAction(options.value)
        );
      }

      return func({ value });
    }
  };
};

export const compose = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => composeFunc(ComposeDirection.LEFT_TO_RIGHT, defaultAction, plugins);

export const composeRight = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => composeFunc(ComposeDirection.RIGHT_TO_LEFT, defaultAction, plugins);
