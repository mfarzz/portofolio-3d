// Content source: CV MII - Muhammad Fariz.pdf (workspace, November 2026).
// Contact values are intentionally retained from the previous portfolio.
export const profile = {
  name: 'Muhammad Fariz',
  role: 'Application Developer',
  location: 'Indonesia',
  university: 'Universitas Andalas',
  email: 'mfarix730@gmail.com',
  github: 'https://github.com/mfarzz',
  cv: 'documents/Muhammad-Fariz-CV.pdf',
  linkedin: 'https://www.linkedin.com/in/mfarizz',
  summary: 'Developer aplikasi web dan desktop. Menghubungkan antarmuka React, API .NET, dan data menjadi produk yang berguna.',
};

export type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  period: string;
  description: string;
  technologies: string[];
  style: 'rintas' | 'rms' | 'ally' | 'mailblast';
  caseStudy: { problem: string; contribution: string; outcome: string };
  links: { label: string; url: string }[];
  gallery: { title: string; description: string; src?: string; alt?: string }[];
};

export const projects: Project[] = [
  { id: 'rintas', number: '01', title: 'Rintas', category: 'WINDOWS / FILE SHARING', period: 'NOV 2026',
    description: 'Berbagi file langsung dari komputer melalui tautan, tanpa penyimpanan cloud. Mendukung kedaluwarsa tautan, pencabutan akses, dan integrasi Windows Explorer.',
    technologies: ['C#', 'Node.js', 'Cloudflare Tunnel'], style: 'rintas',
    caseStudy: { problem: 'Berbagi file dari komputer melalui tautan tanpa mengunggahnya ke penyimpanan cloud.', contribution: 'Membangun aplikasi Windows, integrasi Cloudflare Tunnel, kontrol tautan, dan menu Windows Explorer.', outcome: 'File dapat dibagikan lewat tautan dengan masa berlaku dan pencabutan akses.' },
    links: [{ label: 'Repository', url: 'https://github.com/mfarzz/rintas' }],
    gallery: [{ title: 'Tampilan utama', description: 'Workstation berbagi file Rintas.' }, { title: 'Bagikan file', description: 'Alur pembuatan tautan dari komputer.' }, { title: 'Kontrol tautan', description: 'Pengaturan kedaluwarsa dan pencabutan akses.' }] },
  { id: 'rms', number: '02', title: 'Recruitment System', category: 'MII / FULL-STACK WEB', period: 'NOV 2026',
    description: 'Sistem rekrutmen untuk HR dan interviewer: batch, kandidat, jadwal, asesmen, akses berbasis peran, serta pengiriman dan pemantauan email.',
    technologies: ['ASP.NET Core', 'React', 'SQL Server'], style: 'rms',
    caseStudy: { problem: 'Menghubungkan pengelolaan kandidat, jadwal interview, dan asesmen dalam alur rekrutmen.', contribution: 'Mengembangkan fitur portal HR dan interviewer, integrasi API, akses berbasis peran, serta monitoring email.', outcome: 'Batch rekrutmen, kandidat, jadwal, dan asesmen dikelola melalui portal yang saling terhubung.' },
    links: [],
    gallery: [{ title: 'Portal HR', description: 'Ringkasan alur pengelolaan rekrutmen.' }, { title: 'Kandidat & jadwal', description: 'Pengelolaan kandidat dan interview.' }, { title: 'Asesmen & email', description: 'Pemantauan asesmen dan notifikasi.' }] },
  { id: 'ally', number: '03', title: 'Ally', category: 'REACT SDK / ADAPTIVE UI', period: 'NOV 2026',
    description: 'React SDK untuk checkout adaptif dan dashboard evaluasi. Dibangun dalam satu hari di Sea x OpenAI Codex Hackathon dan masuk Top 30 finalist.',
    technologies: ['React', 'TypeScript', 'OpenAI Codex'], style: 'ally',
    caseStudy: { problem: 'Membangun pengalaman checkout adaptif sekaligus cara mengevaluasi variasi antarmukanya.', contribution: 'Mengembangkan React SDK dan dashboard evaluasi dalam hackathon satu hari menggunakan OpenAI Codex.', outcome: 'Ally masuk Top 30 finalist Sea x OpenAI Codex Hackathon pada 7 November 2026.' },
    links: [],
    gallery: [{ title: 'Checkout adaptif', description: 'Pengalaman checkout yang menyesuaikan antarmuka.' }, { title: 'React SDK', description: 'Integrasi komponen checkout.' }, { title: 'Dashboard evaluasi', description: 'Tampilan evaluasi variasi antarmuka.' }] },
  { id: 'mailblast', number: '04', title: 'MailBlast Workspace', category: 'WINDOWS / EMAIL CAMPAIGNS', period: 'JUL–AGU 2026',
    description: 'Aplikasi kampanye email: penerima dari Excel, template HTML personal, lampiran, SMTP, progres pengiriman, retry, dan log yang dapat diekspor.',
    technologies: ['.NET 10', 'WinUI 3', 'MailKit'], style: 'mailblast',
    caseStudy: { problem: 'Menyiapkan kampanye email personal dari data penerima Excel dan memantau pengirimannya.', contribution: 'Membangun aplikasi Windows dengan template HTML, lampiran, SMTP, retry, dan log pengiriman.', outcome: 'Kampanye email memiliki progres pengiriman yang terlihat dan log yang dapat diekspor.' },
    links: [{ label: 'Repository', url: 'https://github.com/mfarzz/MBW' }],
    gallery: [{ title: 'Workspace kampanye', description: 'Pengelolaan kampanye email.' }, { title: 'Template & penerima', description: 'Personalisasi template dan impor data Excel.' }, { title: 'Progres pengiriman', description: 'Monitoring, retry, dan log pengiriman.' }] },
];

