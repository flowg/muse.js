import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree
} from '@nrwl/devkit';
import * as path from 'path';
import { NestSlsApplicationSchema } from './schema';
import { applicationGenerator } from '@nrwl/nest';

interface NormalizedSchema extends NestSlsApplicationSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: NestSlsApplicationSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(host).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (host: Tree, options: NestSlsApplicationSchema) {
  const normalizedOptions = normalizeOptions(host, options);

  // TODO: Use the app generator from the @nrwl/nest plugin and add necessary files
  // https://nx.dev/latest/angular/core-concepts/nx-devkit#composing-generators
  await applicationGenerator(host, normalizedOptions);

  addFiles(host, normalizedOptions);
  await formatFiles(host);
}
