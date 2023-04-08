import type { ZodIssue } from "zod"

export const formatErrs = (errs: ZodIssue[]) => {
    const set = new Set<string>()

    for (const err of errs) {
        set.add(err.message)
    }

    return [...set].join(', ')
}