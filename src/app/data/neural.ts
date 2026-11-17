export const neuralStages = [
  { id: 'input', label: 'INPUT', title: 'The human behind it.', detail: 'Cerita dimulai dari rasa ingin tahu. Buka galeri di balik proses membangun.', progress: 0.28 },
  { id: 'features', label: 'FEATURE LAYERS', title: 'Find the patterns.', detail: 'Eksplorasi, ekstraksi fitur, dan eksperimen membentuk cara saya menyelesaikan masalah.', progress: 0.5 },
  { id: 'network', label: 'NEURAL NETWORK', title: 'Connect the possibilities.', detail: 'Menghubungkan antarmuka, logika, dan data menjadi pengalaman yang utuh.', progress: 0.8 },
  { id: 'output', label: 'OUTPUT', title: 'Turn ideas into work.', detail: 'Pilih node output untuk menjelajahi proyek yang sudah dibangun.', progress: 0.95 },
] as const;

export type ActivityPhoto = { title: string; caption: string; src?: string; alt?: string };
export type LifeGallery = { id: string; label: string; title: string; photos: ActivityPhoto[] };
const placeholders = (titles: string[], caption: string): ActivityPhoto[] => titles.map(title => ({ title, caption }));

/** Each box stack owns a separate chapter and separate photos. Replace placeholders here. */
export const lifeGalleries: LifeGallery[] = [
  { id: 'beginnings', label: 'Awal perjalanan', title: 'Where it began', photos: placeholders(['Langkah pertama', 'Rasa ingin tahu', 'Cerita kecil', 'Sudut pandang', 'Awal yang berarti'], 'Cerita dari awal perjalanan.') },
  { id: 'learning', label: 'Belajar & bertumbuh', title: 'Learning to grow', photos: placeholders(['Masa belajar', 'Eksplorasi', 'Belajar bersama', 'Mencoba hal baru', 'Sedikit kemajuan'], 'Proses belajar dan menemukan hal baru.') },
  { id: 'people', label: 'Orang & kolaborasi', title: 'Better together', photos: placeholders(['Bersama tim', 'Kolaborasi', 'Diskusi', 'Komunitas', 'Momen bersama'], 'Orang-orang dan kebersamaan di sepanjang perjalanan.') },
  { id: 'experiences', label: 'Tantangan & pengalaman', title: 'Taking the leap', photos: placeholders(['Hackathon', 'Di balik proyek', 'Presentasi', 'Pengalaman baru', 'Momen proses'], 'Mencoba, menghadapi tantangan, dan terus bergerak.') },
  { id: 'milestones', label: 'Pencapaian & kenangan', title: 'Moments that matter', photos: placeholders(['Pencapaian', 'Langkah berikutnya', 'Momen berkesan', 'Perayaan kecil', 'Melihat kembali'], 'Langkah kecil dan momen yang berarti.') },
];

// Shared preparation discovers every configured photo; the input plane uses the first one.
export const personalPhotos = lifeGalleries.flatMap(gallery => gallery.photos);

export const neuralMarkers = [
  { id: 'input', label: 'ME / INPUT', hint: 'Buka galeri personal', kind: 'photo' },
  { id: 'features', label: 'FEATURE LAYERS', hint: 'Jelajahi layer', kind: 'stage' },
  { id: 'network', label: 'NEURAL NETWORK', hint: 'Jelajahi koneksi', kind: 'stage' },
  { id: 'rintas', label: 'RINTAS', hint: 'Buka detail Rintas', kind: 'project' },
  { id: 'ally', label: 'ALLY', hint: 'Buka detail Ally', kind: 'project' },
  { id: 'tangkapin', label: 'TANGKAPIN', hint: 'Lihat proyek Tangkapin', kind: 'project' },
] as const;

export type NeuralMarkerId = typeof neuralMarkers[number]['id'];
