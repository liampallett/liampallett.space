import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Bundle the server TypeScript without starting Astro or contacting real services.
const dir = await mkdtemp(join(tmpdir(), 'site-github-tests-'));
const originalFetch = globalThis.fetch;
const now = new Date().toISOString();
const commit = { sha: 'same', html_url: 'https://github.com/liampallett/site/commit/same',
    commit: { message: 'Recent site commit\nDetails', author: { date: now } } };
let scenario = '';
let calls = [];
globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    calls.push(url);
    let data = [];
    const headers = {};
    if (url.pathname.endsWith('/events/public')) {
        if (scenario === 'events-fail' || scenario === 'all-fail') return new Response('{}', { status: 403 });
        data = [
            { type: 'PullRequestEvent', repo: { name: 'liampallett/site' }, created_at: now,
                payload: { action: 'opened', number: 1, pull_request: { number: 1 } } },
            { type: 'PullRequestEvent', repo: { name: 'liampallett/site' }, created_at: now,
                payload: { action: 'closed', number: 2, pull_request: { title: 'Fix widget', html_url: 'https://github.com/liampallett/site/pull/2' } } },
        ];
    } else if (url.pathname.endsWith('/repos')) {
        data = url.searchParams.get('page') === '1'
            ? [{ full_name: 'liampallett/site', size: 0, private: false }, { full_name: 'liampallett/empty', size: 0, private: false }, { full_name: 'liampallett/private', private: true }]
            : [{ full_name: 'liampallett/fork', size: 1, private: false }];
        if (url.searchParams.get('page') === '1') headers.link = '<https://api.github.com/next>; rel="next"';
    } else if (url.pathname.endsWith('/commits')) {
        if (scenario === 'commits-fail' || scenario === 'all-fail') return new Response('{}', { status: 403 });
        if (url.pathname.includes('/empty/')) return new Response('{}', { status: 409 });
        assert.equal(url.searchParams.get('author'), 'liampallett');
        if (url.pathname.includes('/site/') && url.searchParams.get('page') === '1') {
            headers.link = '<https://api.github.com/next>; rel="next"';
            data = [commit];
        } else data = [commit, { ...commit, sha: 'invalid', commit: { ...commit.commit, author: { date: 'invalid' } } }];
    }
    return new Response(JSON.stringify(data), { headers });
};

async function fresh(name) {
    scenario = name; calls = [];
    const result = await build({ stdin: {
        contents: 'export {fetchGitHub} from "./src/lib/github.ts"; export {fetchCommitGraph} from "./src/lib/commits.ts";',
        resolveDir: process.cwd(), loader: 'ts',
    }, bundle: true, platform: 'node', format: 'esm', write: false });
    const path = join(dir, `${name}.mjs`);
    await writeFile(path, result.outputFiles[0].text);
    return import(pathToFileURL(path).href);
}

try {
    await test('zero-size imported repositories, pagination, empty repos and SHA deduplication', async () => {
        const api = await fresh('normal');
        const [graph, items] = await Promise.all([api.fetchCommitGraph(), api.fetchGitHub()]);
        assert.equal(graph.total, 1);
        assert.equal(Object.values(graph.counts)[0], 1);
        assert(calls.some(u => u.pathname.includes('/site/commits')));
        assert(!calls.some(u => u.pathname.includes('/private/')));
        assert.equal(calls.filter(u => u.pathname.endsWith('/repos')).length, 2);
        assert.equal(items.find(i => i.action === 'commit').text, 'Recent site commit');
        assert(items.some(i => i.text === 'opened PR: liampallett/site #1' && i.url.endsWith('/pull/1')));
        assert(items.some(i => i.text === 'closed PR: Fix widget'));
        assert(items.every(i => i.url && !i.text.includes('undefined')));
        const count = calls.length;
        await api.fetchCommitGraph(); await api.fetchGitHub();
        assert.equal(calls.length, count);
    });
    await test('commit activity survives an events outage', async () => {
        const api = await fresh('events-fail');
        assert.deepEqual((await api.fetchGitHub()).map(i => i.action), ['commit']);
    });
    await test('PR activity survives a commits outage; graph refuses a partial total', async () => {
        const api = await fresh('commits-fail');
        assert((await api.fetchGitHub()).every(i => i.action === 'pr'));
        await assert.rejects(api.fetchCommitGraph, /HTTP 403/);
    });
    await test('complete outage rejects instead of reporting an empty feed', async () => {
        const api = await fresh('all-fail');
        await assert.rejects(api.fetchGitHub, /unavailable/);
    });
} finally {
    globalThis.fetch = originalFetch;
    await rm(dir, { recursive: true, force: true });
}
