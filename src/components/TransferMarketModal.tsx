import React, { useState, useEffect } from 'react';
import { TeamData, PlayerData, MarketPlayer, PlayerPosition } from '../types/game';
import { ShoppingBag, Users, Coins, Check, ArrowRight, Shield, Zap, Search } from 'lucide-react';

interface TransferMarketModalProps {
  userTeam: TeamData;
  onUpdateUserTeam: (team: TeamData) => void;
  onClose: () => void;
}

const GLOBAL_MARKET_PLAYERS: MarketPlayer[] = [
  { id: 'mkt_1', name: 'Kylian Donat', team: 'Madrid Royals', position: 'ST', rating: 93, price: 18000, attributes: { pace: 97, shooting: 92, passing: 82, dribbling: 93, defending: 36, physical: 79 } },
  { id: 'mkt_2', name: 'Erling Haal', team: 'Manchester Titans', position: 'ST', rating: 93, price: 17500, attributes: { pace: 91, shooting: 94, passing: 68, dribbling: 81, defending: 45, physical: 92 } },
  { id: 'mkt_3', name: 'Jude Belling', team: 'Madrid Royals', position: 'CAM', rating: 91, price: 16000, attributes: { pace: 84, shooting: 86, passing: 87, dribbling: 88, defending: 78, physical: 84 } },
  { id: 'mkt_4', name: 'Vini Junior', team: 'Madrid Royals', position: 'LW', rating: 92, price: 16500, attributes: { pace: 96, shooting: 87, passing: 83, dribbling: 94, defending: 32, physical: 70 } },
  { id: 'mkt_5', name: 'Lamine Yamal', team: 'Catalonia FC', position: 'RW', rating: 88, price: 12000, attributes: { pace: 92, shooting: 84, passing: 86, dribbling: 93, defending: 40, physical: 67 } },
  { id: 'mkt_6', name: 'Lionel Messor', team: 'Buenos Aires FC', position: 'RW', rating: 92, price: 15000, attributes: { pace: 82, shooting: 93, passing: 94, dribbling: 95, defending: 35, physical: 65 } },
  { id: 'mkt_7', name: 'Kevin De Bruy', team: 'Manchester Titans', position: 'CAM', rating: 91, price: 14000, attributes: { pace: 74, shooting: 88, passing: 95, dribbling: 87, defending: 65, physical: 76 } },
  { id: 'mkt_8', name: 'Rodri Hernan', team: 'Manchester Titans', position: 'CDM', rating: 92, price: 15500, attributes: { pace: 68, shooting: 84, passing: 90, dribbling: 85, defending: 89, physical: 88 } },
  { id: 'mkt_9', name: 'Cole Palm', team: 'London Blue', position: 'CAM', rating: 87, price: 11000, attributes: { pace: 83, shooting: 86, passing: 87, dribbling: 88, defending: 50, physical: 71 } },
  { id: 'mkt_10', name: 'Florian Wirtz', team: 'Rhine Lions', position: 'CAM', rating: 89, price: 13500, attributes: { pace: 85, shooting: 84, passing: 89, dribbling: 91, defending: 56, physical: 70 } },
  { id: 'mkt_11', name: 'Bukayo Saka', team: 'London Gunners', position: 'RW', rating: 89, price: 13000, attributes: { pace: 89, shooting: 85, passing: 85, dribbling: 89, defending: 65, physical: 78 } },
  { id: 'mkt_12', name: 'Thibault Couron', team: 'Madrid Royals', position: 'GK', rating: 90, price: 12500, attributes: { pace: 52, shooting: 24, passing: 78, dribbling: 45, defending: 92, physical: 88 } },
];

