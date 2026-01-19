import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicGFydGl1ZW50cmVnYSIsImEiOiJjbWtmajNrbjYwaWgxM2Zvc2NxaHowdWl5In0.NDkosgVOdyKJWPY2oUjhDg';

export const RouteMap = ({ orders, myLocation, onClose }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; 
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [myLocation.lng, myLocation.lat],
      zoom: 12
    });

    map.current.on('load', () => {
      const coords = [[myLocation.lng, myLocation.lat], ...orders.map(o => [o.lng, o.lat])];

      // Adiciona a linha da rota
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords }
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 1] }
      });

      // Marcador da sua posição
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([myLocation.lng, myLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML("Você está aqui"))
        .addTo(map.current);

      // Marcadores numerados para as entregas
      orders.forEach((order, index) => {
        const el = document.createElement('div');
        el.className = 'bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg';
        el.innerText = index + 1;

        new mapboxgl.Marker(el)
          .setLngLat([order.lng, order.lat])
          .addTo(map.current);
      });

      // Ajusta o zoom para caber tudo
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach(c => bounds.extend(c));
      map.current.fitBounds(bounds, { padding: 50 });
    });
  }, [orders, myLocation]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
        <h2 className="font-bold text-blue-400 text-lg">Mapa da Rota Otimizada</h2>
        <button onClick={onClose} className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold">Fechar</button>
      </div>
      <div ref={mapContainer} className="flex-1" />
      <div className="p-4 bg-slate-900 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
        {orders.map((o, i) => (
          <div key={o.id} className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
            <span className="text-blue-500 font-bold mr-1">#{i+1}</span> {o.texto.substring(0, 20)}...
          </div>
        ))}
      </div>
    </div>
  );
};