
import React, { useState } from 'react';
import { User, UserFile } from '../types';
import { DB } from '../db';

interface AttachmentsProps {
  user: User;
  refreshUser: () => void;
}

const Attachments: React.FC<AttachmentsProps> = ({ user, refreshUser }) => {
  const files = DB.getUserFiles(user.id);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito pesado para o inventário (Limite: 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      DB.uploadFile(user.id, file.name, data, file.type);
      setIsUploading(false);
      refreshUser();
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (file: UserFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.fileName;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl">📂</div>
          <div>
            <h2 className="text-2xl font-rpg font-bold">Cofre de Arquivos</h2>
            <p className="text-slate-400 text-sm">Armazene comprovantes, PDFs e relatórios com segurança.</p>
          </div>
        </div>
        <label className={`
          cursor-pointer px-8 py-3 rounded-xl font-bold transition-all shadow-lg
          ${isUploading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'}
        `}>
          {isUploading ? 'Processando...' : 'Fazer Upload'}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {files.map(file => (
          <div key={file.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col">
            <div className="text-4xl mb-4">
              {file.mimeType.includes('pdf') ? '📄' : file.mimeType.includes('image') ? '🖼️' : '📁'}
            </div>
            <h4 className="font-bold text-sm truncate mb-1" title={file.fileName}>{file.fileName}</h4>
            {/* Correcting file.createdAt to file.created_at to match types.ts */}
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">Criado em {new Date(file.created_at).toLocaleDateString()}</p>
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => downloadFile(file)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Download
              </button>
              <button 
                onClick={() => {
                  if (confirm("Excluir item do inventário?")) {
                    DB.deleteFile(user.id, file.id);
                    refreshUser();
                  }
                }}
                className="w-10 h-8 flex items-center justify-center bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-600">
            Seu cofre está vazio. Adicione arquivos para carregar com você.
          </div>
        )}
      </div>
    </div>
  );
};

export default Attachments;