export const TransferMarketModal: React.FC<TransferMarketModalProps> = ({
  userTeam,
  onUpdateUserTeam,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'mysquad'>('market');
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dls3d_coins');
      return saved ? parseInt(saved, 10) : 25000;
    } catch {
      return 25000;
    }
  });

  const [filterPos, setFilterPos] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const saveCoins = (newAmount: number) => {
    setCoins(newAmount);
    try {
      localStorage.setItem('dls3d_coins', newAmount.toString());
    } catch {}
  };

  const handleBuyPlayer = (mkt: MarketPlayer) => {
    if (coins < mkt.price) {
      setMessage('Yetarli tanga mavjud emas! (Not enough coins)');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (userTeam.players.some(p => p.name === mkt.name)) {
      setMessage('Bu futbolchi allaqachon jamoangizda bor! (Player already in squad)');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const newPlayer: PlayerData = {
      id: `p_${Date.now()}`,
      name: mkt.name,
      number: Math.floor(10 + Math.random() * 88),
      position: mkt.position,
      rating: mkt.rating,
      attributes: mkt.attributes,
      stamina: 100,
    };

    const updatedPlayers = [newPlayer, ...userTeam.players];
    const updatedTeam = { ...userTeam, players: updatedPlayers };

    saveCoins(coins - mkt.price);
    onUpdateUserTeam(updatedTeam);
    setMessage(`${mkt.name} jamoangizga muvaffaqiyatli qo'shildi! (-${mkt.price} Coins)`);
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSellPlayer = (player: PlayerData) => {
    if (userTeam.players.length <= 11) {
      setMessage('Asosiy tarkibda kamida 11 nafar futbolchi qolishi shart! (Squad must have at least 11 players)');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const sellPrice = Math.round(player.rating * 90);
    const updatedPlayers = userTeam.players.filter(p => p.id !== player.id);
    const updatedTeam = { ...userTeam, players: updatedPlayers };

    saveCoins(coins + sellPrice);
    onUpdateUserTeam(updatedTeam);
    setMessage(`${player.name} sotildi! (+${sellPrice} Coins)`);
    setTimeout(() => setMessage(null), 3500);
  };

  const filteredMarket = GLOBAL_MARKET_PLAYERS.filter(p => {
    const matchesPos = filterPos === 'all' || p.position === filterPos;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
                Transfer Bozori · Transfer Market
              </h2>
              <span className="text-xs text-slate-400">
                Sotib oling, soting va jamoangizni kuchaytiring
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coin Balance Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/50 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-mono-numbers text-sm font-black text-amber-300">
                {coins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
            >
              Yopish
            </button>
          </div>
        </div>

        {/* Status Notification Message */}
        {message && (
          <div className="bg-sky-600/90 text-white text-xs font-bold py-2 px-6 text-center animate-pulse">
            {message}
          </div>
        )}

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'market'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Transfer Bozori</span>
            </button>

            <button
              onClick={() => setActiveTab('mysquad')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'mysquad'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Mening Jamoam ({userTeam.players.length})</span>
            </button>
          </div>

          {activeTab === 'market' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Futbolchi qidirish..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={filterPos}
                onChange={e => setFilterPos(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300 focus:outline-none"
              >
                <option value="all">Barchasi</option>
                <option value="ST">ST</option>
                <option value="LW">LW</option>
                <option value="RW">RW</option>
                <option value="CAM">CAM</option>
                <option value="CM">CM</option>
                <option value="CDM">CDM</option>
                <option value="CB">CB</option>
                <option value="LB">LB</option>
                <option value="RB">RB</option>
                <option value="GK">GK</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Global Transfer Market */}
        {activeTab === 'market' && (
          <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarket.map(player => {
              const inSquad = userTeam.players.some(p => p.name === player.name);
              return (
                <div
                  key={player.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-400/50 transition-all flex flex-col justify-between gap-3 shadow-lg group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
                        {player.position}
                      </span>
                      <h3 className="font-bold text-base text-white mt-1 group-hover:text-sky-300 transition-colors">
                        {player.name}
                      </h3>
                      <span className="text-xs text-slate-400">{player.team}</span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center font-mono-numbers font-black text-amber-400 text-lg shadow-inner">
                      {player.rating}
                    </div>
                  </div>

                  {/* Attributes Mini-Bar */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-numbers text-slate-300">
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">PAC</span>
                      <strong className="text-white">{player.attributes.pace}</strong>
                    </div>
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">SHO</span>
                      <strong className="text-white">{player.attributes.shooting}</strong>
                    </div>
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">PAS</span>
                      <strong className="text-white">{player.attributes.passing}</strong>
                    </div>
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">DRI</span>
                      <strong className="text-white">{player.attributes.dribbling}</strong>
                    </div>
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">DEF</span>
                      <strong className="text-white">{player.attributes.defending}</strong>
                    </div>
                    <div className="bg-slate-900 px-1.5 py-1 rounded flex justify-between">
                      <span className="text-slate-500 font-sans">PHY</span>
                      <strong className="text-white">{player.attributes.physical}</strong>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button
                    disabled={inSquad}
                    onClick={() => handleBuyPlayer(player)}
                    className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                      inSquad
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : coins >= player.price
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-98'
                        : 'bg-slate-800 text-amber-400 border border-amber-400/30 hover:bg-slate-700'
                    }`}
                  >
                    {inSquad ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tarkibda mavjud</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5 fill-current" />
                        <span>Sotib olish: {player.price.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: My Squad / Roster */}
        {activeTab === 'mysquad' && (
          <div className="p-6 overflow-y-auto flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Jamoa: <strong className="text-white">{userTeam.name}</strong></span>
              <span>Futbolchilar soni: <strong className="text-white">{userTeam.players.length}</strong></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userTeam.players.map((p, idx) => {
                const sellValue = Math.round(p.rating * 90);
                const isStarter = idx < 11;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/20 flex items-center justify-center font-athletic font-black text-white text-sm">
                        #{p.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isStarter ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isStarter ? 'START' : 'BENCH'}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                            {p.position}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-0.5 truncate max-w-[130px]">
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono-numbers font-black text-amber-400 text-sm">
                        OVR {p.rating}
                      </span>
                      <button
                        onClick={() => handleSellPlayer(p)}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-bold transition-colors"
                        title={`Sotish: +${sellValue} Coins`}
                      >
                        Sotish ({sellValue})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
