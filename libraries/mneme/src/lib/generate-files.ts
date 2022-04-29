/**
 * Nx imports
 */
import {
    joinPathFragments,
    Tree
} from '@nrwl/devkit';

/**
 * Node.js imports
 */
import * as fs from 'fs';
import { Stats } from 'fs';

/**
 * 3rd-party imports
 */
import * as ejs from 'ejs';
import * as glob from 'glob';

/**
 * Generates a folder of files based on provided templates.
 *
 * While doing so it performs two substitutions:
 * - Substitutes segments of file names surrounded by __
 * - Uses ejs to substitute values in templates
 *
 * It is based on the original generateFiles() code within
 * @nrwl/devkit but adds the possibility to excuse some files
 * from being processed by ejs. These files' contents will be copied as is.
 *
 * @param host: Tree - the virtual file system tree
 * @param srcFolder: string - the source folder of files ( absolute path )
 * @param target: string - the target folder ( relative to the host root )
 * @param substitutions: { [ k: string ]: string | string[] } - an object of key-value pairs.
 * The keys are the placeholders in the templates and the values are their replacements
 * @param ejsIgnore: string - a glob pattern ( https://www.npmjs.com/package/glob ) of files
 * that shouldn't be processed by ejs
 *
 * Examples:
 *
 * ```typescript
 * generateFiles(host, path.join(__dirname , 'files'), './tools/scripts', {tmpl: '', name: 'myscript'})
 * ```
 *
 * This command will take all the files from the `files` directory next to the place where the command is invoked from.
 * It will replace all `__tmpl__` with '' and all `__name__` with 'myscript' in the file names, and will replace all
 * `<%= name %>` with `myscript` in the files themselves.
 *
 * `tmpl: ''` is a common pattern. With it you can name files like this: `index.ts__tmpl__`, so your editor
 * doesn't get confused about incorrect TypeScript files.
 */
export function generateFiles(
    host: Tree,
    srcFolder: string,
    target: string,
    substitutions: { [k: string]: string | string[] },
    ejsIgnore = '**/*.png'
): void {
    // Searching for files that shouldn't be rendered through ejs
    const filesToCopyAsIs: string[] = glob.sync(
        ejsIgnore,
        {
            cwd: srcFolder,
            absolute: true
        }
    );

    allFilesInDir(srcFolder).forEach((f: string) => {
        // Replacing placeholders in filenames
        const relativeToTarget: string = replaceSegmentsInPath(
            f.substring(srcFolder.length),
            substitutions
        );

        // Dealing with the actual content of the files
        let newContent: string | Buffer;
        if (!filesToCopyAsIs.includes(f)) {
            // Replacing placeholders in file content through ejs
            newContent = ejs.render(fs.readFileSync(f).toString(), substitutions);
        } else {
            // Copying file content as is
            newContent = fs.readFileSync(f);
        }

        // Writing the file with all replacements made
        host.write(joinPathFragments(target, relativeToTarget), newContent);
    });
}

function replaceSegmentsInPath(
    filePath: string,
    substitutions: { [k: string]: string | string[] }
): string {
    Object.entries(substitutions).forEach(([t, r]: [string, string | string[]]) => {
        if (typeof r === 'string') {
            filePath = filePath.replace(`__${t}__`, r);
        }
    });

    return filePath;
}

function allFilesInDir(parent: string): string[] {
    let res: string[] = [];
    try {
        fs.readdirSync(parent).forEach((c: string) => {
            const child: string = joinPathFragments(parent, c);
            try {
                const s: Stats = fs.statSync(child);
                if (!s.isDirectory()) {
                    res.push(child);
                } else if (s.isDirectory()) {
                    res = [
                        ...res,
                        ...allFilesInDir(child)
                    ];
                }
            } catch (e) {
                console.error(e);
            }
        });
    } catch (e) {
        console.error(e);
    }

    return res;
}
