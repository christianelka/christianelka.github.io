const SyncHashtag = (() => {
    function parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const wb = XLSX.read(e.target.result, { type: 'array' });
                    const ws = wb.Sheets['IMPORT'];
                    if (!ws) {
                        reject('Sheet "IMPORT" tidak ditemukan. Buat sheet dengan nama IMPORT di file Excel.');
                        return;
                    }
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    const data = [];
                    for (let i = 1; i < rows.length; i++) {
                        const r = rows[i];
                        if (!r || !r[2]) continue;
                        const group = String(r[0] || '').trim();
                        const kip = String(r[1] || '').trim();
                        const hashtag = String(r[2] || '').trim().toLowerCase();
                        if (!group || !kip || !hashtag) continue;
                        data.push({ group, kip, hashtag });
                    }
                    resolve(data);
                } catch (err) {
                    reject('Gagal membaca file: ' + err.message);
                }
            };
            reader.onerror = () => reject('Gagal membaca file');
            reader.readAsArrayBuffer(file);
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

    return { parseExcel, diff, applyChanges, generateDataJs, exportToExcel };
})();
