/* "One network, seven views": the same small station drawn as net elements, net relations,
   a knowledge graph, a schematic, a map, and at meso and macro level.
   Texts come from _data/network_explorer.yml; this file only draws. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var N = 32;
  var BRAND = '#0563bb', INK = '#1c2633', EDGE = '#808893', HALO = '#e3eefa', MUTED = '#4a5563';

  var VIEWS = {
    elements: { mode: 'abstract', chev: true },
    relations: { mode: 'abstract', rels: true },
    graph: { mode: 'kg' },
    schematic: { mode: 'schematic' },
    geographic: { mode: 'geo' },
    meso: { mode: 'meso' },
    macro: { mode: 'macro' }
  };

  var ELS = [
    { id: 'e1', rev: false, sch: [[30, 270], [250, 270]] },
    { id: 'e2', rev: false, sch: [[250, 270], [750, 270]] },
    { id: 'e3', rev: false, sch: [[250, 270], [330, 170], [420, 170]] },
    { id: 'e4', rev: true, sch: [[420, 170], [670, 170], [750, 270]] },
    { id: 'e5', rev: false, sch: [[420, 170], [500, 80], [640, 80]] },
    { id: 'e6', rev: false, sch: [[750, 270], [970, 270]] }
  ];
  var FLOAT = { e1: [140, 215], e2: [470, 270], e3: [330, 145], e4: [640, 150], e5: [500, 85], e6: [840, 225] };
  var RELS = [
    { id: 'r1', a: 'e1', b: 'e2', nav: 'Both' }, { id: 'r2', a: 'e1', b: 'e3', nav: 'Both' }, { id: 'r3', a: 'e2', b: 'e3', nav: 'None' },
    { id: 'r4', a: 'e3', b: 'e4', nav: 'Both' }, { id: 'r5', a: 'e3', b: 'e5', nav: 'Both' }, { id: 'r6', a: 'e4', b: 'e5', nav: 'None' },
    { id: 'r7', a: 'e2', b: 'e6', nav: 'Both' }, { id: 'r8', a: 'e4', b: 'e6', nav: 'Both' }, { id: 'r9', a: 'e2', b: 'e4', nav: 'None' }
  ];
  var OP = [500, 215];
  var AGG = { e1: [[40, 215], OP], e6: [OP, [960, 215]] };

  function f1(n) { return n.toFixed(1); }
  function resample(poly) {
    var seg = [], total = 0, i, k;
    for (i = 1; i < poly.length; i++) { var d = Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]); seg.push(d); total += d; }
    var out = [];
    for (k = 0; k < N; k++) {
      var t = total === 0 ? 0 : (k / (N - 1)) * total; i = 0;
      while (i < seg.length - 1 && t > seg[i]) { t -= seg[i]; i++; }
      var f = seg[i] === 0 ? 0 : Math.min(1, t / seg[i]);
      var a = poly[i], b = poly[i + 1] || poly[i];
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    }
    return out;
  }
  function toGeo(p) { var base = 300 - 0.17 * p[0] + 38 * Math.sin(p[0] / 170); return [p[0] * 0.96 + 20, base + (p[1] - 270) * 0.42]; }
  function pd(pts) { return 'M ' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L '); }
  function line(a, b) { var out = []; for (var k = 0; k < N; k++) { var f = k / (N - 1); out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); } return out; }
  function byId(id) { for (var i = 0; i < ELS.length; i++) if (ELS[i].id === id) return ELS[i]; return null; }
  function ptsFor(el, mode) {
    if (mode === 'meso' || mode === 'macro') { var e = AGG[el.id] || [OP, OP]; return line(e[0], e[1]); }
    if (mode === 'schematic') return resample(el.sch);
    if (mode === 'geo') return resample(el.sch).map(toGeo);
    var c = FLOAT[el.id], P = line([c[0] - 42, c[1]], [c[0] + 42, c[1]]);
    return el.rev ? P.reverse() : P;
  }
  function atI(el, mode, i) {
    var t = el.rev ? 1 - i : i, P = ptsFor(el, mode), f = t * (P.length - 1);
    var k = Math.min(P.length - 2, Math.floor(f)), r = f - k, a = P[k], b = P[k + 1];
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, s = el.rev ? -1 : 1;
    return { p: [a[0] + dx * r, a[1] + dy * r], d: [dx / L * s, dy / L * s] };
  }
  function head(p, ux, uy, size) {
    var nx = -uy, ny = ux;
    return 'M ' + f1(p[0]) + ' ' + f1(p[1]) + ' L ' + f1(p[0] - ux * size + nx * size * 0.55) + ' ' + f1(p[1] - uy * size + ny * size * 0.55) + ' L ' + f1(p[0] - ux * size - nx * size * 0.55) + ' ' + f1(p[1] - uy * size - ny * size * 0.55) + ' Z ';
  }
  function relGeom(r) {
    var A = FLOAT[r.a], B = FLOAT[r.b], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    var p0 = [A[0] + ux * 50, A[1] + uy * 22], p1 = [B[0] - ux * 50, B[1] - uy * 22];
    var mid = [(p0[0] + p1[0]) / 2 - uy * 18, (p0[1] + p1[1]) / 2 + ux * 18];
    var tx = p1[0] - mid[0], ty = p1[1] - mid[1], tl = Math.hypot(tx, ty) || 1;
    return { d: 'M ' + f1(p0[0]) + ' ' + f1(p0[1]) + ' Q ' + f1(mid[0]) + ' ' + f1(mid[1]) + ' ' + f1(p1[0]) + ' ' + f1(p1[1]) + ' ', mid: mid, head: head(p1, tx / tl, ty / tl, 8) };
  }
  function cut(from, to, c) { var dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy) || 1; return { p: [to[0] - dx / L * c, to[1] - dy / L * c], u: [dx / L, dy / L] }; }
  function circ(p, r) { return 'M ' + f1(p[0] - r) + ' ' + f1(p[1]) + ' a ' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0 a ' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0 Z '; }

  var GEO = (function () {
    var both = '', none = '', heads = '', kgE = '', kgH = '', kgN = '', kgt = {};
    RELS.forEach(function (r) {
      var g = relGeom(r);
      if (r.nav === 'None') none += g.d; else { both += g.d; heads += g.head; }
      var m = g.mid;
      [r.a, r.b].forEach(function (e) {
        var c = cut(m, FLOAT[e], 30);
        kgE += 'M ' + f1(m[0]) + ' ' + f1(m[1]) + ' L ' + f1(c.p[0]) + ' ' + f1(c.p[1]) + ' ';
        kgH += head(c.p, c.u[0], c.u[1], 7);
      });
      var x = m[0] - 16, y = m[1] - 10;
      kgN += 'M ' + (x + 4) + ' ' + y + ' H ' + (x + 28) + ' Q ' + (x + 32) + ' ' + y + ' ' + (x + 32) + ' ' + (y + 4) + ' V ' + (y + 16) + ' Q ' + (x + 32) + ' ' + (y + 20) + ' ' + (x + 28) + ' ' + (y + 20) + ' H ' + (x + 4) + ' Q ' + x + ' ' + (y + 20) + ' ' + x + ' ' + (y + 16) + ' V ' + (y + 4) + ' Q ' + x + ' ' + y + ' ' + (x + 4) + ' ' + y + ' Z ';
      kgt[r.id] = [m[0], m[1] + 4];
    });
    return { both: both, none: none, heads: heads, kgE: kgE, kgH: kgH, kgN: kgN, kgt: kgt };
  })();

  function el(tag, attrs, parent, text) {
    var n = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function setD(node, d) { node.setAttribute('d', d); node.style.d = 'path("' + d + '")'; }

  function build(root) {
    var g = root.querySelector('[data-nx="dynamic"]');
    var n = {};
    // net relations (topology graph)
    n.rel = el('g', { 'class': 'fade', opacity: 0 }, g);
    el('path', { d: GEO.both, fill: 'none', stroke: BRAND, 'stroke-width': 2 }, n.rel);
    el('path', { d: GEO.none, fill: 'none', stroke: EDGE, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, n.rel);
    el('path', { d: GEO.heads, fill: BRAND, stroke: 'none' }, n.rel);
    el('text', { x: 500, y: 304, 'font-size': 12, 'text-anchor': 'middle', fill: MUTED }, n.rel, 'solid: navigable · dashed: navigability None');
    // knowledge graph: relations become nodes
    n.kg = el('g', { 'class': 'fade', opacity: 0 }, g);
    el('path', { d: GEO.kgE, fill: 'none', stroke: EDGE, 'stroke-width': 1.5 }, n.kg);
    el('path', { d: GEO.kgH, fill: EDGE, stroke: 'none' }, n.kg);
    el('path', { d: GEO.kgN, fill: '#ffffff', stroke: BRAND, 'stroke-width': 2 }, n.kg);
    RELS.forEach(function (r) { var p = GEO.kgt[r.id]; el('text', { x: f1(p[0]), y: f1(p[1]), 'font-size': 11, 'text-anchor': 'middle', fill: BRAND }, n.kg, r.id); });
    el('text', { x: 500, y: 304, 'font-size': 12, 'text-anchor': 'middle', fill: MUTED }, n.kg, 'NetRelation nodes · arrows are era:elementA / era:elementB triples');
    // net elements: halo (abstract views) and line
    n.halo = el('g', { 'class': 'fade', opacity: 0 }, g);
    n.halos = {}; n.lines = {}; n.labels = {};
    ELS.forEach(function (e) { n.halos[e.id] = el('path', { 'class': 'halo', fill: 'none', stroke: HALO, 'stroke-width': 20, 'stroke-linecap': 'round' }, n.halo); });
    ELS.forEach(function (e) { n.lines[e.id] = el('path', { 'class': 'ne', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); });
    // direction: chevrons and origins
    n.chevG = el('g', { 'class': 'fade', opacity: 0 }, g);
    n.chev = el('path', { fill: 'none', stroke: BRAND, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, n.chevG);
    n.orig = el('path', { fill: BRAND, stroke: 'none' }, n.chevG);
    // labels
    n.lab = el('g', { 'class': 'fade' }, g);
    ELS.forEach(function (e) { n.labels[e.id] = el('text', { 'font-size': 13, 'font-weight': 500, 'text-anchor': 'middle', fill: INK }, n.lab, e.id); });
    // switches (schematic / geographic)
    n.sw = el('g', { 'class': 'fade', opacity: 0 }, g);
    n.swDots = el('path', { fill: '#ffffff', stroke: INK, 'stroke-width': 2 }, n.sw);
    n.swLabels = {};
    ['W1', 'W2', 'W3'].forEach(function (k) { n.swLabels[k] = el('text', { 'font-size': 11, 'text-anchor': 'middle', fill: MUTED }, n.sw, k); });
    n.agg = root.querySelector('[data-nx="agg"]');
    n.meso = root.querySelector('[data-nx="meso"]');
    n.macro = root.querySelector('[data-nx="macro"]');
    return n;
  }

  function draw(n, view) {
    var v = VIEWS[view] || VIEWS.schematic, mode = v.mode;
    var abs = mode === 'abstract' || mode === 'kg';
    var agg = mode === 'meso' || mode === 'macro';
    var chev = '', orig = '';
    ELS.forEach(function (e) {
      var d = pd(ptsFor(e, mode));
      setD(n.halos[e.id], d);
      setD(n.lines[e.id], d);
      n.lines[e.id].setAttribute('stroke', abs ? BRAND : INK);
      n.lines[e.id].setAttribute('stroke-width', abs || agg ? 6 : 5);
      n.lines[e.id].setAttribute('opacity', agg ? (AGG[e.id] && mode === 'meso' ? 1 : 0) : 1);
      var m = atI(e, mode, 0.5);
      n.labels[e.id].setAttribute('x', f1(m.p[0]));
      n.labels[e.id].setAttribute('y', f1(m.p[1] - 16));
      if (v.chev) {
        [0.3, 0.55, 0.8].forEach(function (i) {
          var q = atI(e, mode, i), dd = q.d, nn = [-dd[1], dd[0]], P = q.p;
          chev += 'M ' + f1(P[0] - dd[0] * 6 + nn[0] * 6) + ' ' + f1(P[1] - dd[1] * 6 + nn[1] * 6) + ' L ' + f1(P[0] + dd[0] * 5) + ' ' + f1(P[1] + dd[1] * 5) + ' L ' + f1(P[0] - dd[0] * 6 - nn[0] * 6) + ' ' + f1(P[1] - dd[1] * 6 - nn[1] * 6) + ' ';
        });
        orig += circ(atI(e, mode, 0).p, 6);
      }
    });
    if (chev) { n.chev.setAttribute('d', chev); n.orig.setAttribute('d', orig); }
    var swPos = { W1: ptsFor(byId('e2'), mode)[0], W2: ptsFor(byId('e2'), mode)[N - 1], W3: ptsFor(byId('e5'), mode)[0] };
    var dots = '';
    Object.keys(swPos).forEach(function (k) {
      var q = swPos[k];
      n.swLabels[k].setAttribute('x', f1(q[0]));
      n.swLabels[k].setAttribute('y', f1(q[1] + 24));
      dots += circ(q, 5);
    });
    n.swDots.setAttribute('d', dots);
    n.halo.setAttribute('opacity', abs ? 1 : 0);
    n.chevG.setAttribute('opacity', v.chev ? 1 : 0);
    n.lab.setAttribute('opacity', agg ? 0 : 1);
    n.sw.setAttribute('opacity', mode === 'schematic' || mode === 'geo' ? 1 : 0);
    n.rel.setAttribute('opacity', v.rels ? 1 : 0);
    n.kg.setAttribute('opacity', mode === 'kg' ? 1 : 0);
    n.agg.setAttribute('opacity', agg ? 1 : 0);
    n.meso.setAttribute('opacity', mode === 'meso' ? 1 : 0);
    n.macro.setAttribute('opacity', mode === 'macro' ? 1 : 0);
  }

  function init(root) {
    var steps;
    try { steps = JSON.parse(root.querySelector('[data-steps]').textContent); } catch (e) { return; }
    if (!steps || !steps.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var start = parseInt(root.getAttribute('data-start'), 10);
    var interval = parseInt(root.getAttribute('data-interval'), 10) || 4200;
    var state = { step: start >= 0 && start < steps.length ? start : 0, playing: !reduce };
    var nodes = build(root);
    var svg = root.querySelector('svg');
    var stops = root.querySelectorAll('.nx-stop');
    var play = root.querySelector('.nx-play');
    var text = function (k, v) { root.querySelector('[data-nx="' + k + '"]').textContent = v; };

    function render() {
      var s = state.step, step = steps[s];
      draw(nodes, step.view);
      text('badge', step.badge || '');
      text('title', step.title || '');
      text('sub', step.sub || '');
      text('no', (s + 1) + '/' + steps.length);
      svg.setAttribute('aria-label', 'Railway network explorer, view ' + (s + 1) + ' of ' + steps.length + ': ' + step.title);
      for (var i = 0; i < stops.length; i++) {
        if (i === s) stops[i].setAttribute('aria-current', 'step'); else stops[i].removeAttribute('aria-current');
        stops[i].classList.toggle('is-past', i < s);
      }
      play.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
      play.textContent = state.playing ? root.getAttribute('data-pause-label') : root.getAttribute('data-play-label');
    }

    Array.prototype.forEach.call(stops, function (b) {
      b.addEventListener('click', function () { state.step = parseInt(b.getAttribute('data-step'), 10); state.playing = false; render(); });
    });
    play.hidden = false;
    play.addEventListener('click', function () { state.playing = !state.playing; render(); });

    // Only advance while the explorer is on screen and the tab is visible.
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(root);
    }
    setInterval(function () {
      if (state.playing && visible && !document.hidden) { state.step = (state.step + 1) % steps.length; render(); }
    }, interval);
    render();
  }

  document.querySelectorAll('[data-network-explorer]').forEach(init);
})();
