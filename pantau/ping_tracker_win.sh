#!/bin/bash
# ping_tracker_win.sh - Windows-compatible ping tracker
# Usage: bash ping_tracker_win.sh

PING_TARGET="8.8.8.8"
LOG_FILE="ping_drops_win.txt"

get_timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

echo "Starting ping tracker (Windows mode)..."
echo "Target: ${PING_TARGET}"
echo "Log file: ${LOG_FILE}"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    # Windows ping: -n 1 = 1 packet, -w 2000 = 2000ms timeout
    ping -n 1 -w 2000 "$PING_TARGET" >/dev/null 2>&1

    if [ $? -ne 0 ]; then
        timestamp=$(get_timestamp)
        echo "[${timestamp}] PING DROP!" >> "$LOG_FILE"
        echo "[$(get_timestamp)] Drop detected - logged"
    fi

    sleep 1
done
