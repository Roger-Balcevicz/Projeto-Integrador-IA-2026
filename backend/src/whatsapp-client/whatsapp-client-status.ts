export class Bootstrapping {}

export class Ready {}

export class Authenticated {}

export class AuthFailure {
  constructor(public readonly message: string) {}
}

export class Disconnected {
  constructor(public readonly reason: string) {}
}

export type ClientStatus =
  | Bootstrapping
  | Ready
  | Authenticated
  | AuthFailure
  | Disconnected;
