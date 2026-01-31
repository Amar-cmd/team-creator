'use client';

import { useState } from 'react';
import styles from './SidebarTeams.module.css';

/**
 * Sidebar: ONLY Teams column (per requirement).
 * - Always visible (roster view and team view)
 * - Shows Unassigned + Team list
 */
export default function SidebarTeams({ teams, currentTeam, unassignedCount, onSelectTeam }) {
  const [isOpen, setIsOpen] = useState(false);
  const teamNumbers = Object.keys(teams)
    .map((k) => Number.parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.mobileHeader}>
        <div className={styles.sectionTitle}>All Teams</div>
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide teams list' : 'Show teams list'}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.menuLabel}>Menu</span>
        </button>
      </div>

      <div className={styles.list}>
        <button
          type="button"
          className={currentTeam == null ? styles.itemActive : styles.item}
          onClick={() => onSelectTeam(null)}
        >
          <span>Unassigned</span>
          <span className={styles.count}>{unassignedCount}</span>
        </button>

        {teamNumbers.length === 0 ? (
          <div className={styles.emptyText}>No Assigned Teams</div>
        ) : (
          teamNumbers.map((teamNo) => (
            <button
              key={teamNo}
              type="button"
              className={currentTeam === teamNo ? styles.itemActive : styles.item}
              onClick={() => onSelectTeam(teamNo)}
            >
              <span>Team {teamNo}</span>
              <span className={styles.count}>{teams[teamNo]?.length ?? 0}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
