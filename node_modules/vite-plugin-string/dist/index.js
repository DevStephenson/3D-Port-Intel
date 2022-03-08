"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCompress = void 0;
const pluginutils_1 = require("@rollup/pluginutils");
function default_1(userOptions = {}) {
    const options = Object.assign({
        include: [
            '**/*.vs',
            '**/*.fs',
            '**/*.vert',
            '**/*.frag',
            '**/*.glsl',
            '**/*.wgsl',
        ],
        compress: true,
    }, userOptions);
    const filter = pluginutils_1.createFilter(options.include, options.exclude);
    const compress = options.compress === true ? defaultCompress : options.compress;
    return {
        name: 'vite-plugin-string',
        transform(source, id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!filter(id))
                    return;
                return pluginutils_1.dataToEsm(compress ? yield compress(source) : source);
            });
        },
    };
}
exports.default = default_1;
function defaultCompress(code) {
    let needNewline = false;
    return code
        .replace(/\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g, '')
        .split(/\n+/)
        .reduce((result, line) => {
        line = line.trim().replace(/\s{2,}|\t/, ' ');
        if (line.charAt(0) === '#') {
            if (needNewline) {
                result.push('\n');
            }
            result.push(line, '\n');
            needNewline = false;
        }
        else {
            result.push(line.replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g, '$1'));
            needNewline = true;
        }
        return result;
    }, [])
        .join('')
        .replace(/\n+/g, '\n');
}
exports.defaultCompress = defaultCompress;
