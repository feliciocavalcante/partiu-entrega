import { useState, useEffect } from 'react';

export const AddressInput = ({ value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Verifica se o Google Maps carregou e se tem texto suficiente
    if (value.length < 3 || !window.google || !window.google.maps.places) {
      setSuggestions([]);
      return;
    }

    // Usando o AutocompleteService (ajustado para evitar o erro de tipos mistos)
    const service = new window.google.maps.places.AutocompleteService();
    
    service.getPlacePredictions({
      input: value,
      componentRestrictions: { country: 'br' },
      language: 'pt-BR',
      // CORREÇÃO: Removido 'address' e 'establishment'. 
      // Usamos vazio ou 'geocode' para aceitar tudo sem erro de conflito.
      types: [] 
    }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
      }
    });

  }, [value]);

  const handleSelect = (placeId, description) => {
    if (!window.google) return;

    const sessionToken = new window.google.maps.places.AutocompleteSessionToken();
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    placesService.getDetails({ 
      placeId: placeId,
      fields: ['geometry', 'formatted_address'], // Pedimos apenas o necessário para economizar
      sessionToken: sessionToken
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        onSelect(description, [lng, lat]);
        setShowSuggestions(false);
      }
    });
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder="Rua, Shopping, número..."
        className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelect(item.place_id, item.description)}
              className="p-4 hover:bg-slate-800 cursor-pointer text-sm text-slate-300 border-b border-slate-800 last:border-none flex flex-col"
            >
              <span className="font-bold text-blue-400">
                {item.structured_formatting.main_text}
              </span>
              <span className="text-xs text-slate-500">
                {item.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};