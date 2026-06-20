(function () {
  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    if (b < 1024 * 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
    return (b / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }

  function enhance(input) {
    if (input.dataset.dzReady) return;
    input.dataset.dzReady = '1';

    const multiple = input.multiple;
    const accept = (input.getAttribute('accept') || '').toLowerCase();
    const isImage = accept.includes('image');

    const wrap = document.createElement('label');
    wrap.className = 'dz';
    wrap.tabIndex = 0;

    const title = multiple
      ? 'Перетащите файлы сюда или <b>выберите</b>'
      : 'Перетащите файл сюда или <b>выберите</b>';
    const hintParts = [];
    if (isImage) hintParts.push('Только изображения');
    if (multiple) hintParts.push('Можно несколько');
    const hint = hintParts.length ? hintParts.join(' • ') : 'Любой формат';

    wrap.innerHTML =
      '<div class="dz-inner">' +
        '<div class="dz-ic">' + (isImage ? '🖼️' : '📁') + '</div>' +
        '<div class="dz-text">' +
          '<div class="dz-title">' + title + '</div>' +
          '<div class="dz-hint">' + hint + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dz-list"></div>';

    const prev = input.previousElementSibling;
    let currentChip = null;
    if (prev && prev.tagName === 'SMALL') {
      currentChip = document.createElement('div');
      currentChip.className = 'dz-current';
      currentChip.textContent = prev.textContent.trim();
      prev.remove();
    }

    input.parentNode.insertBefore(wrap, input);
    if (currentChip) wrap.insertBefore(currentChip, wrap.firstChild);
    wrap.appendChild(input);
    input.classList.remove('input');

    const list = wrap.querySelector('.dz-list');

    function render() {
      list.innerHTML = '';
      const files = Array.from(input.files || []);
      files.forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'dz-item';
        const isImg = f.type.startsWith('image/');
        let thumbHtml;
        if (isImg) {
          const url = URL.createObjectURL(f);
          thumbHtml = '<img class="dz-thumb" src="' + url + '" alt="">';
        } else {
          const ext = (f.name.split('.').pop() || '?').slice(0, 4).toUpperCase();
          thumbHtml = '<div class="dz-thumb file">' + ext + '</div>';
        }
        item.innerHTML = thumbHtml +
          '<div class="dz-meta">' +
            '<div class="dz-name"></div>' +
            '<div class="dz-size">' + fmtSize(f.size) + '</div>' +
          '</div>' +
          '<button type="button" class="dz-rm" data-i="' + i + '" title="Убрать">✕</button>';
        item.querySelector('.dz-name').textContent = f.name;
        list.appendChild(item);
      });
    }

    function setFiles(fileList) {
      const dt = new DataTransfer();
      if (multiple && input.files) {
        Array.from(input.files).forEach(f => dt.items.add(f));
      }
      Array.from(fileList).forEach(f => {
        if (accept && !acceptMatches(f, accept)) return;
        dt.items.add(f);
      });
      if (!multiple && dt.files.length > 1) {
        const only = new DataTransfer();
        only.items.add(dt.files[dt.files.length - 1]);
        input.files = only.files;
      } else {
        input.files = dt.files;
      }
      render();
    }

    function acceptMatches(file, acc) {
      const parts = acc.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.length) return true;
      return parts.some(p => {
        if (p.endsWith('/*')) return file.type.startsWith(p.slice(0, -1));
        if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p);
        return file.type === p;
      });
    }

    input.addEventListener('change', render);

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.dz-rm');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt(btn.dataset.i, 10);
      const dt = new DataTransfer();
      Array.from(input.files).forEach((f, i) => { if (i !== idx) dt.items.add(f); });
      input.files = dt.files;
      render();
    });

    ['dragenter', 'dragover'].forEach(ev =>
      wrap.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); wrap.classList.add('is-drag'); })
    );
    ['dragleave', 'dragend', 'drop'].forEach(ev =>
      wrap.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); wrap.classList.remove('is-drag'); })
    );
    wrap.addEventListener('drop', (e) => {
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) setFiles(files);
    });
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
  }

  function init() {
    document.querySelectorAll('input[type=file]').forEach(enhance);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
