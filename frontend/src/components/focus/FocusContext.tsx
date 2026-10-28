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
  const lastContentKeyRef = useRef<string>('hero-play');
  const lastKeyboardKeyRef = useRef<string>('kb-Q');

  const setFocusedKey = useCallback((key: string) => {
    const prevKey = focusedKeyRef.current;
    if (prevKey && prevKey !== key) {
      nodesRef.current.get(prevKey)?.onBlur?.();
    }
    focusedKeyRef.current = key;
    setFocusedKeyState(key);

    if (!key.startsWith('sidebar-')) {
      lastContentKeyRef.current = key;
    }
    if (key.startsWith('kb-')) {
      lastKeyboardKeyRef.current = key;
    }

    const node = nodesRef.current.get(key);
    if (node?.ref) {
      node.onFocus?.();
      try {
        if (key.startsWith('hero-')) {
          window.scrollTo({ top: 0, behavior: 'auto' });
        } else if (key.startsWith('sidebar-')) {
          // Keep sidebar focus clean without altering window scroll
        } else {
          node.ref.scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
            inline: 'center'
          });
        }
      } catch {}
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

  // Spatial direction calculation with TV-optimized shortcuts
  const moveFocus = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const currentKey = focusedKeyRef.current;
    if (!currentKey) {
      const first = nodesRef.current.keys().next().value;
      if (first) setFocusedKey(first);
      return;
    }

    const currentNode = nodesRef.current.get(currentKey);
    if (!currentNode?.ref) return;

    const currentIsSidebar = currentKey.startsWith('sidebar-');

    // 1. Sidebar to Content (RIGHT)
    if (currentIsSidebar && direction === 'RIGHT') {
      const target = lastContentKeyRef.current;
      if (target && nodesRef.current.has(target) && !target.startsWith('sidebar-')) {
        setFocusedKey(target);
        return;
      }
      if (nodesRef.current.has('hero-play')) {
        setFocusedKey('hero-play');
        return;
      }
      if (nodesRef.current.has('kb-Q')) {
        setFocusedKey(lastKeyboardKeyRef.current || 'kb-Q');
        return;
      }
    }

    // 2. Content to Sidebar (LEFT) from leftmost elements
    if (!currentIsSidebar && direction === 'LEFT') {
      const isHeroPlay = currentKey === 'hero-play';
      const isLeftKeyOnKeyboard = ['kb-1', 'kb-Q', 'kb-A', 'kb-Z', 'kb-SPACE', 'kb-ARROW_LEFT'].includes(currentKey);

      let hasSiblingToLeft = false;
      if (currentNode.groupId && !isHeroPlay && !isLeftKeyOnKeyboard) {
        const currentRect = currentNode.ref.getBoundingClientRect();
        for (const [k, n] of nodesRef.current.entries()) {
          if (k !== currentKey && n.groupId === currentNode.groupId && n.ref) {
            const r = n.ref.getBoundingClientRect();
            if (r.left < currentRect.left - 6) {
              hasSiblingToLeft = true;
              break;
            }
          }
        }
      }

      if (isHeroPlay || (!hasSiblingToLeft && !currentKey.startsWith('search-card-') && !currentKey.startsWith('hist-card-')) || isLeftKeyOnKeyboard) {
        if (isLeftKeyOnKeyboard && nodesRef.current.has('sidebar-nav-search')) {
          setFocusedKey('sidebar-nav-search');
          return;
        }
        if (nodesRef.current.has('sidebar-nav-home')) {
          setFocusedKey('sidebar-nav-home');
          return;
        }
        if (nodesRef.current.has('sidebar-nav-search')) {
          setFocusedKey('sidebar-nav-search');
          return;
        }
      }
    }

    // 3. Search Screen: Keyboard to Results (RIGHT)
    if (currentKey.startsWith('kb-') && direction === 'RIGHT') {
      const isRightKey = ['kb-0', 'kb-P', 'kb-L', 'kb-M', 'kb-SEARCH', 'kb-ARROW_RIGHT'].includes(currentKey);
      if (isRightKey) {
        // Jump to first available result or history card on the right
        for (const [k] of nodesRef.current.entries()) {
          if (k.startsWith('search-card-') || k.startsWith('hist-card-') || k.startsWith('search-rec-')) {
            setFocusedKey(k);
            return;
          }
        }
      }
    }

    // 4. Search Screen: Results to Keyboard (LEFT)
    if ((currentKey.startsWith('search-card-') || currentKey.startsWith('hist-card-') || currentKey.startsWith('search-rec-')) && direction === 'LEFT') {
      // Find if there is a card to the left with dx < -8 in the same group
      const currentRect = currentNode.ref.getBoundingClientRect();
      let hasCardToLeft = false;
      nodesRef.current.forEach((node, key) => {
        if (key === currentKey || !node.ref) return;
        if (key.startsWith('search-card-') || key.startsWith('hist-card-') || key.startsWith('search-rec-')) {
          const r = node.ref.getBoundingClientRect();
          if (r.right < currentRect.left && Math.abs((r.top + r.height / 2) - (currentRect.top + currentRect.height / 2)) < 80) {
            hasCardToLeft = true;
          }
        }
      });
      if (!hasCardToLeft) {
        // Return to keyboard
        setFocusedKey(lastKeyboardKeyRef.current || 'kb-SEARCH');
        return;
      }
    }

    // 5. General Spatial Calculation
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

      const targetIsSidebar = targetKey.startsWith('sidebar-');

      // UP and DOWN must NEVER cross between the sidebar and content
      if ((direction === 'UP' || direction === 'DOWN') && currentIsSidebar !== targetIsSidebar) {
        return;
      }

      let isCandidate = false;
      let primaryDiff = 0;
      let secondaryDiff = 0;

      switch (direction) {
        case 'UP':
          if (dy < -6) {
            isCandidate = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'DOWN':
          if (dy > 6) {
            isCandidate = true;
            primaryDiff = Math.abs(dy);
            secondaryDiff = Math.abs(dx);
          }
          break;
        case 'LEFT':
          if (dx < -6) {
            isCandidate = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
        case 'RIGHT':
          if (dx > 6) {
            isCandidate = true;
            primaryDiff = Math.abs(dx);
            secondaryDiff = Math.abs(dy);
          }
          break;
      }

      if (isCandidate) {
        // Favor elements in the same rail/group
        const sameGroupBonus = currentNode.groupId && currentNode.groupId === targetNode.groupId ? 0.45 : 1.0;
        const distance = (primaryDiff + secondaryDiff * 1.8) * sameGroupBonus;
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

  // Global Remote Control Key Handler
  const handleKeyAction = useCallback((key: string) => {
    switch (key) {
      case 'ArrowUp':
      case 'Up':
        moveFocus('UP');
        break;
      case 'ArrowDown':
      case 'Down':
        moveFocus('DOWN');
        break;
      case 'ArrowLeft':
      case 'Left':
        moveFocus('LEFT');
        break;
      case 'ArrowRight':
      case 'Right':
        moveFocus('RIGHT');
        break;
      case 'Enter':
      case 'Select':
      case 'Ok':
        if (focusedKeyRef.current) {
          const node = nodesRef.current.get(focusedKeyRef.current);
          if (node?.onEnter) {
            node.onEnter();
          }
        }
        break;
      default:
        break;
    }
  }, [moveFocus]);

  // Direct Native Bridge for Android TV (Instant Key Execution)
  useEffect(() => {
    (window as any).handleTvKeyEvent = (key: string) => {
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: key,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
    };
    return () => {
      delete (window as any).handleTvKeyEvent;
    };
  }, []);

  // Global Keyboard Listener with D-pad debounce/throttle
  useEffect(() => {
    let lastKeyTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      const isArrow = e.key.startsWith('Arrow') || ['Up', 'Down', 'Left', 'Right'].includes(e.key);
      if (isArrow && now - lastKeyTime < 45) {
        e.preventDefault();
        return;
      }
      lastKeyTime = now;

      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          handleKeyAction('ArrowUp');
          break;
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          handleKeyAction('ArrowDown');
          break;
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          handleKeyAction('ArrowLeft');
          break;
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          handleKeyAction('ArrowRight');
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
  }, [handleKeyAction]);

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
