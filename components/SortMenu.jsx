'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SortMenu.module.css';
import { SORT_MODES } from '../lib/sortUtils';

/**
 * Sort dropdown (top-right sort UX like screenshot).
 * Includes all 4 modes and shows "n" input when mode = everyNth.
 */
export default function SortMenu({
  label = 'Sort',
  sortBy,
  sortMode,
  everyNthN,
  columns,
  onSortByChange,
  onSortModeChange,
  onEveryNthNChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)}>
        {label}
        <span className={styles.chev}>{open ? '▴' : '▾'}</span>
      </button>

      {open ? (
        <div className={styles.menu}>
          <div className={styles.row}>
            <div className={styles.smallLabel}>Field</div>
            <select className={styles.select} value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
              {columns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.divider} />

          <div className={styles.options}>
            {SORT_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                className={sortMode === m.value ? styles.optionActive : styles.option}
                onClick={() => onSortModeChange(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {sortMode === 'everyNth' ? (
            <div className={styles.row}>
              <div className={styles.smallLabel}>n</div>
              <input
                className={styles.input}
                type="number"
                min={2}
                value={everyNthN}
                onChange={(e) => onEveryNthNChange(e.target.value)}
                placeholder="2"
              />
              <div className={styles.hint}>Ordering: 0,n,2n… then 1,1+n…</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
