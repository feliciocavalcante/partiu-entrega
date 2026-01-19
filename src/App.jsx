import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Logo } from './components/Logo';
import { DeliveryForm } from './components/DeliveryForm';
import { DeliveryList } from './components/DeliveryList';
import { RouteMap } from './components/RouteMap'; 
import { getCoordinates } from './services/mapService';

function App() {
  const [entregas, setEntregas] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [myPos, setMyPos] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entregas"), orderBy("status", "desc"), orderBy("dataCriacao", "desc"));
    return onSnapshot(q, (snapshot) => {
      setEntregas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const otimizarRota = () => {
    if (!navigator.geolocation) return alert("GPS não suportado.");
    setIsOptimizing(true);

    // CONFIGURAÇÃO PARA FORÇAR GPS REAL
    const gpsOptions = {
      enableHighAccuracy: true, // Força uso do satélite/GPS real
      timeout: 15000,           // Espera até 15 segundos pela posição
      maximumAge: 0             // Não aceita localização em cache
    };

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      
      // LOG DE TESTE: Verifique estes números no console (F12)
      console.log("📍 Localização detectada:", lat, lng);
      
      setMyPos({ lat, lng });

      const pendentes = entregas.filter(e => e.status === 'pendente' && e.lat && e.lng);
      
      if (pendentes.length === 0) {
        setIsOptimizing(false);
        return alert("Nenhum endereço com GPS para otimizar.");
      }

      const ordenada = pendentes.map(e => ({
        ...e,
        distancia: calcularDistancia(lat, lng, e.lat, e.lng)
      })).sort((a, b) => a.distancia - b.distancia);

      setOptimizedRoute(ordenada);
      setEntregas(prev => [...ordenada, ...prev.filter(e => e.status !== 'pendente' || !e.lat)]);
      setShowMap(true); 
      setIsOptimizing(false);
    }, (error) => {
      console.error("Erro GPS:", error);
      alert("Erro ao obter localização: " + error.message);
      setIsOptimizing(false);
    }, gpsOptions);
  };

  // Funções CRUD 
  const handleAdd = async (texto, coordsPredefinidas = null) => {
    try {
      const coords = coordsPredefinidas || await getCoordinates(texto);
      await addDoc(collection(db, "entregas"), { texto, status: "pendente", dataCriacao: new Date(), lat: coords?.lat || null, lng: coords?.lng || null });
    } catch (e) { console.error(e); }
  };

  const handleBulkAdd = async (lista) => {
    const batch = writeBatch(db);
    for (const texto of lista) {
      const coords = await getCoordinates(texto);
      const docRef = doc(collection(db, "entregas"));
      batch.set(docRef, { texto, status: "pendente", dataCriacao: new Date(), lat: coords?.lat || null, lng: coords?.lng || null });
    }
    await batch.commit();
  };

  const handleEdit = async (id, textoAtual) => {
    const novoTexto = prompt("Editar:", textoAtual);
    if (novoTexto) {
      const coords = await getCoordinates(novoTexto);
      await updateDoc(doc(db, "entregas", id), { texto: novoTexto, lat: coords?.lat || null, lng: coords?.lng || null });
    }
  };

  const handleToggleStatus = async (id, statusAtual) => {
    await updateDoc(doc(db, "entregas", id), { status: statusAtual === 'pendente' ? 'entregue' : 'pendente' });
  };

  const handleDelete = async (id) => {
    if(confirm("Excluir?")) await deleteDoc(doc(db, "entregas", id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans pb-24">
      <Logo />
      <DeliveryForm onAdd={handleAdd} onBulkAdd={handleBulkAdd} />
      <DeliveryList items={entregas} onDelete={handleDelete} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />

      {showMap && myPos && (
        <RouteMap orders={optimizedRoute} myLocation={myPos} onClose={() => setShowMap(false)} />
      )}

      {entregas.filter(e => e.status === 'pendente').length >= 2 && (
        <div className="fixed bottom-6 left-0 right-0 px-5 max-w-md mx-auto z-50">
          <button
            disabled={isOptimizing}
            onClick={otimizarRota}
            className={`w-full ${isOptimizing ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-500'} text-white font-black py-4 rounded-2xl shadow-2xl shadow-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3`}
          >
            {isOptimizing ? "Calculando..." : "Ver Mapa e Otimizar"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;