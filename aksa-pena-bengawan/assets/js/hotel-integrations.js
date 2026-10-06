const WA_PHONE = '62811234567';

function rfqShowError(fieldId, message) {
  var field = document.getElementById(fieldId);
  if (!field) return;
  var wrap = field.closest('.field');
  if (!wrap) return;
  wrap.classList.add('invalid');
  var err = wrap.querySelector('.err');
  if (err) err.textContent = message;
}

function rfqClearErrors() {
  document.querySelectorAll('.field.invalid').forEach(function(el) {
    el.classList.remove('invalid');
  });
  document.querySelectorAll('.field .err').forEach(function(el) {
    el.textContent = '';
  });
}

function rfqGetValue(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function rfqGetRadio(name) {
  var checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? checked.value : '';
}

function rfqValidatePhone(raw) {
  var p = String(raw).replace(/[\s.\-()]/g, '');
  return /^(?:\+?62|0)8\d{8,11}$/.test(p);
}

function rfqSendWhatsApp(event) {
  if (event && event.preventDefault) event.preventDefault();
  rfqClearErrors();

  var hotelName     = rfqGetValue('rfq-hotelName');
  var contactPerson = rfqGetValue('rfq-contactPerson');
  var phone         = rfqGetValue('rfq-phone');
  var email         = rfqGetValue('rfq-email');
  var keycardType   = rfqGetValue('rfq-keycardType');
  var keycardQty    = rfqGetValue('rfq-keycardQty');
  var printSides    = rfqGetValue('rfq-printSides');
  var customPrint   = rfqGetRadio('rfq-customPrint');
  var message       = rfqGetValue('rfq-message');

  var valid = true;

  if (!hotelName) {
    rfqShowError('rfq-hotelName', 'Nama hotel / perusahaan wajib diisi.');
    valid = false;
  }
  if (!contactPerson) {
    rfqShowError('rfq-contactPerson', 'Nama kontak wajib diisi.');
    valid = false;
  }
  if (!phone) {
    rfqShowError('rfq-phone', 'Nomor telepon / WhatsApp wajib diisi.');
    valid = false;
  } else if (!rfqValidatePhone(phone)) {
    rfqShowError('rfq-phone', 'Nomor tidak valid. Gunakan format 08xx, +62, atau 628xx (10-14 digit).');
    valid = false;
  }
  if (!keycardQty || isNaN(Number(keycardQty)) || Number(keycardQty) < 1) {
    rfqShowError('rfq-keycardQty', 'Jumlah kartu wajib diisi angka valid.');
    valid = false;
  }

  if (!valid) return false;

  var lines = [
    '--- PERMINTAAN CETAK KEYCARD ---',
    '',
    'Hotel/Perusahaan: ' + hotelName,
    'Kontak: ' + contactPerson,
    'Telepon: ' + phone,
    'Email: ' + (email || '-'),
    '',
    'KEBUTUHAN KEYCARD:',
    'Tipe Kartu: ' + (keycardType || 'Belum Ditentukan'),
    'Jumlah: ' + keycardQty + ' pcs',
    'Sisi Cetak: ' + (printSides || 'Belum Ditentukan'),
    'Custom Print: ' + (customPrint || 'Belum Ditentukan'),
    '',
    'Catatan Tambahan:',
    message || '-'
  ];

  var text = lines.join('\n');
  var encoded = encodeURIComponent(text);
  var waUrl = 'https://wa.me/' + WA_PHONE + '?text=' + encoded;

  rfqFireAnalyticsLead('whatsapp');
  rfqSubmitFallback();
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  return false;
}

function rfqSubmitFallback() {
  var fallback = document.getElementById('rfq-fallback-form');
  if (!fallback) return;

  var fields = [
    'hotelName', 'contactPerson', 'phone', 'email',
    'keycardType', 'keycardQty', 'printSides', 'message'
  ];

  fields.forEach(function(name) {
    var val = rfqGetValue('rfq-' + name);
    var target = fallback.querySelector('[name="' + name + '"]');
    if (target) target.value = val;
  });

  var customPrint = rfqGetRadio('rfq-customPrint');
  var cpField = fallback.querySelector('[name="customPrint"]');
  if (cpField) cpField.value = customPrint;

  var data = new FormData(fallback);
  // Web3Forms belum dikonfigurasi (butuh API key asli) — jangan tembak endpoint mati.
  console.warn('Fallback Web3Forms tidak terkonfigurasi: data RFQ hanya dikirim via WhatsApp.');
}

function rfqFireAnalyticsLead(method) {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'rfq_lead',
      rfq_method: method
    });
  }

  if (typeof fbq === 'function') {
    fbq('track', 'Lead');
  }
}

function waFabGetContextMessage() {
  var fab = document.getElementById('wa-fab');
  var ctx = fab ? fab.getAttribute('data-wa-context') : null;

  if (!ctx) {
    var title = document.title.toLowerCase();
    if (title.indexOf('keycard') !== -1) {
      ctx = 'keycard';
    } else if (title.indexOf('lock system') !== -1 || title.indexOf('hotel lock') !== -1) {
      ctx = 'lock';
    } else if (title.indexOf('contact') !== -1 || title.indexOf('rfq') !== -1 || title.indexOf('penawaran') !== -1) {
      ctx = 'contact';
    } else {
      ctx = 'home';
    }
  }

  var messages = {
    home: 'Halo Aksa Pena Bengawan, saya ingin cetak keycard hotel custom. Mohon info harga dan MOQ.',
    keycard: 'Halo, saya ingin memesan keycard hotel RFID custom. Mohon info harga dan MOQ.',
    contact: 'Halo, saya ingin request penawaran cetak keycard custom.'
  };

  return messages[ctx] || messages.home;
}

function waFabOpen() {
  var msg = waFabGetContextMessage();
  var encoded = encodeURIComponent(msg);
  var url = 'https://wa.me/' + WA_PHONE + '?text=' + encoded;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function initProductFilter() {
  var filterButtons = document.querySelectorAll('.hl-filter-btn');
  var gridItems = document.querySelectorAll('.hl-grid-item');
  if (!filterButtons.length || !gridItems.length) return;

  filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterButtons.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filterValue = this.getAttribute('data-filter');
      var className = filterValue.replace('.', '');

      gridItems.forEach(function(item) {
        var match = filterValue === '*' || item.classList.contains(className);
        item.style.display = match ? 'block' : 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initProductFilter();
});
