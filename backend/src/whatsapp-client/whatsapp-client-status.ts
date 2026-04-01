export class Initializing {}

export class Ready {}

export class Authenticated {}

export class AuthFailure {
  constructor(public readonly message: string) {}
}

export class Disconnected {
  constructor(public readonly reason: string) {}
}

export type ClientStatus =
  | Initializing
  | Ready
  | Authenticated
  | AuthFailure
  | Disconnected;
