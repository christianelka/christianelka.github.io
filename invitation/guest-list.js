// guest-list.js — Editable whitelist of invited guests.
//
// HOW TO ADD A NEW GUEST
//   1. Generate a token (any random 16+ chars, e.g. crypto.randomUUID().replace(/-/g, ''))
//   2. Add the guest's name, pax, group, and token to the list below
//   3. Send the guest this link:
//        https://yourdomain.com/invitation/undangan_X.html?to=NAME&token=TOKEN
//      The token (NOT the name) is the source of truth — the URL ?to= is
//      display-only and can be safely ignored by the page.
//
// HOW THE GUARD WORKS
//   guest-guard.js loads after this file. It:
//     1. Reads ?token= from the URL
//     2. Looks it up in window.GUEST_LIST
//     3. If valid → sets window.__INVITED_GUEST__ = { token, name, pax, group, note }
//        → page renders normally with guest's name + pax limit
//     4. If invalid → overlays a "tidak terdaftar" gate; cover never opens;
//        forms are blocked at capture phase
//     5. window.GuestQR.payload() returns token-encoded string for QR tickets,
//        so venue can verify QR against this same registry.
//
// MODE TOGGLE (preview vs production)
//   Default = OPEN (no guard) — perfect for preview/demo/presentasi.
//   Set GUEST_CONFIG.production = true to enable token validation.
//   Preview bypass (?preview=1, ?dev=1) works in BOTH modes for demo.

window.GUEST_CONFIG = {
  // ===== PRODUCTION MODE =====
  // Set this to `true` ONLY when going live with real guests.
  // Until then, leave it `false` (or undefined) so the site stays open for preview.
  // Also: enable "prefers-reduced-motion" check, remove "MODE PREVIEW" banner source, etc.
  production: false
};

window.GUEST_LIST = {
  // ===== COUPLE =====
  "g1h2i3j4k5l6m7n8": { name: "Galih Pratama",     pax: 1, group: "Mempelai Pria",   note: "Pengantin pria" },
  "s1e2k3a4r5w6u7l8": { name: "Sekar Wulandari",   pax: 1, group: "Mempelai Wanita", note: "Pengantin wanita" },

  // ===== KELUARGA INTI =====
  "h1a2r3y4o5p6r7m8": { name: "Bapak Haryo Pramudyo",     pax: 1, group: "Keluarga Mempelai Pria" },
  "r1e2t3n4o5w6u7l8": { name: "Ibu Retno Wulandari",      pax: 1, group: "Keluarga Mempelai Pria" },
  "h1e2n3d4r5a6k7u8": { name: "Bapak Dr. Hendra Kusuma",  pax: 1, group: "Keluarga Mempelai Wanita" },
  "m1a2h3a4r5a6n7i8": { name: "Ibu Dra. Maharani",        pax: 1, group: "Keluarga Mempelai Wanita" },

  // ===== KELUARGA BESAR =====
  "kb1p2r3a4m5u6d7y": { name: "Keluarga Besar Pramudyo",  pax: 2, group: "Keluarga" },
  "kb1w2u3l4a5n6d7r": { name: "Keluarga Besar Wulandari",  pax: 2, group: "Keluarga" },
  "kb1k2u3s4u5m6a7n": { name: "Keluarga Besar Kusuma",     pax: 2, group: "Keluarga" },

  // ===== SAHABAT =====
  "sh1a2n3d4i5s6a7p": { name: "Andi Saputra",   pax: 2, group: "Sahabat" },
  "sh1b2u3d4i5s6a7n": { name: "Budi Santoso",   pax: 2, group: "Sahabat" },
  "sh1c2i3c4i5w6j7a": { name: "Cici Wijaya",    pax: 1, group: "Sahabat" },
  "sh1d2e3d4i5k6r7n": { name: "Dedi Kurniawan", pax: 2, group: "Sahabat" },
  "sh1e2v3a4m5a6r7l": { name: "Eva Marlina",    pax: 1, group: "Sahabat" },
  "sh1r2i3o4h5a6r7t": { name: "Rio Hartono",    pax: 2, group: "Sahabat" },
  "sh1s2a3s4h5a6p7r": { name: "Sasha Putri",    pax: 1, group: "Sahabat" },
  "sh1t2i3o4a5n6g7r": { name: "Tio Anggara",    pax: 2, group: "Sahabat" },

  // ===== KANTOR =====
  "of1r2e3z4a5s6a7p": { name: "Reza Saputra",     pax: 1, group: "Kantor" },
  "of1m2a3y4a5s6a7r": { name: "Maya Sari",        pax: 1, group: "Kantor" },
  "of1d2i3m4a5s6a7p": { name: "Dimas Prasetyo",   pax: 1, group: "Kantor" },

  // ===== TETANGGA =====
  "nb1s2u3t4r5i6s7n": { name: "Pak RT Sutrisno",   pax: 2, group: "Tetangga" },
  "nb1a2m3i4n5a6h7a": { name: "Ibu RT Aminah",     pax: 2, group: "Tetangga" }
};
