(function () {
  'use strict';

  function initVisualizer() {
    var hotelInput = document.getElementById('viz-input-hotel');
    var finishSelect = document.getElementById('viz-select-finish');
    var chipSelect = document.getElementById('viz-select-chip');
    var qtyInput = document.getElementById('viz-input-qty');
    var cardEl = document.getElementById('viz-card');
    var hotelNameDisplay = document.getElementById('viz-hotel-name');
    var chipTextDisplay = document.getElementById('viz-chip-text');
    var waBtn = document.getElementById('viz-btn-wa');

    if (!hotelInput || !cardEl || !waBtn) return;

    function update() {
      var name = hotelInput.value.trim() || 'NAMA HOTEL ANDA';
      var finish = finishSelect.value;
      var chip = chipSelect.value;
      var qty = parseInt(qtyInput.value, 10) || 500;

      hotelNameDisplay.textContent = name.toUpperCase();
      chipTextDisplay.textContent = chip;

      cardEl.className = 'hl-viz-card hl-finish-' + finish;

      var msg = 'Halo, saya ingin konsultasi pemesanan custom keycard RFID dengan spesifikasi mockup berikut:\n\n' +
        'Nama Hotel / Properti: ' + name + '\n' +
        'Pilihan Finishing: ' + finishSelect.options[finishSelect.selectedIndex].text + '\n' +
        'Tipe Chip RFID: ' + chip + '\n' +
        'Jumlah Pesanan: ' + qty.toLocaleString('id-ID') + ' pcs\n\n' +
        'Mohon informasi harga, estimasi waktu produksi, dan pembuatan digital proof 3D. Terima kasih.';

      var phone = typeof WA_PHONE !== 'undefined' ? WA_PHONE : '62811234567';
      waBtn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    }

    hotelInput.addEventListener('input', update);
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
