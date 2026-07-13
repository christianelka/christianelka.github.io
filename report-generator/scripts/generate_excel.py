import json
import sys
import csv
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side
from datetime import datetime

HEADER_FILL = PatternFill(start_color="B8CCE4", end_color="B8CCE4", fill_type="solid")
HEADER_FONT = Font(bold=True)
THIN_BORDER = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)
BOLD_FONT = Font(bold=True)

def sc(ws, r, c, v, font=None, fill=None, border=None):
    cell = ws.cell(row=r, column=c, value=v)
    if font: cell.font = font
    if fill: cell.fill = fill
    if border: cell.border = border
    return cell

def auto_fit(ws):
    for col in ws.columns:
        ml = 0
        cl = None
        for cell in col:
            try:
                if hasattr(cell, 'column_letter'): cl = cell.column_letter
                if cell.value: ml = max(ml, len(str(cell.value)))
            except: pass
        if cl: ws.column_dimensions[cl].width = min(ml + 2, 50)

def write_raw_data(ws, data, title=None):
    if not data or len(data) == 0:
        return
    
    headers = list(data[0].keys())
    
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.border = THIN_BORDER
    
    for row_idx, row_data in enumerate(data, 2):
        for col_idx, header in enumerate(headers, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=row_data.get(header, ''))
            cell.border = THIN_BORDER
    
    auto_fit(ws)

