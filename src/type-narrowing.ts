
declare const __brand: unique symbol;
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

type Brand<B> = { [__brand]: B };

export type A = "a";
export type B = "b";
export type C = "c";
export type D = "d";

export type Exclusive = A | D;

export type MyKeys = A | B | C | D;

export type EntityA = {
    [K in A]: string
}

export type EntityB = {
    [K in B]: string
}

export type EntityC = {
    [K in C]: string
}

export type EntityD = {
    [K in D]: string
}

export type Uniq = {
  [K in Exclusive]: AtLeastOne<{
    [U in Exclusive]: K extends U ? string : never
  }>;
}[Exclusive];

export type Combined = AtLeastOne<{
  [K in Exclude<MyKeys, Exclusive>]: string
}>;

export type Operation = {
    [K in MyKeys]: AtLeastOne<{
        [U in MyKeys]: 
            K extends U ? string :
            K extends Exclusive ? never  :
            U extends Exclusive ? never  :
            string
    }>
}[MyKeys];

export function isEntityA(v: any): v is EntityA & Brand<A> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'a' in v
}

export function isEntityB(v: any): v is EntityB & Brand<B> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'b' in v
}

export function isEntityC(v: any): v is EntityC & Brand<C> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'c' in v
}

export function isEntityD(v: any): v is EntityD & Brand<D> {
    return typeof v === "object" && Object.keys(v).length === 1 && 'd' in v
}

export function matchEntityB(v: any): v is EntityB & Combined & Brand<"combined" | B> {
    return typeof v === "object" && 'b' in v
}

export function matchEntityC(v: any): v is EntityC & Combined & Brand<"combined" | C> {
    return typeof v === "object" && 'c' in v
}

export function isUniq(v: any): v is Uniq & Brand<"uniq" | A | D> {
  return typeof v === "object" && Object.entries(v).every(([k,v]) => ['a', 'd'].includes(k) && typeof v === 'string');
}

export function isCombined(v: any): v is Combined & Brand<"combined" | B | C> {
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

