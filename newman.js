/* ============================================================
   Newman Energy — UI Kit JS  ·  vanilla, zero deps
   ============================================================ */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function initNav(){
    const nav = document.querySelector('.nav'); if(!nav) return;
    let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY;
      nav.classList.toggle('hidden', y > last && y > 140);
      last = y;
    }, {passive:true});
    nav.querySelector('.burger')?.addEventListener('click', (e) => {
      const open = nav.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if(id.length < 2) return;
      const t = document.querySelector(id);
      if(t){ e.preventDefault(); t.scrollIntoView({behavior: RM ? 'auto' : 'smooth'}); nav.classList.remove('open'); }
    }));
  }

  function initTabs(root=document){
    root.querySelectorAll('[role=tablist]').forEach(list => {
      const tabs = [...list.querySelectorAll('[role=tab]')];
      const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
      const select = i => {
        tabs.forEach((t,j) => { t.setAttribute('aria-selected', String(j===i)); t.tabIndex = j===i ? 0 : -1; });
        panels.forEach((p,j) => p && (p.hidden = j!==i));
      };
      tabs.forEach((tab,i) => {
        tab.addEventListener('click', () => select(i));
        tab.addEventListener('keydown', e => {
          let n;
          if(e.key==='ArrowRight') n=(i+1)%tabs.length;
          else if(e.key==='ArrowLeft') n=(i-1+tabs.length)%tabs.length;
          else return;
          e.preventDefault(); tabs[n].focus(); select(n);
        });
      });
      select(tabs.findIndex(t => t.getAttribute('aria-selected')==='true') >> 0 || 0);
    });
  }

  let lastFocused = null;
  function openModal(id){
    const b = document.getElementById(id); if(!b) return;
    lastFocused = document.activeElement;
    b.classList.add('open');
    const f = b.querySelector('input,button,a,textarea,select,[tabindex]');
    f?.focus();
  }
  function closeModal(b){ b.classList.remove('open'); lastFocused?.focus(); }
  function initModals(){
    document.querySelectorAll('[data-modal]').forEach(t => t.addEventListener('click', () => openModal(t.dataset.modal)));
    document.querySelectorAll('.backdrop').forEach(b => {
      b.addEventListener('click', e => { if(e.target===b) closeModal(b); });
      b.querySelectorAll('[data-close]').forEach(x => x.addEventListener('click', () => closeModal(b)));
      b.addEventListener('keydown', e => {
        if(e.key==='Escape') return closeModal(b);
        if(e.key!=='Tab') return;
        const f = [...b.querySelectorAll('a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled && el.offsetParent!==null);
        if(!f.length) return;
        const first=f[0], last=f[f.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      });
    });
  }

  function toast(msg, type='info', ms=3500){
    let wrap = document.querySelector('.toasts');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toasts'; wrap.setAttribute('aria-live','polite'); document.body.append(wrap); }
    const t = document.createElement('div'); t.className=`toast ${type}`; t.role='status'; t.textContent=msg;
    wrap.append(t);
    setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),250); }, ms);
  }

  function initReveal(){
    const els = document.querySelectorAll('[data-reveal]');
    if(RM || !('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
    els.forEach(el => io.observe(el));
  }

  function initAccordion(){
    document.querySelectorAll('.acc-head').forEach(h => h.addEventListener('click', () => {
      const open = h.getAttribute('aria-expanded')==='true';
      h.setAttribute('aria-expanded', String(!open));
      const body = h.nextElementSibling;
      body.style.maxHeight = open ? '0px' : body.scrollHeight+'px';
    }));
  }

  function countUp(el, ms=1600){
    const raw = el.dataset.to ?? el.textContent;
    const m = raw.match(/[\d.]+/); if(!m){ return; }
    const pre = raw.slice(0, m.index), post = raw.slice(m.index + m[0].length);
    const end = parseFloat(m[0].replace(/,/g,'')), dec = (m[0].split('.')[1]||'').length;
    if(RM){ el.textContent = raw; return; }
    let t0 = null;
    const step = ts => {
      if(t0===null) t0 = ts;
      const p = Math.min((ts - t0)/ms, 1), v = end*(1 - Math.pow(1-p,3));
      el.textContent = pre + v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + post;
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initStats(){
    const els = document.querySelectorAll('.num[data-to]');
    if(!('IntersectionObserver' in window)){ els.forEach(countUp); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ countUp(e.target); io.unobserve(e.target); } }), {threshold:.6});
    els.forEach(el => io.observe(el));
  }

  /* ---- animated bars: fill width from data-w when scrolled into view ---- */
  function initBars(){
    const bars = document.querySelectorAll('.bar-fill[data-w]');
    const set = el => { el.style.width = RM ? el.dataset.w : ''; requestAnimationFrame(()=>{ el.style.width = el.dataset.w; }); };
    if(RM || !('IntersectionObserver' in window)){ bars.forEach(b=>b.style.width=b.dataset.w); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ set(e.target); io.unobserve(e.target); } }), {threshold:.4});
    bars.forEach(b => io.observe(b));
  }

  function validateForm(form){
    let ok = true;
    form.querySelectorAll('[required],[type=email]').forEach(inp => {
      const f = inp.closest('.field'); let bad = !inp.value.trim();
      if(inp.type==='email' && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) bad = true;
      f?.classList.toggle('error', bad); if(bad) ok = false;
    });
    return ok;
  }

  addEventListener('DOMContentLoaded', () => {
    initNav(); initTabs(); initModals(); initReveal(); initAccordion(); initStats(); initBars();
    document.querySelectorAll('form[data-validate]').forEach(f => f.addEventListener('submit', e => {
      if(!validateForm(f)){ e.preventDefault(); toast('Revisa los campos marcados','error'); }
      else { e.preventDefault(); toast('Enviado — te contactamos','success'); f.reset(); }
    }));
  });

  window.Newman = { toast, openModal, countUp, validateForm };
})();
