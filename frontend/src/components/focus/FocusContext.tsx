import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

export interface FocusNode {
  key: string;
  groupId?: string;
  order?: number;
  ref: HTMLElement;
  onEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface FocusContextType {
  focusedKey: string | null;
  setFocusedKey: (key: string) => void;
  registerNode: (node: FocusNode) => void;
  unregisterNode: (key: string) => void;
  moveFocus: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusedKey, setFocusedKeyState] = useState<string | null>(null);
  const nodesRef = useRef<Map<string, FocusNode>>(new Map());
  const focusedKeyRef = useRef<string | null>(null);

  const setFocusedKey = useCallback((key: string) => {
    console.log('[Focus Changed] =>', key);
    const prevKey = focusedKeyRef.current;
    if (prevKey && prevKey !== key) {
      nodesRef.current.get(prevKey)?.onBlur?.();
    }
    focusedKeyRef.current = key;
    setFocusedKeyState(key);

    const node = nodesRef.current.get(key);
    if (node?.ref) {
      node.onFocus?.();
      // Ensure smooth visibility
      node.ref.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, []);

  const registerNode = useCallback((node: FocusNode) => {
    nodesRef.current.set(node.key, node);
    if (!focusedKeyRef.current) {
      focusedKeyRef.current = node.key;
      setFocusedKeyState(node.key);
    }
  }, []);

  const unregisterNode = useCallback((key: string) => {
    nodesRef.current.delete(key);
    if (focusedKeyRef.current === key) {
      focusedKeyRef.current = null;
    }
  }, []);

  // Spatial direction calculation
  const moveFocus = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const currentKey = focusedKeyRef.current;
    if (!currentKey) {
      const first = nodesRef.current.keys().next().value;
      if (first) setFocusedKey(first);
      return;
    }

    const currentNode = nodesRef.current.get(currentKey);
    if (!currentNode?.ref) return;

    const currentRect = currentNode.ref.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    let bestTargetKey: string | null = null;
    let minDistance = Infinity;

    nodesRef.current.forEach((targetNode, targetKey) => {
      if (targetKey === currentKey || !targetNode.ref) return;

      const targetRect = targetNode.ref.getBoundingClientRect();
      if (targetRect.width === 0 || targetRect.height === 0) return;

      const targetCenter = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2
      };

      const dx = targetCenter.x - currentCenter.x;
      const dy = targetCenter.y - currentCenter.y;

      const currentIsSidebar = currentNode.groupId === 'netflix-sidebar';
      const targetIsSidebar = targetNode.groupId === 'netflix-sidebar';

      // UP and DOWN must NEVER cross between the sidebar and content
      if ((direction === 'UP' || direction === 'DOWN') && currentIsSidebar !== targetIsSidebar) {
        return;
      }

      let isCandidate = false;
      let primaryDiff = 0;
      let secondaryDiff = 0;

      switch (direction) {
        case 'UP':
          if (dy < -8) { // Target is above
            isCandidate = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'DOWN':
          if (dy > 8) { // Target is below
            isCandidate = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'LEFT':
          if (dx < -8) { // Target is to the left
            isCandidate = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
        case 'RIGHT':
          if (dx > 8) { // Target is to the right
            isCandidate = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
      }

      if (isCandidate) {
        // Favor targets in the same group or straight in line
        const sameGroupBonus = currentNode.groupId && currentNode.groupId === targetNode.groupId ? 0.6 : 1.0;
        // Weighted distance penalizes lateral offset
        const distance = (primaryDiff + secondaryDiff * 2.2) * sameGroupBonus;
        if (distance < minDistance) {
          minDistance = distance;
          bestTargetKey = targetKey;
        }
      }
    });

    if (bestTargetKey) {
      setFocusedKey(bestTargetKey);
    }
  }, [setFocusedKey]);

  // Global Remote Control Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('[Remote Key] =>', e.key, 'focusedKey =>', focusedKeyRef.current);
      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          moveFocus('UP');
          break;
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          moveFocus('DOWN');
          break;
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          moveFocus('LEFT');
          break;
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          moveFocus('RIGHT');
          break;
        case 'Enter':
        case 'Select':
        case 'Ok':
          if (focusedKeyRef.current) {
            const node = nodesRef.current.get(focusedKeyRef.current);
            if (node?.onEnter) {
              e.preventDefault();
              node.onEnter();
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFocus]);

  return (
    <FocusContext.Provider value={{ focusedKey, setFocusedKey, registerNode, unregisterNode, moveFocus }}>
      {children}
    </FocusContext.Provider>
  );
};

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}

export function useFocusable({
  focusKey,
  groupId,
  onEnter,
  onFocus,
  onBlur
}: {
  focusKey: string;
  groupId?: string;
  onEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { focusedKey, setFocusedKey, registerNode, unregisterNode } = useFocus();
  const ref = useRef<any>(null);
  const onEnterRef = useRef(onEnter);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);

  onEnterRef.current = onEnter;
  onFocusRef.current = onFocus;
  onBlurRef.current = onBlur;

  const isFocused = focusedKey === focusKey;

  useEffect(() => {
    const el = ref.current;
    if (el) {
      registerNode({
        key: focusKey,
        groupId,
        ref: el,
        onEnter: () => onEnterRef.current?.(),
        onFocus: () => onFocusRef.current?.(),
        onBlur: () => onBlurRef.current?.()
      });
      return () => unregisterNode(focusKey);
    }
  }, [focusKey, groupId, registerNode, unregisterNode]);

  return {
    ref,
    isFocused,
    setFocus: () => setFocusedKey(focusKey)
  };
}
