import { fmt, Text as Format } from "./Format"

export type TestGroup<Context> = {
    context: Context
    tests: Tests<Context>
    label?: string
    beforeEach?: (context: Context) => void
    afterEach?: (context: Context) => void
    beforeAll?: (context: Context) => void
    afterAll?: (context: Context) => void
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
            `\nFinished all test groups: ${counts.totalPassed} of ${counts.totalTests} passed`,
            counts.totalPassed === counts.totalTests ? Format.green : Format.red,
            Format.bold,
            Format.inverse
        )
    )

    if (counts.totalPassed !== counts.totalTests) {
        throw -1
    }
}

export async function runTestsForResult(...testGroups: TestGroup<unknown>[]) {
    runTests(...testGroups)
}

async function runGroup(counts: Counts, group: TestGroup<unknown>) {
    const singleTests: string[] = Object.getOwnPropertyNames(group.tests).filter(testName => {
        return testName.indexOf("_") === 0
    })
    const testNames: string[] = singleTests.length > 0 ? singleTests : Object.getOwnPropertyNames(group.tests)
    const context = group.context
    counts.totalTests += testNames.length
    counts.groupTests = testNames.length

    console.group(
        `Running Group (${counts.currentGroupNumber} of ${counts.totalGroups})${group.label ? ": " + group.label : ""}`
    )
    group.beforeAll?.(context)

    for (let i = 0; i < testNames.length; i++) {
        group.beforeEach?.(context)
        counts.currentTestNumber = i + 1
        await runTest(counts, testNames[i], group.tests[testNames[i]], context)
        group.afterEach?.(context)
    }

    group.afterAll?.(context)
    console.groupEnd()
    console.log(
        fmt(
            `Finished tests: ${counts.groupPassed} of ${testNames.length} passed`,
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
