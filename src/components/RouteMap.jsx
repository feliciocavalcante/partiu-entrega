import { useEffect, useRef } from 'react';

export const RouteMap = ({ orders, myLocation, onClose }) => {
  const mapRef = useRef(null);
  const googleMap = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // 1. Inicializa o mapa focado na sua posição
    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: myLocation.lat, lng: myLocation.lng },
      zoom: 14,
      disableDefaultUI: true, // Deixa o visual limpo
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, // Estilo Escuro
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      ],
    });

    // 2. Marcador da SUA posição (Azul, estilo GPS)
    new window.google.maps.Marker({
      position: { lat: myLocation.lat, lng: myLocation.lng },
      map: googleMap.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: "#ffffff",
      },
      title: "Você está aqui"
    });

    // 3. Marcadores das Entregas (Numerados)
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: myLocation.lat, lng: myLocation.lng });

    const routeCoordinates = [{ lat: myLocation.lat, lng: myLocation.lng }];

    orders.forEach((order, index) => {
      const pos = { lat: order.lat, lng: order.lng };
      routeCoordinates.push(pos);
      bounds.extend(pos);

      // Marcador customizado com número
      new window.google.maps.Marker({
        position: pos,
        map: googleMap.current,
        label: {
          text: (index + 1).toString(),
          color: "white",
          fontWeight: "bold"
        },
        title: order.texto
      });
    });

    // 4. Desenha a Linha da Rota (Caminho)
    const flightPath = new window.google.maps.Polyline({
      path: routeCoordinates,
      geodesic: true,
      strokeColor: "#10b981", // Verde esmeralda
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    flightPath.setMap(googleMap.current);

    // 5. Ajusta o zoom para caber todo mundo na tela
    googleMap.current.fitBounds(bounds, 50);

  }, [orders, myLocation]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Cabeçalho do Mapa */}
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-xl">
        <div>
          <h2 className="font-black text-emerald-400 uppercase tracking-tighter">Rota de Entrega</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {orders.length} Paradas Otimizadas
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-red-500/20"
        >
          FECHAR
        </button>
      </div>

      {/* Container do Google Maps */}
      <div ref={mapRef} className="flex-1" />

      {/* Lista Rápida no Rodapé */}
      {/* Lista Rápida no Rodapé com Botão de Navegação */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3 overflow-x-auto no-scrollbar">
        {orders.map((o, i) => (
          <div
            key={o.id}
            className="min-w-[200px] bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md text-white">#{i + 1}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Destino</span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 leading-tight mb-3">{o.texto}</p>
            </div>

            <button
              onClick={() => {
                // Link que abre o GPS nativo do telemóvel (Google Maps ou Waze)
                const url = `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}&travelmode=driving`;
                window.open(url, '_blank');
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="Width 17.65 16.35L12 21L6.35 16.35M12 21V3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3L17.65 7.65M12 3L6.35 7.65" className="rotate-90 origin-center" />
              </svg>
              Iniciar Rota
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};