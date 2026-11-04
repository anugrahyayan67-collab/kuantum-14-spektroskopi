// Naskah narasi "Satu Molekul, Tiga Tarian" — Kimia Kuantum pertemuan 14: Spektroskopi Molekul.
// Setiap adegan berisi baris narasi. Durasi baris dihitung otomatis dari jumlah
// suku kata (lihat timeline.ts) atau dari rekaman suara bila sudah ada,
// jadi cukup ubah teks di sini: visual, subtitle, dan musik ikut menyesuaikan.
//
// Aturan menulis teks narasi (dibaca mesin TTS):
//  - angka & simbol ditulis sebagai kata ("dua puluh meter per detik"),
//  - rumus ditulis sebagai kalimat; rumus rapi tampil di layar (komponen Formula).
// Angka & term sudah dicek di naskah/AUDIT.md (Atkins, Levine, CRC, NIST CCCBDB).
//
// hl     : kata/frasa yang disorot pada subtitle
// pause  : jeda (detik) SETELAH baris dibacakan
// lead   : jeda (detik) sebelum baris pertama adegan
// tail   : jeda (detik) setelah baris terakhir adegan
// fixed  : durasi tetap (detik) untuk adegan tanpa narasi

export type Line = {
  text: string;
  /** Teks khusus TTS (opsional). Bila kosong, dibuat otomatis oleh src/tts.ts. */
  tts?: string;
  hl?: string[];
  pause?: number;
};

export type SceneScript = {
  id: string;
  chapter: string; // nomor bab di heading, "" untuk tanpa heading
  part?: 1 | 2 | 3; // 1 prinsip & teori dasar, 2 implementasi dalam kimia, 3 penerapan
  title: string;
  lines: Line[];
  lead?: number;
  tail?: number;
  fixed?: number;
  mood: 'mystery' | 'title' | 'wonder' | 'build' | 'quantum' | 'tension' | 'bright' | 'resolve' | 'outro';
};

