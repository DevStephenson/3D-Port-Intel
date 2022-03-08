import { Plugin } from 'vite';
import { FilterPattern } from '@rollup/pluginutils';
export interface Options {
    include?: FilterPattern;
    exclude?: FilterPattern;
    compress?: boolean | ((code: string) => string | Promise<string>);
}
export default function (userOptions?: Options): Plugin;
export declare function defaultCompress(code: string): string;
