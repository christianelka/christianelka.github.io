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
  var roomCount     = rfqGetValue('rfq-roomCount');
  var doorType      = rfqGetValue('rfq-doorType');
  var lockModel     = rfqGetValue('rfq-lockModel');
  var message       = rfqGetValue('rfq-message');
  var services      = [];
  document.querySelectorAll('input[name="rfq-services"]:checked').forEach(function (el) {
    services.push(el.value);
  });

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
  } else if (!rfqValidatePhone(phone)) {
    rfqShowError('rfq-phone', 'Nomor tidak valid. Gunakan format 08xx, +62, atau 628xx (10-14 digit).');
    valid = false;
  }
  if (!roomCount || isNaN(Number(roomCount)) || Number(roomCount) < 1) {
    rfqShowError('rfq-roomCount', 'Jumlah kamar wajib diisi angka valid.');
    valid = false;
  }

  if (!valid) return false;

  var lines = [
    '--- PERMINTAAN PENAWARAN APEBE ---',
    '',
    'Hotel: ' + hotelName,
    'Kontak: ' + contactPerson,
    'Telepon: ' + phone,
    'Email: ' + (email || '-'),
    '',
    'KEBUTUHAN LOCK SYSTEM:',
    'Jumlah Kamar: ' + roomCount,
    'Material Pintu: ' + (doorType || 'Belum Ditentukan'),
    'Model Lock: ' + (lockModel || '-'),
    'Layanan Tambahan: ' + (services.length ? services.join(', ') : '-'),
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
    'roomCount', 'doorType', 'lockModel', 'message'
  ];

  fields.forEach(function(name) {
    var val = rfqGetValue('rfq-' + name);
    var target = fallback.querySelector('[name="' + name + '"]');
    if (target) target.value = val;
  });

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
    home: 'Halo APEBE, saya tertarik dengan hotel lock system. Mohon informasi lebih lanjut.',
    lock: 'Halo APEBE, saya ingin konsultasi mengenai hotel lock untuk hotel kami.',
    contact: 'Halo APEBE, saya ingin request penawaran resmi hotel lock system.'
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
