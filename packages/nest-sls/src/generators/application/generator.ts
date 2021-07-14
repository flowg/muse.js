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
    NxJsonProjectConfiguration,
    ProjectConfiguration,
    Tree,
    updateJson,
    updateProjectConfiguration
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

function generateProjectConfiguration(normalizedOptions: NormalizedSchema<NestSlsAppGeneratorSchema>): ProjectConfiguration & NxJsonProjectConfiguration {
    return {
        root: normalizedOptions.projectRoot,
        projectType: 'application',
        sourceRoot: `${normalizedOptions.projectRoot}/src`,
        targets: {
            deploy: {
                executor: '@nrwl/workspace:run-commands',
                options: {
                    commands: [
                        'cp -RL ../../node_modules .',
                        'sls deploy',
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
        },
        tags: normalizedOptions.parsedTags
    };
}

export default async function (host: Tree, options: NestSlsAppGeneratorSchema): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NestSlsAppGeneratorSchema> = normalizeOptions(host, options);

    // Generating a basic Nest app
    await applicationGenerator(host, normalizedOptions);

    // Adding stuff like targets and executors...
    updateProjectConfiguration(host, normalizedOptions.projectName, generateProjectConfiguration(normalizedOptions));

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
     * Improving default TypeScript configuration to prevent
     * any warning during the compilation of lambda.ts
     */
    updateJson(
        host,
        joinPathFragments(normalizedOptions.projectRoot, 'tsconfig.json'),
        (json) => {
            return {
                ...json,
                compilerOptions: {
                    esModuleInterop: true
                }
            };
        }
    );

    // Generating files from templates
    addFiles(host, normalizedOptions, path.join(__dirname, 'templates'));

    // Formatting files according to Prettier
    await formatFiles(host);

    return installTask;
}
