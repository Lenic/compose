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

export type ComposePlugin<R, T> = ComposePluginCore<R, T> | ComposePluginFullConfig<R, T>;

export interface ComposeInstance<R, T> {
  add(
    pluginsOrCallback: ComposePlugin<R, T>[] | ((list: ComposePlugin<R, T>[]) => ComposePlugin<R, T>[])
  ): ComposeInstance<R, T>;
  exec(value: T): R;
}
