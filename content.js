// Guard to avoid double-injection
if (!window.__ACTIVITY_TRACKER_LOADED__) {
  window.__ACTIVITY_TRACKER_LOADED__ = true;

  function sendMessageToBackground(message) {
    try { chrome.runtime.sendMessage(message).catch(() => {}); } catch (e) {}
  }
  function throttle(fn, wait) {
    let last = 0; return function(...args){ const now = Date.now(); if(now-last>=wait){ last=now; fn.apply(this,args);} };
  }
  console.log('[Tracker] Injected content script on', location.href);
  sendMessageToBackground({ action:'page_view', data:{ url:location.href, title:document.title, timestamp:Date.now() } });
  let lastTitle = document.title;
  const titleObserver = new MutationObserver(()=>{
    if(document.title!==lastTitle){ lastTitle=document.title; sendMessageToBackground({ action:'title_change', data:{ url:location.href, title:lastTitle, timestamp:Date.now() }}); }
  });
  try { titleObserver.observe(document.querySelector('title')||document.documentElement,{subtree:true,childList:true,characterData:true}); } catch(e) {}
  document.addEventListener('click', (e)=>{
    const el=e.target; sendMessageToBackground({ action:'click', data:{ url:location.href, tag:el.tagName, id:el.id||null, classes:el.className||null, text:(el.innerText||'').trim().slice(0,80), timestamp:Date.now() }});
  }, true);
  document.addEventListener('keydown',(e)=>{ if(['Shift','Alt','Control','Meta'].includes(e.key)) return; sendMessageToBackground({ action:'keydown', data:{ url:location.href, key:e.key, timestamp:Date.now() }}); });
  const reportScroll = throttle(()=>{ const scrollPercent = Math.round( (window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100 ); sendMessageToBackground({ action:'scroll', data:{ url:location.href, scrollPercent, timestamp:Date.now() }}); },3000);
  window.addEventListener('scroll', reportScroll, { passive:true });
  function hookMedia(el){ if(el._activityHooked) return; ['play','pause','ended'].forEach(ev=>{ el.addEventListener(ev,()=>{ sendMessageToBackground({ action:'media_'+ev, data:{ url:location.href, src:el.currentSrc||el.src||null, currentTime:Math.round(el.currentTime), duration:Math.round(el.duration||0), timestamp:Date.now() }}); }); }); el._activityHooked=true; }
  document.querySelectorAll('video,audio').forEach(hookMedia);
  const mediaObserver = new MutationObserver(()=>{ document.querySelectorAll('video,audio').forEach(hookMedia); });
  mediaObserver.observe(document.documentElement,{ childList:true, subtree:true });
  let lastUrl = location.href;
  setInterval(()=>{ if(location.href!==lastUrl){ lastUrl=location.href; sendMessageToBackground({ action:'page_view', data:{ url:location.href, title:document.title, timestamp:Date.now() }}); } },1500);
}