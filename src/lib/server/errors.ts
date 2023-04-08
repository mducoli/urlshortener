import { error } from "@sveltejs/kit";

export const PremadeError = {
    ENVMISS: error(500, {
        message: "Internal Server Error",
        description: "Missing environment variables"
    }),
    NOTFOUND: error(404, {
        message: "Not Found",
        description: "The requested URL was not found on this server."
    }),
    UNAUTHORIZED: error(401, {
        message: "Unauthorized"
    })
}