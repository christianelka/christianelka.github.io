/* ====================================================================
 * PAUD Style Guide v2 - Narasi ringkas natural guru TK
 * ------------------------------------------------------------------------
 * Setelah komparasi dengan output Gemini, styleguide direvisi:
 *  - Hapus daftar indikator panjang (terlalu AI-feel)
 *  - Kurangi repetisi nama siswa
 *  - Variasi diksi, tidak monoton "sangat X"
 *  - Tampilkan nama alat Montessori apa adanya jika ingin disebut,
 *    max 1-2 indikator saja (dipilih otomatis dari BSB/BSH)
 * ====================================================================== */

(function () {
  'use strict';

  const STYLE_GUIDE = {

    /* ====================================================================
     * AREA 1: NILAI AGAMA DAN BUDI PEKERTI
     * ================================================================== */
    nilaiAgama: {
      meta: {
        label: 'Nilai Agama dan Budi Pekerti',
        labelEN: 'Religious Values and Conduct',
        template: 'nilaiAgama',
      },

      phrases: {
        BSB: [
          'menunjukkan perkembangan yang sangat membanggakan',
          'sangat aktif dan konsisten dalam kegiatan ibadah, pembiasaan rohani, dan bina diri',
          'menjadi teladan dalam perilaku baik, ketaatan kepada guru, dan kasih sayang kepada teman',
          'sangat baik dalam merawat alam dan lingkungan sebagai bentuk rasa syukur',
          'sangat menghayati nilai-nilai kebaikan dalam kehidupan sehari-hari di sekolah',
          'menunjukkan kemandirian luar biasa dalam menjaga kebersihan dan kesehatan diri',
          'mempraktikkan perilaku Kristiani dengan penuh sukacita dan rasa tanggung jawab',
          'selalu berdoa dengan tertib, taat, dan penuh rasa syukur',
          'sangat bertanggung jawab dalam menjaga kebersihan kelas dan lingkungan sekitar',
          'menunjukkan karakter religius yang kuat dan menjadi contoh bagi teman-temannya',
        ],
        BSH: [
          'mulai mampu mengikuti kegiatan ibadah dan pembiasaan rohani dengan baik',
          'mampu melakukan bina diri secara mandiri meski sesekali masih perlu bantuan guru',
          'menunjukkan perilaku yang baik kepada guru dan teman seperti berbagi dan mengikuti arahan',
          'mulai memahami pentingnya menjaga dan merawat lingkungan sekitar',
          'cukup taat dalam mengikuti aturan kelas dan pembiasaan rohani',
          'mulai mempraktikkan perilaku baik dengan sesekali pengingat',
          'menunjukkan perkembangan positif dalam memahami nilai-nilai kebaikan',
          'mulai konsisten menjaga kebersihan diri dan lingkungan',
          'dapat berdoa dengan tertib meski masih perlu pendampingan',
          'menunjukkan sikap menyayangi teman dan guru dengan baik',
        ],
        MB: [
          'mulai menunjukkan perkembangan dalam mengikuti kegiatan ibadah di sekolah',
          'masih memerlukan pendampingan dalam kegiatan bina diri secara mandiri',
          'mulai memahami perilaku baik meskipun masih perlu diingatkan',
          'mulai mengenali pentingnya menjaga kebersihan diri',
          'masih dalam tahap pengenalan nilai-nilai keagamaan dan karakter Kristiani',
          'mulai berani berdoa sederhana dengan bantuan guru',
          'menunjukkan minat untuk berperilaku baik meski belum konsisten',
          'masih perlu bimbingan dalam merawat lingkungan sekitar',
          'mulai mengenali sikap taat kepada guru dan teman',
          'menunjukkan usaha berperilaku sopan meski masih perlu motivasi',
        ],
        BB: [
          'masih memerlukan stimulus intensif dalam pengenalan kegiatan ibadah',
          'akan terus dilatih bersama dalam pembentukan kebiasaan bina diri',
          'perlu bimbingan berkelanjutan untuk mempraktikkan perilaku baik',
          'akan mendapatkan stimulasi rutin dalam pengenalan kebersihan dan kesehatan diri',
          'masih memerlukan pendampingan penuh dalam memahami nilai keagamaan',
          'akan dirangsang bertahap untuk berani berdoa dan berpartisipasi',
          'perlu dukungan konsisten dalam membentuk sikap taat dan sayang kepada orang lain',
          'akan diperkenalkan perlahan pada konsep merawat lingkungan',
          'masih memerlukan pendekatan individual untuk membangun kebiasaan positif',
          'akan mendapatkan perhatian khusus dari guru dalam pembentukan karakter',
        ],
      },

      closings: [
        'Terus bersinar dalam kebaikan, {name}!',
        'Tetap semangat menjaga hati yang penuh kasih, {name}!',
        'Kami bangga dengan karakter baik {name} yang semakin bertumbuh.',
        'Semoga {name} semakin dekat dengan nilai-nilai kebaikan setiap hari.',
        'Teruslah menjadi berkat bagi sesama, {name}!',
      ],
    },

    /* ====================================================================
     * AREA 2: JATI DIRI
     * ================================================================== */
    jatiDiri: {
      meta: {
        label: 'Jati Diri',
        labelEN: 'Identity Self',
        template: 'jatiDiri',
      },

      phrases: {
        BSB: [
          'sangat baik dalam mengekspresikan emosi dengan cara yang positif',
          'sangat mudah bergaul, bermain berdampingan, dan menerima ajakan teman dengan sukacita',
          'memiliki rasa percaya diri yang tinggi dalam memilih aktivitas dan mencoba hal baru',
          'sangat mandiri dalam memahami dan mengikuti aturan kelas',
          'sangat aktif dan tangkas dalam kegiatan motorik kasar',
          'sangat terampil dalam kegiatan motorik halus seperti menggunting, menulis, dan menuang',
          'sangat bertanggung jawab dalam membereskan mainan dan peralatan belajar',
          'sangat mampu mengenali dan mengelola emosi dengan baik',
          'sangat bangga atas hasil karyanya dan sering menunjukkan inisiatif positif',
          'sangat adaptif terhadap lingkungan baru dan aturan kelas',
        ],
        BSH: [
          'mampu mengekspresikan emosi dengan baik dalam berbagai situasi',
          'dapat bermain berdampingan dan menerima ajakan bermain dari teman',
          'mulai menunjukkan percaya diri saat memilih aktivitas yang diminatinya',
          'mampu mengikuti instruksi sederhana dari guru dengan baik',
          'aktif dalam kegiatan motorik kasar seperti berlari dan melompat',
          'terampil dalam kegiatan motorik halus seperti menuang dan menempel',
          'mau membereskan mainan dan peralatan setelah digunakan',
          'mulai mengenali serta mengelola emosi sederhana',
          'mulai menunjukkan rasa bangga atas hasil karyanya',
          'mampu menyesuaikan diri dengan aturan kelas dan norma yang berlaku',
        ],
        MB: [
          'mulai mengenali berbagai bentuk emosi meski masih perlu bimbingan',
          'mulai berani bermain berdampingan dengan motivasi dari guru',
          'mulai menunjukkan kepercayaan diri pada aktivitas tertentu saja',
          'mulai memahami instruksi sederhana dengan pengulangan',
          'mulai aktif dalam kegiatan motorik kasar dengan pendampingan',
          'masih perlu latihan dalam kegiatan motorik halus',
          'mulai mau membereskan mainan dengan pengingat',
          'mulai belajar mengelola emosi saat menghadapi situasi baru',
          'mulai menunjukkan rasa bangga ketika karyanya diapresiasi',
          'mulai menyesuaikan diri dengan lingkungan kelas',
        ],
        BB: [
          'masih memerlukan pendampingan intensif dalam mengenali dan mengekspresikan emosi',
          'akan terus distimulasi untuk berani bermain dan berinteraksi',
          'masih mengembangkan kepercayaan diri di lingkungan sekolah',
          'masih dalam proses mengenali instruksi sederhana',
          'masih perlu dukungan lebih dalam kegiatan motorik kasar',
          'akan terus dilatih keterampilan motorik halusnya secara bertahap',
          'memerlukan bimbingan berulang untuk peduli terhadap kerapian',
          'perlu pendekatan individual untuk belajar mengelola emosi',
          'sedang dalam proses mengenali rasa bangga dari karyanya',
          'memerlukan waktu dan pendampingan untuk beradaptasi',
        ],
      },

      closings: [
        'Tetap semangat menjadi diri terbaikmu, {name}!',
        'Kami percaya {name} akan terus berkembang dengan percaya diri.',
        'Teruslah berani mencoba hal baru, {name}!',
        'Kami bangga dengan keberanian {name} dalam belajar.',
        'Semoga {name} semakin percaya diri setiap harinya.',
      ],
    },

    /* ====================================================================
     * AREA 3: LITERASI & STEAM (+ Bahasa Mandarin)
     * ================================================================== */
    literasiSteam: {
      meta: {
        label: 'Dasar-Dasar Literasi, Sains, Teknologi, Rekayasa, Seni, dan Matematika',
        labelEN: 'Basics of Literacy and STEAM',
        template: 'literasiSteam',
      },

      phrases: {
        BSB: [
          'sangat antusias mendengarkan cerita dan mampu menceritakan kembali dengan sangat baik',
          'sangat tertarik pada buku, pengenalan bunyi huruf, dan kegiatan literasi lainnya',
          'sangat cerdas dalam menyebutkan urutan bilangan dan memahami konsep korespondensi',
          'sangat baik dalam mengenali bentuk geometri sederhana dan pola berulang',
          'sangat aktif mengeksplorasi lingkungan sekitar dengan rasa ingin tahu yang tinggi',
          'sangat percaya diri dalam mengomunikasikan karya seni kepada orang lain',
          'sangat terampil menggunakan teknologi sederhana sehari-hari sesuai fungsinya',
          'sangat mahir menuangkan ide dan perasaan melalui berbagai media seni',
          'sangat baik dalam mengenal konsep waktu dan membandingkan benda berdasarkan atribut',
          'sangat responsif dalam berdiskusi dan menyampaikan ide-ide kreatif',
        ],
        BSH: [
          'antusias mendengarkan cerita dan mulai mampu memberikan komentar sederhana',
          'mulai menunjukkan ketertarikan terhadap buku dan pengenalan bunyi huruf',
          'mampu menyebutkan urutan bilangan dengan baik',
          'mulai mengenali bentuk geometri sederhana dua dimensi',
          'aktif melakukan eksplorasi lingkungan sekitar dengan bimbingan',
          'mulai berani mengomunikasikan karya seni kepada orang lain',
          'mulai menggunakan teknologi sederhana sesuai fungsinya',
          'mampu menuangkan pikiran dan perasaan dalam bentuk coretan sederhana',
          'mulai mengenal konsep siang-malam dan pola berulang',
          'mulai berani menyampaikan ide-ide melalui berbagai media',
        ],
        MB: [
          'mulai menunjukkan minat terhadap cerita meski perlu motivasi',
          'mulai mengenal bunyi huruf dengan bantuan guru',
          'mulai berlatih menyebutkan urutan bilangan dengan bimbingan',
          'mulai mengenali bentuk geometri dasar dengan pengulangan',
          'mulai melakukan eksplorasi lingkungan dengan rangsangan guru',
          'mulai berani menunjukkan karya seninya dengan dukungan guru',
          'mulai mengenal fungsi teknologi sederhana dengan pendampingan',
          'mulai menuangkan perasaan dalam coretan dengan bantuan',
          'mulai diperkenalkan pada konsep waktu dan pola',
          'mulai berani menyampaikan ide dengan dorongan guru',
        ],
        BB: [
          'masih memerlukan stimulasi berkelanjutan untuk tertarik pada kegiatan membaca',
          'masih dalam tahap pengenalan bunyi huruf dan simbol',
          'masih berlatih pengenalan bilangan dengan pendekatan konkret',
          'masih diperkenalkan pada bentuk-bentuk geometri dasar',
          'masih perlu motivasi untuk mengeksplorasi lingkungan',
          'masih dalam proses berani menunjukkan hasil karya',
          'masih diperkenalkan pada teknologi sederhana dengan bimbingan',
          'masih mengeksplorasi media seni dengan pendampingan penuh',
          'masih diperkenalkan pada konsep dasar waktu dan pola',
          'masih memerlukan rangsangan untuk berani menyampaikan ide',
        ],
      },

      overrides: {
        mandarin: {
          BSB: 'Dalam kegiatan Bahasa Mandarin, ia sangat antusias dan percaya diri — mampu menirukan kosakata serta bernyanyi dengan pengucapan yang baik',
          BSH: 'Dalam kegiatan Bahasa Mandarin, ia mulai berani menirukan kosakata sederhana dan bernyanyi dengan bimbingan guru',
          MB: 'Dalam kegiatan Bahasa Mandarin, ia masih memerlukan bimbingan lebih lanjut untuk menirukan pengucapan kosakata',
          BB: 'Dalam kegiatan Bahasa Mandarin, ia akan mendapatkan stimulasi intensif, terutama pada pelafalan kosakata dan nyanyian sederhana',
        },
      },

      closings: [
        'Teruslah rajin mengeksplorasi, {name}!',
        'Kami bangga dengan rasa ingin tahu {name} yang luar biasa.',
        'Semoga {name} semakin mencintai belajar setiap hari.',
        'Tetap semangat belajar dan bereksplorasi, {name}!',
        'Teruslah berkreasi dan menemukan hal-hal baru, {name}!',
      ],
    },
  };

  /* ====================================================================
   * TEMPLATE v2 — ringkas, tanpa daftar indikator
   * ================================================================== */
  const TEMPLATES = {
    nilaiAgama: {
      open: 'Pada elemen Capaian Pembelajaran {label} di Semester II ini, {name} menunjukkan kemampuan {value}.',
      achv: ' {pronoun} {achv}.',
      gap: ' Hal yang masih perlu dikembangkan adalah kemampuan {gapText}.',
      closing: ' {closing}',
    },
    jatiDiri: {
      open: 'Di Semester II ini, kemampuan {name} pada elemen Capaian Pembelajaran {label} {value}.',
      achv: ' {pronoun} {achv}.',
      gap: ' {pronoun} masih perlu pendampingan pada {gapText}.',
      closing: ' {closing}',
    },
    literasiSteam: {
      open: 'Pada elemen Capaian Pembelajaran Literasi dan STEAM di Semester II ini, {name} menunjukkan kemampuan {value}.',
      achv: ' {pronoun} {achv}.',
      mandarin: ' {mandarinAchv}.',
      gap: ' Beberapa hal yang masih perlu ditingkatkan adalah kemampuan {gapText}.',
      closing: ' {closing}',
    },
  };

  const VALUE_LABELS = {
    BSB: 'Berkembang Sangat Baik (BSB)',
    BSH: 'Berkembang Sesuai Harapan (BSH)',
    MB: 'Mulai Berkembang (MB)',
    BB: 'Belum Berkembang (BB)',
  };

  const GAP_GENERIC_BY_AREA = {
    nilaiAgama: {
      MB: 'menjalankan ibadah secara mandiri dan mempraktikkan perilaku baik secara konsisten',
      BB: 'mengenali kegiatan ibadah, menjalankan bina diri, dan mempraktikkan perilaku baik sehari-hari',
    },
    jatiDiri: {
      MB: 'mengelola emosi, bermain bersama teman, dan mencoba hal-hal baru dengan lebih percaya diri',
      BB: 'mengenali emosi, berani berinteraksi, dan mengikuti aturan kelas dengan lebih mandiri',
    },
    literasiSteam: {
      MB: 'melanjutkan kegiatan literasi, berhitung, dan eksplorasi lingkungan dengan bimbingan',
      BB: 'mengenalan kegiatan membaca, berhitung sederhana, dan berpartisipasi dalam eksplorasi kelas',
    },
  };

  window.PAUD_STYLE_GUIDE = STYLE_GUIDE;
  window.PAUD_TEMPLATES = TEMPLATES;
  window.PAUD_VALUE_LABELS = VALUE_LABELS;
  window.PAUD_GAP_GENERIC = GAP_GENERIC_BY_AREA;
})();
