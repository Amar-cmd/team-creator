'use client';

import styles from './StudentTable.module.css';

/**
 * Minimal, clean table with row selection.
 */
export default function StudentTable({ rows, columns, selectedIds, onToggleRow, onToggleAll }) {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.cbCol}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all"
              />
            </th>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={1 + columns.length}>
                No records to display
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const selected = selectedIds.has(r.id);
              return (
                <tr key={r.id} className={selected ? styles.selected : undefined}>
                  <td className={styles.cbCol}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleRow(r.id)}
                      aria-label="Select row"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key}>{r[c.key] ?? ''}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
