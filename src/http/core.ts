export enum ComposeDirection {
  LEFT_TO_RIGHT = 0,
  RIGHT_TO_LEFT = 1
}

export interface NextFunction<R, T> {
  (config?: T): R;
}

export interface ComposePluginCore<R, T> {
  (next: NextFunction<R, T>, arg: T): R;
}

interface Ref<T> {
  value: T;
}

interface NextFunctionWrapper<R, T> {
  (value: Ref<T>): R;
}

export interface ComposePluginFullConfig<R, T> {
  desc: string;
  order: number;
  executor: ComposePluginCore<R, T>;
}

export type ComposePlugin<R, T> = ComposePluginCore<R, T> | ComposePluginFullConfig<R, T>;

export interface ComposeInstance<R, T> {
  add(
    pluginsOrCallback: ComposePlugin<R, T>[] | ((list: ComposePlugin<R, T>[]) => ComposePlugin<R, T>[])
  ): ComposeInstance<R, T>;
  exec(value: T): R;
}

export const ComposeFunc = <R, T>(
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

      return ComposeFunc(direction, defaultAction, resultList);
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
          (acc, x) => (options: Ref<T>) => {
            const action: NextFunction<R, T> = (config?: T) => {
              if (typeof config !== 'undefined') {
                options.value = config;
              }

              return (acc as NextFunctionWrapper<R, T>)(options);
            };

            return x(action, options.value);
          },
          (options: Ref<T>) => defaultAction(options.value)
        ) as NextFunctionWrapper<R, T>;
      }

      return func({ value });
    }
  };
};

export const compose = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => ComposeFunc(ComposeDirection.LEFT_TO_RIGHT, defaultAction, plugins);

export const composeRight = <R, T>(
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => ComposeFunc(ComposeDirection.RIGHT_TO_LEFT, defaultAction, plugins);
