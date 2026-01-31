// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import * as XLSX from 'xlsx';

// import styles from './TeamBuilderApp.module.css';

// import SidebarTeams from './SidebarTeams';
// import DragDropUpload from './DragDropUpload';
// import SortMenu from './SortMenu';
// import AutoAssignPanel from './AutoAssignPanel';
// import StudentTable from './StudentTable';

// import { STUDENT_FIELD_DEFS, normalizeHeader, pickFirstByAliases } from '../lib/studentFields';
// import { applySort } from '../lib/sortUtils';

// /**
//  * UX states:
//  * - "roster": Upload roster (Img-1 style)
//  * - "teams": Create Team screen (Img-2 style)
//  *
//  * No DB. Everything is in browser memory.
//  */

// const TRIMESTER_OPTIONS = ['', 'Trimester I', 'Trimester II', 'Trimester III', 'Trimester IV', 'Trimester V', 'Trimester VI'];
// const SECTION_OPTIONS = ['', 'Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F'];

// function safeId() {
//   if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
//     return crypto.randomUUID();
//   }
//   return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
// }

// export default function TeamBuilderApp() {
//   const [view, setView] = useState('roster'); // roster | teams
//   const [error, setError] = useState('');

//   // Selected metadata (used in roster and teams view)
//   const [trimester, setTrimester] = useState('');
//   const [section, setSection] = useState('');

//   // Draft roster from upload (user clicks "Create Roster" to confirm)
//   const [draftRoster, setDraftRoster] = useState([]);
//   const [draftFieldKeys, setDraftFieldKeys] = useState(STUDENT_FIELD_DEFS.map((d) => d.key));

//   // Active roster used in team creation
//   const [students, setStudents] = useState([]);
//   const [fieldKeys, setFieldKeys] = useState(STUDENT_FIELD_DEFS.map((d) => d.key));

//   // Team selection + row selection
//   const [currentTeam, setCurrentTeam] = useState(null); // null = unassigned
//   const [selectedIds, setSelectedIds] = useState(() => new Set());
//   const [nextTeamNumber, setNextTeamNumber] = useState(1);

//   // Manual sort (table view) — 4 modes
//   const [sortBy, setSortBy] = useState('name');
//   const [sortMode, setSortMode] = useState('asc');
//   const [sortEveryNthN, setSortEveryNthN] = useState('2');

//   // Auto assign sort (same 4 modes)
//   const [autoSortBy, setAutoSortBy] = useState('name');
//   const [autoSortMode, setAutoSortMode] = useState('random');
//   const [autoEveryNthN, setAutoEveryNthN] = useState('2');
//   const [autoPerTeam, setAutoPerTeam] = useState('');

//   // ---------- Derived structures ----------
//   const teams = useMemo(() => {
//     const map = {};
//     for (const s of students) {
//       if (s.team == null) continue;
//       if (!map[s.team]) map[s.team] = [];
//       map[s.team].push(s);
//     }
//     return map;
//   }, [students]);

//   const unassigned = useMemo(() => students.filter((s) => s.team == null), [students]);

//   // If a team disappears, drop back to Unassigned to avoid "dead selection".
//   useEffect(() => {
//     if (currentTeam == null) return;
//     if (!teams[currentTeam]) {
//       setCurrentTeam(null);
//       setSelectedIds(new Set());
//     }
//   }, [currentTeam, teams]);

//   const columns = useMemo(() => {
//     const allowed = new Set(fieldKeys);
//     return STUDENT_FIELD_DEFS.filter((d) => allowed.has(d.key)).map((d) => ({
//       key: d.key,
//       label: d.label,
//     }));
//   }, [fieldKeys]);

//   const visibleRows = useMemo(() => {
//     const base = currentTeam == null ? unassigned : teams[currentTeam] ?? [];
//     return applySort(base, {
//       sortBy,
//       mode: sortMode,
//       everyNthN: sortEveryNthN,
//     });
//   }, [currentTeam, teams, unassigned, sortBy, sortMode, sortEveryNthN]);

