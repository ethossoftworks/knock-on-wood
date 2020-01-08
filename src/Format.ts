export enum Text {
    green = `\x1b[32m`,
    red = `\x1b[31m`,
    bold = `\x1b[1m`,
    underline = `\x1b[4m`,
    inverse = `\x1b[7m`
}

export function fmt(message: string, ...formatters: Text[]): string {
    return `${formatters.join("")}${message}\x1b[0m`
}