export const otherProjects = [
  { name: 'NeoCentral', period: '2025–2026', category: 'WEB & MOBILE',
    description: 'Platform akademik bersama tim empat orang, mendukung enam peran dan lebih dari 300 pengguna. Mencakup pendaftaran magang, administrasi, penilaian, dan autentikasi Azure AD.',
    technologies: 'React / Express / Flutter / MySQL / Redis / BullMQ' },
  { name: 'Firetech', period: '2025', category: 'COMPETITION PLATFORM',
    description: 'Registrasi kompetisi, pengelolaan tim, verifikasi pembayaran, pemenang, serta pembuatan dan distribusi sertifikat otomatis.',
    technologies: 'React / TypeScript / Express / MySQL' },
  { name: 'TPB Portal', period: '2025–2026', category: 'ACADEMIC PLATFORM',
    description: 'Portal penilaian akademik Departemen Teknik Pertanian dan Biosistem berbasis kurikulum Outcome-Based Education.',
    technologies: 'PHP / Laravel / MySQL' },
  { name: 'Facial Emotion Recognition', period: '2025–2026', category: 'DEEP LEARNING',
    description: 'Klasifikasi ekspresi wajah dengan CNN, mencakup preprocessing gambar, training, validasi, dan evaluasi model.',
    technologies: 'Python / TensorFlow / CNN / Computer Vision' },
  { name: 'Tangkapin', period: '2025', category: 'OBJECT DETECTION',
    description: 'Model deteksi senjata tajam pada gambar dan video untuk mendukung pemantauan keamanan. Meraih medali perunggu kategori AI di MSU Expo Malaysia 2025.',
    technologies: 'Python / Deep Learning / Object Detection' },
  { name: 'SIMANIS', period: '2025', category: 'INTERNSHIP MANAGEMENT',
    description: 'Pengelolaan program magang BPS Sumatera Barat, dari pendaftaran dan aplikasi hingga administrasi peserta, dengan integrasi Google OAuth.',
    technologies: 'React / Express / PostgreSQL / Google OAuth' },
  { name: 'LINKFY', period: '2025', category: 'INTERNAL RESOURCES',
    description: 'Pengelolaan tautan dan sumber daya digital lintas divisi, dengan kategori, kontrol akses, dan Google OAuth.',
    technologies: 'React / Express / PostgreSQL / Google OAuth' },
  { name: 'Outfyt', period: '2024', category: 'RECOMMENDATION SYSTEM',
    description: 'Capstone Bangkit Academy: rekomendasi outfit personal berdasarkan fitur wajah, preferensi, dan kebutuhan pengguna.',
    technologies: 'Python / Machine Learning / Computer Vision' },
];

export const experiences = [
  { period: 'SEP 2026 — SEKARANG', role: 'Application Developer Intern', organization: 'PT Mitra Integrasi Informatika',
    description: 'Portal HR dan interviewer, integrasi ASP.NET Core, SQL Server, akses berbasis peran, dan monitoring pengiriman email.' },
  { period: 'DES 2025 — JUL 2026', role: 'Software Developer', organization: 'PT Neo Telemetri Software',
    description: 'Sistem kompetisi Firetech, portal penilaian akademik TPB, dan model pengenalan emosi wajah.' },
  { period: 'JAN — FEB 2025', role: 'Software Developer Intern', organization: 'BPS Sumatera Barat',
    description: 'Aplikasi full-stack SIMANIS dan LINKFY dengan REST API, PostgreSQL, dan Google OAuth.' },
];

export const education = {
  degree: 'S1 Sistem Informasi',
  institution: 'Universitas Andalas',
  period: '2022–2026',
  gpa: '3,87',
};

export const stack = ['C#', '.NET', 'REACT', 'SQL SERVER', 'TYPESCRIPT', 'PYTHON', 'LARAVEL', 'DOCKER'];
export const qualifications = [
  { label: 'PELATIHAN', name: 'Metrodata Coding Camp .NET', detail: 'Metrodata Academy / Okt 2026–sekarang' },
  { label: 'PELATIHAN', name: 'Bangkit Academy — Machine Learning', detail: '2024 / capstone Outfyt' },
  { label: 'SERTIFIKASI', name: 'Certified Cybersecurity Educator Professional', detail: 'RED TEAM LEADERS / 2026' },
  { label: 'ORGANISASI', name: 'Coordinator Assistant — Lab Rekayasa Data & BI', detail: 'Feb 2025–Feb 2026' },
  { label: 'ORGANISASI', name: 'Programming Coordinator — UKM Neo Telemetri', detail: 'Okt 2024–Des 2025' },
];

export const achievements = [
  { title: 'TOP 30', event: 'Sea x OpenAI Codex Hackathon', detail: 'Ally / 7 November 2026', color: 'coral' },
  { title: 'BRONZE', event: 'MSU Expo Malaysia — AI Category', detail: 'Tangkapin / 2025', color: 'lime' },
];
