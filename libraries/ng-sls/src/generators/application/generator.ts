/**
 * Node.js imports
 */
import * as path from 'path';

/**
 * Nx imports
 */
import {
    formatFiles,
    GeneratorCallback,
    installPackagesTask,
    TargetConfiguration,
    Tree
} from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/angular/src/generators/application/application';

/**
 * 3rd-party imports
 */
import {
    addFiles,
    addTargets2ProjectConfiguration,
    NormalizedSchema,
    normalizeOptions
} from '@muse.js/mneme';

/**
 * Internal imports
 */
import { NgSlsAppGeneratorSchema } from './schema';

function generateNewTargets(normalizedOptions: NormalizedSchema<NgSlsAppGeneratorSchema>): Record<string, TargetConfiguration> {
    return {
        deploy: {
            executor: '@nrwl/workspace:run-commands',
            options: {
                commands: [
                    'sls deploy'
                ],
                cwd: normalizedOptions.projectRoot,
                parallel: false
            }
        },
        remove: {
            executor: '@nrwl/workspace:run-commands',
            options: {
                commands: [
                    'sls remove'
                ],
                cwd: normalizedOptions.projectRoot,
                parallel: false
            }
        }
    };
}

export default async function (host: Tree, options: NgSlsAppGeneratorSchema): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NgSlsAppGeneratorSchema> = normalizeOptions(host, options);

    // Generating a basic Angular app
    await applicationGenerator(host, normalizedOptions);

    // Adding new targets to the generated Angular project
    addTargets2ProjectConfiguration<NgSlsAppGeneratorSchema>(
        host, normalizedOptions, generateNewTargets(normalizedOptions)
    );

    // Generating files from templates
    addFiles(host, normalizedOptions, path.join(__dirname, 'templates'));

    // Formatting files according to Prettier
    await formatFiles(host);

    return () => {
        /*
         * We need to do this in a callback to install Node modules
         * only when all changes to the host are done and the future file system
         * is stable
         */
        installPackagesTask(host);
    };
}
