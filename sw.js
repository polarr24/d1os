/* Version-matched offline shell only. Athlete stores and older caches are untouched. */
const VERSION='21.0.0',CACHE='d1os-shell-'+VERSION;
const FILES=['./index.html','./manifest.webmanifest','./manifest.json','./icon.svg','./icon-180.png','./icon-512.png'];
const base=new URL('./',self.location.href),absolute=f=>new URL(f,base).href;
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const responses=await Promise.all(FILES.map(async f=>{const r=await fetch(new Request(absolute(f),{cache:'reload'}));if(!r.ok)throw Error('Shell fetch failed: '+f);return r;}));
 const html=await responses[0].clone().text();if(!html.includes('<title>D1OS '+VERSION+'</title>'))throw Error('Release mismatch; previous worker retained');
 const c=await caches.open(CACHE);await Promise.all(FILES.map((f,i)=>c.put(absolute(f),responses[i])));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==base.origin)return;const appPage=e.request.mode==='navigate'&&[base.pathname,base.pathname+'index.html'].includes(u.pathname),target=appPage?absolute('./index.html'):e.request;if(appPage||FILES.some(f=>absolute(f)===u.href))e.respondWith(caches.open(CACHE).then(c=>c.match(target)).then(hit=>hit||fetch(e.request)));});
self.addEventListener('message',e=>{if(e.data?.type!=='D1OS_CACHE_STATUS'||!e.ports?.[0])return;e.waitUntil(caches.open(CACHE).then(async c=>{const hits=await Promise.all(FILES.map(f=>c.match(absolute(f)))),html=hits[0]?await hits[0].clone().text():'';e.ports[0].postMessage({version:VERSION,ready:hits.every(Boolean)&&html.includes('<title>D1OS '+VERSION+'</title>')});}));});
