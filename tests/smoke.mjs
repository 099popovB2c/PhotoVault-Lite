import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../app.js', import.meta.url),'utf8');
test('local photo features are wired',()=>{assert.match(src,/showDirectoryPicker/);assert.match(src,/crypto\.subtle\.digest/);assert.match(src,/photovault-favorites/);assert.match(src,/reclaimable/)});
