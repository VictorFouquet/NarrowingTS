import { test, expect, expectTypeOf } from "vitest";
import { isCombinable, isKeyA, isKeyB, isKeyC, isOperation, isExclusive, matchKeyB, matchKeyC, isKeyD, Exclusive, Combinable, Operation } from "./type-narrowing";


test("Exclusive should forbid empty object",
    () => expectTypeOf<{}>().not.toMatchTypeOf<Exclusive>()
);

test("Exclusive should forbid object with several ExclusiveKey",
    () => expectTypeOf<{a: "", d: ""}>().not.toMatchTypeOf<Exclusive>()
)

test("Exclusive should allow only one key from ExclusiveKey", () => {
    expectTypeOf<{a: ""}>().toMatchTypeOf<Exclusive>();
    expectTypeOf<{d: ""}>().toMatchTypeOf<Exclusive>();

    const v: Exclusive = {
        a: "",
        // @ts-expect-error
        c: ""
    };
});

test("Combinable should forbid empty object", () => expectTypeOf<{}>().not.toMatchTypeOf<Combinable>());

test("Combinable should allow any combination of keys from CombinableKey", () => {
    expectTypeOf<{b: ""}>().toMatchTypeOf<Combinable>();
    expectTypeOf<{c: ""}>().toMatchTypeOf<Combinable>();
    expectTypeOf<{b: "", c: ""}>().toMatchTypeOf<Combinable>();

    const v1: Combinable = {
        // @ts-expect-error
        a: "",
        b: "",
        c: ""
    };

    const v2: Combinable = {
        b: "",
        c: "",
        // @ts-expect-error
        d: ""
    };
});

test("Operation should forbid empty object", () => expectTypeOf<{}>().not.toMatchTypeOf<Operation>());

test("Operation should forbid mixing Exlusive and Combinable", () => {
    expectTypeOf<{a: "", b: ""}>().not.toMatchTypeOf<Operation>();
    expectTypeOf<{a: "", c: ""}>().not.toMatchTypeOf<Operation>();
    expectTypeOf<{a: "", b: "", c: ""}>().not.toMatchTypeOf<Operation>();
    
    expectTypeOf<{b: "", d: ""}>().not.toMatchTypeOf<Operation>();
    expectTypeOf<{c: "", d: ""}>().not.toMatchTypeOf<Operation>();
    expectTypeOf<{b: "", c: "", d: ""}>().not.toMatchTypeOf<Operation>();
});

test("Operation should allow Unique", () => {
    expectTypeOf<{a: ""}>().toMatchTypeOf<Operation>();
    expectTypeOf<{d: ""}>().toMatchTypeOf<Operation>();

    expectTypeOf<{a: "", d: ""}>().not.toMatchTypeOf<Operation>();

    expectTypeOf<{}>().not.toMatchTypeOf<Operation>();
});

test("Operation should allow Combinable", () => {
    expectTypeOf<{b: ""}>().toMatchTypeOf<Operation>();
    expectTypeOf<{c: ""}>().toMatchTypeOf<Operation>();
    expectTypeOf<{b: "", c: ""}>().toMatchTypeOf<Operation>();
});

