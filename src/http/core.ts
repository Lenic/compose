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

export interface ComposePluginFullConfig<R, T> {
  desc: string;
  order: number;
  executor: ComposePluginCore<R, T>;
}

export type ComposePlugin<R, T> =
  | ComposePluginCore<R, T>
  | ComposePluginFullConfig<R, T>;

export interface ComposeInstance<R, T> {
  add(...newPlugins: ComposePlugin<R, T>[]): ComposeInstance<R, T>;
  exec(options: T): R;
}

export type ComposeType = <R, T>(
  defaultAction: (options: T) => R,
  ...plugins: ComposePlugin<R, T>[]
) => ComposeInstance<R, T>;

export const ComposeFunc = <R, T>(
  direction: ComposeDirection,
  defaultAction: (options: T) => R,
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => {
  let orderedPlugins: ComposePluginFullConfig[];
  return {
    add(...newPlugins) {
      if (!newPlugins.length) return this;

      return ComposeFunc(direction, defaultAction, [...plugins, ...newPlugins]);
    },
    exec(options) {
      let opts = options;
      const getOpts = (config?: T) => {
        if (config) {
          opts = config;
        }
        return opts;
      };

      if (!orderedPlugins) {
        orderedPlugins = plugins
          .map((v) => {
            if (typeof v === "function") {
              return {
                desc: "",
                order: 0,
                executor: v
              } as ComposePluginFullConfig<R, T>;
            }
            return v;
          })
          .sort((x, y) => x.order - y.order)
          .map((v) => v.executor);
      }

      const method =
        direction === ComposeDirection.LEFT_TO_RIGHT
          ? plugins.reduceRight
          : plugins.reduce;

      const func = method.call(
        orderedPlugins,
        (acc, x) => (config?: T) =>
          x(acc as NextFunction<R, T>, getOpts(config)),
        (config?: T) => defaultAction(getOpts(config))
      ) as NextFunction<R, T>;

      return func(options);
    }
  };
};

export const compose = <R, T>(
  defaultAction: (options: T) => R,
  ...plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> =>
  ComposeFunc(ComposeDirection.LEFT_TO_RIGHT, defaultAction, plugins);

export const composeRight = <R, T>(
  defaultAction: (options: T) => R,
  ...plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> =>
  ComposeFunc(ComposeDirection.RIGHT_TO_LEFT, defaultAction, plugins);
