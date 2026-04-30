import { useState, useEffect, useRef, useCallback } from 'react';
// Build Version: 1.0.2 - Deployment Sync
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Info,
  Volume2,
  VolumeX,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';

// --- Types ---

type Algorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'binarySearch';

interface Step {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  range?: [number, number];
  pivot?: number;
  activeLine?: number;
  found?: number;
  comparisons: number;
  swaps: number;
}

interface AlgorithmInfo {
  name: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  description: string;
  process: string[];
  code: string[];
}

const ALGORITHM_DATA: Record<Algorithm, AlgorithmInfo> = {
  bubble: {
    name: 'Bubble Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    process: [
      'Compares two adjacent elements (Blue).',
      'If the left element is greater than the right, they swap (Red).',
      'This repeats until the largest element "bubbles up" to the end (Green).',
      'The process repeats for the remaining unsorted portion.'
    ],
    code: [
      'for i from 0 to n-1:',
      '  for j from 0 to n-i-1:',
      '    if arr[j] > arr[j+1]:',
      '      swap(arr[j], arr[j+1])'
    ]
  },
  selection: {
    name: 'Selection Sort',
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    description: 'Divides the input list into two parts: a sorted sublist of items which is built up from left to right and a sublist of the remaining unsorted items.',
    process: [
      'Scans the unsorted part to find the minimum element (Blue).',
      'Swaps the minimum element with the first unsorted element (Red).',
      'The first element is now considered sorted (Green).',
      'Repeats for the next unsorted position.'
    ],
    code: [
      'for i from 0 to n-1:',
      '  min_idx = i',
      '  for j from i+1 to n:',
      '    if arr[j] < arr[min_idx]:',
      '      min_idx = j',
      '  swap(arr[i], arr[min_idx])'
    ]
  },
  insertion: {
    name: 'Insertion Sort',
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
    description: 'Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms.',
    process: [
      'Picks the next element to be inserted (Blue).',
      'Compares it with elements in the sorted part (Blue).',
      'Shifts elements to the right to make space (Red).',
      'Inserts the element into its correct position.',
      'The sorted part grows by one (Green).'
    ],
    code: [
      'for i from 1 to n:',
      '  key = arr[i]',
      '  j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j+1] = arr[j]',
      '    j = j - 1',
      '  arr[j+1] = key'
    ]
  },
  merge: {
    name: 'Merge Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
    description: 'An efficient, stable, comparison-based, divide-and-conquer sorting algorithm.',
    process: [
      'Recursively divides the array into halves.',
      'Fades out elements outside the current merge range.',
      'Compares elements from left and right halves (Blue).',
      'Writes the smaller element back into the main array (Red).',
      'The merged range is now sorted.'
    ],
    code: [
      'mergeSort(arr, l, r):',
      '  if l < r:',
      '    m = (l+r)/2',
      '    mergeSort(arr, l, m)',
      '    mergeSort(arr, m+1, r)',
      '    merge(arr, l, m, r)'
    ]
  },
  quick: {
    name: 'Quick Sort',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
    space: 'O(log n)',
    description: 'A divide-and-conquer algorithm. It works by selecting a "pivot" element and partitioning the other elements into two sub-arrays.',
    process: [
      'Selects a "pivot" element (Purple).',
      'Partitions elements around the pivot (Blue/Red).',
      'Moves pivot to its correct final position (Green).',
      'Recursively sorts the sub-arrays.'
    ],
    code: [
      'quickSort(arr, low, high):',
      '  if low < high:',
      '    p = partition(arr, low, high)',
      '    quickSort(arr, low, p - 1)',
      '    quickSort(arr, p + 1, high)'
    ]
  },
  binarySearch: {
    name: 'Binary Search',
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
    description: 'Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
    process: [
      'Automatically sorts the array first.',
      'Selects the middle element of the range (Blue).',
      'If match, target found (Green)!',
      'Else, discards half the array (Fade) and repeats.'
    ],
    code: [
      'binarySearch(arr, target):',
      '  low = 0, high = n-1',
      '  while low <= high:',
      '    mid = (low + high) / 2',
      '    if arr[mid] == target: return mid',
      '    if arr[mid] < target: low = mid + 1',
      '    else: high = mid - 1'
    ]
  }
};