test("Type guards should narrow Exclusive to ExclusiveKey", () => {
    function narrowExclusiveToIsKey(v: any) {
        if (isExclusive(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");

            if (isKeyA(v)) {
                expectTypeOf(v.a).toBeString();
                expectTypeOf(v).not.toHaveProperty("d");
            } else if (isKeyD(v)) {
                expectTypeOf(v.d).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
            } else {
                expect.unreachable();
            }
        }
    }

    narrowExclusiveToIsKey({ a: "" });
    narrowExclusiveToIsKey({ d: "" });
    narrowExclusiveToIsKey({ a: "", d: "" });
    narrowExclusiveToIsKey({ a: "", c: "" });
});

test("Type guards should prevent invalid nesting of isCombinable and isExclusive", () => {1
    function testInvalidSemanticNesting(v: any) {
        if (isCombinable(v)) {
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (isExclusive(v)) {
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            }
            
        } else if (isExclusive(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
            
            if (isCombinable(v)) {
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            }
        }
    }

    let v1: any = { a: "" };
    let v2: any = { b: "", c: "" };

    let v3: any = { a: "", b: "" };
    let v4: any = { a: "", c: "" };
    let v5: any = { a: "", b: "", c: "" };

    testInvalidSemanticNesting(v1);
    testInvalidSemanticNesting(v2);
    testInvalidSemanticNesting(v3);
    testInvalidSemanticNesting(v4);
    testInvalidSemanticNesting(v5);
});

test("Type guards should prevent invalid nesting of isEntity, isExclusive and isCombinable", () => {1
    function testInvalidSemanticNesting(v: any) {
        if (isCombinable(v)) {
            // Should have exact shape { b?: string, c?:string }
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (isKeyA(v)) { // Invalid statement, can't be Combinable and KeyA -> never
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            } else if (isKeyB(v)) {
                // Should have exact shape { b: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("c");
            } else if (isKeyC(v)) {
                // Should have exact shape { c: string }
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("b");
            }
            
        } else if (isExclusive(v)) {
            // Should have exact shape { a: string }
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
            
            if (isKeyA(v)) {
                // Should have exact shape { a: string }
                expectTypeOf(v.a).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");

            } else if (isKeyB(v)) { // Invalid statement, can't be Exclusive and KeyB -> never
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            } else if (isKeyC(v)) { // Invalid statement, can't be Exclusive and KeyC -> never
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            }
        }
    }

    let v1: any = { a: "" };
    let v2: any = { a: "" };
    let v3: any = { a: "" };

    let v4: any = { a: "", b: "" };
    let v5: any = { a: "", c: "" };
    let v6: any = { b: "", c: "" };

    let v7: any = { a: "", b: "", c: "" };

    testInvalidSemanticNesting(v1);
    testInvalidSemanticNesting(v2);
    testInvalidSemanticNesting(v3);
    testInvalidSemanticNesting(v4);
    testInvalidSemanticNesting(v5);
    testInvalidSemanticNesting(v6);
    testInvalidSemanticNesting(v7);
});

test("Type guards should allow valid matching operations", () => {1
    function testMatchingNesting(v: any) {
        if (isCombinable(v)) {
            // Should have exact shape { b?: string, c?:string }
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (matchKeyB(v)) {
                // Should have exact shape { b: string, c?:string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
            } else if (matchKeyC(v)) {
                // Should have exact shape { b: string }
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v.b).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
            }
        }
    }

    let v1: any = { b: "" };
    let v2: any = { c: "" };
    let v3: any = { b: "", c: "" };

    testMatchingNesting(v1);
    testMatchingNesting(v2);
    testMatchingNesting(v3);
});

test("Type guards should allow valid matching with entities operations", () => {1
    function testMatchingNesting(v: any) {            
        if (matchKeyB(v)) {
            // Should have exact shape { b: string, c?:string }
            expectTypeOf(v.b).toBeString();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");

            if (isKeyB(v)) {
                // Should have exact shape { b: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("c");
            } else if (matchKeyC(v)) {
                // Should have exact shape { b: string, c: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.b).toBeString();
            } else if (isKeyC(v)) {
                // Invalid semantically, can't be and match 2 different types at the same time
                expectTypeOf(v).toMatchTypeOf<never>();
            }

        } else if (matchKeyC(v)) {
            // Should have exact shape { b?: string, c: string }
            expectTypeOf(v.c).toBeString();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");

            if (isKeyC(v)) {
                // Should have exact shape { c: string }
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
            } else if (matchKeyB(v)) {
                // Should have exact shape { b: string, c: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.b).toBeString();
            } else if (isKeyB(v)) {
                // Invalid semantically, can't be and match 2 different types at the same time
                expectTypeOf(v).toMatchTypeOf<never>();
            }
        }
    }

    let v1: any = { b: "" };
    let v2: any = { c: "" };
    let v3: any = { b: "", c: "" };

    testMatchingNesting(v1);
    testMatchingNesting(v2);
    testMatchingNesting(v3);
});

test("Type guards should direct type narrowing from operation to entity leavec", () => {1
    function testTypeNarrowing(v: any) {
        if (isOperation(v)) {
            // Should have exact shape { a?: string, b?: string, c?:string }
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v.a).toBeNullable();

            if (isCombinable(v)) {
                // Should have exact shape { b?: string, c?:string }
                expectTypeOf(v.b).toBeNullable();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
                
                if (isKeyA(v)) {
                    expect.unreachable();
                } else if (isKeyB(v)) {
                    // Should have exact shape { b: string }
                    expectTypeOf(v.b).toBeString();
                    expectTypeOf(v).not.toHaveProperty("a");
                    expectTypeOf(v).not.toHaveProperty("c");
                } else if (isKeyC(v)) {
                    // Should have exact shape { c: string }
                    expectTypeOf(v.c).toBeString();
                    expectTypeOf(v).not.toHaveProperty("a");
                    expectTypeOf(v).not.toHaveProperty("b");
                }
                
            } else if (isExclusive(v)) {
                // Should have exact shape { a: string }
                expectTypeOf(v.a).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
                
                if (isKeyA(v)) {
                    // Should have exact shape { a: string }
                    expectTypeOf(v.a).toBeString();
                    expectTypeOf(v).not.toHaveProperty("b");
                    expectTypeOf(v).not.toHaveProperty("c");
    
                } else if (isKeyB(v)) {
                    expect.unreachable();
                } else if (isKeyC(v)) {
                    expect.unreachable();
                }
            }
        } else {
            if ("a" in v) {
                expect(
                    Object.keys(v).includes("b") ||
                    Object.keys(v).includes("b") ||
                    Object.keys(v).length > 1
                ).toBe(true)
            } else if ("b" in v || "c" in v) {
                expect(
                    Object.keys(v).includes("a") ||
                    Object.keys(v).length > 2
                ).toBe(true)
            }
        }
    }

    let v1: any = { a: "" };
    let v2: any = { a: "" };
    let v3: any = { a: "" };

    let v4: any = { a: "", b: "" };
    let v5: any = { a: "", c: "" };
    let v6: any = { b: "", c: "" };

    let v7: any = { a: "", b: "", c: "" };

    testTypeNarrowing(v1);
    testTypeNarrowing(v2);
    testTypeNarrowing(v3);
    testTypeNarrowing(v4);
    testTypeNarrowing(v5);
    testTypeNarrowing(v6);
    testTypeNarrowing(v7);
});

