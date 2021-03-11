/**
 * Nx imports
 */
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles, GeneratorCallback,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
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
  addProjectConfiguration( host, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nannx/nativescript:build'
      }
    },
    tags: normalizedOptions.parsedTags
  } );

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
