# Team Builder (Next.js 16) — Excel/CSV → Teams → Export

A lightweight, **production-ready**, **client-side** Team Builder that lets teachers upload an Excel/CSV roster, sort and select students, create teams manually or automatically, and export the final team list back to Excel — **no database, no backend**.

> ✅ Built with **Next.js 16 (App Router)** + **SheetJS (xlsx)**  
> ✅ **Mobile-first & responsive** UI  
> ✅ All processing happens **in the browser**

---

## ✨ Features

### 1) Upload roster (Excel/CSV)
- Drag & drop or click to upload `.xls`, `.xlsx`, or `.csv`
- Shows clear **“File uploaded”** state with filename (no hanging UX)

### 2) Auto-detect and keep only required columns
The app looks for these fields (case-insensitive + common aliases):
- **SR. NO.**
- **NAME**
- **ADMISSION NO.**
- **ROLL NO.**
- **EMAIL**

If a field exists → it is kept  
If not → it is ignored

### 3) Advanced table selection
- Select rows individually
- Select all visible rows

### 4) Sorting (Manual view + Auto-assign)
Both manual and auto-assign support **all 4 criteria**:
- Ascending
- Descending
- Random
- Every n-th (with `n` input)

### 5) Manual team creation
- Select any students → assign to **New Team** or **Existing Team**
- Teams are created sequentially (**Team 1, Team 2, Team 3…**)

### 6) Sidebar teams navigation
- Sidebar shows **only teams**
- Click any team to view its members
- Includes **Unassigned** view

### 7) Modify teams anytime
- Move students between teams
- Remove students to unassigned

### 8) Export to Excel (single sheet)
- Exports all teams into one Excel sheet as:
  - Team 1 block
  - Team 2 block
  - Team 3 block … etc.

### 9) Auto-assign teams
Teacher sets:
- sorting criteria
- students per team  
Then algorithm assigns all unassigned students into new teams.

### 10) Review + edit after auto-assign
Auto-created teams remain editable like normal teams.

### 11) Trimester + Section tagging
Before export, teacher selects:
- **Trimester**
- **Section**
These are included in the exported Excel header.

### 12) Simple architecture, easy to maintain
- No database
- No server routes
- No external state management

---

## 📸 Screenshots

> Replace placeholders with your actual images and update the paths.

### Upload Screen
![Upload Screen](./docs/images/upload-placeholder.png)

### Team Creation Screen
![Team Screen](./docs/images/team-placeholder.png)

### Mobile View
![Mobile View](./docs/images/mobile-placeholder.png)

---

## 🧱 Tech Stack
- **Next.js 16** (App Router)
- **React 18**
- **SheetJS (xlsx)** for Excel/CSV parsing + export
- **CSS Modules** for clean, scoped styling

---

## ✅ Requirements Checklist (13/13)

- [x] Upload Excel file  
- [x] Keep only allowed fields if they exist (sr no, name, admission number, roll, email)  
- [x] Display in table with row selection  
- [x] Sort: Asc / Desc / Random / Every n-th  
- [x] Assign selected students into teams (1,2,3…)  
- [x] Sidebar navigation to view team members  
- [x] Ability to modify team assignments  
- [x] Export teams to Excel (single sheet, team blocks)  
- [x] Auto-assign feature (criteria + students/team)  
- [x] Review + modify after auto-assign  
- [x] Trimester + Section selection included before export  
- [x] Clear comments where useful  
- [x] No DB / instant workflow (upload → build → export)

---

## 🚀 Getting Started

### 1) Install dependencies
```bash
npm install
