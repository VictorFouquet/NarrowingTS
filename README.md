# TypeNarrowing - TS

The TypeNarrowing *Proof of Concept* provides an example of complex type narrowing in TypeScript using branded-types and typeguards.

## Overview

The POC is aimed at enforcing several business rules to strictly constrain the structure and traversal of an object.

All the object allowed keys are defined as typed strings, `A`, `B`, `C` and `D`.

Each of theses keys is used to define a typed object, associating the key to a `string` value :
- `KeyA` associates `A` to a `string` in an object
- `KeyB` associates `B` to a `string` in an object
- `KeyC` associates `C` to a `string` in an object
- `KeyD` associates `D` to a `string` in an object

These keys are subdivided between:
- `ExclusiveKeys`  : `A` and `D`
- `CombinableKeys` : `B` and `C`

From those subdivided keys, two different typed objects are defined, `Exclusive` and `Combinable`, respectively following exclusive and combinable business rules.

The higher level typed object is `Operation` and can hold any of the allowed keys associated to a `string` value, following the operation business rules.

## Business rules

### Exclusive

An object of type `Exclusive` should:

- allow exactly one key from `ExclusiveKeys`
- overlap `KeyA` and `KeyD`
- forbid empty objects
- forbid the presence of multiple `ExclusiveKeys`
- forbid the presence of any key that doesn't extend `ExclusiveKeys`

### Combinable

An object of type `Combinable` should:

- allow any combination of keys from `CombinableKeys`
- overlap `KeyB` and `KeyC`
- forbid empty objects
- forbid the presence of any key that doesn't extend `CombinableKeys`

### Operation

An object of type `Operation` should:

- allow either the structure of an `Exclusive` or a `Combined` object
- forbid empty objects

## Unit tests

All the business rules are unit tested in the `src/type-narrowing.test.ts` file.

Run the tests with :

```bash
npm install
npm run test
```
