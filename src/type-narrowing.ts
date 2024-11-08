
declare const __brand: unique symbol;
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type Brand<B> = { [__brand]: B };

export type A = "a";
export type B = "b";
export type C = "c";
export type D = "d";

export type ExclusiveKeys = A | D;

export type Keys = A | B | C | D;

export type KeyA = {
    [K in A]: string
}

export type KeyB = {
    [K in B]: string
}

export type KeyC = {
    [K in C]: string
}

export type KeyD = {
    [K in D]: string
}

export type Exclusive = {
  [K in ExclusiveKeys]: AtLeastOne<{
    [U in ExclusiveKeys]: K extends U ? string : never
  }>;
}[ExclusiveKeys];

export type Combinable = AtLeastOne<{
  [K in Exclude<Keys, ExclusiveKeys>]: string
}>;

export type Operation = {
    [K in Keys]: AtLeastOne<{
        [U in Keys]: 
            K extends U ? string :
            K extends ExclusiveKeys ? never  :
            U extends ExclusiveKeys ? never  :
            string
    }>
}[Keys];

export function isKeyA(v: any): v is KeyA & Brand<A> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'a' in v
}

export function isKeyB(v: any): v is KeyB & Brand<B> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'b' in v
}

export function isKeyC(v: any): v is KeyC & Brand<C> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'c' in v
}

export function isKeyD(v: any): v is KeyD & Brand<D> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'd' in v
}

export function matchKeyB(v: any): v is KeyB & Combinable & Brand<"Combinable" | B> {
    return typeof v === "object" && 'b' in v
}

export function matchKeyC(v: any): v is KeyC & Combinable & Brand<"Combinable" | C> {
    return typeof v === "object" && 'c' in v
}

export function isExclusive(v: any): v is Exclusive & Brand<"Exclusive" | A | D> {
  return typeof v === "object" && Object.entries(v).every(([k,v]) => ['a', 'd'].includes(k) && typeof v === 'string');
}

export function isCombinable(v: any): v is Combinable & Brand<"Combinable" | B | C> {
  return typeof v === "object" && Object.entries(v).every(([k,v]) => ['b', 'c'].includes(k) && typeof v === 'string');
}

export function isOperation(v: any): v is Operation {
  return (
    typeof v === "object" &&
    (
      Object.entries(v).every(([k,v]) => k === 'a' && typeof v === 'string') ||
      Object.entries(v).every(([k,v]) => ['b', 'c'].includes(k) && typeof v === 'string')
    )
  );
}

