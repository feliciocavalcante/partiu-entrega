import { Trash2, Edit3, CheckCircle2, Circle, Navigation } from 'lucide-react';

export const DeliveryList = ({ items, onDelete, onEdit, onToggleStatus }) => {
  
  // Função para abrir o GPS (prioriza Waze, cai no Google Maps se não tiver)
  const abrirGPS = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto space-y-3 pb-32 px-2">
      {items.length === 0 && (
        <p className="text-center text-slate-600 mt-10 text-sm italic">
          Nenhuma entrega no roteiro.
        </p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className={`bg-slate-900 p-4 rounded-2xl border transition-all flex justify-between items-center group shadow-md ${
            item.status === 'entregue' ? 'border-emerald-900/50 opacity-60' : 'border-slate-800'
          }`}
        >
          {/* LADO ESQUERDO: CHECK E TEXTO */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => onToggleStatus(item.id, item.status)}
              className="shrink-0 transition-transform active:scale-125"
            >
              {item.status === 'entregue' ? (
                <CheckCircle2 size={24} className="text-emerald-500" />
              ) : (
                <Circle size={24} className="text-slate-600" />
              )}
            </button>

            <div className="flex flex-col overflow-hidden">
              <span className={`text-sm truncate font-medium ${
                item.status === 'entregue' ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}>
                {item.texto}
              </span>
              {/* Avisa se o endereço não foi localizado no mapa */}
              {!item.lat && item.status !== 'entregue' && (
                <span className="text-[10px] text-amber-500">Localização não encontrada</span>
              )}
            </div>
          </div>

          {/* LADO DIREITO: GPS, EDITAR E EXCLUIR */}
          <div className="flex items-center gap-1 shrink-0">
            {/* BOTÃO GPS - Só aparece se tiver coordenadas e não estiver entregue */}
            {item.lat && item.lng && item.status !== 'entregue' && (
              <button
                onClick={() => abrirGPS(item.lat, item.lng)}
                className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white p-2 rounded-xl transition-all mr-1"
                title="Abrir no GPS"
              >
                <Navigation size={18} fill="currentColor" />
              </button>
            )}

            {item.status !== 'entregue' && (
              <button
                onClick={() => onEdit(item.id, item.texto)}
                className="text-slate-500 hover:text-blue-400 p-2 transition-colors"
              >
                <Edit3 size={18} />
              </button>
            )}
            
            <button
              onClick={() => onDelete(item.id)}
              className="text-slate-500 hover:text-red-500 p-2 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};