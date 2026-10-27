import { redirect } from "@sveltejs/kit";
import { DEFAULT_PROFILE } from "$app/env/private"

export const load = () => {
    redirect(308, `/${DEFAULT_PROFILE}`)
};