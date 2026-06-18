import React, { useState, useMemo } from 'react';
import { UploadCloud, Search, Trophy, Users, FileText, X, Medal } from 'lucide-react';

export default function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileName, setFileName] = useState('');
  const [isError, setIsError] = useState(false);

  // Fungsi untuk memproses file CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length > 0) {
          setData(parsedData);
          setIsError(false);
        } else {
          setIsError(true);
        }
      } catch (err) {
        setIsError(true);
        console.error("Gagal membaca CSV:", err);
      }
    };

    reader.readAsText(file);
  };

  // Fungsi manual untuk parsing CSV delimiter titik koma (;)
  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    const result = [];
    
    // Mulai dari baris ke-3 (index 2) karena baris 1 dan 2 adalah header
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(';');
      // Memastikan baris memiliki kolom yang cukup
      if (cols.length >= 6 && cols[1]) {
        result.push({
          no: cols[0],
          nisn: cols[1],
          nama: cols[2],
          totalNilai: cols[3],
          rataRata: cols[4],
          rank: parseInt(cols[5]) || 999, // Konversi ke angka agar bisa diurutkan, fallback 999
          sakit: cols[6] || '-',
          izin: cols[7] || '-',
          alpa: cols[8] || '-'
        });
      }
    }
    return result;
  };

  const clearData = () => {
    setData([]);
    setSearchTerm('');
    setFileName('');
  };

  // Filter data berdasarkan nama
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(siswa => 
      siswa.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // Statistik Cepat
  const topSiswa = useMemo(() => {
    return [...data].sort((a, b) => a.rank - b.rank).slice(0, 3);
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Sistem Informasi Nilai Siswa
            </h1>
            <p className="text-slate-500 text-sm mt-1">Rekapitulasi Total Nilai dan Peringkat Kelas</p>
          </div>
          {data.length > 0 && (
            <button 
              onClick={clearData}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Tutup Data
            </button>
          )}
        </header>

        {/* State 1: Upload File */}
        {data.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Unggah File Rekapitulasi</h2>
            <p className="text-slate-500 mb-8 max-w-md">
              Silakan pilih file <strong>rekap_xdkv2.csv</strong> Anda untuk menampilkan data nilai dan peringkat siswa.
            </p>
            
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pilih File CSV
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
            
            {isError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                Gagal membaca file. Pastikan format file menggunakan delimiter titik koma (;).
              </div>
            )}
          </div>
        )}

        {/* State 2: Dashboard Data */}
        {data.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topSiswa.map((siswa, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                    ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : 'bg-orange-400'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Peringkat {siswa.rank}</p>
                    <h3 className="font-bold text-slate-800 line-clamp-1">{siswa.nama}</h3>
                    <p className="text-sm font-medium text-indigo-600">Total: {siswa.totalNilai}</p>
                  </div>
                  <Medal className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-10 ${
                    index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-500' : 'text-orange-500'
                  }`} />
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <span>Total Data: {data.length} Siswa</span>
                </div>
                
                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white border-b border-slate-200 text-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">Rank</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap">NISN</th>
                      <th className="px-6 py-4 font-semibold w-full">Nama Lengkap</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Total Nilai</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Rata-rata</th>
                      <th className="px-6 py-4 font-semibold whitespace-nowrap text-center">Absensi (S/I/A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((siswa, i) => (
                        <tr 
                          key={i} 
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                              ${siswa.rank === 1 ? 'bg-amber-100 text-amber-700' : 
                                siswa.rank === 2 ? 'bg-slate-200 text-slate-700' : 
                                siswa.rank === 3 ? 'bg-orange-100 text-orange-700' : 
                                'bg-slate-100 text-slate-600'}`
                            }>
                              {siswa.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{siswa.nisn}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{siswa.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-indigo-600">
                            {siswa.totalNilai}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                            {siswa.rataRata}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2 text-xs font-medium">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">S: {siswa.sakit}</span>
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded">I: {siswa.izin}</span>
                              <span className="px-2 py-1 bg-red-50 text-red-600 rounded">A: {siswa.alpa}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                          <p>Tidak ada data siswa dengan nama <strong>"{searchTerm}"</strong></p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 text-center">
                Menampilkan {filteredData.length} dari total {data.length} data.
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}