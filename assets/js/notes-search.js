(function () {
  var indexPromise = null;

  function dataUrl() {
    return window.NOTES_SEARCH_INDEX_URL || '/search-index.json';
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(dataUrl()).then(function (r) { return r.json(); }).catch(function () { return []; });
    }
    return indexPromise;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function score(entry, q) {
    var title = entry.title.toLowerCase();
    var s = 0;
    if (title === q) s += 100;
    else if (title.indexOf(q) === 0) s += 60;
    else if (title.indexOf(q) !== -1) s += 35;

    if (entry.tags && entry.tags.length) {
      var tagsLower = entry.tags.map(function (t) { return t.toLowerCase(); });
      if (tagsLower.indexOf(q) !== -1) s += 50;
      else if (tagsLower.some(function (t) { return t.indexOf(q) !== -1; })) s += 20;
    }

    if (entry.content && entry.content.toLowerCase().indexOf(q) !== -1) s += 10;
    return s;
  }

  function excerptAround(text, q) {
    var lower = text.toLowerCase();
    var idx = lower.indexOf(q);
    if (idx === -1) return text.slice(0, 140);
    var start = Math.max(0, idx - 50);
    var end = Math.min(text.length, idx + q.length + 90);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  function highlight(text, q) {
    var idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(text.slice(idx + q.length));
  }

  function render(results, container, query) {
    container.innerHTML = '';
    if (!query) { container.classList.remove('open'); return; }
    if (results.length === 0) {
      container.innerHTML = '<div class="search-empty">No notes match &quot;' + escapeHtml(query) + '&quot;</div>';
      container.classList.add('open');
      return;
    }
    results.slice(0, 12).forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'search-result';
      a.href = r.url;

      var pathParts = [r.topic];
      if (r.subfolder) pathParts.push(r.subfolder);
      var pathStr = pathParts.map(function (p) { return p.replace(/-/g, ' '); }).join(' / ');

      var excerpt = r.excerpt;
      if (r.content && r.content.toLowerCase().indexOf(query) !== -1 && r.title.toLowerCase().indexOf(query) === -1) {
        excerpt = excerptAround(r.content, query);
      }

      var tagsHtml = '';
      if (r.tags && r.tags.length) {
        tagsHtml = '<div class="search-result-tags">' + r.tags.map(function (t) {
          return '<span class="tag-pill">' + escapeHtml(t) + '</span>';
        }).join('') + '</div>';
      }

      a.innerHTML =
        '<div class="search-result-title">' + highlight(r.title, query) + '</div>' +
        '<div class="search-result-path">' + escapeHtml(pathStr) + '</div>' +
        '<div class="search-result-excerpt">' + highlight(excerpt, query) + '</div>' +
        tagsHtml;
      container.appendChild(a);
    });
    container.classList.add('open');
  }

  function init() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    if (!input || !results) return;

    var debounceTimer;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var q = input.value.trim().toLowerCase();
      debounceTimer = setTimeout(function () {
        if (!q) { render([], results, ''); return; }
        loadIndex().then(function (data) {
          var scored = data
            .map(function (entry) { return { entry: entry, s: score(entry, q) }; })
            .filter(function (x) { return x.s > 0; })
            .sort(function (a, b) { return b.s - a.s; })
            .map(function (x) { return x.entry; });
          render(scored, results, q);
        });
      }, 120);
    });

    document.addEventListener('click', function (e) {
      if (!results.contains(e.target) && e.target !== input) {
        results.classList.remove('open');
      }
    });
    input.addEventListener('focus', function () {
      if (input.value.trim()) results.classList.add('open');
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = '';
        render([], results, '');
        input.blur();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
