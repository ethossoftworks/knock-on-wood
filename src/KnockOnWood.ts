import { fmt, Text as Format } from "./Format"

export type TestGroup<Context> = {
    context: Context
    tests: Tests<Context>
    label?: string
    beforeEach?: (context: Context) => Promise<void>
    afterEach?: (context: Context) => Promise<void>
    beforeAll?: (context: Context) => Promise<void>
    afterAll?: (context: Context) => Promise<void>
}

export type Test<Context> = (t: TestContainer<Context>) => Promise<void>
export type Tests<Context> = { [testName: string]: Test<Context> }

type TestContainer<Context> = {
    context: Context
    fail(reason?: string): void
    assert(condition: boolean, failureMessage?: string): void
}

type TestResult = {
    failed: boolean
    reason?: string
}

class Counts {
    totalGroups = 0
    totalTests = 0
    totalPassed = 0
    groupTests = 0
    groupPassed = 0
    currentGroupNumber = 0
    currentTestNumber = 0
}

export async function runTests(...testGroups: TestGroup<unknown>[]) {
    const counts = new Counts()
    counts.totalGroups = testGroups.length

    for (let i = 0; i < testGroups.length; i++) {
        counts.currentGroupNumber = i + 1
        await runGroup(counts, testGroups[i])
    }

    console.log(
        fmt(
            `\nFinished all test groups: ${counts.totalPassed} of ${counts.totalTests} tests passed`,
            counts.totalPassed === counts.totalTests ? Format.green : Format.red,
            Format.bold,
            Format.inverse
        )
    )

    if (counts.totalPassed !== counts.totalTests) {
        throw -1
    }
}

async function runGroup(counts: Counts, group: TestGroup<unknown>) {
    const testNames: string[] = (() => {
        const singleTests: string[] = Object.getOwnPropertyNames(group.tests).filter(testName => {
            return testName.indexOf("_") === 0
        })
        return singleTests.length > 0 ? singleTests : Object.getOwnPropertyNames(group.tests)
    })()
    const context = group.context
    counts.totalTests += testNames.length
    counts.groupTests = testNames.length
    counts.groupPassed = 0

    console.group(
        `Running Group (${counts.currentGroupNumber} of ${counts.totalGroups})${group.label ? ": " + group.label : ""}`
    )

    await group.beforeAll?.(context)

    for (let i = 0; i < testNames.length; i++) {
        counts.currentTestNumber = i + 1

        await group.beforeEach?.(context)
        await runTest(counts, testNames[i], group.tests[testNames[i]], context)
        await group.afterEach?.(context)
    }

    await group.afterAll?.(context)

    console.groupEnd()
    console.log(
        fmt(
            `Finished group: ${counts.groupPassed} of ${testNames.length} tests passed`,
            counts.groupPassed === testNames.length ? Format.green : Format.red
        )
    )
}

async function runTest(counts: Counts, testName: string, test: Test<unknown>, context: unknown) {
    const testResult: TestResult = { failed: false }
    const testContainer = createTestContainer(context, testResult)

    try {
        console.groupCollapsed(`Running Test (${counts.currentTestNumber} of ${counts.groupTests}): ${testName}`)
        await test(testContainer)

        if (!testResult.failed) {
            counts.groupPassed++
            counts.totalPassed++
            console.groupEnd()
            console.log(fmt(`\u2713 Passed:  ${testName}`, Format.green))
        } else {
            handleFailedTest(testName, testResult.reason)
        }
    } catch (e) {
        handleFailedTest(testName, e)
    }
}

function createTestContainer(context: unknown, result: TestResult): TestContainer<unknown> {
    return {
        context: context,
        fail: (reason?: string) => {
            result.failed = true
            result.reason = reason
        },
        assert: (condition, failureMessage) => {
            if (!condition) {
                result.failed = true
                result.reason = failureMessage
            }
        }
    }
}

function handleFailedTest(testName: string, reason?: string | Error) {
    console.groupEnd()
    console.groupCollapsed(fmt(`\u2717 Failed:  ${testName}`, Format.red))
    if (reason) {
        console.log(reason)
    }
    console.groupEnd()
}
