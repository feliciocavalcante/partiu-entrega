import { Navigation } from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-3 justify-center my-8">
    <div className="bg-slate-800 p-2.5 rounded-2xl shadow-lg border border-slate-700">
      <Navigation size={28} className="text-blue-500 fill-blue-500" />
    </div>
    <h1 className="text-2xl font-black tracking-tighter text-slate-50">
      PARTIU<span className="text-blue-500">ENTREGA</span>
    </h1>
  </div>
);