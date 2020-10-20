export type ComposeResult<T> = T | Promise<T>;

export interface ComposePlugin<R, T> {
  (next: () => ComposeResult<R>, arg: T): ComposeResult<R>;
}

export interface ComposeInstance<R, T> {
  add(newPlugins: ComposePlugin<R, T>[]): ComposeInstance<R, T>;
  exec(options: T): ComposeResult<R>;
}

export interface ComposeType<R, T> {
  (plugins: ComposePlugin<R, T>[]): ComposeInstance<R, T>;
}

const Compose = <R, T>(
  plugins: ComposePlugin<R, T>[]
): ComposeInstance<R, T> => {
  return {
    add(newPlugins) {
      return Compose([...plugins, ...newPlugins]);
    },
    exec(options) {
      const func = plugins.reduce(
        (acc, x) => () => x(acc, options),
        () => plugins[0](null, options)
      );

      return func();
    }
  };
};

export default Compose;
