(function () {
	'use strict';

	function bomFormat(n) {
		return n.toLocaleString('id-ID');
	}

	function bomState() {
		var rooms = parseInt(document.getElementById('bom-rooms').value, 10);
		var ratio = parseFloat(document.getElementById('bom-card-ratio').value);
		var coverage = parseFloat(document.getElementById('bom-switch-coverage').value) / 100;
		var encoders = parseInt(document.getElementById('bom-encoders').value, 10);
		var buffer = parseFloat(document.getElementById('bom-spare').value) / 100;

		return {
			rooms: rooms,
			ratio: ratio,
			encoders: encoders,
			bufferPct: buffer,
			coveragePct: Math.round(coverage * 100),
			cards: Math.round(rooms * ratio),
			switches: Math.round(rooms * coverage),
			spare: Math.round(rooms * buffer)
		};
	}

	function bomRows(s) {
		return [
			{ label: 'Smart lock unit pintu', qty: s.rooms, note: '1 unit per kamar' },
			{ label: 'Mortise + reader module', qty: s.rooms, note: '1 set per unit pintu' },
			{ label: 'RFID keycard custom printing', qty: s.cards, note: 'Rasio ' + s.ratio + ':1 dari jumlah kamar' },
			{ label: 'USB card encoder resepsionis', qty: s.encoders, note: 'Per workstation front desk' },
			{ label: 'Sakelar hemat energi', qty: s.switches, note: 'Untuk kamar tamu' },
			{ label: 'Spare lock unit', qty: s.spare, note: 'Buffer ' + Math.round(s.bufferPct * 100) + '% dari unit pintu' }
		];
	}

	function bomRender() {
		var s = bomState();
		var rows = bomRows(s);
		var tbody = document.getElementById('bom-tbody');
		var totalEl = document.getElementById('bom-total');
		var total = 0;

		tbody.innerHTML = '';
		rows.forEach(function (r) {
			total += r.qty;
			var tr = document.createElement('tr');
			var name = document.createElement('td');
			name.innerHTML = r.label + '<br><span style="font-weight:400;color:#64748b;font-size:12.5px;">' + r.note + '</span>';
			var qty = document.createElement('td');
			qty.className = 'hl-bom-qty';
			qty.textContent = bomFormat(r.qty);
			tr.appendChild(name);
			tr.appendChild(qty);
			tbody.appendChild(tr);
		});

		totalEl.textContent = bomFormat(total) + ' unit';
		document.getElementById('bom-rooms-out').textContent = bomFormat(s.rooms);

		var msg = 'Halo, saya butuh estimasi paket sistem hotel lock untuk proyek berikut:\n\n' +
			'Jumlah kamar: ' + s.rooms + '\n' +
			'Rasio keycard: ' + s.ratio + ':1\n' +
			'Sakelar hemat energi: ' + s.switches + ' unit (' + s.coveragePct + '% dari kamar tamu)\n' +
			'Encoder resepsionis: ' + s.encoders + ' set\n' +
			'Spare lock unit: ' + s.spare + '\n\n' +
			'Rincian komponen:\n' +
			rows.map(function (r) { return '- ' + r.label + ': ' + bomFormat(r.qty) + ' (' + r.note + ')'; }).join('\n') +
			'\n\nTotal unit: ' + bomFormat(total) + '\n\nMohon informasi harga, lead time, dan garansi. Terima kasih.';

		var link = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(msg);
		document.getElementById('bom-wa').href = link;
	}

	document.addEventListener('DOMContentLoaded', function () {
		if (!document.getElementById('bom-rooms')) return;
		['bom-rooms', 'bom-card-ratio', 'bom-switch-coverage', 'bom-encoders', 'bom-spare'].forEach(function (id) {
			var el = document.getElementById(id);
			el.addEventListener('input', bomRender);
			el.addEventListener('change', bomRender);
			// nice-select memicu change via jQuery .trigger() yang tidak sampai ke listener native
			if (window.jQuery) window.jQuery(el).on('change', bomRender);
		});
		bomRender();
	});
})();