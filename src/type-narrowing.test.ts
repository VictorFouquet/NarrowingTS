import { test, expect, expectTypeOf } from "vitest";
import { isCombinable, isKeyA, isKeyB, isKeyC, isSchema, isExclusive, matchKeyB, matchKeyC, isKeyD, Exclusive, Combinable, Schema } from "./type-narrowing";

//------------------------------------------------------------------------- Exclusive type

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


//------------------------------------------------------------------------- Combinable type

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


//------------------------------------------------------------------------- Schema type

test("Schema should forbid empty object", () => expectTypeOf<{}>().not.toMatchTypeOf<Schema>());

test("Schema should forbid mixing Exclusive and Combinable", () => {
    expectTypeOf<{a: "", b: ""}>().not.toMatchTypeOf<Schema>();
    expectTypeOf<{a: "", c: ""}>().not.toMatchTypeOf<Schema>();
    expectTypeOf<{a: "", b: "", c: ""}>().not.toMatchTypeOf<Schema>();
    
    expectTypeOf<{b: "", d: ""}>().not.toMatchTypeOf<Schema>();
    expectTypeOf<{c: "", d: ""}>().not.toMatchTypeOf<Schema>();
    expectTypeOf<{b: "", c: "", d: ""}>().not.toMatchTypeOf<Schema>();
});

test("Schema should allow Unique", () => {
    expectTypeOf<{a: ""}>().toMatchTypeOf<Schema>();
    expectTypeOf<{d: ""}>().toMatchTypeOf<Schema>();

    expectTypeOf<{a: "", d: ""}>().not.toMatchTypeOf<Schema>();

    expectTypeOf<{}>().not.toMatchTypeOf<Schema>();
});

test("Schema should allow Combinable", () => {
    expectTypeOf<{b: ""}>().toMatchTypeOf<Schema>();
    expectTypeOf<{c: ""}>().toMatchTypeOf<Schema>();
    expectTypeOf<{b: "", c: ""}>().toMatchTypeOf<Schema>();
});

//------------------------------------------------------------------------- isKey type guards

test("IsKey typeguards should ensure a key object to contain exactly one valid key", () => {
    function testIsKey(v: any) {
        if (isKeyA(v)) {
            expectTypeOf(v.a).toBeString();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
            expectTypeOf(v).not.toHaveProperty("d");
        } else if (isKeyB(v)) {
            expectTypeOf(v.b).toBeString();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("c");
            expectTypeOf(v).not.toHaveProperty("d");
        }  else if (isKeyC(v)) {
            expectTypeOf(v.c).toBeString();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("d");
        } else if (isKeyD(v)) {
            expectTypeOf(v.d).toBeString();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ d: "" });
});

