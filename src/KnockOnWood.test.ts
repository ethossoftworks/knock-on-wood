import {
    test,
    assert,
    fail,
    expect,
    _test,
    DuplicateTestError,
    beforeEach,
    afterEach,
    beforeAll,
    afterAll,
    group,
} from "./KnockOnWood"

export function group1() {
    const test1: number = 1
    const test2: number = 2

    test("Test Pass", () => {})
    test("Assert Pass", () => assert(1 === 1))
    test("Assert Fail", () => assert(test1 === test2, "Test Assert message"))
    test("Expect Pass", () => expect(1, 1))
    test("Expect Fail", () => expect(1, 2, "Test expect message"))
    test("Fail", () => fail("Test Fail Message"))
    test("Fail No Message", () => fail())
    test("Duplicate Test Name Pass", async () => {
        try {
            await test("Duplicate Nested Test Name Pass", async () => {})
            await test("Duplicate Nested Test Name Pass", async () => {})
            fail("No DuplicateTestError thrown")
        } catch (e) {
            if (!(e instanceof DuplicateTestError)) fail("Wrong error thrown")
        }
    })
    test("Exception", () => {
        ;(window as any)["asdf"] + 1
    })
}

export function group2() {
    _test("Only Test", async () => {})
    test("This shouldn't run 2", async () => {})
    test("This shouldn't run 3", async () => {})
}

let beforeEachCount = 0
let afterEachCount = 0
let allCount = 0

export function callbacksGroup() {
    beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        beforeEachCount++
    })
    afterEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        afterEachCount++
    })
    beforeAll(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        allCount += 1
    })
    afterAll(async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        allCount -= 1
    })

    test("one", async () => {
        expect(beforeEachCount, 1, "Before Each count was wrong")
        expect(afterEachCount, 0, "After Each count was wrong")
        expect(allCount, 1, "All Count was wrong")
    })

    test("two", async () => {
        expect(beforeEachCount, 2, "Before Each count was wrong")
        expect(afterEachCount, 1, "After Each count was wrong")
        expect(allCount, 1, "All Count was wrong")
    })

    test("three", async () => {
        expect(beforeEachCount, 3, "Before Each count was wrong")
        expect(afterEachCount, 2, "After Each count was wrong")
        expect(allCount, 1, "All Count was wrong")
    })
}

export function postCallbackGroup() {
    test("Callbacks Reset", async () => {
        expect(beforeEachCount, 3, "Before Each count was wrong")
        expect(afterEachCount, 3, "After Each count was wrong")
        expect(allCount, 0, "All Count was wrong")
    })
}

export const alternateConstructorGroup1 = group("Alternate Constructor Test 1", () => {
    test("Pass", async () => {})
    test("Fail", async () => fail())
})

export const alternateConstructorGroup2 = group("Alternate Constructor Test 2", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    test("Pass", async () => {})
    test("Fail", async () => fail())
    test("Pass 2", async () => {})
})
