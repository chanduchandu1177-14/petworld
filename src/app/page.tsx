export const runtime = 'edge';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black tracking-widest mb-4">PETSTORY</h1>
      <p className="text-indigo-400 mb-8 uppercase tracking-widest text-sm">Target: USA / UK / AUS</p>
      
      <div className="bg-[#16161d] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-6">BEAM UP YOUR PET 🚀</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Pet Name" className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl" />
          <select className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white/60">
            <option>Dog (Bones 🦴)</option>
            <option>Cat (Fish 🐟)</option>
          </select>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold transition-all">
            POST TO FEED
          </button>
        </div>
      </div>
    </div>
  );
}
