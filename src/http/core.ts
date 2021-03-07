export type ComposeResult<T> = T | Promise<T>;

export enum ComposeDirection {
  LEFT_TO_RIGHT = 0,
  RIGHT_TO_LEFT = 1
}

export interface ComposePlugin<R, T> {
  (next: (config?: T) => ComposeResult<R>, arg: T): ComposeResult<R>;
}

export interface ComposeInstance<R, T> {
  add(...newPlugins: ComposePlugin<R, T>[]): ComposeInstance<R, T>;
  exec(options: T): ComposeResult<R>;
}

export type ComposeType = <R, T>(
  defaultAction: (options: T) => ComposeResult<R>,
  ...plugins: ComposePlugin<R, T>[]
) => ComposeInstance<R, T>;

export const ComposeFunc = <R, T>(
  direction: ComposeDirection,
  defaultAction: (options: T) => ComposeResult<R>,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => {
  type NextFuncType = (config?: T) => ComposeResult<R>;

  let func: NextFuncType;
  return {
    add(...newPlugins) {
      if (!newPlugins.length) return this;

      return ComposeFunc(direction, defaultAction, [...plugins, ...newPlugins]);
    },
    exec(options) {
      const method =
        direction === ComposeDirection.LEFT_TO_RIGHT
          ? plugins.reduceRight
          : plugins.reduce;

      let opts = options;
      const getOpts = (config?: T) => {
        if (config) {
          opts = config;
        }
        return opts;
      };
      if (!func) {
        func = method.call(
          plugins,
          (acc, x) => (config?: T) => x(acc as NextFuncType, getOpts(config)),
          (config?: T) => defaultAction(getOpts(config))
        ) as NextFuncType;
      }

      return func(options);
    }
  };
};

export const compose = <R, T>(
  defaultAction: (options: T) => ComposeResult<R>,
  ...plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> =>
  ComposeFunc(ComposeDirection.LEFT_TO_RIGHT, defaultAction, plugins);

export const composeRight = <R, T>(
  defaultAction: (options: T) => ComposeResult<R>,
  ...plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> =>
  ComposeFunc(ComposeDirection.RIGHT_TO_LEFT, defaultAction, plugins);
