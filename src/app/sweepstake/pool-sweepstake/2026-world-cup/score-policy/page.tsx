import type { Metadata } from "next";
import Link from "next/link";
import { getLoggedInUser } from "../../../../actions";
import { Header } from "../../../../components/Header";

export const metadata: Metadata = {
  title: "Regras de Pontuação · Copa do Mundo 2026 · Bolão Maia",
  description:
    "Entenda como funciona o sistema de pontuação do Bolão Maia para a Copa do Mundo FIFA 2026: fase de grupos, fase de mata-mata e a intuição matemática por trás das fórmulas.",
};

// ─── helpers ────────────────────────────────────────────────────────────────

function scaled(k: number, v: number): number {
  return Math.floor(k * v);
}

function groupTeamScore(
  numTeams: number,
  numQualified: number,
  worstPosition: number,
): number {
  if (worstPosition <= 2) {
    return scaled(10, Math.log2(numTeams / worstPosition));
  }
  return scaled(10, Math.log2(numTeams / numQualified));
}

function cupTeamScore(
  numTeams: number,
  worstPosition: number,
  k: number,
): number {
  return k * scaled(10, Math.log2(numTeams / worstPosition));
}

// ─── constants ───────────────────────────────────────────────────────────────

const GROUP_NUM_TEAMS_PER_GROUP = 4;
const TOTAL_TEAMS = 48; // 12 groups × 4
const TOTAL_QUALIFIED = 32; // 24 auto + 8 best 3rds
const CUP_NUM_TEAMS = 32;
const CUP_FACTOR = 3;

const SCORE_1ST = groupTeamScore(GROUP_NUM_TEAMS_PER_GROUP, 2, 1); // 20
const SCORE_2ND = groupTeamScore(GROUP_NUM_TEAMS_PER_GROUP, 2, 2); // 10
const SCORE_BEST_3RD = groupTeamScore(TOTAL_TEAMS, TOTAL_QUALIFIED, 3); // 5

const CUP_CHAMPION = cupTeamScore(CUP_NUM_TEAMS, 1, CUP_FACTOR); // 150
const CUP_FINALIST = cupTeamScore(CUP_NUM_TEAMS, 2, CUP_FACTOR); // 120
const CUP_THIRD = cupTeamScore(CUP_NUM_TEAMS, 3, CUP_FACTOR); // 102
const CUP_FOURTH = cupTeamScore(CUP_NUM_TEAMS, 4, CUP_FACTOR); // 90
const CUP_QUARTERS = cupTeamScore(CUP_NUM_TEAMS, 8, CUP_FACTOR); // 60
const CUP_ROUND16 = cupTeamScore(CUP_NUM_TEAMS, 16, CUP_FACTOR); // 30

const MAX_GROUPS = 12 * SCORE_1ST + 12 * SCORE_2ND + 8 * SCORE_BEST_3RD; // 400
const MAX_CUP =
  CUP_CHAMPION +
  CUP_FINALIST +
  CUP_THIRD +
  CUP_FOURTH +
  4 * CUP_QUARTERS +
  8 * CUP_ROUND16; // 942
const MAX_TOTAL = MAX_GROUPS + MAX_CUP; // 1342

// ─── sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-3xl">{emoji}</span>
      <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl px-5 py-4 mb-6 font-mono text-sm text-emerald-300 overflow-x-auto">
      {children}
    </div>
  );
}

