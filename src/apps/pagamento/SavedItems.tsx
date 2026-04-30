import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { GlassCard } from '@/components/GlassCard';
import { type PagamentoInputs, type PagamentoResults } from './logic';

export interface SavedComparison {
  id: string;
  name: string;
  inputs: PagamentoInputs;
  results: PagamentoResults;
  createdAt: string;
}

interface SavedItemsProps {
  items: SavedComparison[];
  onLoad: (item: SavedComparison) => void;
  onDelete: (id: string) => void;
}

export function SavedItems({ items, onLoad, onDelete }: SavedItemsProps) {
  if (items.length === 0) return null;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Excluir comparação',
      `Deseja excluir "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(id) },
      ],
    );
  };

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.accent, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
        Comparações Salvas
      </Text>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => onLoad(item)}>
          <GlassCard style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
                {item.results.verdict === 'vista' ? 'À vista' : item.results.verdict === 'prazo' ? 'À prazo' : 'Empate'}
                {' • '}
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id, item.name)}
              hitSlop={12}
              style={{ padding: 8 }}
            >
              <Trash2 color={colors.error} size={18} />
            </Pressable>
          </GlassCard>
        </Pressable>
      ))}
    </View>
  );
}
