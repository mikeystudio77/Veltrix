/* =========================================================
   VELTRIX PROMO SYSTEM  (one file: logic + UI + styles)
   - Halloween sale: -20% on every package (auto-expires)
   - Promo codes: NEWLAUNCH = -20% more (stacks => -40% total)
   Edit the CONFIG block below to change anything.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- CONFIG (edit here) ---------- */
  var CONFIG = {
    storageKey: 'veltrix-promo',
    pillKey: 'veltrix-promo-pill-closed',
    halloween: {
      percent: 20,
      // Sale stops automatically at this moment (Nov 1, 2026, 00:00 local time)
      endsAt: new Date(2026, 10, 1, 0, 0, 0),
      endLabel: 'Oct 31'
    },
    codes: {
      NEWLAUNCH: { percent: 20 }
    },
    maxTotalPercent: 90
  };

  /* ---------- helpers ---------- */
  function store(method, key, value) {
    try {
      if (method === 'get') return window.localStorage.getItem(key);
      if (method === 'set') window.localStorage.setItem(key, value);
      if (method === 'del') window.localStorage.removeItem(key);
    } catch (e) {}
    return null;
  }
  function session(method, key, value) {
    try {
      if (method === 'get') return window.sessionStorage.getItem(key);
      if (method === 'set') window.sessionStorage.setItem(key, value);
    } catch (e) {}
    return null;
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- state ---------- */
  var state = { code: null };

  function halloweenOn() { return Date.now() < CONFIG.halloween.endsAt.getTime(); }
  function codePercent() { return state.code ? CONFIG.codes[state.code].percent : 0; }
  function halloweenPercent() { return halloweenOn() ? CONFIG.halloween.percent : 0; }
  function totalPercent() {
    return Math.min(halloweenPercent() + codePercent(), CONFIG.maxTotalPercent);
  }
  function discounted(base) { return Math.round(base * (100 - totalPercent()) / 100); }

  function lookup(raw) {
    var key = String(raw || '').trim().toUpperCase();
    return Object.prototype.hasOwnProperty.call(CONFIG.codes, key) ? key : null;
  }

  function summary() {
    var parts = [];
    if (halloweenPercent()) parts.push('Halloween -' + halloweenPercent() + '%');
    if (state.code) parts.push(state.code + ' -' + codePercent() + '%');
    if (!parts.length) return '';
    return parts.join(' + ') + (parts.length > 1 ? ' = ' + totalPercent() + '% off' : '');
  }

  /* ---------- styles ---------- */
  function injectStyles() {
    var css = [
      '.vx-promo{max-width:760px;margin:0 auto 34px;padding:20px 22px;border:1px solid rgba(167,139,250,.28);border-radius:14px;background:radial-gradient(ellipse at top,rgba(251,146,60,.08),transparent 70%),#0f0e1b;text-align:center}',
      '.vx-promo-head{display:flex;flex-wrap:wrap;gap:8px 12px;justify-content:center;align-items:center;margin-bottom:14px;font-size:13px;color:#b9b6d0;line-height:1.6}',
      '.vx-promo-head strong{color:#fff;font-size:15px}',
      '.vx-tag{display:inline-block;padding:4px 9px;border-radius:6px;border:1px solid rgba(251,146,60,.45);background:rgba(251,146,60,.12);color:#fdba74;font:700 10px "DM Sans",sans-serif;letter-spacing:1.2px}',
      '.vx-form{display:flex;gap:10px;justify-content:center;max-width:460px;margin:0 auto}',
      '.vx-form input{flex:1;min-width:0;padding:13px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:#080811;color:#fff;font:600 14px "DM Sans",sans-serif;letter-spacing:1.5px;text-transform:uppercase;outline:none;transition:border-color .2s,box-shadow .2s}',
      '.vx-form input::placeholder{color:#6f6d88;letter-spacing:.5px;text-transform:none;font-weight:500}',
      '.vx-form input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px rgba(167,139,250,.18)}',
      '.vx-form input:disabled{opacity:.7;cursor:not-allowed}',
      '.vx-form button{padding:13px 22px;border:0;border-radius:9px;background:linear-gradient(110deg,#a78bfa,#d879f9);color:#100b1c;font:700 13px "DM Sans",sans-serif;cursor:pointer;transition:transform .2s,opacity .2s}',
      '.vx-form button:hover{transform:translateY(-2px)}',
      '.vx-form button.is-remove{background:transparent;color:#d8d3e8;border:1px solid rgba(255,255,255,.18)}',
      '.vx-msg{min-height:20px;margin-top:12px;font-size:12px;line-height:1.7;color:#9997b2}',
      '.vx-msg.ok{color:#86efac}',
      '.vx-msg.err{color:#fca5a5}',
      '.vx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
      '.vx-price{display:inline-block}',
      '.vx-old{display:block;font:500 17px "DM Sans",sans-serif;letter-spacing:0;color:#77758f;text-decoration:line-through;text-decoration-thickness:1.5px;margin-bottom:2px}',
      '.vx-old[hidden]{display:none}',
      '.vx-new{transition:color .25s}',
      '.vx-price.is-sale .vx-new{color:#fff}',
      '.vx-badges{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 20px}',
      '.vx-badges:empty{display:none}',
      '.vx-chip{padding:4px 8px;border-radius:6px;border:1px solid;font:700 10px "DM Sans",sans-serif;letter-spacing:.8px}',
      '.vx-chip.hw{color:#fdba74;background:rgba(251,146,60,.12);border-color:rgba(251,146,60,.4)}',
      '.vx-chip.cd{color:#c4b5fd;background:rgba(167,139,250,.14);border-color:rgba(167,139,250,.45)}',
      '.vx-chip.sv{color:#86efac;background:rgba(134,239,172,.1);border-color:rgba(134,239,172,.35)}',
      '.vx-pill{position:fixed;left:50%;bottom:16px;z-index:60;display:flex;align-items:center;gap:12px;max-width:calc(100% - 24px);padding:10px 12px 10px 16px;border-radius:999px;border:1px solid rgba(167,139,250,.4);background:rgba(14,13,27,.95);backdrop-filter:blur(12px);box-shadow:0 14px 40px rgba(0,0,0,.5);color:#d8d3e8;font:500 12px/1.5 "DM Sans",sans-serif;transform:translate(-50%,0);animation:vx-in .5s ease both}',
      '.vx-pill b{color:#fdba74}',
      '.vx-pill a{color:#c4b5fd;font-weight:700;white-space:nowrap}',
      '.vx-pill button{flex:none;width:26px;height:26px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#d8d3e8;font-size:15px;line-height:1;cursor:pointer}',
      '.vx-pill button:hover{background:rgba(255,255,255,.16)}',
      '@keyframes vx-in{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}',
      '.vx-contact-note{margin:2px 0 16px;padding:11px 13px;border-radius:9px;border:1px solid rgba(251,146,60,.3);background:rgba(251,146,60,.07);color:#fdba74;font-size:12px;line-height:1.7}',
      '@media (max-width:520px){.vx-form{flex-direction:column}.vx-form button{width:100%}.vx-pill{border-radius:16px;font-size:11.5px}.vx-promo{padding:18px 16px}}',
      '@media (prefers-reduced-motion:reduce){.vx-pill{animation:none}.vx-form button:hover{transform:none}}'
    ].join('\n');
    var style = document.createElement('style');
    style.setAttribute('data-vx', 'promo');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- pricing page: prices ---------- */
  var priceNodes = [];
  var badgeBoxes = [];

  function setupPrices() {
    var blocks = document.querySelectorAll('.price-block');
    Array.prototype.forEach.call(blocks, function (block) {
      var price = block.querySelector('.price');
      if (!price || price.querySelector('.vx-price')) return;
      var textNode = null;
      Array.prototype.forEach.call(price.childNodes, function (n) {
        if (!textNode && n.nodeType === 3 && /\$\s*[\d,]+/.test(n.nodeValue)) textNode = n;
      });
      if (!textNode) return;
      var base = parseInt(textNode.nodeValue.replace(/[^\d]/g, ''), 10);
      if (!base) return;

      var wrap = el('span', 'vx-price');
      wrap.setAttribute('data-base', String(base));
      var old = el('span', 'vx-old');
      old.hidden = true;
      old.setAttribute('aria-label', 'Original price');
      var now = el('span', 'vx-new', money(base));
      wrap.appendChild(old);
      wrap.appendChild(now);
      price.replaceChild(wrap, textNode);

      var badges = el('div', 'vx-badges');
      badges.setAttribute('data-base', String(base));
      price.parentNode.insertBefore(badges, price.nextSibling);

      priceNodes.push({ wrap: wrap, old: old, now: now, base: base });
      badgeBoxes.push(badges);
    });
  }

  function renderPrices() {
    var pct = totalPercent();
    priceNodes.forEach(function (p) {
      if (pct > 0) {
        p.old.hidden = false;
        p.old.textContent = money(p.base);
        p.now.textContent = money(discounted(p.base));
        p.wrap.classList.add('is-sale');
      } else {
        p.old.hidden = true;
        p.now.textContent = money(p.base);
        p.wrap.classList.remove('is-sale');
      }
    });
    badgeBoxes.forEach(function (box) {
      var base = parseInt(box.getAttribute('data-base'), 10);
      box.textContent = '';
      if (halloweenPercent()) box.appendChild(el('span', 'vx-chip hw', '🎃 HALLOWEEN -' + halloweenPercent() + '%'));
      if (state.code) box.appendChild(el('span', 'vx-chip cd', state.code + ' -' + codePercent() + '%'));
      if (pct > 0) box.appendChild(el('span', 'vx-chip sv', 'YOU SAVE ' + money(base - discounted(base))));
    });
  }

  /* ---------- pricing page: promo box ---------- */
  var ui = {};

  function buildPromoBox() {
    var grid = document.querySelector('.pricing-grid');
    if (!grid) return;

    var box = el('section', 'vx-promo');
    box.setAttribute('aria-label', 'Promo code');

    var head = el('div', 'vx-promo-head');
    head.appendChild(el('span', 'vx-tag', '🎃 HALLOWEEN SALE'));
    head.appendChild(el('strong', null, CONFIG.halloween.percent + '% off every package'));
    ui.sub = el('span', null, '');
    head.appendChild(ui.sub);
    box.appendChild(head);

    var form = el('form', 'vx-form');
    form.setAttribute('novalidate', '');
    var label = el('label', 'vx-sr', 'Promo code');
    label.setAttribute('for', 'vx-code');
    var input = el('input');
    input.id = 'vx-code';
    input.type = 'text';
    input.placeholder = 'Have a promo code?';
    input.autocomplete = 'off';
    input.setAttribute('autocapitalize', 'characters');
    input.setAttribute('spellcheck', 'false');
    input.maxLength = 24;
    var btn = el('button', null, 'Apply');
    btn.type = 'submit';
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(btn);
    box.appendChild(form);

    var msg = el('p', 'vx-msg');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    box.appendChild(msg);

    grid.parentNode.insertBefore(box, grid);
    ui.box = box; ui.form = form; ui.input = input; ui.btn = btn; ui.msg = msg;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.code) { removeCode(); return; }
      var raw = input.value.trim();
      if (!raw) { say('Enter a promo code first.', 'err'); input.focus(); return; }
      var key = lookup(raw);
      if (!key) { say("That code isn't valid. Check the spelling and try again.", 'err'); input.select(); return; }
      applyCode(key, true);
    });
  }

  function say(text, kind) {
    if (!ui.msg) return;
    ui.msg.textContent = text;
    ui.msg.className = 'vx-msg' + (kind ? ' ' + kind : '');
  }

  function renderPromoBox() {
    if (!ui.box) return;
    var hw = halloweenOn();
    ui.sub.textContent = hw
      ? 'Sale ends ' + CONFIG.halloween.endLabel + '. Promo codes stack on top.'
      : 'Enter a promo code for a discount.';
    if (state.code) {
      ui.input.value = state.code;
      ui.input.disabled = true;
      ui.btn.textContent = 'Remove';
      ui.btn.classList.add('is-remove');
    } else {
      ui.input.disabled = false;
      ui.btn.textContent = 'Apply';
      ui.btn.classList.remove('is-remove');
    }
  }

  /* ---------- actions ---------- */
  function applyCode(key, announce) {
    state.code = key;
    store('set', CONFIG.storageKey, key);
    renderAll();
    if (announce) {
      var s = summary();
      say(key + ' applied. ' + s + '.', 'ok');
    }
  }

  function removeCode() {
    state.code = null;
    store('del', CONFIG.storageKey);
    renderAll();
    if (ui.input) { ui.input.value = ''; ui.input.focus(); }
    say('Promo code removed.', '');
  }

  /* ---------- contact page note ---------- */
  var contactNote = null;

  function setupContact() {
    var form = document.querySelector('#contact-form');
    if (!form) return;
    var submit = form.querySelector('button[type="submit"]');
    if (!submit) return;
    contactNote = el('p', 'vx-contact-note');
    form.insertBefore(contactNote, submit);
  }

  function renderContact() {
    if (!contactNote) return;
    var s = summary();
    if (s) {
      contactNote.textContent = '🎃 Active offer: ' + s + '. It will be included in your message.';
      contactNote.hidden = false;
    } else {
      contactNote.hidden = true;
    }
  }

  /* ---------- floating pill (all pages except pricing) ---------- */
  var pill = null;

  function setupPill() {
    if (document.querySelector('.pricing-grid')) return;
    if (!halloweenOn()) return;
    if (session('get', CONFIG.pillKey) === '1') return;

    pill = el('div', 'vx-pill');
    pill.setAttribute('role', 'region');
    pill.setAttribute('aria-label', 'Current offer');
    var text = el('span');
    var b = el('b', null, '🎃 Halloween Sale: ' + CONFIG.halloween.percent + '% off');
    text.appendChild(b);
    text.appendChild(document.createTextNode(' · code '));
    var code = el('b', null, 'NEWLAUNCH');
    text.appendChild(code);
    text.appendChild(document.createTextNode(' for 20% more'));
    var link = el('a', null, 'See prices ↗');
    link.href = 'pricing.html';
    var close = el('button', null, '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss offer');
    close.addEventListener('click', function () {
      session('set', CONFIG.pillKey, '1');
      if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
      pill = null;
    });
    pill.appendChild(text);
    pill.appendChild(link);
    pill.appendChild(close);
    document.body.appendChild(pill);
  }

  /* ---------- render + init ---------- */
  function renderAll() {
    renderPrices();
    renderPromoBox();
    renderContact();
  }

  function init() {
    injectStyles();

    // restore saved code, or pick one up from ?promo=CODE
    var fromUrl = null;
    try { fromUrl = new URLSearchParams(window.location.search).get('promo'); } catch (e) {}
    var saved = lookup(fromUrl) || lookup(store('get', CONFIG.storageKey));
    if (saved) {
      state.code = saved;
      store('set', CONFIG.storageKey, saved);
    } else {
      store('del', CONFIG.storageKey);
    }

    setupPrices();
    buildPromoBox();
    setupContact();
    setupPill();
    renderAll();

    if (ui.msg && state.code) say(state.code + ' applied. ' + summary() + '.', 'ok');
  }

  window.VeltrixPromo = {
    summary: summary,
    totalPercent: totalPercent,
    price: discounted,
    apply: function (code) { var k = lookup(code); if (!k) return false; applyCode(k, true); return true; },
    remove: removeCode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
