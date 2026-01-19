import { useEffect, useRef } from 'react';

export const RouteMap = ({ orders, myLocation, onClose }) => {
  const mapRef = useRef(null);
  const directionsRenderer = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // 1. Inicializa o mapa com estilo dark
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: myLocation.lat, lng: myLocation.lng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      ],
    });

    // 2. Configura o renderizador de direções
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false, // Mantém marcadores A, B, C... automáticos ou personalizados
      polylineOptions: {
        strokeColor: "#10b981",
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    const directionsService = new window.google.maps.DirectionsService();

    // 3. Prepara os Waypoints (pontos de parada)
    // O Google permite até 25 waypoints no plano padrão
    const waypoints = orders.map(order => ({
      location: { lat: order.lat, lng: order.lng },
      stopover: true,
    }));

    // 4. Solicita a Rota Otimizada pelas ruas
    directionsService.route(
      {
        origin: { lat: myLocation.lat, lng: myLocation.lng },
        destination: { lat: orders[orders.length - 1].lat, lng: orders[orders.length - 1].lng },
        waypoints: waypoints.slice(0, -1),
        optimizeWaypoints: true, // A MÁGICA: Reordenar para o melhor caminho real
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.current.setDirections(result);
        } else {
          console.error("Erro ao traçar rota real:", status);
        }
      }
    );

  }, [orders, myLocation]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-xl">
        <div>
          <h2 className="font-black text-emerald-400 uppercase tracking-tighter text-lg">Navegação Inteligente</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {orders.length} Paradas otimizadas por trânsito
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-red-500/20"
        >
          FECHAR
        </button>
      </div>

      {/* Container do Mapa */}
      <div ref={mapRef} className="flex-1" />

      {/* Rodapé com Cards e Botão de GPS */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3 overflow-x-auto no-scrollbar">
        {orders.map((o, i) => (
          <div
            key={o.id}
            className="min-w-[220px] bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md text-white">PARADA {i + 1}</span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-tight mb-4">{o.texto}</p>
            </div>

            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}&travelmode=driving`;
                window.open(url, '_blank');
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.65 16.35L12 21L6.35 16.35M12 21V3" />
              </svg>
              Abrir no GPS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};