//   // ----------------- Upload parsing -----------------
//   const parseRosterFile = async (file) => {
//     setError('');

//     // small safety guard for browser memory
//     const maxBytes = 15 * 1024 * 1024;
//     if (file.size > maxBytes) {
//       setError('File is too large. Please upload an Excel/CSV file under 15MB.');
//       return;
//     }

//     const data = await file.arrayBuffer();

//     // XLSX can read CSV too (based on extension).
//     const workbook = XLSX.read(data, { type: 'array' });
//     const firstSheetName = workbook.SheetNames?.[0];
//     if (!firstSheetName) {
//       setError('No sheet found in the file.');
//       return;
//     }

//     const worksheet = workbook.Sheets[firstSheetName];
//     const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

//     if (!Array.isArray(rawRows) || rawRows.length === 0) {
//       setError('Sheet is empty. Please upload a roster with at least one data row.');
//       return;
//     }

//     const hasValueForField = Object.fromEntries(STUDENT_FIELD_DEFS.map((d) => [d.key, false]));
//     const processed = [];

//     for (const rawRow of rawRows) {
//       // normalize keys
//       const normalized = {};
//       for (const [k, v] of Object.entries(rawRow)) {
//         normalized[normalizeHeader(k)] = v;
//       }

//       let keep = false;
//       const student = { id: safeId(), team: null };

//       for (const def of STUDENT_FIELD_DEFS) {
//         const value = pickFirstByAliases(normalized, def.headerAliases);
//         const trimmed = String(value ?? '').trim();
//         student[def.key] = trimmed;
//         if (trimmed) {
//           hasValueForField[def.key] = true;
//           keep = true;
//         }
//       }

//       // requirement: keep row if any of the allowed fields exists
//       if (keep) processed.push(student);
//     }

//     if (processed.length === 0) {
//       setError(
//         'No usable rows found. Your sheet must have at least one of: SR. NO., NAME, ADMISSION NO., ROLL NO., EMAIL.'
//       );
//       return;
//     }

//     const detected = STUDENT_FIELD_DEFS.filter((d) => hasValueForField[d.key]).map((d) => d.key);
//     const finalKeys = detected.length ? detected : STUDENT_FIELD_DEFS.map((d) => d.key);

//     setDraftRoster(processed);
//     setDraftFieldKeys(finalKeys);

//     // Make sort defaults valid for draft and final
//     const defaultKey = finalKeys.includes('name') ? 'name' : finalKeys[0];
//     setSortBy(defaultKey);
//     setAutoSortBy(defaultKey);
//   };

//   const onFileSelected = async (file, fileError) => {
//     if (fileError) {
//       setError(fileError);
//       return;
//     }
//     if (!file) return;
//     try {
//       await parseRosterFile(file);
//     } catch {
//       setError('Could not parse file. Please check the file format and try again.');
//     }
//   };

//   // ----------------- Roster confirmation -----------------
//   const canCreateRoster = draftRoster.length > 0 && trimester && section;

//   const createRoster = () => {
//     if (!canCreateRoster) return;

//     // Confirm draft as active roster and switch to team view.
//     setStudents(draftRoster);
//     setFieldKeys(draftFieldKeys);

//     // Reset team state
//     setCurrentTeam(null);
//     setSelectedIds(new Set());
//     setNextTeamNumber(1);

//     setView('teams');
//   };

//   const resetAll = () => {
//     // Start a fresh roster
//     setView('roster');
//     setError('');

//     setDraftRoster([]);
//     setStudents([]);

//     setCurrentTeam(null);
//     setSelectedIds(new Set());
//     setNextTeamNumber(1);

//     setSortMode('asc');
//     setSortEveryNthN('2');
//     setAutoSortMode('random');
//     setAutoEveryNthN('2');
//     setAutoPerTeam('');
//   };

//   // ----------------- Selection helpers -----------------
//   const toggleRow = (id) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   const toggleAll = () => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       const allSelected = visibleRows.length > 0 && visibleRows.every((r) => next.has(r.id));
//       if (allSelected) return new Set();
//       for (const r of visibleRows) next.add(r.id);
//       return next;
//     });
//   };

