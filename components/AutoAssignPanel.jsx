'use client';

import styles from './AutoAssignPanel.module.css';
import SortMenu from './SortMenu';

/**
 * Auto-assign panel. (Same 4 sorting criteria as manual sort.)
 */
export default function AutoAssignPanel({
  columns,
  perTeam,
  onPerTeamChange,

  sortBy,
  sortMode,
  everyNthN,
  onSortByChange,
  onSortModeChange,
  onEveryNthNChange,

  onRun,
  disabled,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Auto Assign</div>
          <div className={styles.sub}>Choose criteria → distribute unassigned students into new teams</div>
        </div>

        <SortMenu
          label="Sort"
          columns={columns}
          sortBy={sortBy}
          sortMode={sortMode}
          everyNthN={everyNthN}
          onSortByChange={onSortByChange}
          onSortModeChange={onSortModeChange}
          onEveryNthNChange={onEveryNthNChange}
        />
      </div>

      <div className={styles.body}>
        <label className={styles.label}>
          Students per team
          <input
            className={styles.input}
            type="number"
            min={1}
            value={perTeam}
            onChange={(e) => onPerTeamChange(e.target.value)}
            placeholder="e.g. 5"
          />
        </label>

        <button type="button" className={styles.primary} onClick={onRun} disabled={disabled}>
          Auto Assign
        </button>
      </div>
    </div>
  );
}
