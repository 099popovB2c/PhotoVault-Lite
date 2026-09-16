import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../app.js',import.meta.url),'utf8');const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('local photo features are wired',()=>{assert.match(src,/showDirectoryPicker/);assert.match(src,/crypto\.subtle\.digest/);assert.match(src,/parseExif/);assert.match(src,/DateTimeOriginal/);assert.match(src,/photovault-trash/);assert.match(src,/isMemory/);assert.match(html,/On this day/);assert.match(html,/Has GPS/)});
