
//------------------------------------------------------------------------------------ Utils

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

//------------------------------------------------------------------------------------ Types

export type A = "a";
export type B = "b";
export type C = "c";
export type D = "d";

export type Keys = A | B | C | D;
export type ExclusiveKeys = Exclude<Keys, B | C>;
export type CombinableKeys = Exclude<Keys, ExclusiveKeys>;

export type KeyA = { [K in A]: string };
export type KeyB = { [K in B]: string };
export type KeyC = { [K in C]: string };
export type KeyD = { [K in D]: string };

export type Exclusive = {
  [K in ExclusiveKeys]: AtLeastOne<{
    [U in ExclusiveKeys]: K extends U ? string : never
  }>;
}[ExclusiveKeys];

export type Combinable = AtLeastOne<{
  [K in CombinableKeys]: string
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

//------------------------------------------------------------------------------------ Type Guards

function containsKeysAllWithTypeString(v: object, keys: string[]): boolean {
    return Object.entries(v).every(([k,v]) => keys.includes(k) && typeof v === 'string');
}

export function isKeyA(v: any): v is KeyA & Brand<A> {
    return typeof v === "object" && containsKeysAllWithTypeString(v, ["a"]);
}

export function isKeyB(v: any): v is KeyB & Brand<B> {
    return typeof v === "object" && containsKeysAllWithTypeString(v, ["b"]);
}

export function isKeyC(v: any): v is KeyC & Brand<C> {
    return typeof v === "object" && containsKeysAllWithTypeString(v, ["c"]);
}

export function isKeyD(v: any): v is KeyD & Brand<D> {
    return typeof v === "object" && containsKeysAllWithTypeString(v, ["d"]);
}

export function matchKeyB(v: any): v is KeyB & Combinable & Brand<"Combinable" | B> {
    return typeof v === "object" && typeof v['b'] === "string";
}

export function matchKeyC(v: any): v is KeyC & Combinable & Brand<"Combinable" | C> {
    return typeof v === "object" && typeof v['c'] === "string";
}

export function isExclusive(v: any): v is Exclusive & Brand<"Exclusive" | A | D> {
  return typeof v === "object"  && containsKeysAllWithTypeString(v, ["a", "d"]) && Object.keys(v).length === 1;
}

export function isCombinable(v: any): v is Combinable & Brand<"Combinable" | B | C> {
  return typeof v === "object" && containsKeysAllWithTypeString(v, ["b", "c"]);
}

export function isOperation(v: any): v is Operation {
  return typeof v === "object"
    && (
        containsKeysAllWithTypeString(v, ["a", "d"]) ||
        containsKeysAllWithTypeString(v, ["b", "c"])
    );
}
