import { cvFileExists, loadConfigFile, loadCvFile, mergeObjectsRecursive, yamlContentToMap } from '#lib/utils.ts';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const loggedInUser = event.locals.user;

    let loggedInUserName: string | null = null;
    let cv: object | undefined;
    let config: object | undefined;

    if (loggedInUser && loggedInUser) {
        loggedInUserName = loggedInUser.preferred_username;
    }

    const loggedIn = !!loggedInUserName;
    const profile = event.params.profile;
    const canEdit = profile === loggedInUserName;
    const cvExists = await cvFileExists(profile);


    if (cvExists) {
        const cvFile = await loadCvFile(profile);
        const cvFileContent = yamlContentToMap(cvFile);
        cv = cvFileContent['cv']
        config = yamlContentToMap(await loadConfigFile())
        mergeObjectsRecursive(config, cvFileContent['config']);
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
        config,
        cv
    };
};
