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
import { applicationGenerator } from '@nrwl/nest';

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
import { NestSlsAppGeneratorSchema } from './schema';
import {
    DEPENDENCIES,
    DEV_DEPENDENCIES
} from './dependencies';

function generateNewTargets( normalizedOptions: NormalizedSchema<NestSlsAppGeneratorSchema> ): Record<string, TargetConfiguration> {
    return {
        deploy: {
            executor: '@nrwl/workspace:run-commands',
            options: {
                commands: [
                    'cp -RL ../../node_modules .',
                    'sls deploy --verbose',
                    'rm -R node_modules'
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

export default async function ( host: Tree, options: NestSlsAppGeneratorSchema ): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NestSlsAppGeneratorSchema> = normalizeOptions(
        host,
        options
    );

    // Generating a basic Nest app
    await applicationGenerator(
        host,
        normalizedOptions
    );

    // Adding new targets to the generated Angular project
    addTargets2ProjectConfiguration<NestSlsAppGeneratorSchema>(
        host,
        normalizedOptions,
        generateNewTargets( normalizedOptions )
    );

    /*
     * Adding dependencies to the workspace's package.json so that
     * the newly created NestJS + Serverless application can build properly
     */
    const installTask: GeneratorCallback = addDependenciesToPackageJson(
        host,
        DEPENDENCIES,
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
