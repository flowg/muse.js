/**
 * Node.js imports
 */
import * as path from 'path';

/**
 * Nx imports
 */
import {
    addDependenciesToPackageJson,
    addProjectConfiguration,
    formatFiles,
    GeneratorCallback,
    NxJsonProjectConfiguration,
    ProjectConfiguration,
    Tree
} from '@nrwl/devkit';

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
import { NativeScriptAppGeneratorSchema } from './schema';
import {
    DEPENDENCIES,
    DEV_DEPENDENCIES
} from './dependencies';

function generateProjectConfiguration(normalizedOptions: NormalizedSchema<NativeScriptAppGeneratorSchema>): ProjectConfiguration & NxJsonProjectConfiguration {
    return {
        root: normalizedOptions.projectRoot,
        projectType: 'application',
        sourceRoot: `${normalizedOptions.projectRoot}/src`,
        targets: {
            build: {
                executor: '@nrwl/workspace:run-commands',
                options: {
                    cwd: normalizedOptions.projectRoot,
                    parallel: false
                },
                configurations: {
                    ios: {
                        commands: [
                            'ns build ios --env.configuration={args.configuration} --env.projectName=' + normalizedOptions.projectName
                        ]
                    },
                    android: {
                        commands: [
                            'ns build android --env.configuration={args.configuration} --env.projectName=' + normalizedOptions.projectName
                        ]
                    }
                }
            },
            ios: {
                executor: '@nrwl/workspace:run-commands',
                options: {
                    commands: [
                        'ns debug ios --no-hmr --env.configuration={args.configuration} --env.projectName=' + normalizedOptions.projectName
                    ],
                    cwd: normalizedOptions.projectRoot,
                    parallel: false
                }
            },
            android: {
                executor: '@nrwl/workspace:run-commands',
                options: {
                    commands: [
                        'ns debug android --no-hmr --env.configuration={args.configuration} --env.projectName=' + normalizedOptions.projectName
                    ],
                    cwd: normalizedOptions.projectRoot,
                    parallel: false
                }
            }
        },
        tags: normalizedOptions.parsedTags
    };
}

export default async function (
    host: Tree,
    options: NativeScriptAppGeneratorSchema
): Promise<GeneratorCallback> {
    const normalizedOptions: NormalizedSchema<NativeScriptAppGeneratorSchema> = normalizeOptions(host, options);
    addProjectConfiguration(host, normalizedOptions.projectName, generateProjectConfiguration(normalizedOptions));

    /*
     * Adding dependencies to the workspace's package.json so that
     * the newly created NativeScript application can build properly
     */
    const installTask: GeneratorCallback = addDependenciesToPackageJson(
        host,
        DEPENDENCIES.get(options.type),
        DEV_DEPENDENCIES.get(options.type)
    );

    // Generating files from templates according to the app's type
    addFiles(host, normalizedOptions, path.join(__dirname, 'templates', `templates-${options.type}`));

    // Generating App_Resources files from templates
    addFiles(host, normalizedOptions, path.join(__dirname, 'templates', 'templates-common'));

    // Formatting files according to Prettier
    await formatFiles(host);

    return installTask;
}
