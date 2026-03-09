import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  getAnalyticsDashboard,
  type ProfileRow,
  type SeoPageRow,
} from "@/lib/admin-analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Phone, Eye, Clock, TrendingUp, FileText } from "lucide-react";
import { ACTIVE_CITY_SLUG } from "@/lib/site-config";

const DAY_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
];

export default function AdminAnalyticsDashboard() {
  const [city, setCity] = useState<string>(ACTIVE_CITY_SLUG);
  const [days, setDays] = useState<number>(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_analytics", city, days],
    queryFn: () => getAnalyticsDashboard({ city: city || undefined, days }),
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Analytics</h1>
        <p className="text-destructive">Error al cargar analítica: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Analytics</h1>
      <p className="text-muted-foreground">
        Métricas desde Google Analytics (GA4). Qué perfiles y páginas generan más clientes.
      </p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Ciudad</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ACTIVE_CITY_SLUG}>{ACTIVE_CITY_SLUG}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Período</label>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <p className="text-muted-foreground">Cargando analítica…</p>
      )}

      {data && (
        <>
          {/* Sección 1 — Resumen general */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Resumen general</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clics WhatsApp</CardTitle>
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.summary.total_whatsapp_clicks}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Clics teléfono</CardTitle>
                  <Phone className="h-4 w-4 text-gold" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.summary.total_phone_clicks}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Visitas a perfiles</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.summary.total_profile_views}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo prom. en perfil</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{Math.round(data.summary.avg_time_on_profile_seconds)} s</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Gráfico líneas: WhatsApp por día */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Clics WhatsApp por día</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.whatsappByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--gold))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sección 2 — Ranking escorts (ordenado por WhatsApp) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Ranking de escorts (por clics WhatsApp)</h2>
            <RankingTable
              rows={[...data.topProfiles].sort((a, b) => b.whatsapp_clicks - a.whatsapp_clicks)}
            />
          </section>

          {/* Gráfico barras: Top 10 escorts WhatsApp */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Top 10 escorts por clics WhatsApp</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...data.topProfiles]
                        .sort((a, b) => b.whatsapp_clicks - a.whatsapp_clicks)
                        .slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="profile_name" width={70} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="whatsapp_clicks" fill="hsl(var(--gold))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sección 3 — Páginas SEO */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Páginas SEO que generan más clientes</h2>
            <SeoPagesTable rows={data.topSeoPages} />
          </section>

          {/* Gráfico barras: Top páginas SEO conversión */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Top páginas SEO por conversión (WhatsApp + teléfono)</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...data.topSeoPages]
                        .map((p) => ({
                          ...p,
                          total: p.whatsapp_clicks + p.phone_clicks,
                          page: p.page_path.replace(/^\//, "").slice(0, 25),
                        }))
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 10)}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="page" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sección 4 — Embudo */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Embudo de conversión</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  {data.funnel.map((step, i) => (
                    <div key={step.step} className="flex items-center gap-2">
                      <div className="rounded-lg border bg-card px-4 py-2 min-w-[140px] text-center">
                        <p className="text-xs text-muted-foreground">{step.label}</p>
                        <p className="text-xl font-bold">{step.count.toLocaleString()}</p>
                      </div>
                      {i < data.funnel.length - 1 && (
                        <span className="text-muted-foreground hidden sm:inline">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sección 5 — Perfiles con mayor engagement */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Perfiles con mayor engagement</h2>
            <EngagementTable rows={data.topEngagement} />
          </section>
        </>
      )}
    </div>
  );
}

function RankingTable({ rows }: { rows: ProfileRow[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead className="text-right">Visitas perfil</TableHead>
            <TableHead className="text-right">Clics WhatsApp</TableHead>
            <TableHead className="text-right">Clics teléfono</TableHead>
            <TableHead className="text-right">Tiempo prom. (s)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 50).map((row, i) => (
            <TableRow key={row.profile_id}>
              <TableCell className="font-medium">{i + 1}</TableCell>
              <TableCell>{row.profile_name}</TableCell>
              <TableCell>{row.city}</TableCell>
              <TableCell className="text-right">{row.profile_views}</TableCell>
              <TableCell className="text-right">{row.whatsapp_clicks}</TableCell>
              <TableCell className="text-right">{row.phone_clicks}</TableCell>
              <TableCell className="text-right">{Math.round(row.avg_engagement_seconds)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function SeoPagesTable({ rows }: { rows: SeoPageRow[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Página</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead className="text-right">Visitas</TableHead>
            <TableHead className="text-right">Clics WhatsApp</TableHead>
            <TableHead className="text-right">Clics teléfono</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows
            .sort((a, b) => b.whatsapp_clicks + b.phone_clicks - (a.whatsapp_clicks + a.phone_clicks))
            .slice(0, 30)
            .map((row, i) => (
              <TableRow key={row.page_path}>
                <TableCell className="font-medium">{i + 1}</TableCell>
                <TableCell className="font-mono text-sm">{row.page_path}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell className="text-right">{row.visits}</TableCell>
                <TableCell className="text-right">{row.whatsapp_clicks}</TableCell>
                <TableCell className="text-right">{row.phone_clicks}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function EngagementTable({ rows }: { rows: ProfileRow[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perfil</TableHead>
            <TableHead className="text-right">Tiempo prom. (s)</TableHead>
            <TableHead className="text-right">Visitas</TableHead>
            <TableHead className="text-right">Clics WhatsApp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 30).map((row) => (
            <TableRow key={row.profile_id}>
              <TableCell className="font-medium">{row.profile_name}</TableCell>
              <TableCell className="text-right">{Math.round(row.avg_engagement_seconds)}</TableCell>
              <TableCell className="text-right">{row.profile_views}</TableCell>
              <TableCell className="text-right">{row.whatsapp_clicks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
