import { test, expect, expectTypeOf } from "vitest";
import { isCombined, isEntityA, isEntityB, isEntityC, isUniq } from "./type-narrowing";

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
            expectTypeOf(v.a).toBeString();
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
            expectTypeOf(v.a).toBeString();
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
