// import RouteComponent from './route-component';

class PageRoute {
  constructor(
    protected _path: string,
    protected _component: () => JSX.Element,
    protected _exact: boolean = true,
    protected _authGuard: boolean = false,
    protected _key: string,
  ) {}

  get path(): string { return this._path; }
  get key(): string { return this._key; }
  get exact(): boolean { return this._exact; }
  get authGuard(): boolean { return this._authGuard; }

  get Component(): () => JSX.Element { return this._component; }
}

export {
  PageRoute,
};