//   // ----------------- Manual assignment -----------------
//   const [targetTeamChoice, setTargetTeamChoice] = useState('new'); // 'new' or existing team number as string

//   const assignSelected = () => {
//     if (selectedIds.size === 0) return;

//     const teamNo =
//       targetTeamChoice === 'new'
//         ? nextTeamNumber
//         : Number.parseInt(String(targetTeamChoice), 10);

//     if (!Number.isFinite(teamNo) || teamNo < 1) return;

//     setStudents((prev) =>
//       prev.map((s) => (selectedIds.has(s.id) ? { ...s, team: teamNo } : s))
//     );

//     setSelectedIds(new Set());

//     // If we assigned to new team, increment for the next one
//     if (targetTeamChoice === 'new') {
//       setNextTeamNumber((n) => n + 1);
//       setTargetTeamChoice('new');
//     } else {
//       // ensure nextTeamNumber always stays > max existing
//       setNextTeamNumber((n) => Math.max(n, teamNo + 1));
//     }
//   };

//   const unassignSelected = () => {
//     if (selectedIds.size === 0) return;
//     setStudents((prev) =>
//       prev.map((s) => (selectedIds.has(s.id) ? { ...s, team: null } : s))
//     );
//     setSelectedIds(new Set());
//   };

//   // ----------------- Auto assign -----------------
//   const runAutoAssign = () => {
//     const perTeam = Number.parseInt(String(autoPerTeam), 10);
//     if (!Number.isFinite(perTeam) || perTeam < 1) {
//       setError('Auto assign: "Students per team" must be a positive number.');
//       return;
//     }

//     setError('');

//     const unassignedNow = students.filter((s) => s.team == null);
//     if (unassignedNow.length === 0) return;

//     const sorted = applySort(unassignedNow, {
//       sortBy: autoSortBy,
//       mode: autoSortMode,
//       everyNthN: autoEveryNthN,
//     });

//     let nextTeam = nextTeamNumber;
//     const updated = students.map((s) => ({ ...s }));

//     for (let i = 0; i < sorted.length; i += perTeam) {
//       const chunk = sorted.slice(i, i + perTeam);
//       for (const st of chunk) {
//         const idx = updated.findIndex((u) => u.id === st.id);
//         if (idx !== -1) updated[idx].team = nextTeam;
//       }
//       nextTeam += 1;
//     }

//     setStudents(updated);
//     setSelectedIds(new Set());
//     setNextTeamNumber(nextTeam);
//   };

//   // ----------------- Export -----------------
//   const canExport = trimester && section && Object.keys(teams).length > 0;

//   const exportTeams = () => {
//     if (!canExport) return;

//     const aoa = [];
//     aoa.push(['Trimester', trimester]);
//     aoa.push(['Section', section]);
//     aoa.push([]);

//     const teamNos = Object.keys(teams)
//       .map((k) => Number.parseInt(k, 10))
//       .filter((n) => Number.isFinite(n))
//       .sort((a, b) => a - b);

//     // export only detected fields in this roster
//     const activeDefs = STUDENT_FIELD_DEFS.filter((d) => fieldKeys.includes(d.key));
//     aoa.push(['']); // spacer
//     for (const teamNo of teamNos) {
//       aoa.push([`Team ${teamNo}`]);
//       aoa.push(activeDefs.map((d) => d.label));
//       for (const s of teams[teamNo] ?? []) {
//         aoa.push(activeDefs.map((d) => s[d.key] ?? ''));
//       }
//       aoa.push([]);
//     }

//     const ws = XLSX.utils.aoa_to_sheet(aoa);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Teams');

//     const safeTrimester = trimester.replace(/[^a-z0-9_-]+/gi, '_');
//     const safeSection = section.replace(/[^a-z0-9_-]+/gi, '_');

//     XLSX.writeFile(wb, `${safeTrimester}_${safeSection}_teams.xlsx`);
//   };

