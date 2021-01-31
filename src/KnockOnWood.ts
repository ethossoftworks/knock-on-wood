import { Logger, Format } from "./Logger"

type Test = () => Promise<any> | any

class TestRunnerContext {
    totalGroups: number = 0
    totalTests: number = 0
    totalPassed: number = 0
    groupTests: number = 0
    groupPassed: number = 0
    currentGroupNumber: number = 0
    currentTestNumber: number = 0

    tests: Map<string, Test> = new Map()
    onlyTests: Map<string, Test> = new Map()

    beforeEach?: () => Promise<void> | void = undefined
    afterEach?: () => Promise<void> | void = undefined
    beforeAll?: () => Promise<void> | void = undefined
    afterAll?: () => Promise<void> | void = undefined

    clearTests() {
        this.tests.clear()
        this.onlyTests.clear()
        this.beforeEach = undefined
        this.afterEach = undefined
        this.beforeAll = undefined
        this.afterAll = undefined
    }
}

const context = new TestRunnerContext()

/**
 * Run groups of tests
 *
 * @param groups The groups of tests to run
 */
export async function runTests(groups: Record<string, () => void>) {
    const allStart = new Date().getTime()
    context.totalGroups = Object.keys(groups).length

    for (const [groupName, group] of Object.entries(groups)) {
        await runGroup(groupName, group)
    }

    Logger.log(
        `Finished all tests. ${context.totalPassed}/${context.totalTests} passed (${Math.round(
            new Date().getTime() - allStart
        )}ms)`,
        context.totalPassed === context.totalTests ? Format.green : Format.red,
        Format.bold
    )
}

async function runGroup(groupName: string, group: () => void) {
    context.clearTests()
    group()

    const groupStart = new Date().getTime()
    const tests = context.onlyTests.size > 0 ? context.onlyTests : context.tests
    context.currentGroupNumber += 1
    context.currentTestNumber = 0
    context.totalTests += tests.size
    context.groupTests = tests.size
    context.groupPassed = 0

    console.group(`${groupName} (${context.currentGroupNumber}/${context.totalGroups})`)

    await context.beforeAll?.()

    for (const [testName, testBlock] of tests.entries()) {
        await runTest(testName, testBlock)
    }

    await context.afterAll?.()

    Logger.log(
        `Finished group '${groupName}': ${context.groupPassed} of ${tests.size} tests passed (${Math.round(
            new Date().getTime() - groupStart
        )}ms)`,
        context.groupPassed === tests.size ? Format.green : Format.red
    )
    console.groupEnd()
}

async function runTest(testName: string, test: Test) {
    const testStart = new Date().getTime()
    context.currentTestNumber += 1

    try {
        await context.beforeEach?.()
        await test()
        await context.afterEach?.()
        context.totalPassed += 1
        context.groupPassed += 1

        Logger.log(
            `\u2713 ${testName} (${Math.round(new Date().getTime() - testStart)}ms) (${context.currentTestNumber}/${
                context.groupTests
            })`,
            Format.green
        )
    } catch (e) {
        const errorContent = ((e: Error): string => {
            // const prelude = `\n  \u2514\u2500 `
            const prelude = `\n    \u21B3 `
            if (e instanceof TestFailure) {
                return e.message !== "" ? `${prelude}${e.message}` : ""
            } else {
                return `${prelude}${e}`
            }
        })(e)

        Logger.error(
            `\u2717 ${testName} (${Math.round(new Date().getTime() - testStart)}ms) (${context.currentTestNumber}/${
                context.groupTests
            })${errorContent}`,
            Format.red
        )
    }
}

/**
 * Runs the given function before each test in a group
 */
export const beforeEach = (func: () => Promise<void> | void) => (context.beforeEach = func)

/**
 * Runs the given function after each test in a group
 */
export const afterEach = (func: () => Promise<void> | void) => (context.afterEach = func)

/**
 * Runs the given function before running any test in a group
 */
export const beforeAll = (func: () => Promise<void> | void) => (context.beforeAll = func)

/**
 * Runs the given function after running all tests in a group
 * @param func
 */
export const afterAll = (func: () => Promise<void> | void) => (context.afterAll = func)

/**
 * Enqueue a test to be run
 *
 * @param testName The user-friendly test name (this must be unique in the group)
 * @param test The test function to run
 */
export const test = async (testName: string, test: Test) => {
    if (context.tests.has(testName)) throw new DuplicateTestError(testName)
    context.tests.set(testName, test)
}

/**
 * Ignore all other tests and only run tests with the preceding _. This is useful when you are trying to debug a single
 * test
 *
 * @param testName The user-friendly test name (this must be unique in the group)
 * @param test The test function to run
 */
export const _test = async (testName: string, test: Test) => {
    if (context.onlyTests.has(testName)) throw new DuplicateTestError(testName)
    context.onlyTests.set(testName, test)
}

/**
 * Fails the current test
 *
 * @param message The reason the test failed
 */
export function fail(message?: string) {
    throw new TestFailure(message)
}

/**
 * Assert a value is equivalent to another value and fail the test if they don't match
 *
 * @param value The value to be tested
 * @param assert The value to be tested against
 * @param message The message to be displayed if the assertion fails
 */
export function expect(value: any, assert: any, message?: string) {
    if (value !== assert) throw new TestFailure(message)
}

/**
 * Assert a condition is true and fail the test if it is false
 *
 * @param condition The condition to verify
 * @param message The message to be displayed if the assertion fails
 */
export const assert = (condition: boolean, message?: string) => expect(condition, true, message)

export class DuplicateTestError extends Error {
    constructor(testName: string) {
        super(`Test "${testName}" already exists.`)
    }
}

class TestFailure extends Error {
    constructor(message?: string) {
        super(message)
    }
}
