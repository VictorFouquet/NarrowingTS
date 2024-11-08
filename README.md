# TypeNarrowing - TS

The TypeNarrowing *Proof of Concept* provides an example of complex type narrowing in TypeScript using branded-types and typeguards.

## Overview

The POC is aimed at enforcing several business rules to strictly constrain the structure and traversal of an object.

All the object allowed keys are defined as typed strings, `A`, `B`, `C` and `D`.

These keys are subdivided between:
- `ExclusiveKeys`  : `A` and `D`
- `CombinableKeys` : `B` and `C`

From those subdivided keys, two different types are defined, `Exclusive` and `Combinable`, respectively following exclusive and combinable business rules.

The higher level type is `Operation` and can hold any of the allowed keys associated to a `string` value, following the operation business rules.


Run the tests with :

```bash
npm install
npm run test
```
