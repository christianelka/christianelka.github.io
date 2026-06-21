/* Sample data - 5 siswa fiktif untuk demonstrasi.
 * TIDAK data riil. Indikator generic agar aman untuk testing. */

(function () {
  'use strict';

  const SAMPLE_STUDENTS = [
    {
      name: 'Adi',
      achievements: {
        nilaiAgama: [
          { indicator: 'Berdoa sebelum dan sesudah kegiatan', value: 'BSB' },
          { indicator: 'Mengenal kebiasaan baik sehari-hari', value: 'BSH' },
          { indicator: 'Menunjukkan sikap menyayangi teman', value: 'BSB' }
        ],
        jatiDiri: [
          { indicator: 'Mengekspresikan emosi dengan cara yang tepat', value: 'BSB' },
          { indicator: 'Bermain bersama teman', value: 'BSH' },
          { indicator: 'Mengikuti aturan kelas', value: 'BSB' }
        ],
        literasiSteam: [
          { indicator: 'Menyebutkan bilangan 1-10', value: 'BSB' },
          { indicator: 'Mengenal huruf vokal', value: 'BSH' },
          { indicator: 'Mendengarkan cerita dengan penuh perhatian', value: 'BSB' }
        ]
      }
    },
    {
      name: 'Bella',
      achievements: {
        nilaiAgama: [
          { indicator: 'Berdoa sebelum dan sesudah kegiatan', value: 'BSB' },
          { indicator: 'Mengenal kebiasaan baik sehari-hari', value: 'BSB' },
          { indicator: 'Menunjukkan sikap menyayangi teman', value: 'BSB' }
        ],
        jatiDiri: [
          { indicator: 'Mengekspresikan emosi dengan cara yang tepat', value: 'BSB' },
          { indicator: 'Bermain bersama teman', value: 'BSB' },
          { indicator: 'Mengikuti aturan kelas', value: 'BSB' }
        ],
        literasiSteam: [
          { indicator: 'Menyebutkan bilangan 1-10', value: 'BSB' },
          { indicator: 'Mengenal huruf vokal', value: 'BSB' },
          { indicator: 'Mendengarkan cerita dengan penuh perhatian', value: 'BSB' }
        ]
      }
    },
    {
      name: 'Citra',
      achievements: {
        nilaiAgama: [
          { indicator: 'Berdoa sebelum dan sesudah kegiatan', value: 'BSH' },
          { indicator: 'Mengenal kebiasaan baik sehari-hari', value: 'BSH' },
          { indicator: 'Menunjukkan sikap menyayangi teman', value: 'BSH' }
        ],
        jatiDiri: [
          { indicator: 'Mengekspresikan emosi dengan cara yang tepat', value: 'BSH' },
          { indicator: 'Bermain bersama teman', value: 'BSH' },
          { indicator: 'Mengikuti aturan kelas', value: 'BSH' }
        ],
        literasiSteam: [
          { indicator: 'Menyebutkan bilangan 1-10', value: 'BSH' },
          { indicator: 'Mengenal huruf vokal', value: 'BSH' },
          { indicator: 'Mendengarkan cerita dengan penuh perhatian', value: 'BSB' }
        ]
      }
    },
    {
      name: 'Dimas',
      achievements: {
        nilaiAgama: [
          { indicator: 'Berdoa sebelum dan sesudah kegiatan', value: 'BSB' },
          { indicator: 'Mengenal kebiasaan baik sehari-hari', value: 'BSH' },
          { indicator: 'Menunjukkan sikap menyayangi teman', value: 'MB' }
        ],
        jatiDiri: [
          { indicator: 'Mengekspresikan emosi dengan cara yang tepat', value: 'BSH' },
          { indicator: 'Bermain bersama teman', value: 'BSH' },
          { indicator: 'Mengikuti aturan kelas', value: 'BSB' }
        ],
        literasiSteam: [
          { indicator: 'Menyebutkan bilangan 1-10', value: 'BSH' },
          { indicator: 'Mengenal huruf vokal', value: 'MB' },
          { indicator: 'Mendengarkan cerita dengan penuh perhatian', value: 'BSH' }
        ]
      }
    },
    {
      name: 'Eka',
      achievements: {
        nilaiAgama: [
          { indicator: 'Berdoa sebelum dan sesudah kegiatan', value: 'BSB' },
          { indicator: 'Mengenal kebiasaan baik sehari-hari', value: 'BSB' },
          { indicator: 'Menunjukkan sikap menyayangi teman', value: 'BSB' }
        ],
        jatiDiri: [
          { indicator: 'Mengekspresikan emosi dengan cara yang tepat', value: 'BSB' },
          { indicator: 'Bermain bersama teman', value: 'BSB' },
          { indicator: 'Mengikuti aturan kelas', value: 'BSH' }
        ],
        literasiSteam: [
          { indicator: 'Menyebutkan bilangan 1-10', value: 'BSB' },
          { indicator: 'Mengenal huruf vokal', value: 'BSB' },
          { indicator: 'Mendengarkan cerita dengan penuh perhatian', value: 'BSH' }
        ]
      }
    }
  ];

  window.PAUD_SAMPLE_STUDENTS = SAMPLE_STUDENTS;
})();
