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

export const beforeEach = (func: () => Promise<void> | void) => (context.beforeEach = func)
export const afterEach = (func: () => Promise<void> | void) => (context.afterEach = func)
export const beforeAll = (func: () => Promise<void> | void) => (context.beforeAll = func)
export const afterAll = (func: () => Promise<void> | void) => (context.afterAll = func)

export const test = async (testName: string, test: Test) => {
    if (context.tests.has(testName)) throw new DuplicateTestError(testName)
    context.tests.set(testName, test)
}

export const _test = async (testName: string, test: Test) => {
    if (context.onlyTests.has(testName)) throw new DuplicateTestError(testName)
    context.onlyTests.set(testName, test)
}

export function fail(message?: string) {
    throw new TestFailure(message)
}

export function expect(value: any, assert: any, message?: string) {
    if (value !== assert) throw new TestFailure(message)
}

export const assert = (condition: boolean, message?: string) => expect(condition, true, message)

export class DuplicateTestError extends Error {
    constructor(testName: string) {
        super(`Test "${testName}" already exists.`)
    }
}

export class TestFailure extends Error {
    constructor(message?: string) {
        super(message)
    }
}
