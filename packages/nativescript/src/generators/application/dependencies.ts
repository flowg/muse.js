/**
 * Internal imports
 */
import { NativeScriptAppType } from './schema';

/**
 * TypeScript entities and constants
 */
export const DEPENDENCIES: Map<NativeScriptAppType, Record<string, string>> = new Map<NativeScriptAppType, Record<string, string>>( [
  [NativeScriptAppType.ANGULAR, {
    '@angular/animations': '^11.0.0',
    '@angular/common': '^11.0.0',
    '@angular/compiler': '^11.0.0',
    '@angular/core': '^11.0.0',
    '@angular/forms': '^11.0.0',
    '@angular/platform-browser': '^11.0.0',
    '@angular/platform-browser-dynamic': '^11.0.0',
    '@angular/router': '^11.0.0',
    '@nativescript/angular': '~11.0.0',
    '@nativescript/core': '~7.1.0',
    '@nativescript/theme': '~3.0.0',
    'nativescript-theme-core': '~1.0.4',
    'zone.js': '^0.10.2'
  }]
] );

export const DEV_DEPENDENCIES: Map<NativeScriptAppType, Record<string, string>> = new Map<NativeScriptAppType, Record<string, string>>( [
  [NativeScriptAppType.ANGULAR, {
    '@angular/compiler-cli': '^11.0.0',
    '@ngtools/webpack': '~11.0.0',
    '@nativescript/webpack': '~4.0.0'
  }]
] );