def create_report(data, output_path, report_date, agents=None):
    wb = Workbook()

    ws_pivot = wb.active
    ws_pivot.title = "Pivot Table"

    ws_report = wb.create_sheet("Report (66) - Used")
    raw_report = data.get('rawReport', [])
    if raw_report:
        write_raw_data(ws_report, raw_report)

    ws_ola = wb.create_sheet("OLA Response")
    raw_sla = data.get('rawSLA', [])
    if raw_sla:
        write_raw_data(ws_ola, raw_sla)

    ws = ws_pivot
    row = 1

    cancelled = data.get('cancelled', [])
    if cancelled and len(cancelled) > 0:
        sc(ws, row, 2, "Cancelled", font=Font(bold=True, size=12))
        row += 1

        all_keys = [k for k in cancelled[0].keys() if k != '_total']
        
        row_key = None
        agent_cols = []
        for k in all_keys:
            val = cancelled[0].get(k)
            if isinstance(val, str) and not val.isdigit():
                row_key = k
            else:
                agent_cols.append(k)
        
        if not row_key and all_keys:
            row_key = all_keys[0]
            agent_cols = all_keys[1:]

        sc(ws, row, 2, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, row, 3, "Column Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        row += 1

        sc(ws, row, 2, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        col = 3
        for agent in agent_cols:
            sc(ws, row, col, agent, font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
            col += 1
        sc(ws, row, col, "Grand Total", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        for rd in cancelled:
            row += 1
            sc(ws, row, 2, rd.get(row_key, ''), border=THIN_BORDER)
            col = 3
            for agent in agent_cols:
                val = rd.get(agent, '')
                sc(ws, row, col, val if val != 0 else '', border=THIN_BORDER)
                col += 1
            sc(ws, row, col, rd.get('_total', ''), border=THIN_BORDER, font=BOLD_FONT)

        row += 1
        sc(ws, row, 2, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        col = 3
        for agent in agent_cols:
            total = sum(rd.get(agent, 0) for rd in cancelled if isinstance(rd.get(agent), (int, float)))
            sc(ws, row, col, total if total != 0 else '', font=BOLD_FONT, border=THIN_BORDER)
            col += 1
        sc(ws, row, col, sum(rd.get('_total', 0) for rd in cancelled), font=BOLD_FONT, border=THIN_BORDER)

        row += 2

    resolved = data.get('resolved', [])
    if resolved and len(resolved) > 0:
        sc(ws, row, 2, "Resolved", font=Font(bold=True, size=12))
        row += 1

        all_keys = [k for k in resolved[0].keys() if k != '_total']
        
        row_key = None
        agent_cols = []
        for k in all_keys:
            val = resolved[0].get(k)
            if isinstance(val, str) and not val.isdigit():
                row_key = k
            else:
                agent_cols.append(k)
        
        if not row_key and all_keys:
            row_key = all_keys[0]
            agent_cols = all_keys[1:]

        sc(ws, row, 2, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, row, 3, "Column Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        row += 1

        sc(ws, row, 2, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        col = 3
        for agent in agent_cols:
            sc(ws, row, col, agent, font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
            col += 1
        sc(ws, row, col, "Grand Total", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        for rd in resolved:
            row += 1
            sc(ws, row, 2, rd.get(row_key, ''), border=THIN_BORDER)
            col = 3
            for agent in agent_cols:
                val = rd.get(agent, '')
                sc(ws, row, col, val if val != 0 else '', border=THIN_BORDER)
                col += 1
            sc(ws, row, col, rd.get('_total', ''), border=THIN_BORDER, font=BOLD_FONT)

        row += 1
        sc(ws, row, 2, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        col = 3
        for agent in agent_cols:
            total = sum(rd.get(agent, 0) for rd in resolved if isinstance(rd.get(agent), (int, float)))
            sc(ws, row, col, total if total != 0 else '', font=BOLD_FONT, border=THIN_BORDER)
            col += 1
        sc(ws, row, col, sum(rd.get('_total', 0) for rd in resolved), font=BOLD_FONT, border=THIN_BORDER)

        row += 2

    ola = data.get('olaResponse', [])
    ola_date = data.get('olaDate', report_date)
    if ola:
        ola_row = 1
        sc(ws, ola_row, 6, "OLA Response", font=Font(bold=True, size=12))
        ola_row += 1

        sc(ws, ola_row, 6, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, ola_row, 7, "Column Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        ola_row += 1

        sc(ws, ola_row, 6, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        ola_col_order = ['Met', 'Missed', '#N/A', '(blank)']
        all_ola_cols = set()
        for rd in ola:
            for k in rd.keys():
                if k not in ['Row Labels', '_total']:
                    all_ola_cols.add(k)

        ola_val_cols = [c for c in ola_col_order if c in all_ola_cols]
        for c in sorted(all_ola_cols):
            if c not in ola_val_cols:
                ola_val_cols.append(c)

        col = 7
        for col_name in ola_val_cols:
            sc(ws, ola_row, col, col_name, font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
            col += 1
        sc(ws, ola_row, col, "Grand Total", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        ola_row += 1
        sc(ws, ola_row, 6, f"<{ola_date}", font=Font(italic=True), border=THIN_BORDER)

        for rd in ola:
            ola_row += 1
            sc(ws, ola_row, 6, rd.get('Row Labels', ''), border=THIN_BORDER)
            col = 7
            for col_name in ola_val_cols:
                val = rd.get(col_name, '')
                sc(ws, ola_row, col, val if val != 0 else '', border=THIN_BORDER)
                col += 1
            sc(ws, ola_row, col, rd.get('_total', ''), border=THIN_BORDER, font=BOLD_FONT)

        ola_row += 1
        sc(ws, ola_row, 6, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        col = 7
        for col_name in ola_val_cols:
            total = sum(rd.get(col_name, 0) for rd in ola if isinstance(rd.get(col_name), (int, float)))
            sc(ws, ola_row, col, total if total != 0 else '', font=BOLD_FONT, border=THIN_BORDER)
            col += 1
        sc(ws, ola_row, col, sum(rd.get('_total', 0) for rd in ola), font=BOLD_FONT, border=THIN_BORDER)

    inprogress = data.get('inprogress', [])
    if inprogress:
        ip_row = row
        sc(ws, ip_row, 2, "Inprogress", font=Font(bold=True, size=12))
        ip_row += 1
        sc(ws, ip_row, 2, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, ip_row, 3, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        uk = list(inprogress[0].keys())[0]
        for rd in inprogress:
            ip_row += 1
            sc(ws, ip_row, 2, rd.get(uk, ''), border=THIN_BORDER)
            sc(ws, ip_row, 3, rd.get('count', ''), border=THIN_BORDER)

        ip_row += 1
        sc(ws, ip_row, 2, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        sc(ws, ip_row, 3, sum(rd.get('count', 0) for rd in inprogress), font=BOLD_FONT, border=THIN_BORDER)

        row = ip_row + 2

    assigned = data.get('assigned', [])
    if assigned:
        ar_row = row
        sc(ws, ar_row, 2, "Assigned", font=Font(bold=True, size=12))
        ar_row += 1
        sc(ws, ar_row, 2, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, ar_row, 3, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        uk = list(assigned[0].keys())[0]
        for rd in assigned:
            ar_row += 1
            sc(ws, ar_row, 2, rd.get(uk, ''), border=THIN_BORDER)
            sc(ws, ar_row, 3, rd.get('count', ''), border=THIN_BORDER)

        ar_row += 1
        sc(ws, ar_row, 2, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        sc(ws, ar_row, 3, sum(rd.get('count', 0) for rd in assigned), font=BOLD_FONT, border=THIN_BORDER)

        row = ar_row + 2

    if agents and len(agents) > 0:
        ag_row = 14 if row <= 14 else row
        sc(ws, ag_row, 6, "Agent", font=Font(bold=True, size=12))
        ag_row += 1
        sc(ws, ag_row, 6, "Domain", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, ag_row, 7, "Nama", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        for a in agents:
            ag_row += 1
            sc(ws, ag_row, 6, a.get('nik', ''), border=THIN_BORDER)
            sc(ws, ag_row, 7, a.get('name', ''), border=THIN_BORDER)

    top5 = data.get('topCategories', [])
    if top5:
        sc(ws, 1, 12, "TOP 5", font=Font(bold=True, size=12))
        sc(ws, 2, 12, "Row Labels", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)
        sc(ws, 2, 13, "Count of Incident ID*+", font=HEADER_FONT, fill=HEADER_FILL, border=THIN_BORDER)

        r = 2
        for rd in top5:
            r += 1
            if rd.get('isParent'):
                sc(ws, r, 12, rd.get('category', ''), border=THIN_BORDER, font=BOLD_FONT)
            else:
                sc(ws, r, 12, f"  {rd.get('category', '')}", border=THIN_BORDER)
            sc(ws, r, 13, rd.get('count', ''), border=THIN_BORDER)

        r += 1
        sc(ws, r, 12, "Grand Total", font=BOLD_FONT, border=THIN_BORDER)
        parent_total = sum(rd.get('count', 0) for rd in top5 if rd.get('isParent'))
        sc(ws, r, 13, parent_total, font=BOLD_FONT, border=THIN_BORDER)

    auto_fit(ws)
    wb.save(output_path)

    csv_path = output_path.replace('.xlsx', '.csv')
    generate_csv(data, csv_path, agents)

    return output_path

def generate_csv(data, csv_path, agents=None):
    rows = []

    cancelled = data.get('cancelled', [])
    if cancelled and len(cancelled) > 0:
        all_keys = [k for k in cancelled[0].keys() if k != '_total']
        
        row_key = None
        agent_cols = []
        for k in all_keys:
            val = cancelled[0].get(k)
            if isinstance(val, str) and not val.isdigit():
                row_key = k
            else:
                agent_cols.append(k)
        
        if not row_key and all_keys:
            row_key = all_keys[0]
            agent_cols = all_keys[1:]

        rows.append(["", "Cancelled"])
        rows.append(["", "Count of Incident ID*+", "Column Labels"])
        rows.append(["", "Row Labels"] + agent_cols + ["Grand Total"])
        for rd in cancelled:
            rows.append(["", rd.get(row_key, '')] + [rd.get(a, '') for a in agent_cols] + [rd.get('_total', '')])
        totals = ["", "Grand Total"]
        for a in agent_cols:
            t = sum(rd.get(a, 0) for rd in cancelled if isinstance(rd.get(a), (int, float)))
            totals.append(t)
        totals.append(sum(rd.get('_total', 0) for rd in cancelled))
        rows.append(totals)
        rows.append([])

    resolved = data.get('resolved', [])
    if resolved and len(resolved) > 0:
        all_keys = [k for k in resolved[0].keys() if k != '_total']
        
        row_key = None
        agent_cols = []
        for k in all_keys:
            val = resolved[0].get(k)
            if isinstance(val, str) and not val.isdigit():
                row_key = k
            else:
                agent_cols.append(k)
        
        if not row_key and all_keys:
            row_key = all_keys[0]
            agent_cols = all_keys[1:]

        rows.append(["", "Resolved"])
        rows.append(["", "Count of Incident ID*+", "Column Labels"])
        rows.append(["", "Row Labels"] + agent_cols + ["Grand Total"])
        for rd in resolved:
            rows.append(["", rd.get(row_key, '')] + [rd.get(a, '') for a in agent_cols] + [rd.get('_total', '')])
        totals = ["", "Grand Total"]
        for a in agent_cols:
            t = sum(rd.get(a, 0) for rd in resolved if isinstance(rd.get(a), (int, float)))
            totals.append(t)
        totals.append(sum(rd.get('_total', 0) for rd in resolved))
        rows.append(totals)
        rows.append([])

    ola = data.get('olaResponse', [])
    ola_date = data.get('olaDate', '')
    if ola:
        ola_col_order = ['Met', 'Missed', '#N/A', '(blank)']
        all_ola_cols = set()
        for rd in ola:
            for k in rd.keys():
                if k not in ['Row Labels', '_total']:
                    all_ola_cols.add(k)
        ola_val_cols = [c for c in ola_col_order if c in all_ola_cols]
        for c in sorted(all_ola_cols):
            if c not in ola_val_cols:
                ola_val_cols.append(c)

        rows.append(["", "", "", "", "", "OLA Response"])
        rows.append(["", "", "", "", "", "Count of Incident ID*+", "Column Labels"] + ola_val_cols + ["Grand Total"])
        rows.append(["", "", "", "", "", f"<{ola_date}"])
        for rd in ola:
            rows.append(["", "", "", "", "", rd.get('Row Labels', '')] + [rd.get(v, '') for v in ola_val_cols] + [rd.get('_total', '')])
        totals = ["", "", "", "", "", "Grand Total", ""]
        for v in ola_val_cols:
            t = sum(rd.get(v, 0) for rd in ola if isinstance(rd.get(v), (int, float)))
            totals.append(t)
        totals.append(sum(rd.get('_total', 0) for rd in ola))
        rows.append(totals)
        rows.append([])

    inprogress = data.get('inprogress', [])
    if inprogress:
        uk = list(inprogress[0].keys())[0]
        rows.append(["", "Inprogress"])
        rows.append(["", "Row Labels", "Count of Incident ID*+"])
        for rd in inprogress:
            rows.append(["", rd.get(uk, ''), rd.get('count', '')])
        rows.append(["", "Grand Total", sum(rd.get('count', 0) for rd in inprogress)])
        rows.append([])

    assigned = data.get('assigned', [])
    if assigned:
        uk = list(assigned[0].keys())[0]
        rows.append(["", "Assigned"])
        rows.append(["", "Row Labels", "Count of Incident ID*+"])
        for rd in assigned:
            rows.append(["", rd.get(uk, ''), rd.get('count', '')])
        rows.append(["", "Grand Total", sum(rd.get('count', 0) for rd in assigned)])
        rows.append([])

    if agents:
        rows.append(["", "", "", "", "", "Agent"])
        rows.append(["", "", "", "", "", "Domain", "Nama"])
        for a in agents:
            rows.append(["", "", "", "", "", a.get('nik', ''), a.get('name', '')])
        rows.append([])

    top5 = data.get('topCategories', [])
    if top5:
        rows.append(["", "", "", "", "", "", "", "", "", "", "", "TOP 5"])
        rows.append(["", "", "", "", "", "", "", "", "", "", "", "Row Labels", "Count of Incident ID*+"])
        for rd in top5:
            if rd.get('isParent'):
                rows.append(["", "", "", "", "", "", "", "", "", "", "", rd.get('category', ''), rd.get('count', '')])
            else:
                rows.append(["", "", "", "", "", "", "", "", "", "", "", f"  {rd.get('category', '')}", rd.get('count', '')])
        parent_total = sum(rd.get('count', 0) for rd in top5 if rd.get('isParent'))
        rows.append(["", "", "", "", "", "", "", "", "", "", "", "Grand Total", parent_total])

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for row in rows:
            writer.writerow(row)

    return csv_path

if __name__ == "__main__":
    input_json = sys.stdin.read()
    params = json.loads(input_json)

    data = params.get('data', {})
    output_path = params.get('outputPath', 'report.xlsx')
    report_date = params.get('reportDate', datetime.now().strftime('%Y-%m-%d'))
    agents = params.get('agents', [])

    result = create_report(data, output_path, report_date, agents)
    print(json.dumps({"success": True, "filePath": result}))
