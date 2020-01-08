import { runTests, TestGroup, Tests } from "./KnockOnWood"

type Context = {
    foo: string
    bar: number
}

type Context2 = {
    foobar: string
}

const testContext1: Context = {
    foo: "One",
    bar: 1
}

const testContext2: Context = {
    foo: "Two",
    bar: 2
}

const testContext3: Context2 = {
    foobar: "foobar"
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

const group3: TestGroup<Context2> = {
    context: testContext3,
    tests: {
        testDifferentContextPerGroup: async ({ context, assert }) => {
            assert(context.foobar === "foobar")
        }
    }
}

runTests(group1, group2, group3)
    .then(() => {})
    .catch(() => {})
