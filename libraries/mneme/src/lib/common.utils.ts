/**
 * Nx imports
 */
import {
    getWorkspaceLayout,
    names,
    offsetFromRoot,
    ProjectConfiguration,
    readProjectConfiguration,
    TargetConfiguration,
    Tree,
    updateProjectConfiguration
} from '@nrwl/devkit';

/**
 * Internal imports
 */
import {
    MinimalSchema,
    NormalizedSchema,
    ProjectType
} from './schemas';
import { generateFiles } from './generate-files';

export function normalizeOptions<T extends MinimalSchema>(
    host: Tree,
    options: T
): NormalizedSchema<T> {
    const name: string = names(options.name).fileName;
    const projectDirectory: string = options.directory
        ? `${names(options.directory).fileName}/${name}`
        : name;
    const projectName: string = projectDirectory.replace(new RegExp('/', 'g'), '-');
    const projectTypeDir: 'appsDir' | 'libsDir' = (options.projectType === ProjectType.APPLICATION) ? 'appsDir' : 'libsDir';
    const projectRoot = `${getWorkspaceLayout(host)[projectTypeDir]}/${projectDirectory}`;
    const parsedTags: string[] = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];

    return {
        ...options,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags
    };
}

export function addTargets2ProjectConfiguration<T extends MinimalSchema>(
    host: Tree,
    normalizedOptions: NormalizedSchema<T>,
    newTargets: Record<string, TargetConfiguration>
): void {
    const project: ProjectConfiguration = readProjectConfiguration(
        host, normalizedOptions.projectName);
    project.targets = {
        ...project.targets,
        ...newTargets
    };
    updateProjectConfiguration(host, normalizedOptions.projectName, project);
}

export function addFiles<T extends MinimalSchema>(
    host: Tree,
    options: NormalizedSchema<T>,
    templatesFolder: string
): void {
    const templateOptions: NormalizedSchema<T> = {
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot),
        tmpl: '',
        dot: '.'
    };

    generateFiles(
        host,
        templatesFolder,
        options.projectRoot,
        templateOptions
    );
}