//   // ---------- Sidebar numbers ----------
//   const sidebarTeams = teams;

//   // ---------- Render ----------
//   return (
//     <div className={styles.shell}>
//       <SidebarTeams
//         teams={sidebarTeams}
//         currentTeam={currentTeam}
//         unassignedCount={unassigned.length}
//         onSelectTeam={(t) => {
//           setCurrentTeam(t);
//           setSelectedIds(new Set());
//         }}
//       />

//       <div className={styles.main}>
//         {view === 'roster' ? (
//           <div className={styles.page}>
//             <div className={styles.headerRow}>
//               <div>
//                 <h1 className={styles.h1}>Team Builder</h1>
//                 <div className={styles.h2}>Must Have: Name, Roll No. (BM-format), Email Id</div>
//               </div>

//               <button type="button" className={styles.ghostBtn} onClick={resetAll} disabled={draftRoster.length === 0}>
//                 Reset
//               </button>
//             </div>

//             <div className={styles.pillsRow}>
//               <select
//                 className={styles.pill}
//                 value={trimester}
//                 onChange={(e) => setTrimester(e.target.value)}
//               >
//                 {TRIMESTER_OPTIONS.map((t) => (
//                   <option key={t} value={t}>
//                     {t || 'Select Trimester'}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 className={styles.pill}
//                 value={section}
//                 onChange={(e) => setSection(e.target.value)}
//               >
//                 {SECTION_OPTIONS.map((s) => (
//                   <option key={s} value={s}>
//                     {s || 'Select Section'}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {error ? <div className={styles.error}>{error}</div> : null}

//             <div className={styles.uploadCard}>
//               <DragDropUpload onFileSelected={onFileSelected} />
//             </div>

//             <div className={styles.footerRow}>
//               <div className={styles.helperText}>
//                 {draftRoster.length > 0
//                   ? `Loaded ${draftRoster.length} students.`
//                   : 'Upload a roster to continue.'}
//               </div>

//               <button
//                 type="button"
//                 className={styles.primaryBtn}
//                 onClick={createRoster}
//                 disabled={!canCreateRoster}
//               >
//                 Create Roster
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className={styles.page}>
//             {/* Top Bar: Trimester + Section on left, Export on right (Requirement #4) */}
//             <div className={styles.topBar}>
//               <div className={styles.topLeft}>
//                 <div className={styles.topTitle}>Create Team</div>
//                 <div className={styles.topMeta}>
//                   {trimester} • {section}
//                 </div>
//               </div>

//               <div className={styles.topRight}>
//                 <button type="button" className={styles.ghostBtn} onClick={resetAll}>
//                   New Roster
//                 </button>

//                 <button
//                   type="button"
//                   className={styles.primaryBtn}
//                   onClick={exportTeams}
//                   disabled={!canExport}
//                   title={canExport ? 'Export teams to Excel' : 'Create at least one team to export'}
//                 >
//                   Export
//                 </button>
//               </div>
//             </div>

//             {error ? <div className={styles.error}>{error}</div> : null}

//             {/* Auto assign panel (Sort has 4 modes as required) */}
//             <AutoAssignPanel
//               columns={columns}
//               perTeam={autoPerTeam}
//               onPerTeamChange={setAutoPerTeam}
//               sortBy={autoSortBy}
//               sortMode={autoSortMode}
//               everyNthN={autoEveryNthN}
//               onSortByChange={setAutoSortBy}
//               onSortModeChange={setAutoSortMode}
//               onEveryNthNChange={setAutoEveryNthN}
//               onRun={runAutoAssign}
//               disabled={students.length === 0 || unassigned.length === 0}
//             />

//             {/* Table area */}
//             <div className={styles.tableCard}>
//               <div className={styles.tableHeader}>
//                 <div>
//                   <div className={styles.tableTitle}>
//                     {currentTeam == null ? 'Students' : `Team ${currentTeam}`}
//                   </div>
//                   <div className={styles.tableSub}>
//                     Select students and assign them to teams.
//                   </div>
//                 </div>

