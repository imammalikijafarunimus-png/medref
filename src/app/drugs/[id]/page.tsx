'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Pill,
  AlertTriangle,
  Activity,
  Baby,
  Shield,
  Info,
  Zap,
  Clock,
  FlaskConical,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Drug } from '@/types';

// ── Local helper (replaces @/lib/helpers) ────────────────────────────────────
function parseJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

// ── Pregnancy category color map ─────────────────────────────────────────────
const pregnancyCatConfig: Record<string, { label: string; color: string }> = {
  a: { label: 'Cat A', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400' },
  b: { label: 'Cat B', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400' },
  c: { label: 'Cat C', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400' },
  d: { label: 'Cat D', color: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400' },
  x: { label: 'Cat X', color: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400' },
};

const interactionSeverityConfig: Record<string, { label: string; dot: string; border: string; bg: string }> = {
  major:    { label: 'Major',    dot: 'bg-red-500',    border: 'border-red-200 dark:border-red-900',    bg: 'bg-red-50/50 dark:bg-red-950/20' },
  moderate: { label: 'Moderate', dot: 'bg-amber-500',  border: 'border-amber-200 dark:border-amber-900', bg: 'bg-amber-50/50 dark:bg-amber-950/20' },
  minor:    { label: 'Minor',    dot: 'bg-blue-400',   border: 'border-blue-200 dark:border-blue-900',   bg: 'bg-blue-50/50 dark:bg-blue-950/20' },
};

export default function DrugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const drugId = params.id as string;

  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [copiedDose, setCopiedDose] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dose-0']));

  // ── Fetch drug + favorite status ──────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [drugRes, favRes] = await Promise.all([
          fetch(`/api/drugs/${drugId}`),
          fetch(`/api/favorites/${drugId}?itemType=drug`),
        ]);

        const drugData = await drugRes.json();
        if (drugData.success) {
          setDrug(drugData.data);
        } else {
          toast.error('Obat tidak ditemukan');
          router.push('/drugs');
          return;
        }

        if (favRes.ok) {
          const favData = await favRes.json();
          setIsFavorite(favData.isFavorite);
          setFavoriteId(favData.favoriteId);
        }
      } catch (error) {
        console.error('Error fetching drug:', error);
        toast.error('Gagal memuat data obat');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [drugId, router]);

  // ── ✅ FIX: Favorite toggle hits real API ─────────────────────────────────
  const handleFavoriteClick = useCallback(async () => {
    if (favoriteLoading) return;
    setFavoriteLoading(true);

    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        const res = await fetch(`/api/favorites/${favoriteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success(`${drug?.name} dihapus dari favorit`);
      } else {
        // Add to favorites
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: drugId, itemType: 'drug' }),
        });
        if (!res.ok) throw new Error('Post failed');
        const data = await res.json();
        setIsFavorite(true);
        setFavoriteId(data.id || data.favoriteId);
        toast.success(`${drug?.name} ditambahkan ke favorit`);
      }
    } catch {
      toast.error('Gagal mengubah favorit');
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, favoriteId, favoriteLoading, drug?.name, drugId]);

  // ── Copy dose to clipboard ────────────────────────────────────────────────
  const handleCopyDose = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedDose(key);
    toast.success('Dosis disalin');
    setTimeout(() => setCopiedDose(null), 2000);
  }, []);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="rounded-2xl border border-border/60 p-5 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            {[60, 80, 56].map((w, i) => (
              <Skeleton key={i} className="h-6 rounded-full" style={{ width: w }} />
            ))}
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!drug) return null;

  const brandNames = parseJson<string[]>(drug.brandNames, []);
  const pregnancyCat = drug.pregnancyCat?.toLowerCase();
  const pregnancyConfig = pregnancyCat ? pregnancyCatConfig[pregnancyCat] : null;
  const primaryDose = drug.doses?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* ── Back nav ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/drugs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Daftar Obat
          </Link>
        </Button>
      </div>

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div className="mt-0.5 w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                {drug.name}
              </h1>
              {drug.genericName && (
                <p className="text-sm text-muted-foreground mt-0.5">{drug.genericName}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {drug.drugClass && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/8 text-primary border border-primary/15">
                    {drug.drugClass}
                  </span>
                )}
                {drug.route && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
                    {drug.route}
                  </span>
                )}
                {pregnancyConfig && (
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border', pregnancyConfig.color)}>
                    <Baby className="h-2.5 w-2.5" />
                    {pregnancyConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            className={cn(
              'mt-0.5 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0',
              'hover:scale-105 active:scale-95 disabled:opacity-50',
              isFavorite
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-500'
                : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-rose-500 hover:border-rose-500/25 hover:bg-rose-500/8'
            )}
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart
              className={cn('h-4 w-4 transition-all duration-200', isFavorite && 'fill-rose-500')}
            />
          </button>
        </div>

        {/* Brand names */}
        {brandNames.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-border/40">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Nama Dagang
            </p>
            <div className="flex flex-wrap gap-1.5">
              {brandNames.map((name: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/40"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Summary Card ───────────────────────────────────────────── */}
      {primaryDose && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/4 dark:bg-blue-950/20 p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Ringkasan Klinis
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* Indication */}
            {primaryDose.indication && (
              <div className="sm:col-span-3 pb-2 mb-1 border-b border-blue-500/10">
                <p className="text-[11px] text-muted-foreground mb-0.5">Indikasi utama</p>
                <p className="text-sm font-medium text-foreground">{primaryDose.indication}</p>
              </div>
            )}
            {/* Adult dose */}
            <div className="flex flex-col gap-0.5 group">
              <p className="text-[11px] text-muted-foreground">Dosis dewasa</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{primaryDose.adultDose}</p>
                <button
                  onClick={() => handleCopyDose(primaryDose.adultDose, 'adult-quick')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedDose === 'adult-quick'
                    ? <Check className="h-3 w-3 text-emerald-500" />
                    : <Copy className="h-3 w-3 text-muted-foreground" />}
                </button>
              </div>
              {primaryDose.frequency && (
                <p className="text-[11px] text-muted-foreground">{primaryDose.frequency}</p>
              )}
            </div>
            {/* Pediatric */}
            {primaryDose.pediatricDose && (
              <div className="flex flex-col gap-0.5 group">
                <p className="text-[11px] text-muted-foreground">Dosis anak</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{primaryDose.pediatricDose}</p>
                  <button
                    onClick={() => handleCopyDose(primaryDose.pediatricDose!, 'ped-quick')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedDose === 'ped-quick'
                      ? <Check className="h-3 w-3 text-emerald-500" />
                      : <Copy className="h-3 w-3 text-muted-foreground" />}
                  </button>
                </div>
                <Link href={`/calculator?drugId=${drug.id}`} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                  Kalkulator dosis <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            )}
            {/* Max dose */}
            {primaryDose.maxDose && (
              <div className="flex flex-col gap-0.5">
                <p className="text-[11px] text-muted-foreground">Dosis maksimal</p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {primaryDose.maxDose} {primaryDose.maxDoseUnit}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Contraindications alert (always visible if exists) ───────────── */}
      {drug.contraindications && drug.contraindications.length > 0 && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 dark:bg-red-950/20 p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Shield className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Kontraindikasi
            </span>
          </div>
          <div className="space-y-1.5">
            {drug.contraindications.map((contra, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{contra.contraindication}</p>
                  {contra.severity === 'absolute' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                      Absolut
                    </span>
                  )}
                  {contra.notes && (
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">{contra.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="dosing">
        <TabsList className="w-full grid grid-cols-4 h-9 p-0.5 mb-4">
          <TabsTrigger value="dosing" className="text-xs gap-1">
            <Activity className="h-3 w-3" />
            Dosis
          </TabsTrigger>
          <TabsTrigger value="indications" className="text-xs gap-1">
            <Shield className="h-3 w-3" />
            Indikasi
          </TabsTrigger>
          <TabsTrigger value="interactions" className="text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />
            Interaksi
            {drug.interactions && drug.interactions.length > 0 && (
              <span className="ml-0.5 px-1 py-0 rounded-full text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold">
                {drug.interactions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs gap-1">
            <Info className="h-3 w-3" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* ── Dosing Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="dosing" className="space-y-3 mt-0">
          {drug.doses && drug.doses.length > 0 ? drug.doses.map((dose, index) => {
            const key = `dose-${index}`;
            const isOpen = expandedSections.has(key);
            return (
              <div key={index} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {/* Dose header — always visible */}
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {dose.indication || 'Dosis Standar'}
                      </p>
                      {!isOpen && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-55">
                          {dose.adultDose}
                        </p>
                      )}
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {/* Dose body */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {/* Adult */}
                      <DoseBlock
                        label="Dosis Dewasa"
                        value={dose.adultDose}
                        sub={dose.frequency ?? undefined}
                        onCopy={() => handleCopyDose(dose.adultDose, `adult-${index}`)}
                        copied={copiedDose === `adult-${index}`}
                        color="blue"
                      />
                      {/* Pediatric */}
                      {dose.pediatricDose && (
                        <DoseBlock
                          label="Dosis Anak"
                          value={dose.pediatricDose}
                          sub={
                            dose.pediatricMinAge || dose.pediatricMaxAge
                              ? `Usia ${dose.pediatricMinAge ?? '0'}–${dose.pediatricMaxAge ?? '18'} tahun`
                              : undefined
                          }
                          onCopy={() => handleCopyDose(dose.pediatricDose!, `ped-${index}`)}
                          copied={copiedDose === `ped-${index}`}
                          color="emerald"
                          link={`/calculator?drugId=${drug.id}`}
                          linkLabel="Kalkulator dosis"
                        />
                      )}
                    </div>

                    {/* Max dose warning */}
                    {dose.maxDose && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/8 border border-orange-500/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                        <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                          Dosis maks: <span className="font-bold">{dose.maxDose} {dose.maxDoseUnit}</span>
                        </p>
                      </div>
                    )}

                    {/* Adjustments */}
                    {(dose.renalAdjust || dose.hepaticAdjust) && (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {dose.renalAdjust && (
                          <AdjustBlock icon="renal" label="Penyesuaian Renal" value={dose.renalAdjust} />
                        )}
                        {dose.hepaticAdjust && (
                          <AdjustBlock icon="hepatic" label="Penyesuaian Hepatik" value={dose.hepaticAdjust} />
                        )}
                      </div>
                    )}

                    {dose.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed px-1">{dose.notes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          }) : (
            <EmptySection message="Belum ada informasi dosis" />
          )}
        </TabsContent>

        {/* ── Indications Tab ────────────────────────────────────────────── */}
        <TabsContent value="indications" className="space-y-3 mt-0">
          {drug.indications && drug.indications.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              {drug.indications.map((indication, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start justify-between p-4',
                    index !== drug.indications!.length - 1 && 'border-b border-border/40'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{indication.indication}</p>
                      {indication.icdCode && (
                        <p className="text-xs text-muted-foreground mt-0.5">ICD-10: {indication.icdCode}</p>
                      )}
                      {indication.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{indication.notes}</p>
                      )}
                    </div>
                  </div>
                  {indication.priority > 0 && (
                    <span className="ml-2 shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      P{indication.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptySection message="Belum ada data indikasi" />
          )}
        </TabsContent>

        {/* ── Interactions Tab ───────────────────────────────────────────── */}
        <TabsContent value="interactions" className="space-y-2 mt-0">
          {drug.interactions && drug.interactions.length > 0 ? drug.interactions.map((interaction, index) => {
            const sev = (interaction.interactionType || 'minor').toLowerCase();
            const cfg = interactionSeverityConfig[sev] ?? interactionSeverityConfig.minor;
            return (
              <div
                key={index}
                className={cn('rounded-2xl border p-4', cfg.border, cfg.bg)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
                    <Link
                      href={`/drugs/${interaction.interactingDrugId}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {interaction.interactingDrug?.name}
                    </Link>
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
                    sev === 'major'    && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                    sev === 'moderate' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                    sev === 'minor'    && 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                  )}>
                    {cfg.label}
                  </span>
                </div>
                {interaction.effect && (
                  <p className="text-xs text-foreground/80 mb-2 leading-relaxed">{interaction.effect}</p>
                )}
                {interaction.management && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Manajemen · </span>
                    <span className="text-xs text-muted-foreground">{interaction.management}</span>
                  </div>
                )}
              </div>
            );
          }) : (
            <EmptySection message="Tidak ada interaksi terdokumentasi" />
          )}
        </TabsContent>

        {/* ── Info Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="info" className="space-y-3 mt-0">
          {/* Mechanism */}
          {drug.mechanism && (
            <InfoBlock icon={<FlaskConical className="h-3.5 w-3.5" />} label="Mekanisme Kerja">
              <p className="text-sm text-foreground/80 leading-relaxed">{drug.mechanism}</p>
            </InfoBlock>
          )}

          {/* Pharmacokinetics grid */}
          {(drug.halfLife || drug.excretion) && (
            <div className="grid grid-cols-2 gap-3">
              {drug.halfLife && (
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Half-life</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{drug.halfLife}</p>
                </div>
              )}
              {drug.excretion && (
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ekskresi</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{drug.excretion}</p>
                </div>
              )}
            </div>
          )}

          {/* Pregnancy & Lactation */}
          {(drug.pregnancyCat || drug.lactation) && (
            <div className="grid grid-cols-2 gap-3">
              {drug.pregnancyCat && (
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Baby className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Kehamilan</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Kategori {drug.pregnancyCat.toUpperCase()}</p>
                </div>
              )}
              {drug.lactation && (
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Laktasi</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{drug.lactation}</p>
                </div>
              )}
            </div>
          )}

          {/* Storage */}
          {drug.storage && (
            <InfoBlock icon={<Thermometer className="h-3.5 w-3.5" />} label="Penyimpanan">
              <p className="text-sm text-foreground/80">{drug.storage}</p>
            </InfoBlock>
          )}

          {/* Notes */}
          {drug.notes && (
            <InfoBlock icon={<Info className="h-3.5 w-3.5" />} label="Catatan Tambahan">
              <p className="text-sm text-foreground/80 leading-relaxed">{drug.notes}</p>
            </InfoBlock>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function DoseBlock({
  label, value, sub, onCopy, copied, color, link, linkLabel,
}: {
  label: string;
  value: string;
  sub?: string;
  onCopy: () => void;
  copied: boolean;
  color: 'blue' | 'emerald';
  link?: string;
  linkLabel?: string;
}) {
  const colorMap = {
    blue:    'bg-blue-500/8 border-blue-500/15',
    emerald: 'bg-emerald-500/8 border-emerald-500/15',
  };
  return (
    <div className={cn('rounded-xl border p-3 group', colorMap[color])}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-foreground leading-snug">{value}</p>
        <button onClick={onCopy} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
          {copied
            ? <Check className="h-3.5 w-3.5 text-emerald-500" />
            : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
        </button>
      </div>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {link && (
        <Link href={link} className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
          {linkLabel} <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      )}
    </div>
  );
}

function AdjustBlock({ icon, label, value }: { icon: 'renal' | 'hepatic'; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-foreground/80 leading-relaxed">{value}</p>
    </div>
  );
}

function InfoBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-1.5 mb-2.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}