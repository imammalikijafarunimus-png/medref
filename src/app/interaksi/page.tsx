'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, X, Plus, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Drug {
  id: string;
  name: string;
  genericName: string | null;
}

interface Interaction {
  id: string;
  drugA: { id: string; name: string };
  drugB: { id: string; name: string };
  interactionType: string | null;
  effect: string | null;
  mechanism: string | null;
  management: string | null;
}

// Warna severity
const warnaSeverity: Record<string, { bg: string; border: string; text: string }> = {
  mayor: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    text: 'text-red-700 dark:text-red-400',
  },
  moderat: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-700 dark:text-amber-400',
  },
  minor: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-900',
    text: 'text-sky-700 dark:text-sky-400',
  },
};

export default function InteraksiPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch semua obat
  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await fetch('/api/drugs?limit=200');
        const data = await res.json();
        if (data.success) {
          setDrugs(data.data);
        }
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    }
    fetchDrugs();
  }, []);

  // Cek interaksi saat obat dipilih
  useEffect(() => {
    if (selectedDrugs.length < 2) {
      setInteractions([]);
      return;
    }

    async function checkInteractions() {
      setLoading(true);
      try {
        const drugIds = selectedDrugs.map((d) => d.id);
        const results: Interaction[] = [];

        for (let i = 0; i < drugIds.length; i++) {
          for (let j = i + 1; j < drugIds.length; j++) {
            const res = await fetch(`/api/interaksi/check?drugA=${drugIds[i]}&drugB=${drugIds[j]}`);
            const data = await res.json();
            if (data.success && data.data) {
              results.push(data.data);
            }
          }
        }

        setInteractions(results);
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
      setLoading(false);
    }

    checkInteractions();
  }, [selectedDrugs]);

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drug.genericName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addDrug = (drug: Drug) => {
    if (!selectedDrugs.find((d) => d.id === drug.id)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d.id !== drugId));
  };

  // Hitung statistik
  const majorCount = interactions.filter((i) => i.interactionType?.toLowerCase() === 'mayor').length;
  const moderateCount = interactions.filter((i) => i.interactionType?.toLowerCase() === 'moderat').length;
  const minorCount = interactions.filter((i) => i.interactionType?.toLowerCase() === 'minor').length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 shrink-0">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Cek Interaksi Obat</h1>
          <p className="text-sm text-muted-foreground">
            Periksa interaksi antara obat-obatan
          </p>
        </div>
      </div>

      {/* Drug Selector */}
      <Card>
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-sm sm:text-base">Pilih Obat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {/* Selected Drugs */}
          {selectedDrugs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedDrugs.map((drug) => (
                <Badge
                  key={drug.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-1"
                >
                  <span className="truncate max-w-[120px] sm:max-w-none">{drug.name}</span>
                  <button
                    onClick={() => removeDrug(drug.id)}
                    className="ml-1 hover:text-rose-500 transition-colors"
                    aria-label={`Hapus ${drug.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama obat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(e.target.value.length > 0);
              }}
              onFocus={() => setShowDropdown(searchQuery.length > 0)}
              className="pl-10 h-11"
            />

            {/* Dropdown */}
            {showDropdown && filteredDrugs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredDrugs.slice(0, 10).map((drug) => (
                  <button
                    key={drug.id}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
                    onClick={() => addDrug(drug)}
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-sm">{drug.name}</span>
                      {drug.genericName && (
                        <span className="text-muted-foreground ml-2 text-xs sm:text-sm">
                          ({drug.genericName})
                        </span>
                      )}
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Pilih minimal 2 obat untuk memeriksa interaksi
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedDrugs.length >= 2 && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            {majorCount > 0 && (
              <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {majorCount} Mayor
              </Badge>
            )}
            {moderateCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {moderateCount} Moderat
              </Badge>
            )}
            {minorCount > 0 && (
              <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                {minorCount} Minor
              </Badge>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 w-32 bg-muted rounded mx-auto" />
                </div>
              </CardContent>
            </Card>
          ) : interactions.length > 0 ? (
            <div className="space-y-3">
              {interactions.map((interaction) => {
                const severity = interaction.interactionType?.toLowerCase() || 'minor';
                const colors = warnaSeverity[severity] || warnaSeverity.minor;

                return (
                  <Card key={interaction.id} className={cn(colors.border)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg shrink-0', colors.bg)}>
                          <AlertTriangle className={cn('h-4 w-4 sm:h-5 sm:w-5', colors.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                            <span className="font-medium text-sm sm:text-base">
                              {interaction.drugA.name}
                            </span>
                            <span className="text-muted-foreground">+</span>
                            <span className="font-medium text-sm sm:text-base">
                              {interaction.drugB.name}
                            </span>
                            <Badge className={cn('ml-auto text-[10px] sm:text-xs', colors.bg, colors.text)}>
                              {severity.charAt(0).toUpperCase() + severity.slice(1)}
                            </Badge>
                          </div>

                          {interaction.effect && (
                            <p className="text-xs sm:text-sm mb-2">{interaction.effect}</p>
                          )}

                          {interaction.mechanism && (
                            <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                              <span className="font-medium">Mekanisme:</span>{' '}
                              {interaction.mechanism}
                            </div>
                          )}

                          {interaction.management && (
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/50 text-xs sm:text-sm">
                              <span className="font-medium">Penatalaksanaan:</span>{' '}
                              {interaction.management}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-6 sm:p-8 text-center">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-emerald-600 mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg text-emerald-700 dark:text-emerald-400">
                  Tidak Ada Interaksi Ditemukan
                </h3>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Tidak ditemukan interaksi signifikan antara obat-obat yang dipilih
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}