# TypeNarrowing - TS

The TypeNarrowing *Proof of Concept* provides an example of complex type narrowing in TypeScript using branded-types and typeguards.

## Overview

The POC is aimed at enforcing several business rules to strictly constrain the structure and traversal of an object.

Specifications as typed objects can either be exclusive or combinable specifications, but can never be both exlusive and combinable at the same time.

**Streaming service domain example**

For the sake of demonstration, let's model a simple streaming service domain by the following business rules:

- The streaming platform sells *plans* that can be either *predefined* or *custom*, mutually exclusive
- The *predefined* plans can either be *standard* or *premium*, mutually exclusive
- The *custom* plans are defined by a combination or *options*, (*adFree*, *offline*...)

Developers should be allowed to create the following `Plan` objects: 

```typescript
// User has a standard plan ✅
let standard: Plan = {
    standard: true
};
// User has a premium plan ✅
let premium: Plan = {
    premium: true
};
// User has a adFree custom plan ✅
let customAdFree: Plan = {
    adFree: true
};
// User has a offline custom plan ✅
let customOffline: Plan = {
    offline: true
};
// User has a combined custom plan ✅
let customCombined: Plan = {
    addFree: true,
    offline: true
}
```

But the developers should not be allowed to have several *predefined* plans:

```typescript
// User can't have two predefined plans ❌
const plan: Plan = {
    standard: true,
    premium: true
}
```

Nor should they be allowed to mix *predefined* and *custom* plans:

```typescript
// User can't mix predefined and custom plans ❌
const plan: Plan = {
    standard: true,
    adFree: true
}
```

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