test("isKey typeguards should narrow to key object when nested in a matchKey statement with corresponding keys", () => {
    function testIsKey(v: any) {
        if (matchKeyB(v)) {
            if (isKeyB(v)) {
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("c");
            }
        } else if (matchKeyC(v)) {
            if (isKeyC(v)) {
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});

test("isKey typeguards should narrow to key object when nested in a isExclusive statement with a ExclusiveKey", () => {
    function testIsKey(v: any) {
        if (isExclusive(v)) {
            if (isKeyA(v)) {
                expectTypeOf(v.a).toBeString();
                expectTypeOf(v).not.toHaveProperty("d");
            } else if (isKeyD(v)) {
                expectTypeOf(v.d).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
});

test("isKey typeguards should narrow to key object when nested in a isCombinable statement with a CombinableKey", () => {
    function testIsKey(v: any) {
        if (isCombinable(v)) {
            if (isKeyB(v)) {
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("c");
            } else if (isKeyC(v)) {
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});

test("isKey typeguards should narrow to key object when nested in a isSchema statement", () => {
    function testIsKey(v: any) {
        if (isSchema(v)) {
            if (isKeyA(v)) {
                expectTypeOf(v.a).toBeString();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
                expectTypeOf(v).not.toHaveProperty("d");
            } else if (isKeyB(v)) {
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("c");
                expectTypeOf(v).not.toHaveProperty("d");
            } else if (isKeyC(v)) {
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("d");
            } else if (isKeyD(v)) {
                expectTypeOf(v.d).toBeString();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
            } else {
                expect.unreachable();
            }
        } else {
            expect.unreachable();
        }
    }
    testIsKey({ a: "" });
    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ d: "" });
});

test("IsKey typeguards should narrow to never if nested in another different IsKey statement", () => {
    function testIsKey(v: any) {
        if (isKeyA(v)) {
            expectTypeOf(v).not.toBeNever();
            if      (isKeyB(v)) expectTypeOf(v).toBeNever();
            else if (isKeyC(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();
        } else if (isKeyB(v)) {
            expectTypeOf(v).not.toBeNever();
            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyC(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();
        }  else if (isKeyC(v)) {
            expectTypeOf(v).not.toBeNever();
            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyB(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();
        } else if (isKeyD(v)) {
            expectTypeOf(v).not.toBeNever();
            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyB(v)) expectTypeOf(v).toBeNever();
            else if (isKeyC(v)) expectTypeOf(v).toBeNever();
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ d: "" });
});

test("isKey typeguards should narrow to never when nested in a matchKey statement with different keys", () => {
    function testIsKey(v: any) {

        if (matchKeyB(v)) {

            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyC(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();

        } else if (matchKeyC(v)) {

            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyB(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();
        
        } else {
            expect.unreachable();
        }

    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});

test("isKey typeguards should narrow to never when nested in a isExclusive statement with a CombinableKey", () => {
    function testIsKey(v: any) {
        if (isExclusive(v)) {
            if (isKeyB(v)) {
                expectTypeOf(v).toBeNever();
            } else if (isKeyC(v)) {
                expectTypeOf(v).toBeNever();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
});

test("isKey typeguards should narrow to never when nested in a isCombinable statement with an ExclusiveKey", () => {
    function testIsKey(v: any) {
        if (isCombinable(v)) {
            if      (isKeyA(v)) expectTypeOf(v).toBeNever();
            else if (isKeyD(v)) expectTypeOf(v).toBeNever();
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});


//------------------------------------------------------------------------- matchKey type guards

test("MatchKey typeguards should ensure the presence of one nullable and one non-nullable CombinableKeys in an object", () => {
    const notMatch = "!match";

    function testIsKey(v: any) {
        if (matchKeyB(v)) {
            expectTypeOf(v.b).toBeString();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("d");
        } else if (matchKeyC(v)) {
            expectTypeOf(v.c).toBeString();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("d");
        } else {
            throw new Error(notMatch);
        }
    }
    
    testIsKey({ a: "", b: "" })
    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ a: "", b: "" })
    testIsKey({ d: "", c: "" });

    expect(() => testIsKey({ a: "" })).toThrow();
    expect(() => testIsKey({ d: "" })).toThrow();

});

test("MatchKey typeguards should narrow to an object with one nullable and one non nullable keys when nested inside isCombinable statements", () => {
    function testIsKey(v: any) {
        if (isCombinable(v)) {
            if (matchKeyB(v)) {
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.c).toBeNullable();
            } else if (matchKeyC(v)) {
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v.b).toBeNullable();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" })
});

test("MatchKey typeguards should narrow to an object with one nullable and one non nullable keys when nested inside isSchema statements", () => {
    function testIsKey(v: any) {
        if (isSchema(v)) {
            if (matchKeyB(v)) {
                expectTypeOf(v.b).toBeString();
                expectTypeOf(v.c).toBeNullable();
            } else if (matchKeyC(v)) {
                expectTypeOf(v.c).toBeString();
                expectTypeOf(v.b).toBeNullable();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" })
});

test("MatchKey typeguards should narrow to never when nested inside isExclusive statements", () => {
    function testIsKey(v: any) {
        if (isExclusive(v)) {
            if (matchKeyB(v)) {
                expectTypeOf(v).toBeNever();
            } else if (matchKeyC(v)) {
                expectTypeOf(v).toBeNever();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
});


//------------------------------------------------------------------------- isExclusive type guards

test("IsExclusive typeguards should ensure a Exclusive object contains ExclusiveKeys only, all nullable", () => {
    function testIsKey(v: any) {
        if (isExclusive(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("b");
            expectTypeOf(v).not.toHaveProperty("c");
        } else {
            expect.unreachable()
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
})

test("isExclusive typeguards should narrow to Exclusive object when nested inside isSchema statement", () => {
    function testIsKey(v: any) {
        if (isSchema(v)) {
            if (isExclusive(v)) {
                expectTypeOf(v.a).toBeNullable();
                expectTypeOf(v.d).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
            } else {
                expect.unreachable();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
});

test("isExclusive typeguards should narrow to never when nested inside isCombinable statement", () => {
    function testIsKey(v: any) {
        if (isCombinable(v)) {
            if (isExclusive(v)) {
                expectTypeOf(v).toBeNever()
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});


//------------------------------------------------------------------------- isCombinable type guards

test("IsCombinable typeguards should ensure a Combinable object contains CombinableKeys only, all nullable", () => {
    const notCombinable = '!Combinable';
    function testIsKey(v: any) {
        if (isCombinable(v)) {
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v).not.toHaveProperty("a");
            expectTypeOf(v).not.toHaveProperty("d");
        } else {
            throw new Error(notCombinable);
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });

    expect(() => testIsKey({ a: "" })).toThrowError(notCombinable);
    expect(() => testIsKey({ a: "", b: "" })).toThrowError(notCombinable);
    expect(() => testIsKey({ d: "", c: "" })).toThrowError(notCombinable);
});

test("IsCombinable typeguards should narrow to Combinable object when nested inside isSchema statement", () => {
    function testIsKey(v: any) {
        if (isSchema(v)) {
            if (isCombinable(v)) {
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("d");
            } else {
                expect.unreachable();
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" });
});

test("IsCombinable typeguards should narrow to never when nested inside isExclusive statement", () => {
    function testIsKey(v: any) {
        if (isExclusive(v)) {
            if (isCombinable(v)) {
                expectTypeOf(v).toBeNever()
            }
        } else {
            expect.unreachable();
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });
});

//------------------------------------------------------------------------- isSchema type guards

test("IsSchema typeguard should ensure an object contains all the defined keys as nullable", () => {
    function testIsKey(v: any) {
        if (isSchema(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
        } else {
            expect.unreachable()
        }
    }

    testIsKey({ a: "" });
    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ d: "" });
});

test("IsSchema typeguard should ensure it has the shape of either Combinable or Exclusive object", () => {
    const notSchema = '!schema';
    function testIsKey(v: any) {
        if (isSchema(v)) {
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v.d).toBeNullable();
        } else {
            throw new Error(notSchema)
        }
    }

    testIsKey({ a: "" });
    testIsKey({ d: "" });

    testIsKey({ b: "" });
    testIsKey({ c: "" });
    testIsKey({ b: "", c: "" })

    expect(() => testIsKey({ a: "", d: "" })).toThrow(notSchema);
    expect(() => testIsKey({ a: "", b: "" })).toThrow(notSchema);
    expect(() => testIsKey({ a: "", c: "" })).toThrow(notSchema);
    expect(() => testIsKey({ b: "", d: "" })).toThrow(notSchema);
    expect(() => testIsKey({ c: "", d: "" })).toThrow(notSchema);
});



test("Type guards should all tree traversal and type narrowing from root to leavec", () => {1
    function testTypeNarrowing(v: any) {
        if (isSchema(v)) {
            // { a?: string, b?: string, c?:string, d?: string }
            expectTypeOf(v.a).toBeNullable();
            expectTypeOf(v.b).toBeNullable();
            expectTypeOf(v.c).toBeNullable();
            expectTypeOf(v.d).toBeNullable();

            if (isCombinable(v)) {
                // { b?: string, c?:string }
                expectTypeOf(v.b).toBeNullable();
                expectTypeOf(v.c).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("a");
                expectTypeOf(v).not.toHaveProperty("d");
                
                if (matchKeyB(v)) {
                    // { b: string, c?: string }
                    expectTypeOf(v.b).toBeString();
                    expectTypeOf(v.c).toBeNullable();

                    if (isKeyB(v)) {
                        // { b: string }
                        expectTypeOf(v.b).toBeString();
                        expectTypeOf(v).not.toHaveProperty("c");
                    } else if (matchKeyC(v)) {
                        // { b: string, c: string }
                        expectTypeOf(v.b).toBeString();
                        expectTypeOf(v.c).toBeString()
                    } else {
                        expect.unreachable();
                    }
                } else if (matchKeyC(v)) {
                    // { b?: string, c: string }
                    expectTypeOf(v.c).toBeString();
                    expectTypeOf(v.b).toBeNullable();

                    if (isKeyC(v)) {
                        // { c: string }
                        expectTypeOf(v.c).toBeString();
                        expectTypeOf(v).not.toHaveProperty("b");
                    } else if (matchKeyB(v)) {
                        // { b: string, c: string }
                        expectTypeOf(v.b).toBeString();
                        expectTypeOf(v.c).toBeString();
                    } else {
                        expect.unreachable();
                    }
                } else {
                    expect.unreachable();
                }
                
            } else if (isExclusive(v)) {
                // { a?: string, d?: string }
                expectTypeOf(v.a).toBeNullable();
                expectTypeOf(v).not.toHaveProperty("b");
                expectTypeOf(v).not.toHaveProperty("c");
                expectTypeOf(v.d).toBeNullable();
                
                if (isKeyA(v)) {
                    // { a: string }
                    expectTypeOf(v.a).toBeString();
                    expectTypeOf(v).not.toHaveProperty("b");
                    expectTypeOf(v).not.toHaveProperty("c");
                    expectTypeOf(v).not.toHaveProperty("d")
    
                } else if (isKeyD(v)) {
                    // { d: string }
                    expectTypeOf(v.d).toBeString();
                    expectTypeOf(v).not.toHaveProperty("a");
                    expectTypeOf(v).not.toHaveProperty("b");
                    expectTypeOf(v).not.toHaveProperty("c");
    
                } else {
                    expect.unreachable()
                }
            }
        } else {
            expect.unreachable()
        }
    }

    testTypeNarrowing({ a: "" });
    testTypeNarrowing({ b: "" });
    testTypeNarrowing({ c: "" });
    testTypeNarrowing({ d: "" });

    testTypeNarrowing({ b: "", c: "" });
});
