import { cvFileExists, getRenderedCvAndConfig } from '#lib/utils/utils.ts';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Cv } from '#lib/types/cv-schema.ts';

export const load: LayoutServerLoad = async (event) => {
    const loggedInUser = event.locals.user;

    let loggedInUserName: string | null = null;
    let cv: Cv;

    if (loggedInUser && loggedInUser) {
        loggedInUserName = loggedInUser.preferred_username;
    }

    const loggedIn = !!loggedInUserName;
    const profile = event.params.profile;
    const canEdit = profile === loggedInUserName;
    const cvExists = await cvFileExists(profile);

    if (cvExists) {
        cv = await getRenderedCvAndConfig(profile);
    } else {
        if (canEdit) {
            redirect(303, `/${profile}/edit`);
        }
        error(404, 'Not found');
    }

    return {
        loggedInUserName,
        loggedIn,
        profile,
        canEdit,
        cvExists,
        cv
    };
};
