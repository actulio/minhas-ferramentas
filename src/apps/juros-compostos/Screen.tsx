import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { NumericInput } from '@/components/NumericInput';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ResultDisplay } from '@/components/ResultDisplay';
import { GlassCard } from '@/components/GlassCard';
import { useSettingsStore } from '@/store/settings';
import {
  solveForA,
  solveForP,
  solveForR,
  solveForT,
  solveForN,
  monthsToYears,
} from './logic';

type SolveTarget = 'A' | 'P' | 'r' | 't' | 'n';

const segments = [
  { label: 'Montante', value: 'A' },
  { label: 'Capital', value: 'P' },
  { label: 'Taxa', value: 'r' },
  { label: 'Período', value: 't' },
  { label: 'Freq.', value: 'n' },
];

const frequencyOptions = [
  { label: 'Mensal', value: 12 },
  { label: 'Trimestral', value: 4 },
  { label: 'Semestral', value: 2 },
  { label: 'Anual', value: 1 },
];

export default function JurosCompostosScreen() {
  const defaultFrequency = useSettingsStore((s) =>
    s.getSetting('juros-compostos', 'defaultFrequency'),
  ) as number;

  const [solveFor, setSolveFor] = useState<SolveTarget>('A');
  const [amountA, setAmountA] = useState('');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [period, setPeriod] = useState('');
  const [frequency, setFrequency] = useState(String(defaultFrequency || 12));
  const [timeUnit, setTimeUnit] = useState<'anos' | 'meses'>('anos');

  const result = useMemo(() => {
    try {
      const A = parseFloat(amountA) || 0;
      const P = parseFloat(principal) || 0;
      const rPercent = parseFloat(rate) || 0;
      const r = rPercent / 100;
      const rawT = parseFloat(period) || 0;
      const t = timeUnit === 'meses' ? monthsToYears(rawT) : rawT;
      const n = parseFloat(frequency) || 12;

      switch (solveFor) {
        case 'A':
          if (P <= 0) return null;
          return { value: solveForA(P, r, n, t), label: 'Montante Final', unit: 'R$' };
        case 'P':
          if (A <= 0) return null;
          return { value: solveForP(A, r, n, t), label: 'Capital Inicial', unit: 'R$' };
        case 'r':
          if (A <= 0 || P <= 0) return null;
          return { value: solveForR(A, P, n, t) * 100, label: 'Taxa de Juros', unit: '% a.a.' };
        case 't': {
          if (A <= 0 || P <= 0) return null;
          const years = solveForT(A, P, r, n);
          return { value: years, label: 'Período', unit: 'anos' };
        }
        case 'n':
          if (A <= 0 || P <= 0) return null;
          return { value: solveForN(A, P, r, t), label: 'Frequência', unit: 'x/ano' };
        default:
          return null;
      }
    } catch {
      return null;
    }
  }, [solveFor, amountA, principal, rate, period, frequency, timeUnit]);

  const formatResult = (val: number): string => {
    if (isNaN(val) || !isFinite(val)) return '—';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Solve-for selector */}
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.accent, marginBottom: 8 }}>
          Calcular:
        </Text>
        <SegmentedControl
          segments={segments}
          selectedValue={solveFor}
          onSelect={(v) => setSolveFor(v as SolveTarget)}
        />

        {/* Result */}
        {result ? (
          !isFinite(result.value) || isNaN(result.value) ? (
            <GlassCard style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.warning, fontSize: 14, textAlign: 'center' }}>
                Não é possível calcular com estes valores
              </Text>
            </GlassCard>
          ) : (
            <ResultDisplay
              label={result.label}
              value={formatResult(result.value)}
              unit={result.unit}
            />
          )
        ) : null}

        {/* Input fields — hide the one being solved for */}
        <GlassCard style={{ marginBottom: 16 }}>
          {solveFor !== 'A' ? (
            <NumericInput
              label="Montante Final (R$)"
              value={amountA}
              onChangeText={setAmountA}
              placeholder="0,00"
              suffix="R$"
            />
          ) : null}
          {solveFor !== 'P' ? (
            <NumericInput
              label="Capital Inicial (R$)"
              value={principal}
              onChangeText={setPrincipal}
              placeholder="0,00"
              suffix="R$"
            />
          ) : null}
          {solveFor !== 'r' ? (
            <NumericInput
              label="Taxa de Juros (% a.a.)"
              value={rate}
              onChangeText={setRate}
              placeholder="0,00"
              suffix="%"
            />
          ) : null}
          {solveFor !== 't' ? (
            <View>
              <NumericInput
                label={`Período (${timeUnit})`}
                value={period}
                onChangeText={setPeriod}
                placeholder="0"
              />
              <SegmentedControl
                segments={[
                  { label: 'Anos', value: 'anos' },
                  { label: 'Meses', value: 'meses' },
                ]}
                selectedValue={timeUnit}
                onSelect={(v) => setTimeUnit(v as 'anos' | 'meses')}
              />
            </View>
          ) : null}
          {solveFor !== 'n' ? (
            <View>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.accent, marginBottom: 8 }}>
                Frequência de Composição
              </Text>
              <SegmentedControl
                segments={frequencyOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
                selectedValue={frequency}
                onSelect={setFrequency}
              />
            </View>
          ) : null}
        </GlassCard>

        {/* Time helper text */}
        {solveFor === 't' && result && isFinite(result.value) ? (
          <GlassCard>
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
              {Math.round(result.value * 12)} meses = {Math.floor(result.value)} {Math.floor(result.value) === 1 ? 'ano' : 'anos'}
              {result.value % 1 > 0.01 ? ` e ${Math.round((result.value % 1) * 12)} meses` : ''}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}