function ScoreTable({
  rows,
}: {
  rows: { label: string; pts: number; dim?: boolean }[];
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider">
            <th className="px-5 py-3 text-left font-semibold">Acerto</th>
            <th className="px-5 py-3 text-right font-semibold">Pontos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors ${row.dim ? "opacity-50" : "hover:bg-zinc-900/40"}`}
            >
              <td className="px-5 py-3.5 text-zinc-300">{row.label}</td>
              <td className="px-5 py-3.5 text-right font-bold text-emerald-400">
                {row.pts} pts
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaxScoreBadge({ label, pts }: { label: string; pts: number }) {
  return (
    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
      <span className="text-xs font-semibold text-zinc-400">{label}</span>
      <span className="text-lg font-extrabold text-emerald-400">
        {pts.toLocaleString("pt-BR")} pts
      </span>
    </div>
  );
}

function ExampleCard({
  title,
  accent,
  rows,
  total,
}: {
  title: string;
  accent: "emerald" | "amber" | "rose";
  rows: { label: string; pts: number | string }[];
  total: number | string;
}) {
  const colors = {
    emerald: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      title: "text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    amber: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      title: "text-amber-400",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    },
    rose: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
      title: "text-rose-400",
      badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    },
  }[accent];

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
      <p className={`text-sm font-bold ${colors.title} mb-3`}>{title}</p>
      <div className="space-y-1.5 mb-3">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-xs text-zinc-400">
            <span>{r.label}</span>
            <span className="font-semibold text-zinc-300">{r.pts}</span>
          </div>
        ))}
      </div>
      <div
        className={`border-t border-zinc-700/40 pt-3 flex justify-between items-center`}
      >
        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
          Total
        </span>
        <span
          className={`text-sm font-extrabold px-3 py-1 rounded-full border ${colors.badge}`}
        >
          {total} pts
        </span>
      </div>
    </div>
  );
}

function Principle({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 size-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
        {n}
      </div>
      <div>
        <p className="text-zinc-200 font-semibold text-sm mb-1">{title}</p>
        <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function ScorePolicyPage() {
  const user = await getLoggedInUser();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header currentUser={user} />

      <main className="container mx-auto px-4 py-10 flex-1 flex flex-col max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-8">
          <Link
            href="/sweepstake/pool-sweepstake/2026-world-cup"
            className="hover:text-zinc-400 transition-colors"
          >
            Copa 2026
          </Link>
          <span>/</span>
          <span className="text-zinc-400">Regras de Pontuação</span>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              📋 Documentação
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              Regras de{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Pontuação
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
              O sistema de pontuação recompensa quem acerta eventos mais
              improváveis. Quanto menor a chance de um time alcançar determinada
              posição, mais pontos valem os palpites que o previram
              corretamente.
            </p>
          </div>
        </div>

        {/* ── SECTION: Fase de Grupos ─────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader emoji="⚽" title="Fase de Grupos" />


          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Cada grupo tem <strong className="text-zinc-200">4 times</strong>.
            Os <strong className="text-zinc-200">2 primeiros</strong> de cada
            grupo se classificam automaticamente. Os{" "}
            <strong className="text-zinc-200">
              8 melhores terceiros colocados
            </strong>{" "}
            (de um total de 12) também avançam, completando os 32 classificados.
            A pontuação de cada time é{" "}
            <strong className="text-zinc-200">não cumulativa</strong>: o palpite
            se beneficia da melhor pontuação disponível com base na pior posição
            entre o resultado real e o palpite.
          </p>

          <ScoreTable
            rows={[
              { label: "Acertou o 1º colocado do grupo", pts: SCORE_1ST },
              {
                label: "Palpitou que o time chegaria pelo menos ao 2º lugar",
                pts: SCORE_2ND,
              },
              {
                label:
                  "Palpitou que o time se classificaria (incluindo melhor 3º)",
                pts: SCORE_BEST_3RD,
              },
              {
                label: "Não acertou a classificação do time",
                pts: 0,
                dim: true,
              },
            ]}
          />

          <MaxScoreBadge
            label="Pontuação máxima — fase de grupos"
            pts={MAX_GROUPS}
          />
          <p className="text-xs text-zinc-600 mb-6">
            = 12 grupos × 20 (1º) + 12 grupos × 10 (2º) + 8 melhores 3os × 5 ={" "}
            {MAX_GROUPS} pts
          </p>

          {/* Exemplos */}
          <h3 className="text-base font-bold text-zinc-300 mb-4">Exemplos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ExampleCard
              title="✅ Acertou tudo num grupo"
              accent="emerald"
              rows={[
                { label: "Brasil — 1º (palpite: 1º)", pts: `${SCORE_1ST} pts` },
                {
                  label: "Argentina — 2º (palpite: 2º)",
                  pts: `${SCORE_2ND} pts`,
                },
              ]}
              total={SCORE_1ST + SCORE_2ND}
            />
            <ExampleCard
              title="🟡 Acertou parcialmente"
              accent="amber"
              rows={[
                {
                  label: `Brasil — ficou 2º, palpite era 1º (pior = 2º)`,
                  pts: `${SCORE_2ND} pts`,
                },
                {
                  label: "Argentina — ficou 3º, não classificou (errou)",
                  pts: "0 pts",
                },
              ]}
              total={SCORE_2ND}
            />
            <ExampleCard
              title="🟢 Acertou melhor 3º colocado"
              accent="emerald"
              rows={[
                {
                  label:
                    "México — ficou 3º e avançou como melhor 3º (palpite: classificado)",
                  pts: `${SCORE_BEST_3RD} pts`,
                },
              ]}
              total={SCORE_BEST_3RD}
            />
            <ExampleCard
              title="🔴 Não acertou a classificação"
              accent="rose"
              rows={[
                {
                  label:
                    "EUA — palpite era 2º, ficou 3º e não passou (errou quem se classifica)",
                  pts: "0 pts",
                },
                {
                  label:
                    "Portugal — palpite era classificado, ficou 4º no grupo",
                  pts: "0 pts",
                },
              ]}
              total={0}
            />
          </div>
        </section>

        {/* ── SECTION: Fase de Mata-Mata ──────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader emoji="🏆" title="Fase de Mata-Mata" />


          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            A fase de mata-mata conta com os{" "}
            <strong className="text-zinc-200">32 classificados</strong> da fase
            de grupos. O palpite indica até qual fase você prevê que cada time
            avançará. A pontuação é{" "}
            <strong className="text-zinc-200">não cumulativa</strong> e usa a{" "}
            <strong className="text-zinc-200">pior posição</strong> entre o
            resultado real e o palpite — palpites conservadores são protegidos,
            palpites otimistas demais são penalizados. O fator{" "}
            <strong className="text-zinc-200">k = 3</strong> faz com que os
            acertos do mata-mata valham mais do que os da fase de grupos.
          </p>

          <ScoreTable
            rows={[
              {
                label: "Palpitou que o time que seria campeão",
                pts: CUP_CHAMPION,
              },
              {
                label:
                  "Palpitou que o time chegaria pelo menos à final (finalista)",
                pts: CUP_FINALIST,
              },
              {
                label:
                  "Palpitou que o time chegaria pelo menos às semifinais (3º lugar)",
                pts: CUP_THIRD,
              },
              {
                label:
                  "Palpitou que o time chegaria pelo menos às semifinais (4º lugar)",
                pts: CUP_FOURTH,
              },
              {
                label:
                  "Palpitou que o time chegaria pelo menos às quartas de final",
                pts: CUP_QUARTERS,
              },
              {
                label:
                  "Palpitou que o time chegaria pelo menos às oitavas de final",
                pts: CUP_ROUND16,
              },
              { label: "Não acertou nenhuma fase do time", pts: 0, dim: true },
            ]}
          />

          <MaxScoreBadge label="Pontuação máxima — mata-mata" pts={MAX_CUP} />
          <p className="text-xs text-zinc-600 mb-6">
            = {CUP_CHAMPION} (campeão) + {CUP_FINALIST} (finalista) +{" "}
            {CUP_THIRD} (3º) + {CUP_FOURTH} (4º) + 4 × {CUP_QUARTERS} (quartas)
            + 8 × {CUP_ROUND16} (oitavas) = {MAX_CUP} pts
          </p>

          {/* Exemplos */}
          <h3 className="text-base font-bold text-zinc-300 mb-4">Exemplos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ExampleCard
              title="✅ Acertou o campeão"
              accent="emerald"
              rows={[
                {
                  label: "Brasil — campeão (palpite: campeão)",
                  pts: `${CUP_CHAMPION} pts`,
                },
              ]}
              total={CUP_CHAMPION}
            />
            <ExampleCard
              title="🟡 Palpite conservador"
              accent="amber"
              rows={[
                {
                  label: `Brasil — foi campeão, palpite era quartas`,
                  pts: `${CUP_QUARTERS} pts`,
                },
                {
                  label: "(pior posição = palpite = quartas)",
                  pts: "",
                },
              ]}
              total={CUP_QUARTERS}
            />
            <ExampleCard
              title="🔴 Palpite otimista demais"
              accent="rose"
              rows={[
                {
                  label: "Brasil — palpite era campeão, caiu nas oitavas",
                  pts: `${CUP_ROUND16} pts`,
                },
                {
                  label: "(pior posição = resultado real = oitavas)",
                  pts: "",
                },
              ]}
              total={CUP_ROUND16}
            />
          </div>
        </section>

        {/* ── SECTION: Pontuação Geral ─────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader emoji="📊" title="Pontuação Geral" />

          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            A pontuação geral é a{" "}
            <strong className="text-zinc-200">soma</strong> dos pontos obtidos
            na fase de grupos e na fase de mata-mata.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Fase de Grupos", pts: MAX_GROUPS, emoji: "⚽" },
              { label: "Fase de Mata-Mata", pts: MAX_CUP, emoji: "🏆" },
              { label: "Total Máximo", pts: MAX_TOTAL, emoji: "🥇" },
            ].map(({ label, pts, emoji }) => (
              <div
                key={label}
                className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 text-center"
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {pts.toLocaleString("pt-BR")}
                  <span className="text-sm font-semibold text-zinc-500 ml-1">
                    pts
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Intuição Matemática ─────────────────────────────────── */}
        <section className="mb-10">
          <SectionHeader emoji="🧮" title="Intuição Matemática" />

          {/* Princípios */}
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-5">
            Princípios
          </h3>
          <div className="space-y-6 mb-10">
            <Principle
              n={1}
              title="Palpites mais precisos valem mais"
              body="Acertar o 1º colocado pontua mais do que acertar que o time chegaria pelo menos à final — mesmo que o time tenha sido campeão nos dois casos. Isso acontece porque a probabilidade de terminar exatamente em 1º é menor do que a de terminar entre os dois finalistas. Quanto mais específico (e portanto improvável) for o palpite que se confirma, maior a recompensa."
            />
            <Principle
              n={2}
              title="Pontuação calculada na margem (não cumulativa)"
              body="Quem palpita que o time vai mais longe do que o real é penalizado — a pontuação usa a posição real, que é pior. Quem palpita aquém do real é protegido — a pontuação usa o palpite, que é mais conservador. Nunca existe acúmulo de pontos por passar de uma fase à outra."
            />
            <Principle
              n={3}
              title="Eventos raros não devem ser inalcançáveis"
              body="O logaritmo (log₂) garante que pontuações altíssimas sejam possíveis mas não infinitas. Uma probabilidade de 100 % pontua zero, e eventos cada vez mais improváveis crescem de forma logarítmica — não explosiva."
            />
            <Principle
              n={4}
              title="Pontuação inteira"
              body="A função scaled(k, v) = floor(k × v) multiplica o logaritmo por 10 e aplica piso, garantindo que o resultado seja sempre um número inteiro."
            />
            <Principle
              n={5}
              title="Mata-mata vale mais"
              body="O fator k = 3 na fase de mata-mata faz com que acertar o campeão (150 pts) valha muito mais do que acertar o 1º de um grupo (20 pts), refletindo a maior importância de prever o vencedor de uma fase eliminatória."
            />
          </div>

          {/* Derivação */}
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-5">
            Derivação da fórmula
          </h3>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Probabilidade de uma posição",
                body: (
                  <>
                    A probabilidade de um time ficar <em>pelo menos</em> na
                    posição <code className="text-emerald-300">x</code> é:
                    <FormulaBlock>
                      <span className="text-zinc-400">p(x) = </span>
                      <span className="text-emerald-300">x</span>
                      <span className="text-zinc-400"> / N</span>
                      <br />
                      <span className="text-zinc-600">
                        {"// N = número total de times na fase"}
                      </span>
                    </FormulaBlock>
                    <strong className="text-zinc-300">Fase de grupos:</strong>{" "}
                    <code className="text-emerald-300">N = 4</code> (times por
                    grupo), então p(1º) = 1/4 e p(2º) = 2/4. Para o melhor 3º,
                    usamos 32/48 (os 32 classificados entre 48 times).
                    <br />
                    <br />
                    <strong className="text-zinc-300">Fase de mata-mata:</strong>{" "}
                    <code className="text-emerald-300">N = 32</code> (times
                    classificados). A posição de cada time é determinada pela
                    fase em que foi eliminado:
                    <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-zinc-900/80 text-zinc-500">
                            <th className="px-4 py-2 text-left font-semibold">Fase de eliminação</th>
                            <th className="px-4 py-2 text-right font-semibold">Posição (x)</th>
                            <th className="px-4 py-2 text-right font-semibold">p(x) = x/32</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-400">
                          <tr>
                            <td className="px-4 py-2">Campeão</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">1</td>
                            <td className="px-4 py-2 text-right font-mono">1/32</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Final (vice-campeão)</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">2</td>
                            <td className="px-4 py-2 text-right font-mono">2/32</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Disputa de 3º lugar (vencedor)</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">3</td>
                            <td className="px-4 py-2 text-right font-mono">3/32</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Disputa de 3º lugar (perdedor)</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">4</td>
                            <td className="px-4 py-2 text-right font-mono">4/32</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Eliminado nas quartas de final</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">8</td>
                            <td className="px-4 py-2 text-right font-mono">8/32</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Eliminado nas oitavas de final</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-400">16</td>
                            <td className="px-4 py-2 text-right font-mono">16/32</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ),
              },
              {
                step: "2",
                title: "Probabilidade inversa",
                body: (
                  <>
                    A pontuação bruta é a probabilidade <em>inversa</em> —
                    eventos mais raros geram valores maiores:
                    <FormulaBlock>
                      <span className="text-zinc-400">{"inverse_prob = "}</span>
                      <span className="text-emerald-300">1 / p(x)</span>
                      <span className="text-zinc-400">{" = N / x"}</span>
                    </FormulaBlock>
                  </>
                ),
              },
              {
                step: "3",
                title: "Aplicação do logaritmo",
                body: (
                  <>
                    O log₂ comprime a escala, impedindo que eventos extremamente
                    raros dominem completamente o placar e garantindo que p = 1
                    pontue zero:
                    <FormulaBlock>
                      <span className="text-emerald-300">log₂</span>
                      <span className="text-zinc-400">(N / x)</span>
                    </FormulaBlock>
                  </>
                ),
              },
              {
                step: "4",
                title: "Escalonamento para inteiro",
                body: (
                  <>
                    Multiplicamos por 10 e aplicamos piso para obter um inteiro
                    legível:
                    <FormulaBlock>
                      <span className="text-emerald-300">scaled</span>
                      <span className="text-zinc-300">(10, v) = </span>
                      <span className="text-teal-300">floor</span>
                      <span className="text-zinc-300">(10 × v)</span>
                    </FormulaBlock>
                  </>
                ),
              },
              {
                step: "5",
                title: "Fator de fase",
                body: (
                  <>
                    O fator <code className="text-emerald-300">k</code>{" "}
                    multiplica a pontuação para diferenciar as fases do torneio.
                    A pontuação final é:
                    <FormulaBlock>
                      <span className="text-zinc-400">pontos = </span>
                      <span className="text-amber-300">k</span>
                      <span className="text-zinc-400"> × </span>
                      <span className="text-emerald-300">scaled</span>
                      <span className="text-zinc-300">(10, </span>
                      <span className="text-teal-300">log₂</span>
                      <span className="text-zinc-300">(N / </span>
                      <span className="text-emerald-300">max</span>
                      <span className="text-zinc-300">
                        (pos_real, palpite)))
                      </span>
                      <br />
                      <br />
                      <span className="text-zinc-600">
                        {"// k = 1  → fase de grupos"}
                      </span>
                      <br />
                      <span className="text-zinc-600">
                        {"// k = 3  → fase de mata-mata"}
                      </span>
                    </FormulaBlock>
                  </>
                ),
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="size-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {step}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-200">{title}</h4>
                </div>
                <div className="text-sm text-zinc-400 leading-relaxed">
                  {body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="border-t border-zinc-900 pt-8">
          <Link
            href="/sweepstake/pool-sweepstake/2026-world-cup"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            ← Voltar ao Bolão
          </Link>
        </div>
      </main>
    </div>
  );
}