// Task: sum up the business rules tested here, the fix the KO without breaking OKs
// let v: unknown

// if (isOperation(v)) {
//   // Here `v` is inferred as `Operation`, with `a`, `b`, and `c` optional
//   v.a; // OK: `string | undefined`
//   v.b; // OK: `string | undefined`
//   v.c; // OK: `string | undefined`

//   if (isExclusive(v)) {
//     if (isKeyA(v)) {
//         v.a
//     }
//     // Inside `isExclusive`, `v` is `Exclusive` and has only `a`
//     v.a; // OK: `string`
//     v.b; // OK: `b` does not exist on `Exclusive`
//     v.c; // OK: `c` does not exist on `Exclusive`

//     if (isCombinable(v)) {
//       v.a; // OK: `never` due to mutual exclusivity
//       v.b; // OK: `never` due to mutual exclusivity
//       v.c; // OK: `never` due to mutual exclusivity
//     }
//   } else if (isCombinable(v)) {
//     // Inside `isCombinable`, `v` is `Combinable` with `b` and `c` only
//     v.a; // OK: `a` does not exist on `Combinable`
//     v.b; // OK: string | undefined
//     v.c; // OK: `string | undefined`
//     if (isKeyB(v)) {
//         v.b
//     } else if (isKeyC(v)) {
//         v.c
//     }
//     if (isExclusive(v)) {
//       v.a; // OK: `never` due to mutual exclusivity
//       v.b; // OK: `never` due to mutual exclusivity
//       v.c; // OK: `never` due to mutual exclusivity
//     }
//   }
// }