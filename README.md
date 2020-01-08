# Knock On Wood
A simple testing framework for TypeScript

* [Features](#features)
* [Build](#build)
* [Usage](#usage)
* [Motivation](#motivation)
* [Design](#design)

# Features
* Run groups of tests with different contexts for testing different environments
* Use in Node.JS or in the browser
* Easily extend an existing set of tests with more tests without duplicating code
* Asynchronous design
* Asynchronous capable setup and teardown functions before and after each test group and/or test

# Build
```bash
git clone https://github.com/ethossoftworks/knock-on-wood.git
cd knock-on-wood
yarn                 # or npm install
yarn build           # or npm run build

# yarn test          # Run testing script
# yarn test-inspect  # Run testing script with chrome dev-tools inspector
```

# Usage
## Add to Project
```bash
npm install @ethossoftworks/knock-on-wood
# or
yarn add @ethossoftworks/knock-on-wood
```

## Write a Basic Test
```typescript
import { runTests, TestGroup } from "@ethossoftworks/knock-on-wood"

const mainGroup: TestGroup<{}> = {
    context: {},
    tests: {
        myFirstTest: async ({ assert }) => {
            assert(1 === 1)
        }
    }
}

runTests(mainGroup)
    .then(() => {})
    .catch(() => {})
```

## Write a Basic Test With a Context
```typescript
import { runTests, TestGroup } from "@ethossoftworks/knock-on-wood"

type Context = {
    username: string
    password: string
}

const mainGroup: TestGroup<Context> = {
    context: {
        username: "foo",
        password: "bar"
    },
    tests: {
        myFirstTest: async ({ context, assert }) => {
            assert(context.username === "foo")
        }
    }
}

runTests(mainGroup)
    .then(() => {})
    .catch(() => {})
```

## Use Multiple Contexts With Same Tests
```typescript
import { runTests, Tests, TestGroup } from "@ethossoftworks/knock-on-wood"

type Context = {
    username: string
    password: string
}

const endUserContext: Context = {
    username: "user",
    password: "password"
}

const adminUserContext: Context = {
    username: "admin",
    password: "root"
}

const mainTests: Tests<Context> = {
    login: async ({ context, assert }) => {
        await login(context.username, context.password)
        assert(true)
    },
    getData: async({ context, assert }) => {
        await getData()
        assert(true)
    }
}

const adminTests: Tests<Context> = {
    deleteUser: async ({ context, assert }) => {
        assert(true)
    }
}

const endUserTestGroup: TestGroup<Context> = {
    context: endUserContext,
    tests: {...mainTests}
}

const adminUserTestGroup: TestGroup<Context> = {
    context: adminUserContext,
    tests: {
        ...mainTests
        ...adminTests
    }
}

runTests(endUserTestGroup, adminUserTestGroup)
    .then(() => {})
    .catch(() => {})
```

## Setup/Teardown
```typescript
import { runTests, TestGroup } from "@ethossoftworks/knock-on-wood"

const mainGroup: TestGroup<{}> = {
    context: {},
    beforeAll: async context => {
        console.log("Before all tests in group")
    },
    beforeEach: async context => {
        console.log("Before each test in group")
    },
    afterEach: async context => {
        console.log("After each test in group")
    },
    afterAll: async context => {
        console.log("After all tests in group")
    }
    tests: {
        myFirstTest: async ({ context, assert }) => {
            assert(context.username === "foo")
        }
    }
}

runTests(mainGroup)
    .then(() => {})
    .catch(() => {})
```

# Motivation
Knock-On-Wood had a few motivating factors:
1. The desire to run the same tests across different type-safe test contexts (i.e. testing different account credentials).
2. The desire to have a base set of tests that could be extended for a different test context without having to duplicate test code.
3. Not wanting to learn a huge testing framework; just the need for something with a simple API and reasonable flexibility.

# Design
## Object-first design
Knock-On-Wood's design is intentionally very bare. I wanted to use plain objects as much as possible due to the ability to use the spread operator (...) to merge tests together. Using objects allows for easy merging/extending of multiple `Tests` objects to be included in a group.

## Test Contexts
The requirement of a context for every `TestGroup` was born out of the many times I've needed to pass the same type of information to multiple tests while also needing the flexibility to change out that information to test alternate scenarios. There have been many times I've needed to run the same exact tests against multiple environments and this type of design lends itself well to that end.

## Asynchronous Design
I test a lot of asynchronous code and with Async/Await it doesn't hurt to simply always assume that every test might not return immediately. I mainly did not want the cognitive load of having two different ways to write tests for asynchronous vs. synchronous tests.

## This Works In The Browser?
Sure. Why not? Sometimes it's just easier test things in the browser without dealing with Node.JS (i.e. DOM access or browser APIs). I didn't see the need to force users to use Node.JS to use this framework. They are welcome to, but I didn't want to box anyone into a corner. Not including Node.JS specific dependencies allows Knock-On-Wood to be more flexible.