// --- Sound Utility ---

class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTone(freq: number, duration: number = 0.05) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

const soundManager = new SoundManager();

// --- App Component ---

export default function App() {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [customArray, setCustomArray] = useState('');
  const [searchTarget, setSearchTarget] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Apply theme class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Generate array
  const generateArray = useCallback(() => {
    let newArray: number[] = [];
    if (customArray) {
      newArray = customArray.split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num) && num > 0 && num <= 100);
      
      if (newArray.length > 50) newArray = newArray.slice(0, 50);
      if (newArray.length > 0) setArraySize(newArray.length);
    }

    if (newArray.length === 0) {
      newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10);
    }

    setArray(newArray);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    
    // Pre-calculate steps
    const calculatedSteps = calculateSteps(algorithm, [...newArray]);
    setSteps(calculatedSteps);
  }, [arraySize, algorithm, customArray]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Calculate steps for selected algorithm
  const calculateSteps = (algo: Algorithm, arr: number[]): Step[] => {
    let comps = 0;
    let swapsCount = 0;
    const history: Step[] = [{ array: [...arr], comparing: [], swapping: [], sorted: [], activeLine: -1, comparisons: 0, swaps: 0 }];

    if (algo === 'bubble') {
      const n = arr.length;
      const sorted: number[] = [];
      for (let i = 0; i < n - 1; i++) {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], activeLine: 0, comparisons: comps, swaps: swapsCount });
        for (let j = 0; j < n - i - 1; j++) {
          comps++;
          history.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted], activeLine: 1, comparisons: comps, swaps: swapsCount });
          history.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted], activeLine: 2, comparisons: comps, swaps: swapsCount });
          if (arr[j] > arr[j + 1]) {
            swapsCount++;
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            history.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: [...sorted], activeLine: 3, comparisons: comps, swaps: swapsCount });
          }
        }
        sorted.unshift(n - i - 1);
      }
      sorted.unshift(0);
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], activeLine: -1, comparisons: comps, swaps: swapsCount });
    } else if (algo === 'selection') {
      const n = arr.length;
      const sorted: number[] = [];
      for (let i = 0; i < n - 1; i++) {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], activeLine: 0, comparisons: comps, swaps: swapsCount });
        let minIdx = i;
        history.push({ array: [...arr], comparing: [i], swapping: [], sorted: [...sorted], activeLine: 1, comparisons: comps, swaps: swapsCount });
        for (let j = i + 1; j < n; j++) {
          comps++;
          history.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: [...sorted], activeLine: 2, comparisons: comps, swaps: swapsCount });
          history.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: [...sorted], activeLine: 3, comparisons: comps, swaps: swapsCount });
          if (arr[j] < arr[minIdx]) {
            minIdx = j;
            history.push({ array: [...arr], comparing: [minIdx], swapping: [], sorted: [...sorted], activeLine: 4, comparisons: comps, swaps: swapsCount });
          }
        }
        if (minIdx !== i) {
          swapsCount++;
          [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
          history.push({ array: [...arr], comparing: [], swapping: [i, minIdx], sorted: [...sorted], activeLine: 5, comparisons: comps, swaps: swapsCount });
        }
        sorted.push(i);
      }
      sorted.push(n - 1);
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], activeLine: -1, comparisons: comps, swaps: swapsCount });
    } else if (algo === 'insertion') {
      const n = arr.length;
      const sorted: number[] = [0];
      for (let i = 1; i < n; i++) {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], activeLine: 0, comparisons: comps, swaps: swapsCount });
        let key = arr[i];
        history.push({ array: [...arr], comparing: [i], swapping: [], sorted: [...sorted], activeLine: 1, comparisons: comps, swaps: swapsCount });
        let j = i - 1;
        history.push({ array: [...arr], comparing: [j], swapping: [], sorted: [...sorted], activeLine: 2, comparisons: comps, swaps: swapsCount });
        while (j >= 0 && arr[j] > key) {
          comps++;
          history.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted], activeLine: 3, comparisons: comps, swaps: swapsCount });
          arr[j + 1] = arr[j];
          swapsCount++;
          history.push({ array: [...arr], comparing: [], swapping: [j + 1], sorted: [...sorted], activeLine: 4, comparisons: comps, swaps: swapsCount });
          j = j - 1;
          history.push({ array: [...arr], comparing: [j], swapping: [], sorted: [...sorted], activeLine: 5, comparisons: comps, swaps: swapsCount });
        }
        arr[j + 1] = key;
        swapsCount++;
        history.push({ array: [...arr], comparing: [], swapping: [j + 1], sorted: [...sorted], activeLine: 6, comparisons: comps, swaps: swapsCount });
        sorted.push(i);
      }
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, i) => i), activeLine: -1, comparisons: comps, swaps: swapsCount });
    } else if (algo === 'merge') {
      const merge = (l: number, m: number, r: number) => {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = arr.slice(l, m + 1);
        const R = arr.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
          comps++;
          history.push({ array: [...arr], comparing: [l + i, m + 1 + j], swapping: [], sorted: [], range: [l, r], activeLine: 5, comparisons: comps, swaps: swapsCount });
          if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
          } else {
            arr[k] = R[j];
            j++;
          }
          swapsCount++;
          history.push({ array: [...arr], comparing: [], swapping: [k], sorted: [], range: [l, r], activeLine: 5, comparisons: comps, swaps: swapsCount });
          k++;
        }
        while (i < n1) {
          swapsCount++;
          history.push({ array: [...arr], comparing: [], swapping: [l + i], sorted: [], range: [l, r], activeLine: 5, comparisons: comps, swaps: swapsCount });
          arr[k] = L[i];
          i++; k++;
        }
        while (j < n2) {
          swapsCount++;
          history.push({ array: [...arr], comparing: [], swapping: [m + 1 + j], sorted: [], range: [l, r], activeLine: 5, comparisons: comps, swaps: swapsCount });
          arr[k] = R[j];
          j++; k++;
        }
      };

      const mergeSort = (l: number, r: number) => {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 0, comparisons: comps, swaps: swapsCount });
        if (l < r) {
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 1, comparisons: comps, swaps: swapsCount });
          const m = l + Math.floor((r - l) / 2);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 2, comparisons: comps, swaps: swapsCount });
          mergeSort(l, m);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 3, comparisons: comps, swaps: swapsCount });
          mergeSort(m + 1, r);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 4, comparisons: comps, swaps: swapsCount });
          merge(l, m, r);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 5, comparisons: comps, swaps: swapsCount });
        }
      };

      mergeSort(0, arr.length - 1);
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: arr.length }, (_, i) => i), activeLine: -1, comparisons: comps, swaps: swapsCount });
    } else if (algo === 'quick') {
      const partition = (l: number, r: number) => {
        const pivot = arr[r];
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], pivot: r, activeLine: 2, comparisons: comps, swaps: swapsCount });
        let i = l - 1;
        for (let j = l; j < r; j++) {
          comps++;
          history.push({ array: [...arr], comparing: [j, r], swapping: [], sorted: [], range: [l, r], pivot: r, activeLine: 2, comparisons: comps, swaps: swapsCount });
          if (arr[j] < pivot) {
            i++;
            swapsCount++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            history.push({ array: [...arr], comparing: [], swapping: [i, j], sorted: [], range: [l, r], pivot: r, activeLine: 2, comparisons: comps, swaps: swapsCount });
          }
        }
        swapsCount++;
        [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];
        history.push({ array: [...arr], comparing: [], swapping: [i + 1, r], sorted: [], range: [l, r], pivot: i + 1, activeLine: 2, comparisons: comps, swaps: swapsCount });
        return i + 1;
      };

      const quickSort = (l: number, r: number) => {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 0, comparisons: comps, swaps: swapsCount });
        if (l < r) {
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 1, comparisons: comps, swaps: swapsCount });
          const p = partition(l, r);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], pivot: p, activeLine: 2, comparisons: comps, swaps: swapsCount });
          quickSort(l, p - 1);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 3, comparisons: comps, swaps: swapsCount });
          quickSort(p + 1, r);
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [l, r], activeLine: 4, comparisons: comps, swaps: swapsCount });
        }
      };

      quickSort(0, arr.length - 1);
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: arr.length }, (_, i) => i), activeLine: -1, comparisons: comps, swaps: swapsCount });
    } else if (algo === 'binarySearch') {
      arr.sort((a, b) => a - b);
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], activeLine: -1, comparisons: comps, swaps: swapsCount });
      
      const target = arr[Math.floor(Math.random() * arr.length)];
      setSearchTarget(target);

      let low = 0;
      let high = arr.length - 1;
      history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [0, arr.length - 1], activeLine: 1, comparisons: comps, swaps: swapsCount });
      
      while (low <= high) {
        history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [low, high], activeLine: 2, comparisons: comps, swaps: swapsCount });
        const mid = Math.floor((low + high) / 2);
        comps++;
        history.push({ array: [...arr], comparing: [mid], swapping: [], sorted: [], range: [low, high], activeLine: 3, comparisons: comps, swaps: swapsCount });
        
        if (arr[mid] === target) {
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [mid], range: [low, high], found: mid, activeLine: 4, comparisons: comps, swaps: swapsCount });
          break;
        }
        
        history.push({ array: [...arr], comparing: [mid], swapping: [], sorted: [], range: [low, high], activeLine: 4, comparisons: comps, swaps: swapsCount });
        if (arr[mid] < target) {
          low = mid + 1;
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [low, high], activeLine: 5, comparisons: comps, swaps: swapsCount });
        } else {
          high = mid - 1;
          history.push({ array: [...arr], comparing: [], swapping: [], sorted: [], range: [low, high], activeLine: 6, comparisons: comps, swaps: swapsCount });
        }
      }
    }

    return history;
  };

  // Playback logic
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      // Slower speed calculation: 1000ms at speed 1, 10ms at speed 100
      const delay = Math.max(10, 1000 - (speed * 9.9));
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, delay);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, steps.length, speed]);

  // Sound effects
  useEffect(() => {
    if (!isMuted && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      if (step.comparing.length > 0 || step.swapping.length > 0) {
        const idx = step.comparing[0] ?? step.swapping[0];
        const val = step.array[idx];
        const freq = 200 + (val * 5);
        soundManager.playTone(freq);
      }
    }
  }, [currentStepIndex, isMuted, steps]);

  const currentStep = steps[currentStepIndex] || { array: [], comparing: [], swapping: [], sorted: [] };
  const info = ALGORITHM_DATA[algorithm];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="text-accent-primary" />
            SortVision <span className="text-accent-primary">Pro</span>
          </h1>
          <p className="text-text-dim text-sm font-mono mt-1">
            ALGO_VISUALIZER_V1.0 // {info.name.toUpperCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hardware-button-secondary p-2.5"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="hardware-button-secondary p-2.5"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`hardware-button-secondary p-2.5 ${showInfo ? 'bg-accent-primary/20 border-accent-primary/50' : ''}`}
            title="Algorithm Info"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Controls Panel */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="hardware-panel p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm font-bold text-text-dim uppercase tracking-widest">
              <Settings2 size={16} />
              Configuration
            </div>

            {/* Custom Array Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-text-dim">CUSTOM_ARRAY (CSV)</label>
              <input 
                type="text"
                value={customArray}
                onChange={(e) => setCustomArray(e.target.value)}
                placeholder="e.g. 10, 50, 20, 80"
                className="hardware-input w-full text-xs"
                disabled={isPlaying}
              />
              <p className="text-[10px] text-text-dim italic">Max 50 items, values 1-100</p>
            </div>

            {/* Algorithm Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-text-dim">SELECT_ALGORITHM</label>
              <select 
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                className="hardware-input w-full appearance-none cursor-pointer"
                disabled={isPlaying}
              >
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="quick">Quick Sort</option>
                <option value="binarySearch">Binary Search</option>
              </select>
            </div>

            {/* Array Size */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-text-dim">ARRAY_SIZE</label>
                <span className="text-xs font-mono text-accent-primary font-bold">{arraySize}</span>
              </div>
              <input 
                type="range"
                min="5"
                max="50"
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                className="accent-accent-primary h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                disabled={isPlaying}
              />
            </div>

            {/* Speed */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-text-dim">ANIMATION_SPEED</label>
                <span className="text-xs font-mono text-accent-primary font-bold">{speed}%</span>
              </div>
              <input 
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="accent-accent-primary h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button 
              onClick={generateArray}
              disabled={isPlaying}
              className="hardware-button-primary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Generate New Array
            </button>
          </div>

          {/* Complexity & Current Stats Panel */}
          <div className="hardware-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-dim uppercase tracking-widest">
              <BarChart3 size={16} />
              Algorithm Metrics
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Best</p>
                <p className="text-lg font-bold text-accent-success">{info.best}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Average</p>
                <p className="text-lg font-bold text-accent-primary">{info.average}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Worst</p>
                <p className="text-lg font-bold text-accent-error">{info.worst}</p>
              </div>
              <div className="stat-card">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Space</p>
                <p className="text-lg font-bold text-text-main">{info.space}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2 pt-4 border-t border-panel-border">
              <div className="stat-card border-none bg-accent-primary/5">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Comparisons</p>
                <p className="text-xl font-bold text-accent-primary">
                  {currentStep.comparisons}
                </p>
              </div>
              <div className="stat-card border-none bg-accent-error/5">
                <p className="text-[10px] font-mono text-text-dim uppercase font-bold">Swaps/Writes</p>
                <p className="text-xl font-bold text-accent-error">
                  {currentStep.swaps}
                </p>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="hardware-panel p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-dim uppercase tracking-widest">
              <Info size={16} />
              Color Legend
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                <span className="text-xs font-medium">Comparing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-accent-error shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                <span className="text-xs font-medium">Swapping / Writing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-accent-success shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                <span className="text-xs font-medium">Sorted / Found</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                <span className="text-xs font-medium">Pivot (Quick)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-white/10 dark:bg-white/10 border border-panel-border" />
                <span className="text-xs font-medium">Unsorted / Outside Range</span>
              </div>
            </div>
          </div>

          {/* Algorithm Code Panel */}
          <div className="hardware-panel p-6 flex flex-col gap-4 overflow-hidden hidden lg:flex">
            <div className="flex items-center gap-2 text-sm font-bold text-text-dim uppercase tracking-widest">
              <BarChart3 size={16} />
              Algorithm Execution
            </div>
            <div className="bg-black/20 rounded border border-panel-border p-3 font-mono text-[10px] leading-relaxed overflow-x-auto min-h-[120px]">
              {info.code.map((line, idx) => (
                <div 
                  key={idx} 
                  className={`whitespace-pre px-2 py-0.5 rounded transition-colors ${currentStep.activeLine === idx ? 'bg-accent-primary/20 text-accent-primary border-l-2 border-accent-primary' : 'text-text-dim opacity-50'}`}
                >
                  {line}
                </div>
              ))}
              {info.code.length === 0 && <span className="text-text-dim opacity-50 italic">No code provided</span>}
            </div>
          </div>
        </aside>

        {/* Visualization Area */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="hardware-panel flex-1 p-8 flex flex-col relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
            
            {/* Target Display for Binary Search */}
            {algorithm === 'binarySearch' && searchTarget && (
              <div className="absolute top-4 right-4 bg-accent-primary/20 border border-accent-primary/30 px-4 py-2 rounded-lg z-20 flex flex-col items-end gap-1 backdrop-blur-md">
                <span className="text-[10px] font-mono font-bold text-accent-primary uppercase tracking-wider">Search Target</span>
                <span className="text-2xl font-bold text-white leading-none">{searchTarget}</span>
              </div>
            )}
            
            {/* Visualizer */}
            <div className="flex-1 flex items-end justify-center gap-1.5 min-h-[350px] relative z-10">
              {currentStep.array.map((value, idx) => {
                const isComparing = currentStep.comparing.includes(idx);
                const isSwapping = currentStep.swapping.includes(idx);
                const isSorted = currentStep.sorted.includes(idx);
                const isPivot = currentStep.pivot === idx;
                const isFound = currentStep.found === idx;
                const isInRange = currentStep.range ? (idx >= currentStep.range[0] && idx <= currentStep.range[1]) : true;

                let color = isDarkMode ? 'bg-white/10' : 'bg-black/5';
                if (isFound) color = 'bg-accent-success shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-pulse';
                else if (isPivot) color = 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]';
                else if (isSwapping) color = 'bg-accent-error shadow-[0_0_20px_rgba(244,63,94,0.4)]';
                else if (isComparing) color = 'bg-accent-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]';
                else if (isSorted) color = 'bg-accent-success shadow-[0_0_20px_rgba(16,185,129,0.2)]';

                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={false}
                    className={`rounded-t-lg ${color} transition-all duration-300 flex items-start justify-center pt-3 overflow-hidden border border-white/5 dark:border-black/5`}
                    style={{ 
                      height: `${value}%`, 
                      width: `${Math.max(4, 100 / arraySize - 1.5)}%`,
                      opacity: isInRange ? 1 : 0.3
                    }}
                  >
                    {arraySize <= 25 && (
                      <span className={`text-[11px] font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'} opacity-60`}>
                        {value}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Info Overlay */}
            <AnimatePresence>
              {showInfo && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-8 bottom-8 hardware-panel p-6 bg-panel/90 backdrop-blur-xl z-20 border-accent-primary/20"
                >
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Info className="text-accent-primary" size={20} />
                    {info.name}
                  </h3>
                  <p className="text-text-dim text-sm leading-relaxed font-medium mb-4">{info.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-text-dim uppercase font-bold tracking-widest">Animation Process</p>
                    <ul className="space-y-1">
                      {info.process.map((step, i) => (
                        <li key={i} className="text-xs text-text-main flex items-start gap-2">
                          <span className="text-accent-primary font-bold">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Playback Controls */}
          <div className="hardware-panel p-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentStepIndex(0)}
                className="hardware-button-secondary p-2.5"
                disabled={currentStepIndex === 0}
                title="Reset"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                className="hardware-button-secondary p-2.5"
                disabled={currentStepIndex === 0 || isPlaying}
                title="Previous Step"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="hardware-button-primary px-8 py-3 flex items-center gap-3 min-w-[140px] justify-center"
              >
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                <span className="font-bold uppercase tracking-widest text-sm">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </button>

              <button 
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                className="hardware-button-secondary p-2.5"
                disabled={currentStepIndex === steps.length - 1 || isPlaying}
                title="Next Step"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-text-dim uppercase font-bold tracking-wider">Progress</p>
                  <p className="text-base font-mono font-bold text-accent-primary">
                    {Math.round((currentStepIndex / (steps.length - 1 || 1)) * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-text-dim uppercase font-bold tracking-wider">Step</p>
                  <p className="text-base font-mono font-bold text-text-main">
                    {currentStepIndex} <span className="text-text-dim text-xs">/ {steps.length - 1}</span>
                  </p>
                </div>
              </div>
              <div className="w-56 h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-panel-border">
                <motion.div 
                  className="h-full bg-accent-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={false}
                  animate={{ width: `${(currentStepIndex / (steps.length - 1 || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-text-dim text-[11px] font-mono uppercase tracking-[0.3em] py-6 border-t border-panel-border">
        SortVision Pro // Hardware-Accelerated Algorithm Visualizer // 2026
      </footer>
    </div>
  );
}
