const SyncHashtag = (() => {
    // ponytail: read workbook from file once, reuse across detect/parse/preview
    function readWorkbook(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    resolve(XLSX.read(e.target.result, { type: 'array' }));
                } catch (err) {
                    reject('Gagal membaca file: ' + err.message);
                }
            };
            reader.onerror = () => reject('Gagal membaca file');
            reader.readAsArrayBuffer(file);
        });
    }

    function detectSheets(workbook) {
        const results = [];
        const sheetNames = workbook.SheetNames || [];
        for (const name of sheetNames) {
            const ws = workbook.Sheets[name];
            if (!ws) continue;
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (!rows.length) continue;
            // scan rows 0-9 for header row (some sheets have headers mid-sheet)
            const { idx: headerIdx } = findHeaderRow(rows);
            if (headerIdx < 0) continue;
            const headers = rows[headerIdx].map(h => String(h || '').trim().toLowerCase());
            const dataRows = rows.slice(headerIdx + 1).filter(r => r && r[0] && r[2]);
            results.push({ name, headers: rows[headerIdx], headerIdx, rowCount: dataRows.length });
        }
        // ponytail: rightmost sheet = most updated (user convention)
        results.sort((a, b) => sheetNames.indexOf(b.name) - sheetNames.indexOf(a.name));
        return results;
    }

    function findHeaderRow(rows) {
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const h = (rows[i] || []).map(c => String(c || '').trim().toLowerCase());
            const hasGroup = h.some(c => c.includes('assigned group') || c === 'group');
            const hasKip = h.some(c => c.includes('kip') || c.includes('experience'));
            const hasHashtag = h.some(c => c.includes('hashtag') || c.includes('hastag'));
            if (hasGroup && hasKip && hasHashtag) return { idx: i, headers: rows[i] };
        }
        return { idx: -1, headers: [] };
    }

    function parseSheet(workbook, sheetName) {
        const ws = workbook.Sheets[sheetName];
        if (!ws) return [];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const { idx: headerIdx } = findHeaderRow(rows);
        if (headerIdx < 0) return [];
        const data = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || !r[2]) continue;
            const group = String(r[0] || '').trim();
            const kip = String(r[1] || '').trim();
            const hashtag = String(r[2] || '').trim();
            if (!group || !kip || !hashtag) continue;
            data.push({ group, kip, hashtag });
        }
        return data;
    }

    function previewSheet(workbook, sheetName, limit = 10) {
        const ws = workbook.Sheets[sheetName];
        if (!ws) return { headers: [], rows: [] };
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (!rows.length) return { headers: [], rows: [] };
        const { idx: headerIdx, headers } = findHeaderRow(rows);
        if (headerIdx < 0) return { headers: [], rows: [] };
        return {
            headers,
            rows: rows.slice(headerIdx + 1, headerIdx + 1 + limit).map(r => ({
                group: String(r[0] || '').trim(),
                kip: String(r[1] || '').trim(),
                hashtag: String(r[2] || '').trim()
            }))
        };
    }

    // Legacy: parse file with named sheet (backward compat)
    function parseExcel(file) {
        return new Promise((resolve, reject) => {
            readWorkbook(file).then(wb => {
                const ws = wb.Sheets['IMPORT'];
                if (!ws) {
                    reject('Sheet "IMPORT" tidak ditemukan. Buat sheet dengan nama IMPORT di file Excel.');
                    return;
                }
                resolve(parseSheet(wb, 'IMPORT'));
            }).catch(reject);
        });
    }

    function diff(currentData, newData) {
        const currentMap = new Map(currentData.map(d => [d.hashtag, d]));
        const newMap = new Map(newData.map(d => [d.hashtag, d]));
        const added = [], modified = [], unchanged = [], deleted = [];
        for (const [tag, item] of newMap) {
            const existing = currentMap.get(tag);
            if (!existing) {
                added.push(item);
            } else if (existing.group !== item.group || existing.kip !== item.kip) {
                modified.push({ old: existing, new: item });
            } else {
                unchanged.push(existing);
            }
        }
        for (const [tag, item] of currentMap) {
            if (!newMap.has(tag)) deleted.push(item);
        }
        return { added, modified, deleted, unchanged };
    }

    function applyChanges(data, diffResult, selections) {
        const result = data.filter(d => !selections.deleted.has(d.hashtag));
        for (const m of selections.modified) {
            const idx = result.findIndex(d => d.hashtag === m.new.hashtag);
            if (idx >= 0) {
                result[idx] = m.new;
            }
        }
        for (const item of selections.added) {
            if (result.every(d => d.hashtag !== item.hashtag)) {
                result.push(item);
            }
        }
        result.sort((a, b) => a.hashtag.localeCompare(b.hashtag));
        return result;
    }

    function generateDataJs(data) {
        const entries = data.map(d =>
            `    { group: ${JSON.stringify(d.group)}, kip: ${JSON.stringify(d.kip)}, hashtag: ${JSON.stringify(d.hashtag)}, skala: 0 }`
        ).join(',\n');
        return `const ESCALATION_DATA = [\n${entries}\n];\n`;
    }

    function exportToExcel(data) {
        const ws = XLSX.utils.json_to_sheet(
            data.map(d => ({
                'Assigned Group': d.group,
                'KIP / Experience': d.kip,
                'Hashtag': d.hashtag
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hashtag');
        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `hashtag-export-${today}.xlsx`);
    }

    return { readWorkbook, detectSheets, parseSheet, previewSheet, parseExcel, diff, applyChanges, generateDataJs, exportToExcel };
})();
