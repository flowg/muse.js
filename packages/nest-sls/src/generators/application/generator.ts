/**
 * Node.js imports
 */
import * as path from 'path';

/**
 * Nx imports
 */
import {
    addDependenciesToPackageJson,
    formatFiles,
    GeneratorCallback,
    Tree
} from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/nest';

/**
 * 3rd-party imports
 */
import {
    addFiles,
    NormalizedSchema,
    normalizeOptions
} from '@muse.js/mneme';

/**
 * Internal imports
 */
import { NestSlsAppGeneratorSchema } from './schema';
import {
    DEPENDENCIES,
    DEV_DEPENDENCIES
} from './dependencies';

export default async function (host: Tree, options: NestSlsAppGeneratorSchema): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NestSlsAppGeneratorSchema> = normalizeOptions(host, options);

    // Generating a basic Nest app
    await applicationGenerator(host, normalizedOptions);

    /*
     * Adding dependencies to the workspace's package.json so that
     * the newly created Nest.js + Serverless application can build properly
     */
    const installTask: GeneratorCallback = addDependenciesToPackageJson(
        host,
        DEPENDENCIES,
        DEV_DEPENDENCIES
    );

    // TODO: See which key in tsconfig.base.json is necessary for the app to work + make sure it is generated as such
    /*
     * TODO: Add an executor that will copy node_modules for the workspace into the API app folder
     *  ( beware of @muse.js/nest-sls symbolic link )
     *  + execute sls deploy inside that folder
     *  + remove node_modules inside that folder
     */

    // Generating files from templates
    addFiles(host, normalizedOptions, path.join(__dirname, 'templates'));

    // Formatting files according to Prettier
    await formatFiles(host);

    return installTask;
}
