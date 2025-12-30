import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { setStrategy } from '../api';

type Strategy = 'Match' | 'Premium' | 'Undercut';

type Props = {
  siteId: string;
  initial?: Strategy;
  accentColor: string;
  onChange?: (s: Strategy) => void;
};

const options: Strategy[] = ['Match', 'Premium', 'Undercut'];

export const StrategyDropdown: React.FC<Props> = ({ siteId, initial = 'Match', accentColor, onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Strategy>(initial);

  const choose = async (strategy: Strategy) => {
    setValue(strategy);
    setOpen(false);
    setStrategy(siteId, strategy);
    onChange?.(strategy);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.button, { borderColor: accentColor }]} onPress={() => setOpen(!open)}>
        <Text style={[styles.label, { color: accentColor }]}>{value}</Text>
        <Text style={[styles.caret, { color: accentColor }]}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={styles.menuItem} onPress={() => choose(opt)}>
              <Text style={styles.menuText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 10 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontWeight: '700' },
  caret: { fontSize: 12 },
  menu: {
    marginTop: 4,
    backgroundColor: '#111827',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuText: { color: '#e5e7eb', fontSize: 14 },
});

export default StrategyDropdown;
