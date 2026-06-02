"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Tabs,
  Avatar,
  Chip,
  ProgressBar,
  Label,
  Accordion,
  Table,
  Modal,
  Alert,
  CloseButton,
  Spinner
} from "@heroui/react";

// Mock Data
const INITIAL_POOLS = [
  {
    id: "wc-2026",
    title: "Copa do Mundo 2026",
    category: "Fifa World Cup",
    progress: 45,
    participants: 124,
    status: "active",
    statusLabel: "Ativo",
    closesIn: "2 dias",
    statusColor: "success" as const,
    image: "⚽",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    id: "cl-2026",
    title: "Champions League",
    category: "UEFA",
    progress: 80,
    participants: 89,
    status: "active",
    statusLabel: "Fase Final",
    closesIn: "5 dias",
    statusColor: "accent" as const,
    image: "🏆",
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    id: "br-2026",
    title: "Brasileirão Série A",
    category: "CBF",
    progress: 12,
    participants: 250,
    status: "active",
    statusLabel: "Rodada 5",
    closesIn: "12 horas",
    statusColor: "warning" as const,
    image: "🇧🇷",
    gradient: "from-yellow-500/10 to-green-500/10",
  },
  {
    id: "euro-2026",
    title: "Eurocopa 2026",
    category: "UEFA",
    progress: 100,
    participants: 78,
    status: "completed",
    statusLabel: "Finalizado",
    closesIn: "Encerrado",
    statusColor: "danger" as const,
    image: "🇪🇺",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Thiago Silva", avatar: "TS", score: 345, exact: 18, outcome: 42, trend: "up", avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg" },
  { rank: 2, name: "Luigi Minardi", avatar: "LM", score: 330, exact: 15, outcome: 48, trend: "same", avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg" },
  { rank: 3, name: "Ana Costa", avatar: "AC", score: 312, exact: 14, outcome: 40, trend: "down", avatarUrl: "" },
  { rank: 4, name: "Carlos Maia", avatar: "CM", score: 298, exact: 11, outcome: 45, trend: "up", avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg" },
  { rank: 5, name: "Mariana Souza", avatar: "MS", score: 285, exact: 12, outcome: 38, trend: "down", avatarUrl: "" },
];

const INITIAL_MATCHES = [
  {
    id: "m1",
    home: "Argentina",
    homeFlag: "🇦🇷",
    away: "França",
    awayFlag: "🇫🇷",
    date: "Amanhã, 16:00",
    stage: "Quartas de Final",
    predictionHome: "2",
    predictionAway: "1",
  },
  {
    id: "m2",
    home: "Brasil",
    homeFlag: "🇧🇷",
    away: "Alemanha",
    awayFlag: "🇩🇪",
    date: "Quinta, 16:00",
    stage: "Quartas de Final",
    predictionHome: "3",
    predictionAway: "1",
  },
  {
    id: "m3",
    home: "Espanha",
    homeFlag: "🇪🇸",
    away: "Inglaterra",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    date: "Sexta, 16:00",
    stage: "Semifinal",
    predictionHome: "1",
    predictionAway: "1",
  },
];

export default function Home() {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [selectedChampionship, setSelectedChampionship] = useState("wc");
  
  // Predictor State
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Modal Submit Simulation
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;
    
    setAlertMessage(`Bolão "${newPoolName}" criado com sucesso! Compartilhe o código de convite: MAIA-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsModalOpen(false);
    setNewPoolName("");
    
    // Clear alert after 6 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 6000);
  };

  // Prediction Score Change
  const updateScore = (matchId: string, team: "home" | "away", val: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const currentVal = parseInt(team === "home" ? m.predictionHome : m.predictionAway) || 0;
        const newVal = Math.max(0, currentVal + val).toString();
        return team === "home" 
          ? { ...m, predictionHome: newVal } 
          : { ...m, predictionAway: newVal };
      }
      return m;
    }));
  };

  // Score Input Change
  const handleScoreInput = (matchId: string, team: "home" | "away", value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return team === "home"
          ? { ...m, predictionHome: cleaned }
          : { ...m, predictionAway: cleaned };
      }
      return m;
    }));
  };

  // Submit Predictions Simulation
  const savePredictions = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAlertMessage("Seus palpites foram salvos com sucesso! Boa sorte!");
      setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              Bolão Maia
            </span>
            <Chip color="success" className="text-[10px] h-5 px-1.5 font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v3.0 (HeroUI)
            </Chip>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <span className="text-zinc-100 border-b-2 border-emerald-500 pb-1 pt-1 px-1">Painel</span>
            <a href="#pools" className="hover:text-zinc-100 transition-colors">Meus Bolões</a>
            <a href="#leaderboard" className="hover:text-zinc-100 transition-colors">Classificação</a>
            <a href="#rules" className="hover:text-zinc-100 transition-colors">Regulamento</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              onPress={() => setIsModalOpen(true)}
              className="bg-emerald-500 text-zinc-950 font-semibold px-4 py-2 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10 rounded-xl text-sm"
              id="btn-create-sweepstake"
            >
              Criar Bolão
            </Button>
            
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
              <Avatar aria-label="Seu Perfil" className="size-8 ring-2 ring-emerald-500/20">
                <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg" alt="Perfil" />
                <Avatar.Fallback>LM</Avatar.Fallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-zinc-200">Luigi Minardi</p>
                <p className="text-[10px] text-zinc-500">330 pts • #2º</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ALERT SECTION */}
      {alertMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top duration-300">
          <Alert status="success" className="bg-zinc-900 border border-emerald-500/30 text-zinc-100 shadow-xl shadow-black/80">
            <Alert.Indicator className="text-emerald-500" />
            <Alert.Content>
              <Alert.Title className="font-semibold text-emerald-400">Sucesso!</Alert.Title>
              <Alert.Description className="text-zinc-300 text-sm mt-0.5">{alertMessage}</Alert.Description>
            </Alert.Content>
            <CloseButton onPress={() => setAlertMessage(null)} className="text-zinc-400 hover:text-zinc-200" />
          </Alert>
        </div>
      )}

      {/* 2. HERO BANNER */}
      <section className="relative w-full pt-8 pb-12 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4">
          <Card className="relative w-full border border-zinc-900 bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div className="relative z-10 flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Bolão Destaque
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
                Copa do Mundo <br className="hidden md:inline" />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Fifa World Cup 2026</span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base max-w-lg mb-6 leading-relaxed">
                Faça seus palpites sobre quem se classificará na fase de grupos e projete o mata-mata completo do maior torneio do planeta. Dispute prêmios com a galera!
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-zinc-300">
                <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-sm">👥</span>
                  <span>124 Participantes</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-sm">💰</span>
                  <span className="text-emerald-400">R$ 2.480,00 Acumulados</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-sm">⏰</span>
                  <span>Fecha em 48h</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-auto flex flex-col items-center justify-center bg-zinc-950/50 border border-zinc-800/80 p-6 rounded-2xl md:min-w-[320px]">
              <span className="text-4xl mb-2">🏆</span>
              <h3 className="font-bold text-lg text-zinc-200">Palpite nos Grupos & Cup</h3>
              <p className="text-zinc-500 text-xs text-center mt-1 mb-4 max-w-[200px]">
                A pontuação se ajusta de acordo com o nível de acerto nos jogos e mata-mata.
              </p>
              <div className="w-full space-y-3">
                <div className="flex justify-between text-xs font-medium text-zinc-400">
                  <span>Palpites preenchidos</span>
                  <span>18/40</span>
                </div>
                <ProgressBar aria-label="Palpites preenchidos" className="w-full" value={45}>
                  <ProgressBar.Track className="bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <ProgressBar.Fill className="bg-emerald-500 h-full rounded-full transition-all duration-500" />
                  </ProgressBar.Track>
                </ProgressBar>
                <div className="pt-2 flex gap-2">
                  <a href="#predictor" className="w-full">
                    <Button className="w-full bg-emerald-500 text-zinc-950 font-bold py-2.5 rounded-xl hover:bg-emerald-400 transition-all text-xs">
                      Continuar Palpites
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. TABS MAIN SECTION */}
      <main className="container mx-auto px-4 pb-20 flex-1">
        <Tabs className="w-full flex flex-col gap-6" id="dashboard-tabs">
          <Tabs.ListContainer className="border-b border-zinc-900">
            <Tabs.List
              aria-label="Opções do Painel"
              className="flex gap-4 md:gap-8 overflow-x-auto pb-0.5 *:px-4 *:py-3 *:text-sm *:font-semibold *:transition-all *:relative *:outline-none"
            >
              <Tabs.Tab id="pools" className="text-zinc-400 data-[selected=true]:text-emerald-400">
                <span>🏆 Meus Bolões</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>
              
              <Tabs.Tab id="predictor" className="text-zinc-400 data-[selected=true]:text-emerald-400">
                <span>⚽ Palpitar (Simulação)</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>

              <Tabs.Tab id="leaderboard" className="text-zinc-400 data-[selected=true]:text-emerald-400">
                <span>📊 Classificação Geral</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>

              <Tabs.Tab id="rules" className="text-zinc-400 data-[selected=true]:text-emerald-400">
                <span>📜 Regulamento & Pontos</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          {/* TAB 1: MEUS BOLÕES */}
          <Tabs.Panel id="pools" className="pt-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Seus Bolões Ativos</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Participe, crie novos grupos e acompanhe os encerramentos.</p>
                </div>
                <Button 
                  onPress={() => setIsModalOpen(true)}
                  variant="outline"
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl text-xs px-3 py-1.5"
                >
                  + Novo Grupo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {INITIAL_POOLS.map((pool) => (
                  <Card key={pool.id} className="bg-zinc-900/50 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all flex flex-col justify-between overflow-hidden group">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${pool.gradient}`} />
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{pool.image}</span>
                          <Chip 
                            color={pool.statusColor} 
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-5 bg-zinc-950/80 border border-zinc-800"
                          >
                            {pool.statusLabel}
                          </Chip>
                        </div>
                        <h3 className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{pool.title}</h3>
                        <p className="text-zinc-500 text-xs mt-0.5">{pool.category}</p>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                            <span>Preenchimento</span>
                            <span>{pool.progress}%</span>
                          </div>
                          <ProgressBar aria-label="Progresso do palpite" value={pool.progress}>
                            <ProgressBar.Track className="bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                              <ProgressBar.Fill className={`h-full rounded-full bg-gradient-to-r ${pool.gradient}`} />
                            </ProgressBar.Track>
                          </ProgressBar>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-900 pt-3">
                          <span>👥 {pool.participants} palpiteiros</span>
                          <span className="text-zinc-400 font-semibold">{pool.closesIn}</span>
                        </div>

                        <a href="#predictor" className="block w-full">
                          <Button 
                            variant="secondary"
                            className="w-full mt-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs py-2 rounded-xl border border-zinc-850 hover:border-zinc-800 transition-all"
                          >
                            {pool.status === "completed" ? "Ver Classificação" : "Editar Palpites"}
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Tabs.Panel>

          {/* TAB 2: PALPITAR SIMULAÇÃO */}
          <Tabs.Panel id="predictor" className="pt-2">
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-bold text-zinc-100">Simulador de Palpites</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Insira os placares abaixo e clique em salvar para registrar sua aposta.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip color="success" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 h-6">
                    Prazo: 04/06 às 15:45
                  </Chip>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {matches.map((match) => (
                  <Card key={match.id} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 md:p-6 hover:border-zinc-800 transition-all">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                      
                      {/* Match Details */}
                      <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-[140px]">
                        <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 mb-2">
                          {match.stage}
                        </span>
                        <span className="text-zinc-500 text-xs">{match.date}</span>
                      </div>

                      {/* Team VS Panel */}
                      <div className="flex items-center justify-center gap-4 md:gap-8 flex-1 w-full max-w-md">
                        
                        {/* Home Team */}
                        <div className="flex items-center justify-end gap-3 flex-1">
                          <span className="font-bold text-sm md:text-base text-zinc-200 text-right line-clamp-1">{match.home}</span>
                          <span className="text-2xl md:text-3xl shrink-0">{match.homeFlag}</span>
                        </div>

                        {/* Input Home */}
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1.5 rounded-xl shrink-0">
                          <Button 
                            variant="ghost" 
                            onPress={() => updateScore(match.id, "home", -1)}
                            className="size-7 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg text-sm font-bold"
                          >
                            -
                          </Button>
                          <input 
                            type="text" 
                            value={match.predictionHome}
                            onChange={(e) => handleScoreInput(match.id, "home", e.target.value)}
                            className="w-8 text-center font-bold text-zinc-100 text-base md:text-lg focus:outline-none bg-transparent"
                            aria-label={`Gols do ${match.home}`}
                          />
                          <Button 
                            variant="ghost" 
                            onPress={() => updateScore(match.id, "home", 1)}
                            className="size-7 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg text-sm font-bold"
                          >
                            +
                          </Button>
                        </div>

                        <span className="text-zinc-600 font-extrabold text-sm shrink-0">X</span>

                        {/* Input Away */}
                        <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-2 py-1.5 rounded-xl shrink-0">
                          <Button 
                            variant="ghost" 
                            onPress={() => updateScore(match.id, "away", -1)}
                            className="size-7 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg text-sm font-bold"
                          >
                            -
                          </Button>
                          <input 
                            type="text" 
                            value={match.predictionAway}
                            onChange={(e) => handleScoreInput(match.id, "away", e.target.value)}
                            className="w-8 text-center font-bold text-zinc-100 text-base md:text-lg focus:outline-none bg-transparent"
                            aria-label={`Gols do ${match.away}`}
                          />
                          <Button 
                            variant="ghost" 
                            onPress={() => updateScore(match.id, "away", 1)}
                            className="size-7 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg text-sm font-bold"
                          >
                            +
                          </Button>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-start gap-3 flex-1">
                          <span className="text-2xl md:text-3xl shrink-0">{match.awayFlag}</span>
                          <span className="font-bold text-sm md:text-base text-zinc-200 text-left line-clamp-1">{match.away}</span>
                        </div>

                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-zinc-900 pt-6">
                <Button 
                  variant="outline"
                  onPress={() => setMatches(INITIAL_MATCHES)}
                  className="border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800 text-zinc-400 font-semibold px-5 py-2.5 rounded-xl text-xs"
                >
                  Limpar Alterações
                </Button>
                <Button 
                  onPress={savePredictions}
                  className="bg-emerald-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 text-xs shadow-md shadow-emerald-500/10"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="xs" className="text-zinc-950" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Palpites</span>
                  )}
                </Button>
              </div>
            </div>
          </Tabs.Panel>

          {/* TAB 3: LEADERBOARD CLASSIFICAÇÃO */}
          <Tabs.Panel id="leaderboard" className="pt-2">
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Classificação dos Palpiteiros</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Acompanhe quem está no topo e quem está subindo no placar geral do bolão.</p>
              </div>

              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden mt-2">
                <Table>
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Tabela de Classificação" className="min-w-[600px]">
                      <Table.Header className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-850 text-xs font-bold uppercase tracking-wider">
                        <Table.Column isRowHeader className="w-20 pl-6 py-4">Posição</Table.Column>
                        <Table.Column className="py-4">Usuário</Table.Column>
                        <Table.Column className="text-center py-4">Placar Exato (10pt)</Table.Column>
                        <Table.Column className="text-center py-4">Vencedor/Gols (5pt)</Table.Column>
                        <Table.Column className="text-right pr-6 py-4">Pontuação Total</Table.Column>
                      </Table.Header>
                      <Table.Body className="text-sm font-semibold text-zinc-200">
                        {LEADERBOARD.map((user) => (
                          <Table.Row key={user.rank} className="border-b border-zinc-900 hover:bg-zinc-900/20 transition-colors">
                            <Table.Cell className="pl-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                                  user.rank === 1 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                  user.rank === 2 ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/30" :
                                  user.rank === 3 ? "bg-amber-600/20 text-amber-500 border border-amber-600/30" :
                                  "text-zinc-500"
                                }`}>
                                  {user.rank}
                                </span>
                                <span className="text-[10px]">
                                  {user.trend === "up" && <span className="text-emerald-500">▲</span>}
                                  {user.trend === "down" && <span className="text-red-500">▼</span>}
                                  {user.trend === "same" && <span className="text-zinc-600">●</span>}
                                </span>
                              </div>
                            </Table.Cell>
                            
                            <Table.Cell className="py-4">
                              <div className="flex items-center gap-3">
                                <Avatar aria-label={`Foto de ${user.name}`} className="size-8">
                                  {user.avatarUrl ? (
                                    <Avatar.Image src={user.avatarUrl} alt={user.name} />
                                  ) : null}
                                  <Avatar.Fallback>{user.avatar}</Avatar.Fallback>
                                </Avatar>
                                <span className={user.name === "Luigi Minardi" ? "text-emerald-400 font-bold" : "text-zinc-200"}>
                                  {user.name}
                                  {user.name === "Luigi Minardi" && (
                                    <Chip className="ml-2 h-4 px-1 text-[8px] bg-emerald-550/10 text-emerald-400 border border-emerald-500/10 font-bold uppercase">
                                      Você
                                    </Chip>
                                  )}
                                </span>
                              </div>
                            </Table.Cell>
                            
                            <Table.Cell className="text-center py-4 text-zinc-400">{user.exact}</Table.Cell>
                            <Table.Cell className="text-center py-4 text-zinc-400">{user.outcome}</Table.Cell>
                            
                            <Table.Cell className="text-right pr-6 py-4 font-bold text-zinc-100">
                              <span className="text-base text-emerald-400">{user.score}</span>
                              <span className="text-[10px] text-zinc-500 ml-1">pts</span>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </div>
            </div>
          </Tabs.Panel>

          {/* TAB 4: ACCORDION REGULAMENTO */}
          <Tabs.Panel id="rules" className="pt-2">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Funcionamento da Pontuação</h2>
                <p className="text-zinc-500 text-xs mt-0.5">As regras definem o número de pontos somados por partida dependendo da precisão de seu palpite.</p>
              </div>

              <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 mt-2">
                <Accordion className="w-full">
                  <Accordion.Item>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-sm font-semibold py-3 flex items-center justify-between text-zinc-200 hover:text-emerald-400 w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-550">🔥</span>
                          <span>Placar Exato (10 Pontos)</span>
                        </span>
                        <Accordion.Indicator>
                          <span className="text-xs text-zinc-600">▼</span>
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel className="pb-4 pt-1 pl-7 text-xs text-zinc-400 leading-relaxed">
                      <Accordion.Body>
                        Você ganha <strong>10 pontos</strong> se acertar exatamente o resultado final do jogo. 
                        Por exemplo, se você palpitou 2 x 1 e a partida terminou exatamente 2 x 1.
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-sm font-semibold py-3 flex items-center justify-between text-zinc-200 hover:text-emerald-400 w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-550">⚽</span>
                          <span>Acerto de Vencedor & Gols do Vencedor (7 Pontos)</span>
                        </span>
                        <Accordion.Indicator>
                          <span className="text-xs text-zinc-600">▼</span>
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel className="pb-4 pt-1 pl-7 text-xs text-zinc-400 leading-relaxed">
                      <Accordion.Body>
                        Você ganha <strong>7 pontos</strong> se acertar o vencedor da partida e o número exato de gols marcados pelo time vencedor, mesmo errando o saldo ou gols do perdedor. 
                        Por exemplo, palpitou 3 x 1 e terminou 3 x 2.
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-sm font-semibold py-3 flex items-center justify-between text-zinc-200 hover:text-emerald-400 w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-550">📈</span>
                          <span>Vencedor e Saldo de Gols (5 Pontos)</span>
                        </span>
                        <Accordion.Indicator>
                          <span className="text-xs text-zinc-600">▼</span>
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel className="pb-4 pt-1 pl-7 text-xs text-zinc-400 leading-relaxed">
                      <Accordion.Body>
                        Você ganha <strong>5 pontos</strong> se acertar o vencedor e a diferença de gols (saldo). 
                        Por exemplo, palpitou 2 x 0 (saldo +2) e terminou 3 x 1 (saldo +2).
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item>
                    <Accordion.Heading>
                      <Accordion.Trigger className="text-sm font-semibold py-3 flex items-center justify-between text-zinc-200 hover:text-emerald-400 w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-550">🎯</span>
                          <span>Acerto Apenas do Vencedor (3 Pontos)</span>
                        </span>
                        <Accordion.Indicator>
                          <span className="text-xs text-zinc-600">▼</span>
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel className="pb-4 pt-1 pl-7 text-xs text-zinc-400 leading-relaxed">
                      <Accordion.Body>
                        Você ganha <strong>3 pontos</strong> se apenas acertar quem ganhou o jogo (ou o empate), mas errar placar exato, gols do vencedor e saldo.
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      </main>

      {/* 4. MOCK CREATION MODAL */}
      <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 relative">
            <Modal.CloseTrigger className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200" />
            
            <Modal.Header className="mb-4">
              <Modal.Icon className="bg-emerald-500/10 text-emerald-400 rounded-xl size-10 flex items-center justify-center border border-emerald-500/10 mb-2">
                <span>➕</span>
              </Modal.Icon>
              <Modal.Heading className="text-xl font-bold text-zinc-100">Criar Novo Bolão</Modal.Heading>
            </Modal.Header>

            <form onSubmit={handleCreatePool}>
              <Modal.Body className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label htmlFor="pool-name" className="text-xs font-semibold text-zinc-400">Nome do Bolão</label>
                  <input 
                    id="pool-name"
                    type="text" 
                    placeholder="Ex: Galera do Futebol F.C." 
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 px-4 py-3 rounded-xl focus:outline-none text-zinc-100 text-sm placeholder:text-zinc-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="championship" className="text-xs font-semibold text-zinc-400">Campeonato Base</label>
                  <select 
                    id="championship"
                    value={selectedChampionship}
                    onChange={(e) => setSelectedChampionship(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 px-4 py-3 rounded-xl focus:outline-none text-zinc-100 text-sm transition-colors cursor-pointer"
                  >
                    <option value="wc">Copa do Mundo FIFA 2026</option>
                    <option value="cl">UEFA Champions League</option>
                    <option value="br">Brasileirão Série A</option>
                  </select>
                </div>

                <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 text-xs text-zinc-500 leading-relaxed">
                  Ao criar o bolão, você se tornará o <strong>administrador</strong>. Poderá definir taxas de entrada se desejar e convidar amigos pelo link gerado.
                </div>
              </Modal.Body>

              <Modal.Footer className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-850 pt-4">
                <Button 
                  slot="close" 
                  variant="outline" 
                  className="border-zinc-800 text-zinc-400 hover:bg-zinc-950 px-4 py-2 rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-500 text-zinc-950 font-bold px-5 py-2 rounded-xl hover:bg-emerald-400 transition-all text-xs"
                >
                  Confirmar e Criar
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* 5. FOOTER */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-8 text-center text-zinc-600 text-xs mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Bolão Maia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Server Time: 2026-06-02 18:16:21</span>
            <span>•</span>
            <a href="#" className="hover:text-zinc-400 transition-colors">Termos</a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
