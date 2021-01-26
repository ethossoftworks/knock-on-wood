const isBrowser = typeof window !== "undefined"

export const Format = {
    green: isBrowser ? `color: green;` : `\x1b[32m`,
    red: isBrowser ? `color: red;` : `\x1b[31m`,
    bold: isBrowser ? `font-weight: 700;` : `\x1b[1m`,
    underline: isBrowser ? `text-decoration: underline;` : `\x1b[4m`,
    reset: isBrowser ? `` : `\x1b[0m`,
}

export const Logger = {
    log: (message: string, ...formatters: string[]) =>
        console.log(
            ...(isBrowser
                ? [`%c ${message}`, formatters.join("")]
                : [`${formatters.join("")}${message}${Format.reset}`])
        ),

    error: (message: string, ...formatters: string[]) =>
        console.error(
            ...(isBrowser
                ? [`%c ${message}`, formatters.join("")]
                : [`${formatters.join("")}${message}${Format.reset}`])
        ),
}
