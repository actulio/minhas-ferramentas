import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { Save } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { NumericInput } from '@/components/NumericInput';
import { ResultDisplay } from '@/components/ResultDisplay';
import { GlassCard } from '@/components/GlassCard';
import { useSettingsStore } from '@/store/settings';
import { loadJSON, saveJSON } from '@/store/storage';
import { compare } from './logic';
import { SavedItems, type SavedComparison } from './SavedItems';

const STORAGE_KEY = 'pagamento-saved-items';

export default function PagamentoScreen() {
  const defaultReturn = useSettingsStore((s) =>
    s.getSetting('pagamento', 'defaultMonthlyReturn'),
  ) as number;
  const defaultCashback = useSettingsStore((s) =>
    s.getSetting('pagamento', 'defaultCashbackRate'),
  ) as number;

  const [cashPrice, setCashPrice] = useState('');
  const [installmentPrice, setInstallmentPrice] = useState('');
  const [installments, setInstallments] = useState('');
  const [monthlyReturn, setMonthlyReturn] = useState(String(defaultReturn || 0.8));
  const [cashbackRate, setCashbackRate] = useState(String(defaultCashback || 1.0));
  const [savedItems, setSavedItems] = useState<SavedComparison[]>([]);

  // Load saved items on mount
  useEffect(() => {
    loadJSON<SavedComparison[]>(STORAGE_KEY).then((items) => {
      if (items) setSavedItems(items);
    });
  }, []);

  const persistItems = useCallback(async (items: SavedComparison[]) => {
    setSavedItems(items);
    await saveJSON(STORAGE_KEY, items);
  }, []);

  const result = useMemo(() => {
    const cp = parseFloat(cashPrice) || 0;
    const ip = parseFloat(installmentPrice) || 0;
    const inst = parseInt(installments, 10) || 0;
    const mr = (parseFloat(monthlyReturn) || 0) / 100;
    const cb = (parseFloat(cashbackRate) || 0) / 100;

    if (cp <= 0 || ip <= 0 || inst <= 0) return null;

    return compare({
      cashPrice: cp,
      installmentPrice: ip,
      installments: inst,
      monthlyReturn: mr,
      cashbackRate: cb,
    });
  }, [cashPrice, installmentPrice, installments, monthlyReturn, cashbackRate]);

  const handleSave = () => {
    if (!result) return;
    Alert.prompt(
      'Salvar comparação',
      'Dê um nome para esta comparação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: (name) => {
            if (!name?.trim()) return;
            const item: SavedComparison = {
              id: String(Date.now()),
              name: name.trim(),
              inputs: {
                cashPrice: parseFloat(cashPrice),
                installmentPrice: parseFloat(installmentPrice),
                installments: parseInt(installments, 10),
                monthlyReturn: (parseFloat(monthlyReturn) || 0) / 100,
                cashbackRate: (parseFloat(cashbackRate) || 0) / 100,
              },
              results: result,
              createdAt: new Date().toISOString(),
            };
            persistItems([item, ...savedItems]);
          },
        },
      ],
      'plain-text',
    );
  };

  const handleLoad = (item: SavedComparison) => {
    setCashPrice(String(item.inputs.cashPrice));
    setInstallmentPrice(String(item.inputs.installmentPrice));
    setInstallments(String(item.inputs.installments));
    setMonthlyReturn(String(item.inputs.monthlyReturn * 100));
    setCashbackRate(String(item.inputs.cashbackRate * 100));
  };

  const handleDelete = (id: string) => {
    persistItems(savedItems.filter((i) => i.id !== id));
  };

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const verdictText = result
    ? result.verdict === 'vista'
      ? 'À vista é mais vantajoso'
      : result.verdict === 'prazo'
        ? 'À prazo é mais vantajoso'
        : 'Ambos custam o mesmo'
    : '';

  return (
    <LinearGradient
      colors={[colors.bg.start, colors.bg.mid, colors.bg.end]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Result */}
        {result ? (
          <>
            <ResultDisplay
              label={verdictText}
              value={`R$ ${fmt(result.savings)}`}
              unit="de economia"
            />

            {/* Save button */}
            <Pressable
              onPress={handleSave}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                marginBottom: 16,
              }}
            >
              <Save color={colors.text.accent} size={16} />
              <Text style={{ color: colors.text.accent, fontSize: 13, marginLeft: 6 }}>
                Salvar comparação
              </Text>
            </Pressable>
          </>
        ) : null}

        {/* Inputs */}
        <GlassCard style={{ marginBottom: 16 }}>
          <NumericInput label="Preço à vista (R$)" value={cashPrice} onChangeText={setCashPrice} placeholder="0,00" suffix="R$" error={parseFloat(cashPrice) < 0 ? 'Valor deve ser positivo' : undefined} />
          <NumericInput label="Preço à prazo (R$)" value={installmentPrice} onChangeText={setInstallmentPrice} placeholder="0,00" suffix="R$" error={parseFloat(installmentPrice) < 0 ? 'Valor deve ser positivo' : undefined} />
          <NumericInput label="Nº de parcelas" value={installments} onChangeText={setInstallments} placeholder="0" error={parseInt(installments, 10) < 0 ? 'Valor deve ser positivo' : undefined} />
          <NumericInput label="Rendimento mensal (%)" value={monthlyReturn} onChangeText={setMonthlyReturn} placeholder="0,8" suffix="%" />
          <NumericInput label="Cashback à prazo (%)" value={cashbackRate} onChangeText={setCashbackRate} placeholder="1,0" suffix="%" />
        </GlassCard>

        {/* Breakdown */}
        {result ? (
          <GlassCard style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.accent, marginBottom: 10 }}>
              Detalhamento
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Custo efetivo à vista</Text>
              <Text style={{ color: colors.text.primary, fontSize: 13 }}>R$ {fmt(result.effectiveCostVista)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Custo efetivo à prazo</Text>
              <Text style={{ color: colors.text.primary, fontSize: 13 }}>R$ {fmt(result.effectiveCostPrazo)}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: colors.glass.border, marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Desconto mín. p/ à vista valer</Text>
              <Text style={{ color: colors.text.primary, fontSize: 13 }}>{fmt(result.breakEvenDiscount)}%</Text>
            </View>
          </GlassCard>
        ) : null}

        {/* Saved Items */}
        <SavedItems items={savedItems} onLoad={handleLoad} onDelete={handleDelete} />
      </ScrollView>
    </LinearGradient>
  );
}
