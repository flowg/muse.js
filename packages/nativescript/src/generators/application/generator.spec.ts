/**
 * Nx imports
 */
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { readProjectConfiguration, Tree } from '@nrwl/devkit';

/**
 * Internal imports
 */
import generator from './generator';
import { NativeScriptAppGeneratorSchema, NativeScriptAppType } from './schema';

describe( 'nativescript generator', () => {
  let appTree: Tree;
  const options: NativeScriptAppGeneratorSchema = {
    name: 'test',
    type: NativeScriptAppType.ANGULAR
  };

  beforeEach( () => {
    appTree = createTreeWithEmptyWorkspace();
  } );

  it( 'should run successfully', async () => {
    await generator( appTree, options );
    const config = readProjectConfiguration( appTree, 'test' );
    expect( config ).toBeDefined();
  } );
} );