//                 {/* Sort dropdown (4 modes) */}
//                 <SortMenu
//                   label="Sort"
//                   columns={columns}
//                   sortBy={sortBy}
//                   sortMode={sortMode}
//                   everyNthN={sortEveryNthN}
//                   onSortByChange={setSortBy}
//                   onSortModeChange={setSortMode}
//                   onEveryNthNChange={setSortEveryNthN}
//                 />
//               </div>

//               <StudentTable
//                 rows={visibleRows}
//                 columns={columns}
//                 selectedIds={selectedIds}
//                 onToggleRow={toggleRow}
//                 onToggleAll={toggleAll}
//               />

//               {/* Bottom action row (more like Img-2) */}
//               <div className={styles.bottomActions}>
//                 <div className={styles.selectedInfo}>
//                   Selected: <b>{selectedIds.size}</b>
//                 </div>

//                 <div className={styles.actionsRight}>
//                   <select
//                     className={styles.teamSelect}
//                     value={targetTeamChoice}
//                     onChange={(e) => setTargetTeamChoice(e.target.value)}
//                   >
//                     <option value="new">New Team ({nextTeamNumber})</option>
//                     {Object.keys(teams)
//                       .map((k) => Number.parseInt(k, 10))
//                       .filter((n) => Number.isFinite(n))
//                       .sort((a, b) => a - b)
//                       .map((n) => (
//                         <option key={n} value={String(n)}>
//                           Team {n}
//                         </option>
//                       ))}
//                   </select>

//                   <button
//                     type="button"
//                     className={styles.primaryBtn}
//                     onClick={assignSelected}
//                     disabled={selectedIds.size === 0}
//                   >
//                     {targetTeamChoice === 'new'
//                       ? `Assign to Team ${nextTeamNumber}`
//                       : `Assign to Team ${targetTeamChoice}`}
//                   </button>

//                   <button
//                     type="button"
//                     className={styles.dangerBtn}
//                     onClick={unassignSelected}
//                     disabled={selectedIds.size === 0}
//                     title="Remove selected students from team"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import styles from './TeamBuilderApp.module.css';

import SidebarTeams from './SidebarTeams';
import DragDropUpload from './DragDropUpload';
import SortMenu from './SortMenu';
import AutoAssignPanel from './AutoAssignPanel';
import StudentTable from './StudentTable';

import { STUDENT_FIELD_DEFS, normalizeHeader, pickFirstByAliases } from '../lib/studentFields';
import { applySort } from '../lib/sortUtils';

const TRIMESTER_OPTIONS = ['', 'Trimester I', 'Trimester II', 'Trimester III', 'Trimester IV', 'Trimester V', 'Trimester VI'];
const SECTION_OPTIONS = ['', 'Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F'];

function safeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function TeamBuilderApp() {
  const [view, setView] = useState('roster');
  const [error, setError] = useState('');

  const [trimester, setTrimester] = useState('');
  const [section, setSection] = useState('');

  // NEW: show upload success UI (filename)
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [draftRoster, setDraftRoster] = useState([]);
  const [draftFieldKeys, setDraftFieldKeys] = useState(STUDENT_FIELD_DEFS.map((d) => d.key));

  const [students, setStudents] = useState([]);
  const [fieldKeys, setFieldKeys] = useState(STUDENT_FIELD_DEFS.map((d) => d.key));

  const [currentTeam, setCurrentTeam] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [nextTeamNumber, setNextTeamNumber] = useState(1);

  const [sortBy, setSortBy] = useState('name');
  const [sortMode, setSortMode] = useState('asc');
  const [sortEveryNthN, setSortEveryNthN] = useState('2');

  const [autoSortBy, setAutoSortBy] = useState('name');
  const [autoSortMode, setAutoSortMode] = useState('random');
  const [autoEveryNthN, setAutoEveryNthN] = useState('2');
  const [autoPerTeam, setAutoPerTeam] = useState('');

  const [targetTeamChoice, setTargetTeamChoice] = useState('new');

  const teams = useMemo(() => {
    const map = {};
    for (const s of students) {
      if (s.team == null) continue;
      if (!map[s.team]) map[s.team] = [];
      map[s.team].push(s);
    }
    return map;
  }, [students]);

  const unassigned = useMemo(() => students.filter((s) => s.team == null), [students]);

  useEffect(() => {
    if (currentTeam == null) return;
    if (!teams[currentTeam]) {
      setCurrentTeam(null);
      setSelectedIds(new Set());
    }
  }, [currentTeam, teams]);

  const columns = useMemo(() => {
    const allowed = new Set(fieldKeys);
    return STUDENT_FIELD_DEFS.filter((d) => allowed.has(d.key)).map((d) => ({
      key: d.key,
      label: d.label,
    }));
  }, [fieldKeys]);

  const visibleRows = useMemo(() => {
    const base = currentTeam == null ? unassigned : teams[currentTeam] ?? [];
    return applySort(base, {
      sortBy,
      mode: sortMode,
      everyNthN: sortEveryNthN,
    });
  }, [currentTeam, teams, unassigned, sortBy, sortMode, sortEveryNthN]);

  const parseRosterFile = async (file) => {
    setError('');

    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('File is too large. Please upload an Excel/CSV file under 15MB.');
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheetName = workbook.SheetNames?.[0];
    if (!firstSheetName) {
      setError('No sheet found in the file.');
      return;
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      setError('Sheet is empty. Please upload a roster with at least one data row.');
      return;
    }

    const hasValueForField = Object.fromEntries(STUDENT_FIELD_DEFS.map((d) => [d.key, false]));
    const processed = [];

    for (const rawRow of rawRows) {
      const normalized = {};
      for (const [k, v] of Object.entries(rawRow)) {
        normalized[normalizeHeader(k)] = v;
      }

      let keep = false;
      const student = { id: safeId(), team: null };

      for (const def of STUDENT_FIELD_DEFS) {
        const value = pickFirstByAliases(normalized, def.headerAliases);
        const trimmed = String(value ?? '').trim();
        student[def.key] = trimmed;
        if (trimmed) {
          hasValueForField[def.key] = true;
          keep = true;
        }
      }

      if (keep) processed.push(student);
    }

    if (processed.length === 0) {
      setError(
        'No usable rows found. Your sheet must have at least one of: SR. NO., NAME, ADMISSION NO., ROLL NO., EMAIL.'
      );
      return;
    }

    const detected = STUDENT_FIELD_DEFS.filter((d) => hasValueForField[d.key]).map((d) => d.key);
    const finalKeys = detected.length ? detected : STUDENT_FIELD_DEFS.map((d) => d.key);

    setDraftRoster(processed);
    setDraftFieldKeys(finalKeys);

    const defaultKey = finalKeys.includes('name') ? 'name' : finalKeys[0];
    setSortBy(defaultKey);
    setAutoSortBy(defaultKey);

    // NEW: show upload status in UI
    setUploadedFileName(file.name);
  };

  const onFileSelected = async (file, fileError) => {
    if (fileError) {
      setError(fileError);
      setUploadedFileName('');
      return;
    }
    if (!file) return;

    try {
      await parseRosterFile(file);
    } catch {
      setError('Could not parse file. Please check the file format and try again.');
      setUploadedFileName('');
    }
  };

  const canCreateRoster = draftRoster.length > 0 && trimester && section;

  const createRoster = () => {
    if (!canCreateRoster) return;

    setStudents(draftRoster);
    setFieldKeys(draftFieldKeys);

    setCurrentTeam(null);
    setSelectedIds(new Set());
    setNextTeamNumber(1);

    setView('teams');
  };

  const resetAll = () => {
    setView('roster');
    setError('');

    setDraftRoster([]);
    setStudents([]);
    setUploadedFileName('');

    setCurrentTeam(null);
    setSelectedIds(new Set());
    setNextTeamNumber(1);

    setSortMode('asc');
    setSortEveryNthN('2');
    setAutoSortMode('random');
    setAutoEveryNthN('2');
    setAutoPerTeam('');
    setTargetTeamChoice('new');
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = visibleRows.length > 0 && visibleRows.every((r) => next.has(r.id));
      if (allSelected) return new Set();
      for (const r of visibleRows) next.add(r.id);
      return next;
    });
  };

  const assignSelected = () => {
    if (selectedIds.size === 0) return;

    const teamNo =
      targetTeamChoice === 'new'
        ? nextTeamNumber
        : Number.parseInt(String(targetTeamChoice), 10);

    if (!Number.isFinite(teamNo) || teamNo < 1) return;

    setStudents((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, team: teamNo } : s))
    );

    setSelectedIds(new Set());

    if (targetTeamChoice === 'new') {
      setNextTeamNumber((n) => n + 1);
      setTargetTeamChoice('new');
    } else {
      setNextTeamNumber((n) => Math.max(n, teamNo + 1));
    }
  };

  const unassignSelected = () => {
    if (selectedIds.size === 0) return;
    setStudents((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, team: null } : s))
    );
    setSelectedIds(new Set());
  };

  const runAutoAssign = () => {
    const perTeam = Number.parseInt(String(autoPerTeam), 10);
    if (!Number.isFinite(perTeam) || perTeam < 1) {
      setError('Auto assign: "Students per team" must be a positive number.');
      return;
    }

    setError('');

    const unassignedNow = students.filter((s) => s.team == null);
    if (unassignedNow.length === 0) return;

    const sorted = applySort(unassignedNow, {
      sortBy: autoSortBy,
      mode: autoSortMode,
      everyNthN: autoEveryNthN,
    });

    let nextTeam = nextTeamNumber;
    const updated = students.map((s) => ({ ...s }));

    for (let i = 0; i < sorted.length; i += perTeam) {
      const chunk = sorted.slice(i, i + perTeam);
      for (const st of chunk) {
        const idx = updated.findIndex((u) => u.id === st.id);
        if (idx !== -1) updated[idx].team = nextTeam;
      }
      nextTeam += 1;
    }

    setStudents(updated);
    setSelectedIds(new Set());
    setNextTeamNumber(nextTeam);
  };

  const canExport = trimester && section && Object.keys(teams).length > 0;

  const exportTeams = () => {
    if (!canExport) return;

    const teamNos = Object.keys(teams)
      .map((k) => Number.parseInt(k, 10))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);

    const activeDefs = STUDENT_FIELD_DEFS.filter((d) => fieldKeys.includes(d.key));
    const orderedKeys = ['srNo', 'name', 'roll', 'admissionNumber', 'email'];
    const orderedDefs = orderedKeys
      .map((key) => activeDefs.find((d) => d.key === key))
      .filter(Boolean);
    const remainingDefs = activeDefs.filter((d) => !orderedKeys.includes(d.key));
    const finalDefs = [...orderedDefs, ...remainingDefs];

    const headerRow = [...finalDefs.map((d) => d.label), 'TEAM'];
    const aoa = [headerRow];

    for (const teamNo of teamNos) {
      for (const s of teams[teamNo] ?? []) {
        aoa.push([...finalDefs.map((d) => s[d.key] ?? ''), `Team ${teamNo}`]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teams');

    const safeTrimester = trimester.replace(/[^a-z0-9_-]+/gi, '_');
    const safeSection = section.replace(/[^a-z0-9_-]+/gi, '_');

    XLSX.writeFile(wb, `${safeTrimester}_${safeSection}_teams.xlsx`);
  };

  return (
    <div className={styles.shell}>
      <SidebarTeams
        teams={teams}
        currentTeam={currentTeam}
        unassignedCount={unassigned.length}
        onSelectTeam={(t) => {
          setCurrentTeam(t);
          setSelectedIds(new Set());
        }}
      />

      <div className={styles.main}>
        {view === 'roster' ? (
          <div className={styles.page}>
            <div className={styles.headerRow}>
              <div>
                <h1 className={styles.h1}>Team Builder</h1>
                <div className={styles.h2}>Must Have: Name, Roll No. (BM-format), Email Id</div>
              </div>

              <button
                type="button"
                className={styles.ghostBtn}
                onClick={resetAll}
                disabled={draftRoster.length === 0 && !uploadedFileName}
              >
                Reset
              </button>
            </div>

            <div className={styles.pillsRow}>
              <select className={styles.pill} value={trimester} onChange={(e) => setTrimester(e.target.value)}>
                {TRIMESTER_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t || 'Select Trimester'}
                  </option>
                ))}
              </select>

              <select className={styles.pill} value={section} onChange={(e) => setSection(e.target.value)}>
                {SECTION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s || 'Select Section'}
                  </option>
                ))}
              </select>
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.uploadCard}>
              <DragDropUpload
                onFileSelected={onFileSelected}
                uploadedFileName={uploadedFileName}
              />
            </div>

            <div className={styles.footerRow}>
              <div className={styles.helperText}>
                {draftRoster.length > 0 ? `Loaded ${draftRoster.length} students.` : 'Upload a roster to continue.'}
              </div>

              <button type="button" className={styles.primaryBtn} onClick={createRoster} disabled={!canCreateRoster}>
                Create Roster
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.page}>
            <div className={styles.topBar}>
              <div className={styles.topLeft}>
                <div className={styles.topTitle}>Create Team</div>
                <div className={styles.topMeta}>
                  {trimester} • {section}
                </div>
              </div>

              <div className={styles.topRight}>
                <button type="button" className={styles.ghostBtn} onClick={resetAll}>
                  New Roster
                </button>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={exportTeams}
                  disabled={!canExport}
                  title={canExport ? 'Export teams to Excel' : 'Create at least one team to export'}
                >
                  Export
                </button>
              </div>
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            <AutoAssignPanel
              columns={columns}
              perTeam={autoPerTeam}
              onPerTeamChange={setAutoPerTeam}
              sortBy={autoSortBy}
              sortMode={autoSortMode}
              everyNthN={autoEveryNthN}
              onSortByChange={setAutoSortBy}
              onSortModeChange={setAutoSortMode}
              onEveryNthNChange={setAutoEveryNthN}
              onRun={runAutoAssign}
              disabled={students.length === 0 || unassigned.length === 0}
            />

            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <div>
                  <div className={styles.tableTitle}>{currentTeam == null ? 'Students' : `Team ${currentTeam}`}</div>
                  <div className={styles.tableSub}>Select students and assign them to teams.</div>
                </div>

                <SortMenu
                  label="Sort"
                  columns={columns}
                  sortBy={sortBy}
                  sortMode={sortMode}
                  everyNthN={sortEveryNthN}
                  onSortByChange={setSortBy}
                  onSortModeChange={setSortMode}
                  onEveryNthNChange={setSortEveryNthN}
                />
              </div>

              <StudentTable
                rows={visibleRows}
                columns={columns}
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
              />

              <div className={styles.bottomActions}>
                <div className={styles.selectedInfo}>
                  Selected: <b>{selectedIds.size}</b>
                </div>

                <div className={styles.actionsRight}>
                  <select className={styles.teamSelect} value={targetTeamChoice} onChange={(e) => setTargetTeamChoice(e.target.value)}>
                    <option value="new">New Team ({nextTeamNumber})</option>
                    {Object.keys(teams)
                      .map((k) => Number.parseInt(k, 10))
                      .filter((n) => Number.isFinite(n))
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <option key={n} value={String(n)}>
                          Team {n}
                        </option>
                      ))}
                  </select>

                  <button type="button" className={styles.primaryBtn} onClick={assignSelected} disabled={selectedIds.size === 0}>
                    {targetTeamChoice === 'new' ? `Assign to Team ${nextTeamNumber}` : `Assign to Team ${targetTeamChoice}`}
                  </button>

                  <button type="button" className={styles.dangerBtn} onClick={unassignSelected} disabled={selectedIds.size === 0}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
