import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE, validateHtml, validateUrls, findKey, submitUrls } from './indexnow.mjs';

const html = (url) => `<link rel="canonical" href="${url}"><meta name="robots" content="index, follow">`;
test('canonical, duplicate canonical and noindex validation', () => {
  validateHtml(html(SITE+'/'), SITE+'/');
  assert.throws(()=>validateHtml(html(SITE+'/'), SITE+'/about/'));
  assert.throws(()=>validateHtml(html(SITE+'/')+html(SITE+'/'), SITE+'/'));
  assert.throws(()=>validateHtml(html(SITE+'/').replace('index, follow','noindex'), SITE+'/'));
});
test('explicit lists only: reject cross-host, query, noindex, nonexistent and duplicate URLs', () => {
  for (const urls of [[], ['https://example.com/'], [SITE+'/?utm_source=chatgpt.com'], [SITE+'/privacy/'], [SITE+'/missing/'], [SITE+'/',SITE+'/']]) assert.throws(()=>validateUrls(urls));
  assert.deepEqual(validateUrls([SITE+'/']), [SITE+'/']);
});
test('invalid key fails without network', async () => {
  assert.throws(()=>findKey('public','invalid/key'));
  await assert.rejects(submitUrls([SITE+'/'], undefined, ()=>{throw new Error('must not request');}), /Provision/);
});
test('verify production ownership/pages before single POST; 202 means pending', async () => {
  const calls=[], key='test-key-1234';
  const result = await submitUrls([SITE+'/'],key,async(url,init)=>{
    calls.push({url,init});
    if(init.method==='POST') return new Response('',{status:202});
    return new Response(url.endsWith('.txt')?key:html(url),{status:200});
  });
  assert.equal(result.status,202);assert.equal(calls.length,3);
  assert.deepEqual(JSON.parse(calls[2].init.body).urlList,[SITE+'/']);
  assert.equal(calls[2].url,'https://api.indexnow.org/indexnow');
});
test('ownership mismatch and production redirects fail before submission', async () => {
  for(const res of [new Response('wrong',{status:200}),new Response('',{status:301})]) await assert.rejects(submitUrls([SITE+'/'],'test-key-1234',async()=>res));
});
test('X-Robots-Tag/noindex and endpoint failures are not silently accepted', async () => {
  for(const mode of ['header','html','endpoint']) {
    let posts=0;
    await assert.rejects(submitUrls([SITE+'/'],'test-key-1234',async(url,init)=>{
      if(init.method==='POST'){posts++;return new Response('',{status:429});}
      if(url.endsWith('.txt'))return new Response('test-key-1234');
      return new Response(mode==='html'?html(url).replace('index, follow','noindex'):html(url),{headers:mode==='header'?{'x-robots-tag':'noindex'}:{}});
    }));
    assert.equal(posts,mode==='endpoint'?1:0);
  }
});
