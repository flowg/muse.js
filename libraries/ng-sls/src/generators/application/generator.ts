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
    joinPathFragments,
    TargetConfiguration,
    Tree,
    updateJson
} from '@nrwl/devkit';
import { applicationGenerator } from '@nrwl/angular/generators';

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
import { DEV_DEPENDENCIES } from './dependencies';

function generateNewTargets( normalizedOptions: NormalizedSchema<NgSlsAppGeneratorSchema> ): Record<string, TargetConfiguration> {
    return {
        deploy: {
            executor: '@nrwl/workspace:run-commands',
            dependsOn: [ 'build' ],
            options: {
                commands: [
                    'sls client deploy --no-confirm --verbose'
                ],
                cwd: normalizedOptions.projectRoot,
                parallel: false
            }
        },
        remove: {
            executor: '@nrwl/workspace:run-commands',
            options: {
                commands: [
                    'sls client remove --no-confirm'
                ],
                cwd: normalizedOptions.projectRoot,
                parallel: false
            }
        }
    };
}

export default async function ( host: Tree, options: NgSlsAppGeneratorSchema ): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NgSlsAppGeneratorSchema> = normalizeOptions(
        host,
        options
    );

    // Generating a basic Angular app
    await applicationGenerator(
        host,
        normalizedOptions
    );

    // Adding new targets to the generated Angular project
    addTargets2ProjectConfiguration<NgSlsAppGeneratorSchema>(
        host,
        normalizedOptions,
        generateNewTargets( normalizedOptions )
    );

    /*
     * Adding dependencies to the workspace's package.json so that
     * the newly created Angular + Serverless application can build properly
     */
    const installTask: GeneratorCallback = addDependenciesToPackageJson(
        host,
        {},
        DEV_DEPENDENCIES
    );

    /*
     * Improving default TypeScript configuration to be able
     * to work with a serverless.ts file
     */
    updateJson(
        host,
        joinPathFragments(
            normalizedOptions.projectRoot,
            'tsconfig.json'
        ),
        ( json ) => {
            return {
                ...json,
                compilerOptions: {
                    module: 'commonjs'
                }
            };
        }
    );

    // Generating files from templates
    addFiles(
        host,
        normalizedOptions,
        path.join(
            __dirname,
            'templates'
        )
    );

    // Formatting files according to Prettier
    await formatFiles( host );

    return installTask;
}
