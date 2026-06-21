/* ====================================================================
 * xlsx Parser - Konversi REKAP RAPOR xlsx ke student JSON array
 * --------------------------------------------------------------------
 * Sheet "REKAP" layout (empiris dari file asli):
 *   R4:  header — col 0 = "KOMPETENSI", col 1..N = student names
 *   R5+: section header (NILAI AGAMA, JATI DIRI, LITERASI, dst)
 *   Row indicator:  col 0 = judul indikator, col 1+ = skor numerik
 *                   (1=BB, 2=MB, 3=BSH, 4=BSB)
 *   Row "Hasil Pengamatan/Penilaian": col 0 = label, col 1+ = avg
 *   Row kategori:   col 0 = kosong, col 1+ = "BSB"/"BSH"/"MB"/"BB"
 *
 * Yang kita PARSE hanya row kategori (sumber nilai final per indikator
 * per siswa). Indikator label kita ambil dari row SEBELUM row kategori
 * (yang berisi "Hasil Pengamatan" atau baris indikator terakhir dalam
 *  sub-section).
 * ================================================================== */

(function () {
  'use strict';

  /* === Regex deteksi section header di xlsx REKAP === */
  const SECTION_HEADERS = {
    nilaiAgama: /NILAI AGAMA|Nilai Agama/i,
    jatiDiri: /JATI DIRI|Jati Diri/i,
    literasiSteam: /LITERASI|STEAM|Literasi/i,
  };

  const VALID_VALUES = ['BSB', 'BSH', 'MB', 'BB'];
  const VALUE_SET = new Set(VALID_VALUES);

  /* === Deteksi row kategori: col 0 kosong, col 1+ = BSB/BSH/MB/BB === */
  function isCategoryRow(row) {
    if (!row || row.length < 2) return false;
    const c0 = String(row[0] || '').trim();
    if (c0 !== '') return false;
    let count = 0;
    for (let i = 1; i < row.length; i++) {
      if (VALUE_SET.has(String(row[i] || '').trim())) count++;
    }
    return count >= 1;
  }

  /* === Deteksi row label (col 0 non-kosong, bukan header) === */
  function getIndicatorLabel(row) {
    if (!row) return null;
    const c0 = String(row[0] || '').trim();
    if (!c0) return null;
    if (/^KOMPETENSI$/i.test(c0)) return null;
    if (/^NILAI AGAMA/i.test(c0)) return null;
    if (/^JATI DIRI/i.test(c0)) return null;
    if (/^LITERASI|^STEAM/i.test(c0)) return null;
    if (/^ANAK |^AGAMA DAN|^DASAR-DASAR/i.test(c0)) return null;
    if (/^Hasil Pengamatan/i.test(c0)) return null;
    if (c0.length < 4) return null;
    return c0;
  }

  /* === Deteksi section mana row ini berada === */
  function detectSection(label) {
    for (const key of Object.keys(SECTION_HEADERS)) {
      if (SECTION_HEADERS[key].test(label)) return key;
    }
    return null;
  }

  /* === Parser utama: workbook (parsed by SheetJS) → students array === */
  function parseRekapWorkbook(workbook) {
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { ok: false, error: 'Workbook kosong.' };
    }
    const sheetName = workbook.SheetNames.find((n) => /rekap/i.test(n)) || workbook.SheetNames[0];
    const ws = workbook.Sheets[sheetName];
    if (!ws) return { ok: false, error: 'Sheet tidak ditemukan: ' + sheetName };

    const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
    if (rows.length < 5) return { ok: false, error: 'Sheet REKAP tidak memiliki data yang cukup.' };

    /* === Cari header siswa (R4-style: col 0 = "KOMPETENSI") === */
    let headerRowIdx = -1;
    let studentNames = [];
    for (let r = 0; r < Math.min(20, rows.length); r++) {
      const row = rows[r] || [];
      const c0 = String(row[0] || '').trim();
      if (/^KOMPETENSI$/i.test(c0) && row.length > 1) {
        headerRowIdx = r;
        studentNames = row.slice(1).map((c) => String(c || '').trim()).filter(Boolean);
        break;
      }
    }
    if (headerRowIdx < 0 || studentNames.length === 0) {
      return { ok: false, error: 'Header siswa tidak ditemukan. Pastikan baris 4 berisi "KOMPETENSI | Nama1 | Nama2 | ...".' };
    }

    /* === Inisialisasi struktur per siswa === */
    const students = studentNames.map((name) => ({
      name,
      achievements: { nilaiAgama: [], jatiDiri: [], literasiSteam: [] },
    }));

    /* === Walk rows, track current section, kumpulkan indikator === */
    let currentSection = null;
    let lastIndicatorLabel = null;
    const stats = { totalRows: 0, categoryRows: 0, mappedIndicators: 0, skipped: 0 };

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      stats.totalRows++;
      const c0 = String(row[0] || '').trim();

      /* Update section jika ada header baru */
      const newSection = detectSection(c0);
      if (newSection) {
        currentSection = newSection;
        lastIndicatorLabel = null;
        continue;
      }

      if (!currentSection) continue;

      /* Track last indicator label (skip sub-section group headers) */
      const label = getIndicatorLabel(row);
      if (label) {
        lastIndicatorLabel = label;
        continue;
      }

      /* Row kategori BSB/BSH/MB/BB → map per siswa */
      if (isCategoryRow(row)) {
        stats.categoryRows++;
        if (!lastIndicatorLabel) {
          stats.skipped++;
          continue;
        }
        for (let s = 0; s < studentNames.length; s++) {
          const cellVal = String(row[s + 1] || '').trim();
          if (VALUE_SET.has(cellVal)) {
            students[s].achievements[currentSection].push({
              indicator: lastIndicatorLabel,
              value: cellVal,
            });
            stats.mappedIndicators++;
          }
        }
      }
    }

    if (stats.mappedIndicators === 0) {
      return {
        ok: false,
        error: 'Tidak ada indikator yang berhasil di-parse. Pastikan format REKAP sesuai (lihat sample).',
      };
    }

    return { ok: true, students, sheetName, stats };
  }

  /* === Wrapper: terima File object (dari <input type="file">) === */
  function parseRekapFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('File kosong.'));
      if (!window.XLSX) return reject(new Error('Library XLSX belum dimuat. Periksa koneksi CDN.'));
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = window.XLSX.read(data, { type: 'array' });
          resolve(parseRekapWorkbook(wb));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsArrayBuffer(file);
    });
  }

  window.PAUD_XLSX = { parseRekapFile, parseRekapWorkbook };
})();
