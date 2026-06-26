import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Search,
  Download,
  LogOut,
  ShieldCheck,
  AtSign,
  Globe,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import {
  generateMockResults,
  toCSV,
  download,
  type OsintResult,
  type QueryType,
} from "@/lib/osint-mock";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "OSINT Console" },
      { name: "description", content: "Consultas OSINT por usuario, dominio o correo." },
    ],
  }),
  component: OsintPage,
});

const TYPE_META: Record<QueryType, { label: string; placeholder: string; icon: typeof UserIcon }> = {
  username: { label: "Usuario", placeholder: "ej. johndoe", icon: UserIcon },
  domain: { label: "Dominio", placeholder: "ej. ejemplo.com", icon: Globe },
  email: { label: "Correo", placeholder: "ej. juan@ejemplo.com", icon: AtSign },
};

const RISK_VARIANT: Record<OsintResult["risk"], string> = {
  info: "bg-muted text-muted-foreground",
  low: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "bg-destructive/15 text-destructive",
};

function validate(type: QueryType, value: string): string | null {
  const v = value.trim();
  if (!v) return "Ingresa un valor para buscar";
  if (v.length > 255) return "Demasiado largo";
  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo inválido";
  if (type === "domain" && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)) return "Dominio inválido";
  if (type === "username" && !/^[a-zA-Z0-9._-]{2,40}$/.test(v)) return "Usuario inválido (2-40, alfanum, . _ -)";
  return null;
}

function OsintPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<QueryType>("domain");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OsintResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState<{ type: QueryType; value: string } | null>(null);

  const Icon = TYPE_META[type].icon;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(type, query);
    if (err) return toast.error(err);
    setSearching(true);
    // Simula latencia de red mientras SpiderFoot ejecuta los módulos.
    await new Promise((r) => setTimeout(r, 900));
    const data = generateMockResults(type, query.trim());
    setResults(data);
    setLastQuery({ type, value: query.trim() });
    setSearching(false);
    toast.success(`${data.length} hallazgos`);
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const filename = useMemo(() => {
    if (!lastQuery) return "osint";
    const safe = lastQuery.value.replace(/[^a-z0-9]+/gi, "_");
    return `osint_${lastQuery.type}_${safe}`;
  }, [lastQuery]);

  function exportCSV() {
    if (!results.length) return;
    download(`${filename}.csv`, toCSV(results), "text/csv;charset=utf-8");
  }
  function exportJSON() {
    if (!results.length) return;
    download(
      `${filename}.json`,
      JSON.stringify({ query: lastQuery, generatedAt: new Date().toISOString(), results }, null, 2),
      "application/json",
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold leading-tight">OSINT Console</h1>
              <p className="text-xs text-muted-foreground">Powered by SpiderFoot (simulado)</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nueva investigación</CardTitle>
            <CardDescription>
              Selecciona el tipo de objetivo y ejecuta los módulos OSINT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-[180px_1fr_auto]">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as QueryType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_META) as QueryType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_META[t].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q">Objetivo</Label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={TYPE_META[type].placeholder}
                    className="pl-9"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={searching} className="w-full md:w-auto">
                  {searching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>
                {lastQuery
                  ? `${results.length} hallazgos para ${TYPE_META[lastQuery.type].label.toLowerCase()} "${lastQuery.value}"`
                  : "Aún no hay consultas"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={!results.length}>
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportJSON} disabled={!results.length}>
                <Download className="w-4 h-4 mr-2" /> JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dato</TableHead>
                    <TableHead>Riesgo</TableHead>
                    <TableHead className="text-right">Descubierto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                        Ejecuta una búsqueda para ver resultados aquí.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.module}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.type}</TableCell>
                        <TableCell className="font-medium break-all">{r.data}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={RISK_VARIANT[r.risk]}>
                            {r.risk}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(r.discoveredAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
