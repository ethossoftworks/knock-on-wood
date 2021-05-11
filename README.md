# Knock On Wood

A simple testing framework for TypeScript

-   [Features](#features)
-   [Build](#build)
-   [Usage](#usage)
-   [Motivation](#motivation)
-   [Release Notes](#release-notes)

# Features

-   Use in Node.JS or in the browser
-   Asynchronous design
-   Asynchronous capable setup and teardown functions before and after each test group and/or test

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
import { runTests, test, assert } from "@ethossoftworks/knock-on-wood"

const mainGroup = group("Main", () => {
    test("myFirstTest", () => {
        assert(1 === 1)
    })
})

runTests([mainGroup])
    .then(() => {})
    .catch(() => {})
```

Or

```typescript
import { runTests, test, assert } from "@ethossoftworks/knock-on-wood"

const mainGroup = () => {
    test("myFirstTest", () => {
        assert(1 === 1)
    })
})

runTests({"Main Group": mainGroup})
    .then(() => {})
    .catch(() => {})
```

## Write a Basic Test With a Context

```typescript
import { runTests, test, assert } from "@ethossoftworks/knock-on-wood"

type Context = {
    username: string
    password: string
}

const context: Context = {
    username: "foo",
    password: "bar",
}

const mainGroup = (context: Context) => {
    test("myFirstTest", async () => {
        assert(context.username === "foo")
    })
}

runTests({ Main: mainGroup(context) })
    .then(() => {})
    .catch(() => {})
```

## Use Multiple Contexts With Same Tests

```typescript
import { runTests, test, assert } from "@ethossoftworks/knock-on-wood"

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

const mainTests = (context: Context) => {
    test("login", async => () => {
        await login(context.username, context.password)
        assert(true)
    })
    test("getData", async => () => {
        await getData()
        assert(true)
    })
}

const adminTests = (context: Context) => {
    test("deleteUser", async () => {
        assert(true)
    })
}

runTests({
    "End User Tests": mainTests(endUserContext),
    "Admin Tests": () => {
        mainTests(adminUserContext)
        adminTests(adminUserContext)
    })
    .then(() => {})
    .catch(() => {})
```

## Setup/Teardown

```typescript
import { runTests, beforeAll, beforeEach, afterAll, afterEach, assert, test } from "@ethossoftworks/knock-on-wood"

const mainGroup = () => {
    beforeAll(async () => {
        console.log("Before all tests in group")
    })
    beforeEach(async () => {
        console.log("Before each test in group")
    })
    afterEach(async () => {
        console.log("After each test in group")
    }),
        afterAll(async () => {
            console.log("After all tests in group")
        })

    test("myFirstTest", async () => {
        assert(context.username === "foo")
    })
}

runTests(mainGroup)
    .then(() => {})
    .catch(() => {})
```

# Motivation

Knock-On-Wood had a few motivating factors:

1. The desire to run the same tests across different type-safe test contexts (i.e. testing different account credentials).
2. Not wanting to learn a huge testing framework; just the need for something with a simple API and reasonable flexibility.

## Asynchronous Design

I test a lot of asynchronous code and with Async/Await it doesn't hurt to simply always assume that every test might not return immediately. I mainly did not want the cognitive load of having two different ways to write tests for asynchronous vs. synchronous tests.

## This Works In The Browser?

Sure. Why not? Sometimes it's just easier test things in the browser without dealing with Node.JS (i.e. DOM access or browser APIs). I didn't see the need to force users to use Node.JS to use this framework. They are welcome to, but I didn't want to box anyone into a corner. Not including Node.JS specific dependencies allows Knock-On-Wood to be more flexible.

# Release Notes

## 2.0.1

-   Converted build system to rollup

## 2.0.0

-   New API design
