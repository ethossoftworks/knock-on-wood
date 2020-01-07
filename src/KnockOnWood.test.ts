import { runTests, TestGroup, Tests } from "./KnockOnWood"

type Context = {
    foo: string
    bar: number
}

const testContext1: Context = {
    foo: "One",
    bar: 1
}

const testContext2: Context = {
    foo: "Two",
    bar: 2
}

const mainTests: Tests<Context> = {
    testAssertPass: async ({ assert }) => {
        assert(true)
    },
    testContext: async ({ context }) => {
        console.log(context.foo, context.bar)
    }
}

const extraTests: Tests<Context> = {
    testFail: async ({ fail }) => {
        fail()
    },
    testAssertFail: async ({ assert }) => {
        assert(false)
    },
    testNothing: async () => {}
}

const group1: TestGroup<Context> = {
    context: testContext1,
    beforeAll: async context => {},
    afterAll: async context => {},
    beforeEach: async context => {},
    afterEach: async context => {},
    tests: {
        ...mainTests
    }
}

const group2: TestGroup<Context> = {
    context: testContext2,
    tests: {
        ...mainTests,
        ...extraTests
    }
}

runTests(group1, group2)
// .then(() => {})
// .catch(() => {})
