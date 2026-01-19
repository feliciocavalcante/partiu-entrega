import { useState } from 'react';
import { Plus, ClipboardList, Type } from 'lucide-react';
import { AddressInput } from './AddressInput';

export const DeliveryForm = ({ onAdd, onBulkAdd }) => {
  const [mode, setMode] = useState('single');
  const [text, setText] = useState("");
  const [selectedCoords, setSelectedCoords] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (mode === 'single') {
      // Se o usuário digitou mas não clicou em uma sugestão, 
      // o 'selectedCoords' estará null. O App.jsx cuidará de buscar 
      // a coordenada via mapService se necessário.
      onAdd(text, selectedCoords);
    } else {
      const lines = text.split('\n').filter(line => line.trim() !== "");
      onBulkAdd(lines);
    }

    // Limpa os estados
    setText("");
    setSelectedCoords(null);
  };

  const handleSelectAddress = (addressName, coords) => {
    // Quando seleciona da lista, já temos o nome oficial e as coordenadas
    setText(addressName);
    setSelectedCoords({ lng: coords[0], lat: coords[1] });
  };

  return (
    <div className="max-w-md mx-auto mb-8 px-2">
      <div className="flex bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
        <button 
          type="button"
          onClick={() => { setMode('single'); setText(""); setSelectedCoords(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'single' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
        >
          <Type size={16} /> Único
        </button>
        <button 
          type="button"
          onClick={() => { setMode('bulk'); setText(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'bulk' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
        >
          <ClipboardList size={16} /> Colar Lista
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'single' ? (
          <div className="flex gap-2 relative">
            <AddressInput 
              value={text} 
              onChange={(val) => {
                setText(val);
                // Se o usuário voltar a digitar, limpamos as coordenadas antigas
                // para forçar uma nova busca se ele não clicar em uma sugestão
                setSelectedCoords(null);
              }} 
              onSelect={handleSelectAddress} 
            />
            
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl text-white active:scale-95 transition-all h-[58px] shadow-lg shadow-blue-900/20"
            >
              <Plus size={24} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea 
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui vários endereços (um por linha)..."
              className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none shadow-inner"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 w-full py-4 rounded-xl text-white font-bold active:scale-95 transition-all shadow-lg shadow-blue-900/20"
            >
              IMPORTAR LISTA
            </button>
          </div>
        )}
      </form>
    </div>
  );
};