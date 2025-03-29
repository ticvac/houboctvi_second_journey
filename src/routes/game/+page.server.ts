import type Page from "../+page.svelte";
import type { PageServerLoad } from "../demo/lucia/$types";
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    return {
        user: event.locals.user,
    };
};