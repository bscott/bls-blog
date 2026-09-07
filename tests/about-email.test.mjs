import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const aboutPath = new URL('../src/pages/about.astro', import.meta.url);
const desiredAddress = 'brian@bscott.dev';
const addressCodePoints = [...desiredAddress].map((character) => character.charCodeAt(0));

test('About page reveals the contact address without publishing it in HTML source', async () => {
  const source = await readFile(aboutPath, 'utf8');

  assert.equal(source.includes(desiredAddress), false, 'plain email must not appear in source');
  assert.equal(source.includes('byte-mail'), false, 'old contact address must be removed');
  assert.match(source, /<button[^>]+id="email-link"[^>]+hidden/);
  assert.match(source, /trigger\.hidden = false/);
  assert.match(source, /Reveal email address/);
  assert.match(source, /addEventListener\(['"]click['"]/);
  assert.match(source, /String\.fromCharCode/);
  assert.equal(
    source.includes(JSON.stringify(addressCodePoints)),
    true,
    'source must contain the code-point sequence for brian@bscott.dev',
  );
  assert.equal(source.includes('mailto:brian'), false, 'plain mailto address must not appear in source');
});
