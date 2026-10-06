(function () {
  'use strict';

  var BG_LABELS = {
    emerald: 'Emerald (hijau brand)',
    midnight: 'Midnight (biru gelap)',
    sand: 'Sand (krem hangat)',
    'photo-lobby': 'Foto lobi hotel',
    'photo-room': 'Foto kamar hotel',
    custom: 'Foto upload sendiri'
  };
  var POS_LABELS = { center: 'tengah', top: 'atas', bottom: 'bawah' };
  var LOGOPOS_LABELS = { center: 'tengah', tl: 'kiri atas', tr: 'kanan atas', bl: 'kiri bawah', br: 'kanan bawah' };

  function initVisualizer() {
    var hotelInput = document.getElementById('viz-input-hotel');
    var bgSelect = document.getElementById('viz-select-bg');
    var bgInput = document.getElementById('viz-input-bg');
    var logosList = document.getElementById('viz-logos-list');
    var addLogoBtn = document.getElementById('viz-btn-addlogo');
    var backMirrorCheck = document.getElementById('viz-check-backlogo');
    var inkInput = document.getElementById('viz-input-textcolor');
    var chipCheck = document.getElementById('viz-check-chip');
    var backInput = document.getElementById('viz-input-back');
    var backLabelInput = document.getElementById('viz-input-backlabel');
    var orientSelect = document.getElementById('viz-select-orient');
    var posSelect = document.getElementById('viz-select-pos');
    var posBackSelect = document.getElementById('viz-select-posback');
    var finishSelect = document.getElementById('viz-select-finish');
    var chipSelect = document.getElementById('viz-select-chip');
    var qtyInput = document.getElementById('viz-input-qty');
    var cardEl = document.getElementById('viz-card');
    var hotelNameDisplay = document.getElementById('viz-hotel-name');
    var backHotelDisplay = document.getElementById('viz-back-hotel');
    var backLabelDisplay = document.getElementById('viz-back-label');
    var backTextDisplay = document.getElementById('viz-back-text');
    var chipTextDisplay = document.getElementById('viz-chip-text');
    var logoPh = document.getElementById('viz-logo-ph');
    var flipBtn = document.getElementById('viz-btn-flip');
    var dlBtn = document.getElementById('viz-btn-download');
    var pdfBtn = document.getElementById('viz-btn-pdf');
    var waBtn = document.getElementById('viz-btn-wa');

    if (!hotelInput || !cardEl || !waBtn) return;

    var logos = [];
    var MAX_LOGOS = 4;
    var backCustom = false;
    var customBgUrl = null;

    function slug() {
      return (hotelInput.value.trim() || 'hotel').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'hotel';
    }

    function placeLogo(url, pos, isBack) {
      var suffix = isBack ? '-back' : '';
      var slotId = pos === 'center' ? 'viz-logo-center' + suffix : 'viz-corner-' + pos + suffix;
      var slot = document.getElementById(slotId);
      if (!slot) return;
      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      slot.appendChild(img);
      slot.hidden = false;
    }

    function renderLogos() {
      var slots = ['viz-logo-center', 'viz-corner-tl', 'viz-corner-tr', 'viz-corner-bl', 'viz-corner-br',
                   'viz-logo-center-back', 'viz-corner-tl-back', 'viz-corner-tr-back', 'viz-corner-bl-back', 'viz-corner-br-back'];
      slots.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.querySelectorAll('img').forEach(function (i) { i.remove(); });
        if (el.classList.contains('hl-viz-logo-corner')) el.hidden = true;
      });
      var mirror = backMirrorCheck && backMirrorCheck.checked;
      var anyCenter = false;
      logos.forEach(function (L) {
        if (!L.url) return;
        placeLogo(L.url, L.pos, false);
        if (L.pos === 'center') anyCenter = true;
        if (mirror) placeLogo(L.url, L.backPos, true);
      });
      if (logoPh) logoPh.style.display = anyCenter ? 'none' : '';
      // tandai slot berisi >1 logo agar mengecil otomatis
      slots.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle('multi', el.querySelectorAll('img').length > 1);
      });
    }

    function logoPosOptions(selected) {
      var opts = [['center', 'Tengah (Di Atas Nama Hotel)'], ['tl', 'Kiri Atas'], ['tr', 'Kanan Atas'], ['bl', 'Kiri Bawah'], ['br', 'Kanan Bawah']];
      return opts.map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === selected ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('');
    }

    function refreshAddBtn() {
      if (addLogoBtn) addLogoBtn.style.display = logos.length >= MAX_LOGOS ? 'none' : '';
    }

    function addLogoRow() {
      if (logos.length >= MAX_LOGOS || !logosList) return;
      var idx = logos.length;
      logos.push({ url: null, pos: 'center', backPos: 'center' });
      var row = document.createElement('div');
      row.className = 'viz-logo-row';
      row.setAttribute('data-idx', idx);
      row.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:center;background:var(--bg-soft,#f7faf9);border:1px solid var(--line);border-radius:10px;padding:.6rem .7rem;';
      row.innerHTML =
        '<span style="font-size:.85rem;font-weight:600;">Logo ' + (idx + 1) + '</span>' +
        '<button type="button" class="viz-logo-rm" aria-label="Hapus logo ' + (idx + 1) + '" style="background:none;border:0;color:var(--muted);font-size:1.3rem;line-height:1;cursor:pointer;padding:.1rem .4rem;">×</button>' +
        '<input type="file" accept="image/*" aria-label="File logo ' + (idx + 1) + '" style="grid-column:1/-1;">' +
        '<select class="viz-logo-pos" aria-label="Posisi depan logo ' + (idx + 1) + '" style="grid-column:1/-1;">' + logoPosOptions('center') + '</select>' +
        '<span class="viz-logo-backpos-lbl" style="grid-column:1/-1;font-size:.78rem;font-weight:600;color:var(--muted);">Posisi di sisi belakang</span>' +
        '<select class="viz-logo-backpos" aria-label="Posisi belakang logo ' + (idx + 1) + '" style="grid-column:1/-1;">' + logoPosOptions('center') + '</select>';
      var fileInput = row.querySelector('input[type=file]');
      var posSel = row.querySelector('.viz-logo-pos');
      var backPosSel = row.querySelector('.viz-logo-backpos');
      var rmBtn = row.querySelector('.viz-logo-rm');
      fileInput.addEventListener('change', function () {
        readImageFile(fileInput.files && fileInput.files[0], function (url) {
          logos[idx].url = url;
          update();
        });
      });
      posSel.addEventListener('change', function () {
        logos[idx].pos = posSel.value;
        update();
      });
      backPosSel.addEventListener('change', function () {
        logos[idx].backPos = backPosSel.value;
        update();
      });
      rmBtn.addEventListener('click', function () {
        logos.splice(idx, 1);
        row.remove();
        renumberLogoRows();
        update();
      });
      logosList.appendChild(row);
      refreshAddBtn();
      update();
    }

    function renumberLogoRows() {
      if (!logosList) return;
      Array.prototype.forEach.call(logosList.children, function (row, i) {
        row.setAttribute('data-idx', i);
        var label = row.querySelector('span');
        if (label) label.textContent = 'Logo ' + (i + 1);
      });
      refreshAddBtn();
    }

    function update() {
      var name = hotelInput.value.trim() || 'NAMA HOTEL ANDA';
      var bg = bgSelect ? bgSelect.value : 'emerald';
      var finish = finishSelect.value;
      var chip = chipSelect.value;
      var qty = parseInt(qtyInput.value, 10) || 500;
      var orient = orientSelect ? orientSelect.value : 'landscape';
      var pos = posSelect ? posSelect.value : 'center';
      var posBack = posBackSelect ? posBackSelect.value : 'center';
      var backLabel = backLabelInput ? backLabelInput.value.trim() : 'AKSA PENA BENGAWAN';

      hotelNameDisplay.textContent = name.toUpperCase();
      if (backHotelDisplay) backHotelDisplay.textContent = name.toUpperCase();
      if (backLabelDisplay) backLabelDisplay.textContent = backLabel.toUpperCase() || 'AKSA PENA BENGAWAN';
      chipTextDisplay.textContent = chip;
      if (!backCustom && backTextDisplay) {
        backTextDisplay.textContent = 'Kartu ini milik ' + name + '. Jika menemukan, mohon kembalikan ke resepsionis hotel.';
      }

      var mirror = backMirrorCheck && backMirrorCheck.checked;
      var frontTl = logos.some(function (L) { return L.url && L.pos === 'tl'; });
      var backTl = mirror && logos.some(function (L) { return L.url && L.backPos === 'tl'; });
      var ink = inkInput ? inkInput.value : '#ffffff';
      var customInk = ink.toLowerCase() !== '#ffffff';
      var showChip = !chipCheck || chipCheck.checked;

      cardEl.className = 'hl-viz-card hl-finish-' + finish + ' hl-bg-' + bg +
        (orient === 'portrait' ? ' portrait' : '') +
        ' pos-' + pos +
        ' posb-' + posBack +
        (frontTl ? ' has-tl' : '') +
        (backTl ? ' has-tl-b' : '') +
        (customInk ? ' custom-ink' : '') +
        (showChip ? '' : ' hide-chip') +
        (cardEl.classList.contains('flipped') ? ' flipped' : '');
      if (customInk) cardEl.style.setProperty('--viz-ink', ink);
      else cardEl.style.removeProperty('--viz-ink');

      var bgUrl = (bg === 'custom' && customBgUrl) ? customBgUrl : null;
      cardEl.querySelectorAll('.hl-viz-card-bg').forEach(function (el) {
        el.style.backgroundImage = bgUrl ? 'url(' + bgUrl + ')' : '';
      });

      renderLogos();

      var logoDesc = logos.map(function (L, i) {
        if (!L.url) return null;
        var d = 'Logo ' + (i + 1) + ' (depan: ' + (LOGOPOS_LABELS[L.pos] || L.pos);
        if (mirror) d += ', belakang: ' + (LOGOPOS_LABELS[L.backPos] || L.backPos);
        return d + ')';
      }).filter(Boolean).join(', ') || 'belum ada / pakai standar';

      var msg = 'Halo, saya ingin konsultasi pemesanan custom keycard RFID dengan spesifikasi mockup berikut:\n\n' +
        'Nama Hotel / Properti: ' + name + '\n' +
        'Desain Latar: ' + (BG_LABELS[bg] || bg) + '\n' +
        'Warna Teks: ' + (customInk ? ink : 'putih (standar)') + '\n' +
        'Logo: ' + logoDesc + '\n' +
        'Orientasi: ' + (orient === 'portrait' ? 'Portrait' : 'Landscape') + '\n' +
        'Posisi Konten Depan: ' + (POS_LABELS[pos] || pos) + '\n' +
        'Posisi Konten Belakang: ' + (POS_LABELS[posBack] || posBack) + '\n' +
        'Label Belakang: ' + backLabel + '\n' +
        'Teks Belakang: ' + (backTextDisplay ? backTextDisplay.textContent : '-') + '\n' +
        'Pilihan Finishing: ' + finishSelect.options[finishSelect.selectedIndex].text + '\n' +
        'Tipe Chip RFID: ' + chip + '\n' +
        'Jumlah Pesanan: ' + qty.toLocaleString('id-ID') + ' pcs\n\n' +
        'Mohon informasi harga, estimasi waktu produksi, dan pembuatan digital proof 3D. Terima kasih.';

      var phone = typeof WA_PHONE !== 'undefined' ? WA_PHONE : '62811234567';
      waBtn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    }

    function readImageFile(file, cb) {
      if (!file || !file.type.match(/^image\//)) return;
      var reader = new FileReader();
      reader.onload = function (e) { cb(e.target.result); };
      reader.readAsDataURL(file);
    }

    if (addLogoBtn) {
      addLogoBtn.addEventListener('click', addLogoRow);
    }
    if (backMirrorCheck) {
      backMirrorCheck.addEventListener('change', function () {
        if (logosList) logosList.classList.toggle('show-backpos', backMirrorCheck.checked);
        update();
      });
    }
    if (chipCheck) {
      chipCheck.addEventListener('change', update);
    }
    if (inkInput) {
      inkInput.addEventListener('input', function () {
        document.querySelectorAll('.viz-swatches button').forEach(function (b) {
          b.classList.toggle('active', b.getAttribute('data-c').toLowerCase() === inkInput.value.toLowerCase());
        });
        update();
      });
    }
    document.querySelectorAll('.viz-swatches button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (inkInput) {
          inkInput.value = btn.getAttribute('data-c');
          inkInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    // mulai dengan 1 slot logo
    addLogoRow();

    var bgActions = document.getElementById('viz-bg-custom-actions');
    var bgChangeBtn = document.getElementById('viz-btn-bg-change');
    var bgRemoveBtn = document.getElementById('viz-btn-bg-remove');
    var prevBgValue = 'emerald';

    function updateBgActions() {
      if (bgActions) bgActions.hidden = !customBgUrl;
    }

    if (bgSelect && bgInput) {
      bgSelect.addEventListener('change', function () {
        if (bgSelect.value === 'custom') {
          if (!customBgUrl) bgInput.click();
        } else {
          prevBgValue = bgSelect.value;
        }
        update();
      });
      bgInput.addEventListener('change', function () {
        var file = bgInput.files && bgInput.files[0];
        bgInput.value = '';
        if (!file) {
          // dialog dibatalkan: kembalikan ke pilihan sebelumnya
          bgSelect.value = customBgUrl ? 'custom' : prevBgValue;
          updateBgActions();
          update();
          return;
        }
        readImageFile(file, function (url) {
          customBgUrl = url;
          bgSelect.value = 'custom';
          prevBgValue = 'custom';
          updateBgActions();
          update();
        });
      });
      if (bgChangeBtn) {
        bgChangeBtn.addEventListener('click', function () {
          bgInput.click();
        });
      }
      if (bgRemoveBtn) {
        bgRemoveBtn.addEventListener('click', function () {
          customBgUrl = null;
          bgSelect.value = 'emerald';
          prevBgValue = 'emerald';
          updateBgActions();
          update();
        });
      }
    }

    if (backInput) {
      backInput.addEventListener('input', function () {
        backCustom = backInput.value.trim().length > 0;
        if (backCustom && backTextDisplay) backTextDisplay.textContent = backInput.value.trim();
        update();
      });
    }
    if (backLabelInput) backLabelInput.addEventListener('input', update);

    if (flipBtn) {
      flipBtn.addEventListener('click', function () {
        cardEl.classList.toggle('flipped');
      });
    }

    var DL_SCALE = 3;

    function getPhotoBg() {
      var bg = bgSelect ? bgSelect.value : 'emerald';
      if (bg === 'custom' && customBgUrl) return { url: customBgUrl, overlay: false };
      if (bg === 'photo-lobby') return { url: 'assets/img/stock/keycard-hero.jpg', overlay: true };
      if (bg === 'photo-room') return { url: 'assets/img/stock/room-key.jpg', overlay: true };
      return null;
    }

    function rr(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // gambar foto asli di resolusi penuh di bawah hasil capture (html2canvas melemahkan foto bg)
    function compositePhoto(baseCanvas, photo) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
          try {
            var out = document.createElement('canvas');
            out.width = baseCanvas.width;
            out.height = baseCanvas.height;
            var ctx = out.getContext('2d');
            var cw = out.width, ch = out.height;
            ctx.save();
            rr(ctx, 0, 0, cw, ch, 12 * DL_SCALE);
            ctx.clip();
            var ir = img.width / img.height, cr = cw / ch;
            var dw, dh, dx, dy;
            if (ir > cr) { dh = ch; dw = dh * ir; dx = (cw - dw) / 2; dy = 0; }
            else { dw = cw; dh = dw / ir; dx = 0; dy = (ch - dh) / 2; }
            ctx.drawImage(img, dx, dy, dw, dh);
            if (photo.overlay) {
              var g = ctx.createLinearGradient(0, 0, cw, ch);
              g.addColorStop(0, 'rgba(12,31,26,0.72)');
              g.addColorStop(1, 'rgba(12,31,26,0.45)');
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, cw, ch);
            }
            ctx.restore();
            ctx.drawImage(baseCanvas, 0, 0);
            resolve(out);
          } catch (e) { resolve(baseCanvas); }
        };
        img.onerror = function () { resolve(baseCanvas); };
        img.src = photo.url;
      });
    }

    function captureFace(isBack) {
      return new Promise(function (resolve, reject) {
        if (typeof html2canvas === 'undefined') {
          reject(new Error('html2canvas missing'));
          return;
        }
        var photo = getPhotoBg();
        var clone = cardEl.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.remove('flipped');
        clone.style.transform = 'none';
        clone.style.position = 'fixed';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.margin = '0';
        // bg foto di-composite manual (kualitas penuh); glare hanya efek layar
        if (photo) {
          clone.querySelectorAll('.hl-viz-card-bg').forEach(function (el) { el.style.display = 'none'; });
          clone.style.background = 'transparent';
        }
        clone.querySelectorAll('.hl-viz-card-glare').forEach(function (el) { el.style.display = 'none'; });
        var faces = clone.querySelectorAll('.hl-viz-face');
        if (faces.length === 2) {
          faces[isBack ? 0 : 1].style.display = 'none';
          faces[isBack ? 1 : 0].style.transform = 'none';
        }
        document.body.appendChild(clone);
        html2canvas(clone, { backgroundColor: null, scale: DL_SCALE, useCORS: true }).then(function (canvas) {
          clone.remove();
          if (photo) return compositePhoto(canvas, photo).then(resolve);
          resolve(canvas);
        }).catch(function (err) {
          clone.remove();
          reject(err);
        });
      });
    }

    function busy(btn, on) {
      if (!btn) return;
      if (on) {
        btn.disabled = true;
        btn.dataset.label = btn.textContent;
        btn.textContent = 'Menyiapkan...';
      } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.label || btn.textContent;
      }
    }

    function flatJpeg(canvas) {
      var out = document.createElement('canvas');
      out.width = canvas.width;
      out.height = canvas.height;
      var ctx = out.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, 0, 0);
      return out.toDataURL('image/jpeg', 0.95);
    }

    if (dlBtn) {
      dlBtn.addEventListener('click', function () {
        busy(dlBtn, true);
        Promise.all([captureFace(false), captureFace(true)]).then(function (pages) {
          var front = pages[0], back = pages[1];
          var pad = 36, gap = 48, labelH = 56;
          var W = pad * 2 + front.width + gap + back.width;
          var H = pad * 2 + labelH + Math.max(front.height, back.height);
          var out = document.createElement('canvas');
          out.width = W;
          out.height = H;
          var ctx = out.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#101B16';
          ctx.font = '700 39px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          var y0 = pad + labelH;
          ctx.fillText('DEPAN', pad + front.width / 2, pad + 34);
          ctx.drawImage(front, pad, y0);
          ctx.fillText('BELAKANG', pad + front.width + gap + back.width / 2, pad + 34);
          ctx.drawImage(back, pad + front.width + gap, y0);
          var a = document.createElement('a');
          a.download = 'mockup-keycard-' + slug() + '.png';
          a.href = out.toDataURL('image/png');
          document.body.appendChild(a);
          a.click();
          a.remove();
          busy(dlBtn, false);
        }).catch(function () {
          busy(dlBtn, false);
          alert('Download gagal. Silakan screenshot manual ya.');
        });
      });
    }

    if (pdfBtn) {
      pdfBtn.addEventListener('click', function () {
        if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
          alert('Pustaka PDF belum termuat. Silakan screenshot manual ya.');
          return;
        }
        busy(pdfBtn, true);
        Promise.all([captureFace(false), captureFace(true)]).then(function (pages) {
          // 300 DPI: 1px gambar = 72/300 pt, jadi hasil cetak/zoom tetap tajam
          var w = pages[0].width * 0.24;
          var h = pages[0].height * 0.24;
          var orient = w > h ? 'landscape' : 'portrait';
          var pdf = new jspdf.jsPDF({ orientation: orient, unit: 'pt', format: [w, h] });
          pdf.addImage(flatJpeg(pages[0]), 'JPEG', 0, 0, w, h);
          pdf.addPage([w, h], orient);
          pdf.addImage(flatJpeg(pages[1]), 'JPEG', 0, 0, w, h);
          pdf.save('mockup-keycard-' + slug() + '.pdf');
          busy(pdfBtn, false);
        }).catch(function () {
          busy(pdfBtn, false);
          alert('Download PDF gagal. Silakan screenshot manual ya.');
        });
      });
    }

    hotelInput.addEventListener('input', update);
    if (bgSelect) bgSelect.addEventListener('change', update);
    if (orientSelect) orientSelect.addEventListener('change', update);
    if (posSelect) posSelect.addEventListener('change', update);
    if (posBackSelect) posBackSelect.addEventListener('change', update);
    finishSelect.addEventListener('change', update);
    chipSelect.addEventListener('change', update);
    qtyInput.addEventListener('input', update);

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualizer);
  } else {
    initVisualizer();
  }
})();
