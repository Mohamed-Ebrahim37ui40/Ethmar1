const CACHE='firmo-map-v1';
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  const urls=[self.registration.scope,'./','./index.html','./Firmo-خريطة-الزراعة.html'];
  for(const u of urls){try{const r=await fetch(u,{cache:'reload'});if(r&&r.ok)await c.put(u,r.clone())}catch(x){}}
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  const ks=await caches.keys();
  await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const isNav=e.request.mode==='navigate'||(e.request.headers.get('accept')||'').includes('text/html');
    try{
      const res=await fetch(e.request);
      if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){
        const c=await caches.open(CACHE);
        c.put(e.request,res.clone()).catch(()=>{});
        if(isNav){c.put(self.registration.scope,res.clone()).catch(()=>{});c.put('./',res.clone()).catch(()=>{});}
      }
      return res;
    }catch(err){
      const c=await caches.open(CACHE);
      let hit=await c.match(e.request,{ignoreSearch:true});
      if(hit)return hit;
      if(isNav){
        hit=await c.match(self.registration.scope)||await c.match('./')||await c.match('./index.html')||await c.match('./Firmo-خريطة-الزراعة.html');
        if(hit)return hit;
      }
      throw err;
    }
  })());
});
