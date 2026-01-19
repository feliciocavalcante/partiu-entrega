import { useEffect, useRef, useState } from 'react';

export const RouteMap = ({ orders, myLocation, onClose }) => {
  const mapRef = useRef(null);
  const directionsRenderer = useRef(null);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  
  // Estado para controlar qual parada foi clicada para abrir o modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

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

    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#10b981",
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = orders.map(order => ({
      location: { lat: order.lat, lng: order.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: { lat: myLocation.lat, lng: myLocation.lng },
        destination: { lat: orders[orders.length - 1].lat, lng: orders[orders.length - 1].lng },
        waypoints: waypoints.slice(0, -1),
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.current.setDirections(result);
          const route = result.routes[0];
          let totalDist = 0;
          let totalDuration = 0;
          route.legs.forEach(leg => {
            totalDist += leg.distance.value;
            totalDuration += leg.duration.value;
          });
          setRouteInfo({
            distance: (totalDist / 1000).toFixed(1) + ' km',
            duration: Math.ceil(totalDuration / 60) + ' min'
          });
        }
      }
    );
  }, [orders, myLocation]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="flex gap-4 items-center">
          <div>
            <h2 className="font-black text-emerald-400 uppercase tracking-tighter text-lg leading-none">Navegação</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {orders.length} Paradas
            </p>
          </div>
          {routeInfo.distance && (
            <div className="flex gap-2 animate-in slide-in-from-left duration-500">
              <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <p className="text-[9px] text-slate-500 uppercase font-black">Distância</p>
                <p className="text-xs font-bold text-white">{routeInfo.distance}</p>
              </div>
              <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <p className="text-[9px] text-slate-500 uppercase font-black">Tempo Est.</p>
                <p className="text-xs font-bold text-white">{routeInfo.duration}</p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-red-500/20"
        >
          FECHAR
        </button>
      </div>

      <div ref={mapRef} className="flex-1" />

      {/* Rodapé com o design original */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3 overflow-x-auto no-scrollbar">
        {orders.map((o, i) => (
          <div key={o.id} className="min-w-[220px] bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md text-white">PARADA {i + 1}</span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-tight mb-4">{o.texto}</p>
            </div>
            {/* O botão agora abre o modal em vez de abrir o link direto */}
            <button
              onClick={() => setSelectedOrder(o)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.65 16.35L12 21L6.35 16.35M12 21V3" />
              </svg>
              Abrir GPS
            </button>
          </div>
        ))}
      </div>

      {/* Modal de seleção de GPS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-white font-black text-center mb-6 uppercase tracking-widest text-sm">Escolha o GPS</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.lat},${selectedOrder.lng}&travelmode=driving`, '_blank');
                  setSelectedOrder(null);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl border border-slate-700 active:scale-95 transition-all"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1024px-Google_Maps_icon_%282020%29.svg.png" className="w-10 h-10 object-contain" alt="Maps" />
                <span className="text-[10px] text-white font-black uppercase">Maps</span>
              </button>

              <button 
                onClick={() => {
                  window.open(`https://waze.com/ul?ll=${selectedOrder.lat},${selectedOrder.lng}&navigate=yes`, '_blank');
                  setSelectedOrder(null);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-slate-800 rounded-2xl border border-slate-700 active:scale-95 transition-all"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Waze_logo.svg/1200px-Waze_logo.svg.png" className="w-10 h-10 object-contain" alt="Waze" />
                <span className="text-[10px] text-white font-black uppercase">Waze</span>
              </button>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors text-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};