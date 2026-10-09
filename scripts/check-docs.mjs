#!/usr/bin/env node

/**
 * Deterministic documentation checks. Network availability belongs in the
 * scheduled Lychee workflow; this script must stay fast and offline.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', '.next', 'backend', 'nextapp', 'node_modules', 'out', 'public', 'src', 'coverage']);
const topLevelDocs = ['README.md', 'CONTRIBUTING.md', 'CLAUDE.md', 'AGENTS.md'];
const historicalDocs = new Set(['docs/MIGRATION-PROGRESS.md', 'docs/IMPROVEMENTS.md']);
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const errors = [];

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : markdownFiles(resolve(directory, entry.name));
    }
    return extname(entry.name) === '.md' ? [resolve(directory, entry.name)] : [];
  });
}

function anchors(markdown) {
  return new Set([...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => heading
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[\`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')));
}

function fail(file, message) {
  errors.push(`${relative(root, file)}: ${message}`);
}

const files = [...topLevelDocs.map((file) => resolve(root, file)), ...markdownFiles(resolve(root, 'docs'))]
  .filter(existsSync);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const [, rawLink] of content.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(rawLink)) continue;
    const [pathPart, fragment] = rawLink.split('#', 2);
    const target = pathPart ? resolve(dirname(file), pathPart) : file;
    if (!existsSync(target)) {
      fail(file, `local link target does not exist: ${rawLink}`);
      continue;
    }
    if (fragment && extname(target) === '.md') {
      const targetAnchors = anchors(readFileSync(target, 'utf8'));
      if (!targetAnchors.has(fragment.toLowerCase())) fail(file, `local link anchor does not exist: ${rawLink}`);
    }
  }

  for (const [, command] of content.matchAll(/npm run ([\w:-]+)/g)) {
    if (!packageJson.scripts[command]) fail(file, `documents unknown npm script: npm run ${command}`);
  }

  if (!historicalDocs.has(file)) {
    if (/npm run tina|Once \[?Phase 7.*TinaCMS/i.test(content)) fail(file, 'describes TinaCMS as a planned workflow; it is deferred indefinitely');
    if (/Tailwind utility classes are co-located|All component styles live in a single `globals\.css`/i.test(content)) {
      fail(file, 'describes the retired Tailwind/monolithic-globals.css styling workflow');
    }
  }

  for (const [, version] of content.matchAll(/Next(?:\.js)?\s+(?:v)?(\d+\.\d+\.\d+)/gi)) {
    if (version !== packageJson.dependencies.next.replace(/^\^/, '')) {
      fail(file, `documents Next.js ${version}; package.json declares ${packageJson.dependencies.next}`);
    }
  }
}

if (errors.length) {
  console.error(`Documentation check failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed (${files.length} Markdown files).`);
}
