import XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

export function loadFile(filePath) {
  const ext = filePath.toLowerCase().split('.').pop();

  if (ext === 'xlsx' || ext === 'xls') {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    return XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
  }

  if (ext === 'csv') {
    const content = readFileSync(filePath, 'latin1');
    return parse(content, { columns: true, skip_empty_lines: true, trim: true });
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

export function cleanSLA(rawData) {
  const headers = Object.keys(rawData[0] || {});

  const incidentKey = headers.find(h => h.includes('Incident ID'));
  const svTitleKey = headers.find(h => h.includes('SVTTitle'));
  const elapsedKey = headers.find(h => h.includes('OverallElapsedTime'));
  const startTimeKey = headers.find(h => h.includes('OverallStartTime'));
  const stopTimeKey = headers.find(h => h.includes('OverallStopTime'));
  const olaResponseKey = headers.find(h => h.includes('OLA Response') || h.includes('MeasurementStatus'));
  const submitDateKey = headers.find(h => h.includes('Submit Date'));

  const keepKeys = [incidentKey, svTitleKey, elapsedKey, startTimeKey, stopTimeKey, submitDateKey].filter(Boolean);

  let cleaned = rawData.map(row => {
    const newRow = {};
    for (const k of keepKeys) {
      newRow[k] = row[k];
    }
    return newRow;
  });

  if (svTitleKey) {
    cleaned = cleaned.filter(row =>
      row[svTitleKey] === 'SC3 - IT OLA Response - 0010'
    );
  }

  if (elapsedKey) {
    cleaned.sort((a, b) => {
      const va = parseFloat(a[elapsedKey]) || 0;
      const vb = parseFloat(b[elapsedKey]) || 0;
      return va - vb;
    });
  }

  return cleaned;
}

export function mergeData(reportData, slaData) {
  const reportHeaders = Object.keys(reportData[0] || {});
  const slaHeaders = Object.keys(slaData[0] || {});

  const reportIncidentKey = reportHeaders.find(h => h.includes('Incident ID'));
  const slaIncidentKey = slaHeaders.find(h => h.includes('Incident ID'));

  const slaElapsedKey = slaHeaders.find(h => h.includes('OverallElapsedTime'));

  const slaMap = new Map();
  for (const row of slaData) {
    const key = row[slaIncidentKey];
    if (key != null) {
      slaMap.set(String(key), {
        elapsed: row[slaElapsedKey]
      });
    }
  }

  return reportData.map(row => {
    const match = slaMap.get(String(row[reportIncidentKey]));
    return {
      ...row,
      'OLA Response': match ? (parseFloat(match.elapsed) <= 600 ? 'Met' : 'Missed') : null
    };
  });
}

export function aggregateCancelled(data, agentNiks) {
  const hashtagKey = findKey(data, 'ticket hashtag');
  const userKey = findKey(data, 'status history.cancelled.user');

  if (!hashtagKey || !userKey) return { data: [], agents: agentNiks };

  const filtered = data.filter(row => {
    const val = row[userKey];
    return val && agentNiks.includes(String(val).trim());
  });

  const result = pivotCount(filtered, hashtagKey, userKey);

  const activeAgents = [...new Set(filtered.map(r => String(r[userKey]).trim()))].filter(Boolean);

  return { data: result, agents: activeAgents };
}

export function aggregateResolved(data, agentNiks) {
  const hashtagKey = findKey(data, 'ticket hashtag');
  const userKey = findKey(data, 'status history.resolved.user');

  if (!hashtagKey || !userKey) return { data: [], agents: agentNiks };

  const filtered = data.filter(row => {
    const val = row[userKey];
    return val && agentNiks.includes(String(val).trim());
  });

  const result = pivotCount(filtered, hashtagKey, userKey);

  const activeAgents = [...new Set(filtered.map(r => String(r[userKey]).trim()))].filter(Boolean);

  return { data: result, agents: activeAgents };
}

export function aggregateInprogress(data, agentNiks) {
  const userKey = findKey(data, 'status history.in progress.user');

  if (!userKey) return [];

  const filtered = data.filter(row => {
    const val = row[userKey];
    return val && agentNiks.includes(String(val).trim());
  });

  const counts = {};
  for (const row of filtered) {
    const val = String(row[userKey]).trim();
    counts[val] = (counts[val] || 0) + 1;
  }

  return agentNiks.map(nik => ({
    [userKey]: nik,
    count: counts[nik] || 0
  })).filter(item => item.count > 0).sort((a, b) => Number(a[userKey]) - Number(b[userKey]));
}

export function aggregateAssigned(data, agentNiks) {
  const userKey = findKey(data, 'status history.assigned.user');

  if (!userKey) return [];

  const filtered = data.filter(row => {
    const val = row[userKey];
    return val && agentNiks.includes(String(val).trim());
  });

  const counts = {};
  for (const row of filtered) {
    const val = String(row[userKey]).trim();
    counts[val] = (counts[val] || 0) + 1;
  }

  return agentNiks.map(nik => ({
    [userKey]: nik,
    count: counts[nik] || 0
  })).filter(item => item.count > 0).sort((a, b) => Number(a[userKey]) - Number(b[userKey]));
}

export function aggregateOlaResponse(data) {
  const dateKey = findKey(data, 'submit date');
  const olaKey = findKey(data, 'ola response');

  if (!dateKey || !olaKey) return { date: null, data: [] };

  const hourGroups = {};
  let reportDate = null;

  for (const row of data) {
    const dateStr = row[dateKey];
    if (!dateStr) continue;

    let date;
    if (dateStr instanceof Date) {
      date = dateStr;
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) continue;

    if (!reportDate) {
      reportDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const hourKey = `${hours} ${ampm}`;

    if (!hourGroups[hourKey]) {
      hourGroups[hourKey] = {};
    }

    const olaValue = row[olaKey] || '#N/A';
    hourGroups[hourKey][olaValue] = (hourGroups[hourKey][olaValue] || 0) + 1;
  }

  const hourOrder = [];
  for (let h = 1; h <= 12; h++) {
    hourOrder.push(`${h} AM`);
  }
  for (let h = 1; h <= 12; h++) {
    hourOrder.push(`${h} PM`);
  }

  const result = [];
  for (const hourKey of hourOrder) {
    if (hourGroups[hourKey]) {
      const rowData = { 'Row Labels': hourKey };
      let total = 0;
      for (const [olaValue, count] of Object.entries(hourGroups[hourKey])) {
        rowData[olaValue] = count;
        total += count;
      }
      rowData._total = total;
      result.push(rowData);
    }
  }

  return { date: reportDate, data: result };
}

export function aggregateTopCategories(data, limit = 5) {
  const tier1Key = findKey(data, 'operational categorization tier 1');
  const tier2Key = findKey(data, 'operational categorization tier 2');

  if (!tier1Key || !tier2Key) return [];

  const grouped = {};
  for (const row of data) {
    const t1 = row[tier1Key] || 'Unknown';
    const t2 = row[tier2Key] || 'Unknown';

    if (!grouped[t1]) {
      grouped[t1] = { total: 0, children: {} };
    }
    grouped[t1].total += 1;
    grouped[t1].children[t2] = (grouped[t1].children[t2] || 0) + 1;
  }

  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit);

  const result = [];
  for (const [t1, info] of sorted) {
    result.push({ category: t1, count: info.total, isParent: true });

    const sortedChildren = Object.entries(info.children)
      .sort((a, b) => b[1] - a[1]);

    for (const [t2, count] of sortedChildren) {
      result.push({ category: t2, count, isParent: false });
    }
  }

  return result;
}

function findKey(data, target) {
  if (!data.length) return null;
  const keys = Object.keys(data[0]);
  const targetLower = target.toLowerCase();
  return keys.find(k => k.toLowerCase().includes(targetLower)) || null;
}

function pivotCount(data, rowKey, colKey) {
  const result = {};
  for (const row of data) {
    const rVal = row[rowKey] || 'Unknown';
    const cVal = row[colKey] || 'Unknown';
    if (!result[rVal]) result[rVal] = {};
    result[rVal][cVal] = (result[rVal][cVal] || 0) + 1;
  }

  const rows = [];
  for (const [rowVal, cols] of Object.entries(result)) {
    const rowData = { [rowKey]: rowVal };
    let total = 0;
    for (const [colVal, count] of Object.entries(cols)) {
      rowData[colVal] = count;
      total += count;
    }
    rowData._total = total;
    rows.push(rowData);
  }

  return rows.sort((a, b) => b._total - a._total);
}
