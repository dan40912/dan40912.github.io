/* Dify-style flow diagram renderer: SVG bezier edges + hover HINT tooltips.
   Usage: renderFlow({ canvas: '#id', edges: [{from,to,label,cls,dashed,fromSide,toSide,fromAt,toAt,d,at}] })
   Node markup: .fnode[id] positioned absolutely inside the canvas; hint content in a hidden .fnode-tip child. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var CONFIGS = [];
  var UID = 0;
  var COLORS = {
    norm: '#7f9c8f',
    internal: '#256d93',
    external: '#247a51',
    risk: '#a34e44',
    amber: '#9c6b19',
    loop: '#8b8f96'
  };

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function portPt(node, side, at) {
    var x = node.offsetLeft, y = node.offsetTop, w = node.offsetWidth, h = node.offsetHeight;
    var t = (typeof at === 'number') ? at : 0.5;
    if (side === 'left') return { x: x, y: y + h * t };
    if (side === 'right') return { x: x + w, y: y + h * t };
    if (side === 'top') return { x: x + w * t, y: y };
    return { x: x + w * t, y: y + h };
  }

  function ctrl(p, side, d) {
    if (side === 'left') return { x: p.x - d, y: p.y };
    if (side === 'right') return { x: p.x + d, y: p.y };
    if (side === 'top') return { x: p.x, y: p.y - d };
    return { x: p.x, y: p.y + d };
  }

  function cubic(p0, c1, c2, p1, t) {
    var u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y
    };
  }

  function draw(cfg) {
    var canvas = qs(cfg.canvas);
    if (!canvas) return;
    var old = canvas.querySelector('svg.edge-svg');
    if (old) old.parentNode.removeChild(old);
    canvas.querySelectorAll('.edge-label').forEach(function (l) { l.parentNode.removeChild(l); });

    var w = canvas.offsetWidth, h = canvas.offsetHeight;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'edge-svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

    var defs = document.createElementNS(NS, 'defs');
    Object.keys(COLORS).forEach(function (k) {
      var m = document.createElementNS(NS, 'marker');
      m.setAttribute('id', 'arr-' + k + '-' + cfg.uid);
      m.setAttribute('viewBox', '0 0 10 10');
      m.setAttribute('refX', '9');
      m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '7');
      m.setAttribute('markerHeight', '7');
      m.setAttribute('orient', 'auto-start-reverse');
      var tri = document.createElementNS(NS, 'path');
      tri.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      tri.setAttribute('fill', COLORS[k]);
      m.appendChild(tri);
      defs.appendChild(m);
    });
    svg.appendChild(defs);
    canvas.insertBefore(svg, canvas.firstChild);

    cfg._items = [];
    cfg.edges.forEach(function (e) {
      var a = qs(e.from, canvas), b = qs(e.to, canvas);
      if (!a || !b) return;
      var s1 = e.fromSide || 'right', s2 = e.toSide || 'left';
      var p1 = portPt(a, s1, e.fromAt), p2 = portPt(b, s2, e.toAt);
      var dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      var d = e.d || Math.max(36, Math.min(130, dist * 0.45));
      var c1 = ctrl(p1, s1, d), c2 = ctrl(p2, s2, d);
      var cls = e.cls || 'norm';

      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M ' + p1.x + ' ' + p1.y + ' C ' + c1.x + ' ' + c1.y + ', ' + c2.x + ' ' + c2.y + ', ' + p2.x + ' ' + p2.y);
      path.setAttribute('class', 'edge ' + cls + (e.dashed ? ' dashed' : ''));
      path.setAttribute('stroke', COLORS[cls]);
      path.setAttribute('marker-end', 'url(#arr-' + cls + '-' + cfg.uid + ')');
      svg.appendChild(path);

      var lab = null;
      if (e.label) {
        var mid = cubic(p1, c1, c2, p2, (typeof e.at === 'number') ? e.at : 0.5);
        lab = document.createElement('div');
        lab.className = 'edge-label ' + cls;
        lab.textContent = e.label;
        lab.style.left = mid.x + 'px';
        lab.style.top = mid.y + 'px';
        canvas.appendChild(lab);
      }
      cfg._items.push({ from: e.from, to: e.to, path: path, label: lab });
    });
  }

  function attachUX(cfg) {
    var canvas = qs(cfg.canvas);
    if (!canvas) return;
    var tip = document.createElement('div');
    tip.className = 'flow-tip';
    tip.style.display = 'none';
    canvas.appendChild(tip);
    var pinned = null;

    function showTip(node) {
      var src = node.querySelector('.fnode-tip');
      if (!src) { tip.style.display = 'none'; return; }
      tip.innerHTML = src.innerHTML;
      tip.style.display = 'block';
      tip.style.left = '0px';
      tip.style.top = '0px';
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = node.offsetLeft + node.offsetWidth + 14;
      if (x + tw > canvas.offsetWidth - 6) x = node.offsetLeft - tw - 14;
      if (x < 6) x = 6;
      var y = node.offsetTop;
      if (y + th > canvas.offsetHeight - 6) y = canvas.offsetHeight - th - 6;
      if (y < 6) y = 6;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    }

    function hideTip() { tip.style.display = 'none'; }

    function setFocus(node, on) {
      if (!cfg._items) return;
      var id = '#' + node.id;
      cfg._items.forEach(function (it) {
        var hot = (it.from === id || it.to === id);
        [it.path, it.label].forEach(function (elm) {
          if (!elm) return;
          elm.classList.toggle('hot', on && hot);
          elm.classList.toggle('dim', on && !hot);
        });
      });
    }

    canvas.querySelectorAll('.fnode').forEach(function (node) {
      node.addEventListener('mouseenter', function () {
        if (!pinned) { showTip(node); setFocus(node, true); }
      });
      node.addEventListener('mouseleave', function () {
        if (!pinned) { hideTip(); setFocus(node, false); }
      });
      node.addEventListener('click', function (ev) {
        if (ev.target.closest('a')) return;
        ev.stopPropagation();
        if (pinned === node) {
          pinned = null;
          node.classList.remove('pinned');
          hideTip();
          setFocus(node, false);
          return;
        }
        if (pinned) { pinned.classList.remove('pinned'); setFocus(pinned, false); }
        pinned = node;
        node.classList.add('pinned');
        showTip(node);
        setFocus(node, true);
      });
    });

    canvas.addEventListener('click', function () {
      if (pinned) {
        pinned.classList.remove('pinned');
        setFocus(pinned, false);
        pinned = null;
        hideTip();
      }
    });
  }

  window.renderFlow = function (cfg) {
    cfg.uid = (++UID);
    CONFIGS.push(cfg);
    draw(cfg);
    attachUX(cfg);
  };

  /* redraw once webfonts settle (node heights may shift a few px) */
  window.addEventListener('load', function () { CONFIGS.forEach(draw); });

  /* scale-to-fit toggle: <button data-fit="#canvas-id"> inside .canvas-wrap > .fit-stage > .flow-canvas */
  function initFit() {
    document.querySelectorAll('[data-fit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var canvas = qs(btn.getAttribute('data-fit'));
        if (!canvas) return;
        var stage = canvas.parentElement;
        var wrap = stage.parentElement;
        var on = !canvas.classList.contains('fitted');
        if (on) {
          var scale = Math.min(1, (wrap.clientWidth - 38) / canvas.offsetWidth);
          canvas.style.transform = 'scale(' + scale + ')';
          stage.style.width = Math.ceil(canvas.offsetWidth * scale) + 'px';
          stage.style.height = Math.ceil(canvas.offsetHeight * scale) + 'px';
          canvas.classList.add('fitted');
          btn.textContent = '以 100% 檢視';
        } else {
          canvas.style.transform = '';
          stage.style.width = '';
          stage.style.height = '';
          canvas.classList.remove('fitted');
          btn.textContent = '縮放全覽';
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFit);
  } else {
    initFit();
  }
})();
