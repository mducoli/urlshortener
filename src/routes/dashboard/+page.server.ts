import { KVFast } from '$lib/server/db';
import type { Link } from '$lib/types';
import { fail, type ActionFailure, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { z } from 'zod'
import { formatErrs } from '$lib/server/formatErrs';
import { makeid } from '$lib/server/makeid';
import { LinkFabric } from '$lib/server/linkFabric';
import { PremadeError } from '$lib/server/errors';

export const load = (async ({ locals, platform }) => {
    if (!locals.authenticated) throw PremadeError.UNAUTHORIZED
    if(!platform?.env?.DATA) throw PremadeError.ENVMISS

    const db = new KVFast<Link>(platform.env.DATA, "link")
    const data = await db.list()

    return {
        urls: data.values
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async ({ request, locals, platform }): Promise<ActionFailure<{
        error: string;
    }> | {
        action: 'create';
        created: Link;
    }> => {
        if (!locals.authenticated) throw PremadeError.UNAUTHORIZED
        if(!platform?.env?.DATA) throw PremadeError.ENVMISS
        
        const db = new KVFast<Link>(platform.env.DATA, "link")

        // VALIDATE INPUT
        const schema = z.object({
            url: z.string().startsWith('http', { message: "Invalid URL" }).url({ message: "Invalid URL" }),
            id: z.string().regex(/^[a-zA-Z0-9_-]{6,30}$/, {message: "Invalid ID"}).optional().or(z.literal(''))
        })

        const validator = schema.safeParse(Object.fromEntries(await request.formData()))
        if(!validator.success) return fail(400, { ok: false, error: formatErrs(validator.error.errors) })
        const form = validator.data

        // CHECK ID OR CREATE ONE
        let shortid = form.id
        if (shortid) {
            const check = await db.get(shortid)
            if (check) return fail(400, { ok: false, error: 'ID already used' });
        } else {
            for (; ;) {
                shortid = makeid(6);
                const check = await db.get(shortid)
                if (!check) break;
            }
        }

        // CREATE LINK
        const newlink = LinkFabric.parse({
            id: shortid,
            long_url: form.url
        })
        await db.put(shortid, newlink)

        return {
            action: 'create',
            created: newlink
        };

    },

    edittitle: async ({ request, locals, platform }): Promise<ActionFailure<{
        error: string;
    }> | {
        action: 'update';
        updated: Link;
    }> => {
        if (!locals.authenticated) throw PremadeError.UNAUTHORIZED
        if(!platform?.env?.DATA) throw PremadeError.ENVMISS
        
        const db = new KVFast<Link>(platform.env.DATA, "link")


        // VALIDATE INPUT
        const schema = z.object({
            title: z.string(),
            shortid: z.string().regex(/^[a-zA-Z0-9_-]{6,30}$/, {message: "Invalid ID"})
        })

        const validator = schema.safeParse(Object.fromEntries(await request.formData()))
        if(!validator.success) return fail(400, { ok: false, error: formatErrs(validator.error.errors) })
        const form = validator.data

        // CHECK IF EXIST
        const check = await db.get(form.shortid)
        if (!check)
            return fail(404, { error: 'Link not found' });

        // UPDATE
        const result = check
        result.title = form.title
        await db.put(form.shortid, result)

        return {
            action: 'update',
            updated: result
        }

    },

    hide: async ({ request, locals, platform }): Promise<ActionFailure<{
        error: string;
    }> | {
        action: 'update';
        updated: Link;
    }> => {
        if (!locals.authenticated) throw PremadeError.UNAUTHORIZED
        if(!platform?.env?.DATA) throw PremadeError.ENVMISS
        
        const db = new KVFast<Link>(platform.env.DATA, "link")

        // VALIDATE INPUT
        const schema = z.object({
            shortid: z.string().regex(/^[a-zA-Z0-9_-]{6,30}$/, {message: "Invalid ID"}),
            show: z.string().optional().transform(v => !!v)
        })

        const validator = schema.safeParse(Object.fromEntries(await request.formData()))
        if(!validator.success) return fail(400, { ok: false, error: formatErrs(validator.error.errors) })
        const form = validator.data

        // CHECK IF EXIST
        const check = await db.get(form.shortid)
        if (!check)
            return fail(404, { ok: false, error: 'Link not found' });

        // UPDATE
        const result = check
        result.hidden = !form.show
        await db.put(form.shortid, result)

        return {
            action: 'update',
            updated: result
        };
    }
};
