export interface KeyValue<K = string, V = any> {
  key: K;
  value: V;
}

export interface SplitChunk {
  splitId: number;
  text: string;
  lines: string[];
}

export interface MapperOutput {
  mapperId: number;
  splitId: number;
  pairs: KeyValue<string, number>[];
}

export interface ShuffledGroup {
  key: string;
  values: number[];
  assignedReducerId: number;
}

export interface ReducerOutput {
  reducerId: number;
  results: KeyValue<string, number>[];
}

export interface MapReduceExecutionState {
  rawInput: string;
  splits: SplitChunk[];
  mapOutputs: MapperOutput[];
  allMapPairs: KeyValue<string, number>[];
  shuffledGroups: ShuffledGroup[];
  reducedOutputs: ReducerOutput[];
  finalResults: KeyValue<string, number>[];
}

export class MapReduceEngine {
  public static simulate(inputText: string, numSplits = 2, numReducers = 2): MapReduceExecutionState {
    const cleaned = inputText.trim();
    if (!cleaned) {
      return {
        rawInput: '',
        splits: [],
        mapOutputs: [],
        allMapPairs: [],
        shuffledGroups: [],
        reducedOutputs: [],
        finalResults: [],
      };
    }

    // Stage 1 & 2: Input & Splitting
    const words = cleaned
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 0);

    const chunkSize = Math.max(1, Math.ceil(words.length / numSplits));
    const splits: SplitChunk[] = [];

    for (let i = 0; i < numSplits; i++) {
      const chunkWords = words.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunkWords.length > 0) {
        splits.push({
          splitId: i + 1,
          text: chunkWords.join(' '),
          lines: chunkWords,
        });
      }
    }

    // Stage 3: Map Phase
    const mapOutputs: MapperOutput[] = [];
    const allMapPairs: KeyValue<string, number>[] = [];

    splits.forEach(split => {
      const pairs: KeyValue<string, number>[] = split.lines.map(word => ({
        key: word.toLowerCase(),
        value: 1,
      }));
      mapOutputs.push({
        mapperId: split.splitId,
        splitId: split.splitId,
        pairs,
      });
      allMapPairs.push(...pairs);
    });

    // Stage 4: Shuffle and Sort Phase
    const groupMap: Map<string, number[]> = new Map();
    allMapPairs.forEach(({ key, value }) => {
      const existing = groupMap.get(key) || [];
      existing.push(value);
      groupMap.set(key, existing);
    });

    // Sort keys alphabetically
    const sortedKeys = Array.from(groupMap.keys()).sort();
    const shuffledGroups: ShuffledGroup[] = sortedKeys.map((key, idx) => ({
      key,
      values: groupMap.get(key) || [],
      assignedReducerId: (idx % numReducers) + 1,
    }));

    // Stage 5: Reduce Phase
    const reducerMap: Map<number, KeyValue<string, number>[]> = new Map();
    for (let r = 1; r <= numReducers; r++) {
      reducerMap.set(r, []);
    }

    shuffledGroups.forEach(group => {
      const sum = group.values.reduce((acc, v) => acc + v, 0);
      const list = reducerMap.get(group.assignedReducerId) || [];
      list.push({ key: group.key, value: sum });
      reducerMap.set(group.assignedReducerId, list);
    });

    const reducedOutputs: ReducerOutput[] = [];
    for (let r = 1; r <= numReducers; r++) {
      const items = reducerMap.get(r) || [];
      if (items.length > 0) {
        reducedOutputs.push({
          reducerId: r,
          results: items,
        });
      }
    }

    // Stage 6: Final Output (Sorted by descending count, then key)
    const finalResults: KeyValue<string, number>[] = [];
    shuffledGroups.forEach(group => {
      const sum = group.values.reduce((acc, v) => acc + v, 0);
      finalResults.push({ key: group.key, value: sum });
    });
    finalResults.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));

    return {
      rawInput: inputText,
      splits,
      mapOutputs,
      allMapPairs,
      shuffledGroups,
      reducedOutputs,
      finalResults,
    };
  }
}
