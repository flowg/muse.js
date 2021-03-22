/**
 * Nx imports
 */
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles, GeneratorCallback,
  getWorkspaceLayout,
  names, NxJsonProjectConfiguration,
  offsetFromRoot, ProjectConfiguration,
  Tree
} from '@nrwl/devkit';

/**
 * 3rd-party imports
 */
import * as path from 'path';

/**
 * Internal imports
 */
import { NativeScriptAppGeneratorSchema } from './schema';
import { generateFiles } from '../generate-files';
import { DEPENDENCIES, DEV_DEPENDENCIES } from './dependencies';

/**
 * TypeScript entities and constants
 */
interface NormalizedSchema extends NativeScriptAppGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: NativeScriptAppGeneratorSchema
): NormalizedSchema {
  const name: string = names( options.name ).fileName;
  const projectDirectory: string = options.directory
    ? `${names( options.directory ).fileName}/${name}`
    : name;
  const projectName: string = projectDirectory.replace( new RegExp( '/', 'g' ), '-' );
  const projectRoot = `${getWorkspaceLayout( host ).appsDir}/${projectDirectory}`;
  const parsedTags: string[] = options.tags
    ? options.tags.split( ',' ).map( ( s ) => s.trim() )
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags
  };
}

function generateProjectConfiguration( normalizedOptions: NormalizedSchema ): ProjectConfiguration & NxJsonProjectConfiguration {
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

function addFiles( host: Tree, templatesFolder: string, options: NormalizedSchema ): void {
  const templateOptions: Record<string, string | string[]> = {
    ...options,
    ...names( options.name ),
    offsetFromRoot: offsetFromRoot( options.projectRoot ),
    tmpl: '',
    dot: '.'
  };

  generateFiles(
    host,
    path.join( __dirname, 'templates', templatesFolder ),
    options.projectRoot,
    templateOptions
  );
}

export default async function(
  host: Tree,
  options: NativeScriptAppGeneratorSchema
): Promise<GeneratorCallback> {
  const normalizedOptions: NormalizedSchema = normalizeOptions( host, options );
  addProjectConfiguration( host, normalizedOptions.projectName, generateProjectConfiguration( normalizedOptions ) );

  /*
   * Adding dependencies to the workspace's package.json so that
   * the newly created NativeScript application can build properly
   */
  const installTask: GeneratorCallback = addDependenciesToPackageJson(
    host,
    DEPENDENCIES.get( options.type ),
    DEV_DEPENDENCIES.get( options.type )
  );

  // Generating files from templates according to the app's type
  addFiles( host, `templates-${options.type}`, normalizedOptions );

  // Generating App_Resources files from templates
  addFiles( host, 'templates-common', normalizedOptions );

  // Formatting files according to Prettier
  await formatFiles( host );

  return installTask;
}
