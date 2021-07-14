/**
 * TypeScript entities and constants
 */
export enum ProjectType {
    APPLICATION = 'application',
    LIBRARY = 'library'
}

export interface MinimalSchema {
    projectType: ProjectType;
    name: string;
    directory?: string;
    tags?: string;
}

interface ProjectSchema {
    projectName: string;
    projectRoot: string;
    projectDirectory: string;
    parsedTags: string[];
}

export type NormalizedSchema<T> = T & ProjectSchema;