export const SCRIPT: SceneScript[] = [
  {
    "id": "hook",
    "chapter": "",
    "title": "Membaca planet yang jauh",
    "mood": "mystery",
    "lead": 1.6,
    "tail": 1.2,
    "lines": [
      {
        "text": "Sekitar tujuh ratus tahun cahaya dari Bumi, sebuah planet raksasa melintas di depan bintangnya.",
        "hl": [
          "tujuh ratus tahun cahaya"
        ],
        "pause": 0.7
      },
      {
        "text": "Cahaya bintang menembus atmosfer planet itu, dan sebagian warnanya hilang.",
        "hl": [
          "sebagian warnanya hilang"
        ],
        "pause": 0.7
      },
      {
        "text": "Dari celah-celah gelap itu, teleskop James Webb membaca: di sana ada karbon dioksida dan uap air.",
        "hl": [
          "karbon dioksida dan uap air"
        ],
        "pause": 0.7
      },
      {
        "text": "Tanpa pernah ke sana. Hanya dengan membaca cahaya yang diserap molekul.",
        "hl": [
          "membaca cahaya"
        ],
        "pause": 0.9
      },
      {
        "text": "Setiap molekul menari dengan tiga cara: bergerak, berputar, dan bergetar. Dan setiap tarian punya warnanya sendiri.",
        "hl": [
          "tiga cara"
        ],
        "pause": 1.0
      }
    ]
  },
  {
    "id": "title",
    "chapter": "",
    "title": "Satu Molekul, Tiga Tarian",
    "mood": "title",
    "fixed": 7,
    "lines": []
  },
  {
    "id": "roadmap",
    "chapter": "",
    "title": "Peta video",
    "mood": "wonder",
    "lead": 0.8,
    "tail": 1.4,
    "lines": [
      {
        "text": "Perjalanan kita punya tiga bagian.",
        "pause": 0.6
      },
      {
        "text": "Pertama, prinsip dasar: tangga energi tiap gerak, populasi Boltzmann, dan aturan seleksi.",
        "hl": [
          "prinsip dasar"
        ],
        "pause": 0.7,
        "tts": "Pertama, prinsip dasar: tangga energi tiap gerak, populasi Bolsman, dan aturan seleksi."
      },
      {
        "text": "Kedua, implementasi dalam kimia: spektrum rotasi, spektrum vibrasi-rotasi, Raman, dan spektrum elektronik.",
        "hl": [
          "implementasi dalam kimia"
        ],
        "pause": 0.7
      },
      {
        "text": "Ketiga, penerapan: alat uji napas, astronomi radio, dan atmosfer planet lain.",
        "hl": [
          "penerapan"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "ladders",
    "chapter": "01",
    "title": "Empat tangga energi",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Molekul menyimpan energi dalam beberapa cara, dan semuanya terkuantisasi.",
        "hl": [
          "terkuantisasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Translasi: bergerak dari tempat ke tempat. Di ruang bebas tingkatnya sangat rapat, hampir kontinu, seperti partikel dalam kotak yang sangat besar.",
        "hl": [
          "Translasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Rotasi: berputar. Celah antartingkat sekitar seperseribu elektronvolt, cocok dengan gelombang mikro.",
        "hl": [
          "gelombang mikro"
        ],
        "pause": 0.7
      },
      {
        "text": "Vibrasi: bergetar. Celahnya sekitar sepersepuluh elektronvolt, cocok dengan inframerah.",
        "hl": [
          "inframerah"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektronik: elektron melompat antarorbital. Celahnya beberapa elektronvolt, cocok dengan cahaya tampak dan ultraviolet.",
        "hl": [
          "beberapa elektronvolt"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "ruler",
    "chapter": "02",
    "title": "Spektrum sebagai penggaris",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bayangkan spektrum elektromagnetik sebagai penggaris raksasa.",
        "hl": [
          "penggaris raksasa"
        ],
        "pause": 0.7
      },
      {
        "text": "Di ujung panjang ada gelombang mikro: molekul berputar menyerapnya.",
        "hl": [
          "molekul berputar"
        ],
        "pause": 0.7
      },
      {
        "text": "Di tengah ada inframerah: ikatan bergetar menyerapnya. Inilah dasar video sidik jari molekul.",
        "hl": [
          "sidik jari molekul"
        ],
        "pause": 0.7
      },
      {
        "text": "Di ujung pendek ada cahaya tampak dan ultraviolet: elektron melompat, memberi warna pada pewarna dan daun.",
        "hl": [
          "elektron melompat"
        ],
        "pause": 0.7
      },
      {
        "text": "Satuan favorit ahli spektroskopi adalah bilangan gelombang, per sentimeter, yang sebanding langsung dengan energi.",
        "hl": [
          "bilangan gelombang"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "boltzmann",
    "chapter": "03",
    "title": "Siapa yang menempati tangga",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Molekul tidak semuanya berada di tingkat terendah. Panas mendistribusikan mereka ke tingkat-tingkat atas.",
        "hl": [
          "Panas"
        ],
        "pause": 0.7
      },
      {
        "text": "Perbandingan populasi mengikuti faktor Boltzmann: e pangkat minus selisih energi dibagi k T.",
        "hl": [
          "faktor Boltzmann"
        ],
        "pause": 0.7,
        "tts": "Perbandingan populasi mengikuti faktor Bolsman: e pangkat minus selisih energi dibagi ka te."
      },
      {
        "text": "Pada suhu kamar, k T sekitar dua ratus per sentimeter.",
        "hl": [
          "dua ratus per sentimeter"
        ],
        "pause": 0.7,
        "tts": "Pada suhu kamar, ka te sekitar dua ratus per sentimeter."
      },
      {
        "text": "Tingkat rotasi jauh lebih kecil dari itu, jadi banyak tingkat rotasi terisi sekaligus.",
        "hl": [
          "banyak tingkat rotasi terisi"
        ],
        "pause": 0.7
      },
      {
        "text": "Tingkat vibrasi biasanya jauh lebih besar, jadi hampir semua molekul berada di tingkat vibrasi dasar.",
        "hl": [
          "tingkat vibrasi dasar"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "selection",
    "chapter": "04",
    "title": "Aturan seleksi: siapa boleh menyerap",
    "mood": "tension",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Tidak semua molekul menyerap setiap jenis cahaya. Ada aturan seleksi kasar dan halus.",
        "hl": [
          "aturan seleksi"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk spektrum rotasi gelombang mikro, molekul harus punya momen dipol permanen. H Cl dan CO bisa; N dua dan CO dua tidak.",
        "hl": [
          "momen dipol permanen"
        ],
        "pause": 0.7,
        "tts": "Untuk spektrum rotasi gelombang mikro, molekul harus punya momen dipol permanen. Ha ce el dan ce o bisa; en dua dan ce o dua tidak."
      },
      {
        "text": "Untuk spektrum vibrasi inframerah, getarannya harus mengubah momen dipol, seperti yang kita ramal dengan simetri.",
        "hl": [
          "mengubah momen dipol"
        ],
        "pause": 0.7
      },
      {
        "text": "Aturan halusnya: delta J plus minus satu untuk rotasi, dan delta v plus minus satu untuk vibrasi harmonik.",
        "hl": [
          "delta J plus minus satu"
        ],
        "pause": 0.7,
        "tts": "Aturan halusnya: delta je plus minus satu untuk rotasi, dan delta fe plus minus satu untuk vibrasi harmonik."
      },
      {
        "text": "Foton membawa satu satuan momentum sudut, jadi rotasi molekul hanya bisa naik atau turun satu langkah.",
        "hl": [
          "satu satuan momentum sudut"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "rotation",
    "chapter": "05",
    "title": "Spektrum rotasi",
    "mood": "quantum",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Molekul diatomik berputar seperti barbel. Energinya B kali J kali J tambah satu.",
        "hl": [
          "J kali J tambah satu"
        ],
        "pause": 0.7,
        "tts": "Molekul diatomik berputar seperti barbel. Energinya be kali je kali je tambah satu."
      },
      {
        "text": "Karena delta J plus minus satu, garis-garis serapannya berjarak sama, dua B.",
        "hl": [
          "berjarak sama"
        ],
        "pause": 0.7,
        "tts": "Karena delta je plus minus satu, garis-garis serapannya berjarak sama, dua be."
      },
      {
        "text": "Untuk karbon monoksida, B sekitar satu koma sembilan tiga per sentimeter, jadi garisnya berjarak sekitar tiga koma delapan enam.",
        "hl": [
          "satu koma sembilan tiga"
        ],
        "pause": 0.7,
        "tts": "Untuk karbon monoksida, be sekitar satu koma sembilan tiga per sentimeter, jadi garisnya berjarak sekitar tiga koma delapan enam."
      },
      {
        "text": "Dari B kita mendapat momen inersia, dan dari momen inersia, panjang ikatan: sekitar seratus tiga belas pikometer.",
        "hl": [
          "panjang ikatan"
        ],
        "pause": 0.7
      },
      {
        "text": "Tinggi garis naik lalu turun, mengikuti populasi Boltzmann dan degenerasi dua J tambah satu.",
        "hl": [
          "naik lalu turun"
        ],
        "pause": 0.9,
        "tts": "Tinggi garis naik lalu turun, mengikuti populasi Bolsman dan degenerasi dua je tambah satu."
      }
    ]
  },
  {
    "id": "rovib",
    "chapter": "06",
    "title": "Vibrasi dan rotasi sekaligus",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Saat molekul menyerap foton inframerah, ia biasanya juga berganti tingkat rotasi.",
        "hl": [
          "berganti tingkat rotasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Spektrum H Cl gas tidak berupa satu garis, melainkan dua sayap garis-garis halus di sekitar dua ribu delapan ratus delapan puluh enam per sentimeter.",
        "hl": [
          "dua sayap"
        ],
        "pause": 0.7,
        "tts": "Spektrum ha ce el gas tidak berupa satu garis, melainkan dua sayap garis-garis halus di sekitar dua ribu delapan ratus delapan puluh enam per sentimeter."
      },
      {
        "text": "Cabang R di sisi energi tinggi: J naik satu. Cabang P di sisi energi rendah: J turun satu.",
        "hl": [
          "Cabang R",
          "Cabang P"
        ],
        "pause": 0.7,
        "tts": "Cabang er di sisi energi tinggi: je naik satu. Cabang pe di sisi energi rendah: je turun satu."
      },
      {
        "text": "Di tengahnya ada celah kosong, karena delta J sama dengan nol tidak diizinkan untuk H Cl.",
        "hl": [
          "celah kosong"
        ],
        "pause": 0.7,
        "tts": "Di tengahnya ada celah kosong, karena delta je sama dengan nol tidak diizinkan untuk ha ce el."
      },
      {
        "text": "Perbesar setiap garis: ternyata kembar. Klorin tiga puluh lima dan tiga puluh tujuh punya massa berbeda, jadi frekuensinya sedikit bergeser.",
        "hl": [
          "ternyata kembar"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "raman",
    "chapter": "07",
    "title": "Hamburan Raman",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Ada cara lain melihat rotasi dan vibrasi: menembakkan laser dan menangkap cahaya yang terhambur.",
        "hl": [
          "cahaya yang terhambur"
        ],
        "pause": 0.7
      },
      {
        "text": "Sebagian kecil cahaya terhambur dengan energi sedikit berbeda. Selisihnya sama dengan energi rotasi atau vibrasi molekul.",
        "hl": [
          "energi sedikit berbeda"
        ],
        "pause": 0.7
      },
      {
        "text": "Efek ini ditemukan C. V. Raman tahun seribu sembilan ratus dua puluh delapan, dan diganjar Nobel Fisika tahun seribu sembilan ratus tiga puluh.",
        "hl": [
          "C. V. Raman"
        ],
        "pause": 0.7,
        "tts": "Efek ini ditemukan ce fe Raman tahun seribu sembilan ratus dua puluh delapan, dan diganjar Nobel Fisika tahun seribu sembilan ratus tiga puluh."
      },
      {
        "text": "Syaratnya bukan dipol, melainkan perubahan polarisabilitas. Karena itu N dua dan regangan simetris CO dua terlihat di Raman.",
        "hl": [
          "polarisabilitas"
        ],
        "pause": 0.7,
        "tts": "Syaratnya bukan dipol, melainkan perubahan polarisabilitas. Karena itu en dua dan regangan simetris ce o dua terlihat di Raman."
      },
      {
        "text": "Inframerah dan Raman saling melengkapi, persis seperti aturan saling meniadakan dari video simetri.",
        "hl": [
          "saling melengkapi"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "electronic",
    "chapter": "08",
    "title": "Spektrum elektronik",
    "mood": "bright",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Saat elektron melompat ke orbital yang lebih tinggi, molekul juga bisa mulai bergetar dan berputar.",
        "hl": [
          "melompat"
        ],
        "pause": 0.7
      },
      {
        "text": "Lompatan elektron terjadi sangat cepat, jauh lebih cepat daripada inti bergerak. Inti seolah membeku selama lompatan.",
        "hl": [
          "Inti seolah membeku"
        ],
        "pause": 0.7
      },
      {
        "text": "Ini prinsip Franck–Condon: transisi digambar sebagai garis tegak pada diagram energi potensial.",
        "hl": [
          "prinsip Franck–Condon"
        ],
        "pause": 0.7,
        "tts": "Ini prinsip Frank Kondon: transisi digambar sebagai garis tegak pada diagram energi potensial."
      },
      {
        "text": "Garis tegak itu mendarat di beberapa tingkat vibrasi keadaan atas, sehingga pita serapan punya deretan puncak vibrasi.",
        "hl": [
          "deretan puncak vibrasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Dalam larutan, puncak-puncak ini melebur menjadi pita lebar: spektrum UV–Vis yang dipakai di laboratorium sehari-hari.",
        "hl": [
          "UV–Vis"
        ],
        "pause": 0.9,
        "tts": "Dalam larutan, puncak-puncak ini melebur menjadi pita lebar: spektrum u fe fis yang dipakai di laboratorium sehari-hari."
      }
    ]
  },
  {
    "id": "translation",
    "chapter": "09",
    "title": "Tarian keempat: translasi",
    "mood": "quantum",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bagaimana dengan translasi? Di dalam wadah biasa, tingkat energinya terlalu rapat untuk terlihat sebagai garis.",
        "hl": [
          "terlalu rapat"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi translasi tetap meninggalkan jejak: efek Doppler.",
        "hl": [
          "efek Doppler"
        ],
        "pause": 0.7,
        "tts": "Tetapi translasi tetap meninggalkan jejak: efek Dopler."
      },
      {
        "text": "Molekul yang bergerak menuju detektor tampak menyerap frekuensi sedikit lebih tinggi; yang menjauh, sedikit lebih rendah.",
        "hl": [
          "menuju detektor"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena gas berisi molekul dengan kecepatan berbeda-beda, setiap garis melebar. Makin panas gas, makin lebar garisnya.",
        "hl": [
          "setiap garis melebar"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila molekul dikurung di ruang sangat sempit, seperti elektron di titik kuantum, tingkat translasi kembali terpisah, seperti partikel dalam kotak.",
        "hl": [
          "titik kuantum"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "breath",
    "chapter": "10",
    "title": "Alat uji napas",
    "mood": "bright",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Spektroskopi inframerah bekerja diam-diam di sekitar kita.",
        "hl": [
          "diam-diam"
        ],
        "pause": 0.7
      },
      {
        "text": "Alat uji napas alkohol jenis inframerah menembakkan cahaya melalui sampel napas.",
        "hl": [
          "Alat uji napas"
        ],
        "pause": 0.7
      },
      {
        "text": "Ikatan C–H etanol menyerap di sekitar tiga koma empat mikrometer. Makin banyak etanol, makin banyak cahaya yang hilang.",
        "hl": [
          "tiga koma empat mikrometer"
        ],
        "pause": 0.7,
        "tts": "Ikatan ce ha etanol menyerap di sekitar tiga koma empat mikrometer. Makin banyak etanol, makin banyak cahaya yang hilang."
      },
      {
        "text": "Hubungan antara serapan dan konsentrasi mengikuti hukum Lambert–Beer, hukum yang sama di spektrofotometer laboratorium.",
        "hl": [
          "hukum Lambert–Beer"
        ],
        "pause": 0.7,
        "tts": "Hubungan antara serapan dan konsentrasi mengikuti hukum Lambert Ber, hukum yang sama di spektrofotometer laboratorium."
      }
    ]
  },
  {
    "id": "radio",
    "chapter": "11",
    "title": "Astronomi radio",
    "mood": "wonder",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Awan gas dingin di antara bintang sebagian besar berupa hidrogen molekular, yang hampir tak terlihat.",
        "hl": [
          "hampir tak terlihat"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi karbon monoksida yang ikut tercampur berputar dan memancarkan garis rotasi pada seratus lima belas gigahertz.",
        "hl": [
          "seratus lima belas gigahertz"
        ],
        "pause": 0.7
      },
      {
        "text": "Teleskop radio memetakan garis itu untuk melihat di mana bintang-bintang baru lahir.",
        "hl": [
          "bintang-bintang baru lahir"
        ],
        "pause": 0.7
      },
      {
        "text": "Dengan cara serupa, sekitar tiga ratus lima puluh jenis molekul telah ditemukan di ruang antarbintang, termasuk molekul organik.",
        "hl": [
          "tiga ratus lima puluh jenis molekul"
        ],
        "pause": 0.9
      }
    ]
  },
  {
    "id": "exoplanet",
    "chapter": "12",
    "title": "Atmosfer planet lain",
    "mood": "bright",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Kembali ke planet jauh itu. Saat planet melintas, cahaya bintang menembus lapisan tipis atmosfernya.",
        "hl": [
          "lapisan tipis atmosfernya"
        ],
        "pause": 0.7
      },
      {
        "text": "Molekul di sana menyerap pada panjang gelombang khasnya: karbon dioksida di sekitar empat koma tiga mikrometer, uap air di beberapa pita inframerah.",
        "hl": [
          "empat koma tiga mikrometer"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada tahun dua ribu dua puluh dua, teleskop James Webb mendeteksi karbon dioksida dengan jelas di atmosfer planet WASP tiga puluh sembilan b.",
        "hl": [
          "WASP tiga puluh sembilan b"
        ],
        "pause": 0.7,
        "tts": "Pada tahun dua ribu dua puluh dua, teleskop James Webb mendeteksi karbon dioksida dengan jelas di atmosfer planet wosp tiga puluh sembilan be."
      },
      {
        "text": "Tangga energi yang sama, aturan seleksi yang sama, simetri yang sama: dari laboratorium kampus sampai planet di bintang lain.",
        "hl": [
          "dari laboratorium kampus"
        ],
        "pause": 1.0
      }
    ]
  },
  {
    "id": "recap",
    "chapter": "13",
    "title": "Merangkai semuanya",
    "mood": "resolve",
    "lead": 1.0,
    "tail": 2.4,
    "lines": [
      {
        "text": "Mari rangkum.",
        "pause": 0.6
      },
      {
        "text": "Molekul punya empat tangga energi: translasi, rotasi, vibrasi, dan elektronik, dari yang paling rapat sampai paling renggang.",
        "hl": [
          "empat tangga energi"
        ],
        "pause": 0.7
      },
      {
        "text": "Gelombang mikro menggerakkan rotasi, inframerah menggerakkan vibrasi, cahaya tampak dan ultraviolet menggerakkan elektron.",
        "hl": [
          "Gelombang mikro"
        ],
        "pause": 0.7
      },
      {
        "text": "Faktor Boltzmann menentukan tingkat mana yang terisi, dan aturan seleksi menentukan lompatan mana yang diizinkan.",
        "hl": [
          "aturan seleksi"
        ],
        "pause": 0.7,
        "tts": "Faktor Bolsman menentukan tingkat mana yang terisi, dan aturan seleksi menentukan lompatan mana yang diizinkan."
      },
      {
        "text": "Cabang P dan R, isotop, Raman, dan Franck–Condon semuanya terbaca dari spektrum.",
        "hl": [
          "terbaca dari spektrum"
        ],
        "pause": 0.7,
        "tts": "Cabang pe dan er, isotop, Raman, dan Frank Kondon semuanya terbaca dari spektrum."
      },
      {
        "text": "Dengan itu kita membaca napas, awan antarbintang, dan atmosfer planet lain.",
        "hl": [
          "atmosfer planet lain"
        ],
        "pause": 0.7
      },
      {
        "text": "Ini akhir perjalanan kimia kuantum semester ini. Terima kasih sudah ikut menari bersama molekul.",
        "hl": [
          "akhir perjalanan"
        ],
        "pause": 1.0
      }
    ]
  },
  {
    "id": "outro",
    "chapter": "",
    "title": "Penutup",
    "mood": "outro",
    "fixed": 15,
    "lines": []
  }
];
