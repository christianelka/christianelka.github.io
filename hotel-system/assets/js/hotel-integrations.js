var WA_PHONE = '62811234567';

function rfqShowError(fieldId, message) {
  var field = document.getElementById(fieldId);
  if (!field) return;

  var existing = field.parentElement.querySelector('.rfq-error-msg');
  if (existing) existing.remove();

  var msg = document.createElement('span');
  msg.className = 'rfq-error-msg';
  msg.style.cssText = 'display:block;color:#e53e3e;font-size:13px;margin-top:4px;font-weight:500;';
  msg.textContent = message;
  field.parentElement.appendChild(msg);
  field.style.borderColor = '#e53e3e';
}

function rfqClearErrors() {
  document.querySelectorAll('.rfq-error-msg').forEach(function(el) {
    el.remove();
  });
  document.querySelectorAll('.rfq-field').forEach(function(el) {
    el.style.borderColor = '';
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

function rfqSendWhatsApp(event) {
  if (event && event.preventDefault) event.preventDefault();
  rfqClearErrors();

  var hotelName      = rfqGetValue('rfq-hotelName');
  var contactPerson  = rfqGetValue('rfq-contactPerson');
  var phone          = rfqGetValue('rfq-phone');
  var email          = rfqGetValue('rfq-email');
  var roomCount      = rfqGetValue('rfq-roomCount');
  var doorType       = rfqGetValue('rfq-doorType');
  var preferredBrand = rfqGetValue('rfq-preferredBrand');
  var lockModel      = rfqGetValue('rfq-lockModel');
  var keycardType    = rfqGetValue('rfq-keycardType');
  var keycardQty     = rfqGetValue('rfq-keycardQty');
  var customPrint    = rfqGetRadio('rfq-customPrint');
  var message        = rfqGetValue('rfq-message');

  var valid = true;

  if (!hotelName) {
    rfqShowError('rfq-hotelName', 'Nama hotel wajib diisi.');
    valid = false;
  }
  if (!contactPerson) {
    rfqShowError('rfq-contactPerson', 'Nama kontak wajib diisi.');
    valid = false;
  }
  if (!phone) {
    rfqShowError('rfq-phone', 'Nomor telepon / WhatsApp wajib diisi.');
    valid = false;
  }
  if (!roomCount || isNaN(Number(roomCount)) || Number(roomCount) < 1) {
    rfqShowError('rfq-roomCount', 'Jumlah kamar wajib diisi angka valid.');
    valid = false;
  }

  if (!valid) return false;

  var lines = [
    '--- PERMINTAAN PENAWARAN HOTEL LOCK SYSTEM ---',
    '',
    'Hotel: ' + hotelName,
    'Kontak: ' + contactPerson,
    'Telepon: ' + phone,
    'Email: ' + (email || '-'),
    '',
    'KEBUTUHAN LOCK SYSTEM:',
    'Jumlah Kamar: ' + roomCount,
    'Tipe Pintu: ' + (doorType || 'Belum Ditentukan'),
    'Brand Preferensi: ' + (preferredBrand || 'Belum Ditentukan'),
    'Model Lock: ' + (lockModel || '-'),
    '',
    'KEBUTUHAN KEYCARD:',
    'Tipe Chip: ' + (keycardType || 'Belum Ditentukan'),
    'Jumlah: ' + (keycardQty || '-'),
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
    'roomCount', 'doorType', 'preferredBrand', 'lockModel',
    'keycardType', 'keycardQty', 'message'
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
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: data
  }).catch(function() {});
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
    home: 'Halo, saya tertarik dengan solusi hotel lock system. Mohon informasi lebih lanjut.',
    lock: 'Halo, saya ingin konsultasi mengenai hotel lock system untuk hotel kami.',
    keycard: 'Halo, saya ingin memesan keycard hotel RFID. Mohon info harga dan MOQ.',
    contact: 'Halo, saya ingin request penawaran resmi hotel lock system dan keycard.'
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

      gridItems.forEach(function(item) {
        if (filterValue === '*' || item.classList.contains(filterValue.replace('.', ''))) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initProductFilter();
});
