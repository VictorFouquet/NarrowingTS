# NarrowingTS

The **NarrowingTS** proof of concept demonstrates advanced type narrowing techniques in TypeScript, using branded types and type guards to strictly enforce complex business rules. The main goal is to provide an example of how to model a domain with types that are either mutually exclusive or combinable, but never both at the same time.

## Overview

In TypeScript, narrowing down types to enforce specific business rules is a common practice when developing robust applications.

**NarrowingTS** is an attempt to build a strict type system that ensures an object’s structure adheres to defined constraints, and dynamically adjusting the required shape of the object based on its values. This is especially useful when we want to model scenarios where we must enforce exclusivity or combinability of certain properties in an object.

For example, consider an e-commerce or subscription service where certain plans, configurations, or options must either be mutually exclusive or combinable. TypeScript’s structural typing allows us to define a flexible yet strictly constrained set of possible configurations, but it doesn’t naturally prevent the presence of conflicting or invalid combinations.

In this proof of concept, we demonstrate how TypeScript’s branded types, type guards, and custom types can help ensure that an object adheres to the correct structure, disallowing illegal combinations of properties.

### Business Rules

The following business rules are enforced in this system:

- **Exclusive**: An object can only have one key from a set of exclusive keys. It cannot have multiple exclusive keys or any keys that do not belong to the exclusive set.
- **Combinable**: An object can have multiple keys from a set of combinable keys. These keys can overlap, but no additional keys outside the set can be present.
- **Schema**: An object must either match the structure of an Exclusive object or a Combinable object, but it cannot be both.

## Streaming Service Domain Example

To illustrate the concept in a real-world context, let’s model a **streaming service subscription** domain with these business rules:

- The streaming platform offers **plans** that can be either *predefined* or *custom*, but never both.
- The **predefined plans** consist of *standard* or *premium*, which are **mutually exclusive**.
- The **custom plans** are defined by a set of **options**, such as *adFree* and *offline* than **can be combined**.

This ensures that users can create a valid Plan object, while preventing conflicting or invalid combinations.

### Example usage

With these rules in place, the following configurations are **valid**:

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

However, the following configurations would be **invalid**:
```typescript
// User can't have two predefined plans ❌
const plan: Plan = {
    standard: true,
    premium: true
}
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

### Schema

An object of type `Schema` should:

- allow either the structure of an `Exclusive` or a `Combined` object
- forbid empty objects

## Unit tests

All the business rules are unit tested in the `src/type-narrowing.test.ts` file.

Using your favorite package manager :
- Install dependencies (`vitest`, `@types/node` and `typescript`)
```bash
npm install
```
- Run the unit tests suite
```bash
npm run test
```
