
import React, { useState, useEffect } from 'react';
import { User, UserFile } from '../types';
import { API } from '../api';

interface AttachmentsProps {
  user: User;
  refreshUser: () => void;
}

const Attachments: React.FC<AttachmentsProps> = ({ user, refreshUser }) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFiles(); }, [user.id]);

  const loadFiles = async () => {
    setLoading(true);
    // Correctly using the now existing API.getFiles
    const data = await API.getFiles(user.id);
    setFiles(data);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito pesado (Limite: 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result as string;
      // Correctly using the now existing API.uploadFile
      await API.uploadFile(user.id, file.name, data, file.type);
      setIsUploading(false);
      loadFiles();
      refreshUser();
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir item do inventário?")) {
      // Correctly using the now existing API.deleteFile
      await API.deleteFile(id);
      loadFiles();
    }
  };

  const downloadFile = (file: UserFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    // Use the snake_case property from the UserFile type
    link.download = file.file_name;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-3xl">📂</div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cofre de Arquivos</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Armazene evidências de progresso</p>
          </div>
        </div>
        <label className={`
          cursor-pointer px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl
          ${isUploading ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}
        `}>
          {isUploading ? 'Sincronizando...' : 'Adicionar ao Inventário'}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {files.map(file => {
          // Use snake_case properties to match UserFile type
          const name = file.file_name;
          const mime = file.mime_type;
          return (
            <div key={file.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col group relative">
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">
                {mime?.includes('pdf') ? '📄' : mime?.includes('image') ? '🖼️' : '📁'}
              </div>
              <h4 className="font-bold text-xs truncate mb-1 text-zinc-200" title={name}>{name}</h4>
              <p className="text-[8px] text-zinc-600 font-black uppercase mb-4 tracking-tighter">
                {new Date(file.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => downloadFile(file)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors text-zinc-400 hover:text-white"
                >
                  Abrir
                </button>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="w-10 h-8 flex items-center justify-center bg-red-900/10 text-red-500 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
        {!loading && files.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Inventário vazio. Carregue seus dados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attachments;
