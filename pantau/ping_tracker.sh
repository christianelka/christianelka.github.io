#!/bin/sh
# ping_tracker.sh - Monitor network stability and log drops with GPS location
# Compatible with Android Termux environment
# Usage: nohup sh ping_tracker.sh &

# ============================================
# Configuration
# ============================================
PING_TARGET="8.8.8.8"
PING_TIMEOUT=2
PING_COUNT=1
SLEEP_INTERVAL=1
LOG_FILE="ping_drops.txt"

# ============================================
# Get current timestamp in YYYY-MM-DD HH:MM:SS format
# ============================================
get_timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# ============================================
# Fetch GPS location from termux-location
# Returns: Google Maps URL or error message
# ============================================
get_location() {
    # Check if termux-location is available
    if ! command -v termux-location >/dev/null 2>&1; then
        echo "TERMUX_LOCATION_MISSING"
        return 1
    fi

    # Fetch last known location (fast, non-blocking)
    # -r last prevents hanging while moving
    location_json=$(termux-location -r last 2>/dev/null)

    # Check if we got valid JSON
    if [ -z "$location_json" ]; then
        echo "GPS_FAILED"
        return 1
    fi

    # Parse latitude and longitude using jq
    latitude=$(echo "$location_json" | jq -r '.latitude' 2>/dev/null)
    longitude=$(echo "$location_json" | jq -r '.longitude' 2>/dev/null)

    # Check if coordinates are valid (not null or empty)
    if [ -z "$latitude" ] || [ -z "$longitude" ] || \
       [ "$latitude" = "null" ] || [ "$longitude" = "null" ]; then
        echo "GPS_FAILED"
        return 1
    fi

    # Return Google Maps URL
    echo "https://maps.google.com/?q=${latitude},${longitude}"
    return 0
}

# ============================================
# Log ping drop event with location
# ============================================
log_drop() {
    timestamp=$(get_timestamp)
    location_result=$(get_location)
    location_status=$?

    case "$location_result" in
        "TERMUX_LOCATION_MISSING")
            echo "[${timestamp}] PING DROP! Lokasi: termux-location tidak terinstall. Install dengan: pkg install termux-api" >> "$LOG_FILE"
            ;;
        "GPS_FAILED")
            echo "[${timestamp}] PING DROP! Lokasi: Gagal mengunci GPS (Sinyal Lemah)" >> "$LOG_FILE"
            ;;
        *)
            echo "[${timestamp}] PING DROP! Lokasi: ${location_result}" >> "$LOG_FILE"
            ;;
    esac
}

# ============================================
# Main loop
# ============================================
echo "Starting ping tracker..."
echo "Target: ${PING_TARGET}"
echo "Log file: ${LOG_FILE}"
echo "Press Ctrl+C to stop"
echo ""

while true; do
    # Send 1 ping packet, suppress all output
    # -c 1: send 1 packet
    # -W 2: timeout after 2 seconds
    ping -c "$PING_COUNT" -W "$PING_TIMEOUT" "$PING_TARGET" >/dev/null 2>&1

    # Check exit code: non-zero means packet lost
    if [ $? -ne 0 ]; then
        log_drop
        echo "[$(get_timestamp)] Drop detected - logged"
    fi

    # Wait before next ping
    sleep "$SLEEP_INTERVAL"
done
