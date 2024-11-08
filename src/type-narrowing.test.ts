import { test, expect, expectTypeOf } from "vitest";
import { isCombined, isEntityA, isEntityB, isEntityC, isOperation, isUniq, matchEntityB, matchEntityC } from "./type-narrowing";

test("Type guards should prevent invalid nesting of isCombined and isUniq", () => {1
    function testInvalidSemanticNesting(v: any) {
        if (isCombined(v)) {
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (isUniq(v)) {
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            }
            
        } else if (isUniq(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
            
            if (isCombined(v)) {
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

test("Type guards should prevent invalid nesting of isEntity, isUniq and isCombined", () => {1
    function testInvalidSemanticNesting(v: any) {
        if (isCombined(v)) {
            // Should have exact shape { b?: string, c?:string }
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (isEntityA(v)) { // Invalid statement, can't be combined and entityA -> never
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            } else if (isEntityB(v)) {
                // Should have exact shape { b: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("c");
            } else if (isEntityC(v)) {
                // Should have exact shape { c: string }
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("b");
            }
            
        } else if (isUniq(v)) {
            // Should have exact shape { a: string }
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
            
            if (isEntityA(v)) {
                // Should have exact shape { a: string }
                expectTypeOf(v.a).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");

            } else if (isEntityB(v)) { // Invalid statement, can't be uniq and entityB -> never
                expectTypeOf(v).toMatchTypeOf<never>();
                expect.unreachable();
            } else if (isEntityC(v)) { // Invalid statement, can't be uniq and entityC -> never
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
        if (isCombined(v)) {
            // Should have exact shape { b?: string, c?:string }
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            
            if (matchEntityB(v)) {
                // Should have exact shape { b: string, c?:string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
            } else if (matchEntityC(v)) {
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
        if (matchEntityB(v)) {
            // Should have exact shape { b: string, c?:string }
            expectTypeOf(v.b).toBeString();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");

            if (isEntityB(v)) {
                // Should have exact shape { b: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("c");
            } else if (matchEntityC(v)) {
                // Should have exact shape { b: string, c: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.b).toBeString();
            } else if (isEntityC(v)) {
                // Invalid semantically, can't be and match 2 different types at the same time
                expectTypeOf(v).toMatchTypeOf<never>();
            }

        } else if (matchEntityC(v)) {
            // Should have exact shape { b?: string, c: string }
            expectTypeOf(v.c).toBeString();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");

            if (isEntityC(v)) {
                // Should have exact shape { c: string }
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
            } else if (matchEntityB(v)) {
                // Should have exact shape { b: string, c: string }
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.b).toBeString();
            } else if (isEntityB(v)) {
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

            if (isCombined(v)) {
                // Should have exact shape { b?: string, c?:string }
                expectTypeOf(v.b).toBeNullable();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
                
                if (isEntityA(v)) {
                    expect.unreachable();
                } else if (isEntityB(v)) {
                    // Should have exact shape { b: string }
                    expectTypeOf(v.b).toBeString();
                    expectTypeOf(v).not.toHaveProperty("a");
                    expectTypeOf(v).not.toHaveProperty("c");
                } else if (isEntityC(v)) {
                    // Should have exact shape { c: string }
                    expectTypeOf(v.c).toBeString();
                    expectTypeOf(v).not.toHaveProperty("a");
                    expectTypeOf(v).not.toHaveProperty("b");
                }
                
            } else if (isUniq(v)) {
                // Should have exact shape { a: string }
                expectTypeOf(v.a).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
                
                if (isEntityA(v)) {
                    // Should have exact shape { a: string }
                    expectTypeOf(v.a).toBeString();
                    expectTypeOf(v).not.toHaveProperty("b");
                    expectTypeOf(v).not.toHaveProperty("c");
    
                } else if (isEntityB(v)) {
                    expect.unreachable();
                } else if (isEntityC(v)) {
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

//   if (isUniq(v)) {
//     if (isEntityA(v)) {
//         v.a
//     }
//     // Inside `isUniq`, `v` is `Uniq` and has only `a`
//     v.a; // OK: `string`
//     v.b; // OK: `b` does not exist on `Uniq`
//     v.c; // OK: `c` does not exist on `Uniq`

//     if (isCombined(v)) {
//       v.a; // OK: `never` due to mutual exclusivity
//       v.b; // OK: `never` due to mutual exclusivity
//       v.c; // OK: `never` due to mutual exclusivity
//     }
//   } else if (isCombined(v)) {
//     // Inside `isCombined`, `v` is `Combined` with `b` and `c` only
//     v.a; // OK: `a` does not exist on `Combined`
//     v.b; // OK: string | undefined
//     v.c; // OK: `string | undefined`
//     if (isEntityB(v)) {
//         v.b
//     } else if (isEntityC(v)) {
//         v.c
//     }
//     if (isUniq(v)) {
//       v.a; // OK: `never` due to mutual exclusivity
//       v.b; // OK: `never` due to mutual exclusivity
//       v.c; // OK: `never` due to mutual exclusivity
//     }
//   }
// }