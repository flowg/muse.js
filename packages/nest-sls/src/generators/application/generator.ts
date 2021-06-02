/**
 * Nx imports
 */
import {
    formatFiles,
    Tree
} from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/nest';

/**
 * Internal imports
 */
import { NestSlsAppGeneratorSchema } from './schema';
import {
    addFiles,
    normalizeOptions
} from 'packages/common.utils';

export default async function (host: Tree, options: NestSlsAppGeneratorSchema) {
    const normalizedOptions = normalizeOptions(host, options);

    // Generating a basic Nest app
    await applicationGenerator(host, normalizedOptions);

    // Generating files from templates
    addFiles(host, normalizedOptions);

    // Formatting files according to Prettier
    await formatFiles(host);
}
