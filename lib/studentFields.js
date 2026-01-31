// /**
//  * Central field definitions.
//  *
//  * Why this exists:
//  * - Keeps upload parsing, sorting, display, and export in sync.
//  * - Lets the UI adapt if the uploaded sheet is missing some columns.
//  */

// export const STUDENT_FIELD_DEFS = [
//   {
//     key: 'srNo',
//     label: 'Sr. No.',
//     headerAliases: ['sr. no.', 'sr no', 'sr.no', 'serial no', 'serial number'],
//   },
//   {
//     key: 'name',
//     label: 'Name',
//     headerAliases: ['name', 'student name', 'full name'],
//   },
//   {
//     key: 'admissionNumber',
//     label: 'Admission No.',
//     headerAliases: ['admission number', 'admission no', 'adm no', 'admission#', 'admission #'],
//   },
//   {
//     key: 'roll',
//     label: 'Roll No.',
//     headerAliases: ['roll', 'roll no', 'roll number'],
//   },
//   {
//     key: 'email',
//     label: 'Email',
//     headerAliases: ['email', 'e-mail', 'mail'],
//   },
// ];

// /**
//  * Normalizes a raw header string so we can match arbitrary Excel headers.
//  */
// export function normalizeHeader(value) {
//   return String(value ?? '')
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, ' ');
// }

// /**
//  * Returns the first matching value in `row` for any alias.
//  * `row` should have normalized keys.
//  */
// export function pickFirstByAliases(row, aliases) {
//   for (const alias of aliases) {
//     const key = normalizeHeader(alias);
//     if (Object.prototype.hasOwnProperty.call(row, key)) {
//       return row[key];
//     }
//   }
//   return '';
// }

// /**
//  * Converts values coming from Excel into safe display strings.
//  *
//  * Notes:
//  * - We do not try to interpret dates/numbers here; we simply preserve what Excel gives.
//  * - Keeps output deterministic and safe for rendering/export.
//  */
// export function valueFromUnknown(v) {
//   if (v == null) return '';
//   if (typeof v === 'string') return v.trim();
//   if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
//   if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
//   return String(v).trim();
// }

// /**
//  * Extracts only the supported fields from a parsed Excel row.
//  * The row MUST have normalized headers.
//  */
// export function pickSupportedFieldsForRow(normalizedRow) {
//   const out = {};
//   for (const def of STUDENT_FIELD_DEFS) {
//     const raw = pickFirstByAliases(normalizedRow, def.headerAliases);
//     const val = valueFromUnknown(raw);
//     if (val) out[def.key] = val;
//   }
//   return out;
// }

// /**
//  * Normalizes values for sorting.
//  */
// export function normalizeLabelValue(v) {
//   return valueFromUnknown(v).toLowerCase();
// }

// export function compareValues(a, b) {
//   const av = normalizeLabelValue(a);
//   const bv = normalizeLabelValue(b);
//   if (av < bv) return -1;
//   if (av > bv) return 1;
//   return 0;
// }

// /**
//  * Deterministic shuffle using Fisher-Yates.
//  */
// export function shuffleInPlace(arr) {
//   for (let i = arr.length - 1; i > 0; i -= 1) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [arr[i], arr[j]] = [arr[j], arr[i]];
//   }
//   return arr;
// }

// /**
//  * "Every n-th" ordering.
//  * Example (n=3): indices 0,3,6,9, 1,4,7,10, 2,5,8,11.
//  */
// export function reorderEveryNth(arr, n) {
//   const step = Number.parseInt(n, 10);
//   if (!Number.isFinite(step) || step <= 1) return arr.slice();
//   const out = [];
//   for (let start = 0; start < step; start += 1) {
//     for (let i = start; i < arr.length; i += step) {
//       out.push(arr[i]);
//     }
//   }
//   return out;
// }


/**
 * Central source of truth for "allowed" roster fields.
 *
 * Requirement: Keep only these if they exist; ignore everything else:
 * - srNo, name, admissionNumber, roll, email
 */

export const STUDENT_FIELD_DEFS = [
  {
    key: 'srNo',
    label: 'SR. NO.',
    headerAliases: [
      'sr. no.',
      'sr no',
      'sr.no',
      's.no',
      'serial no',
      'serial number',
      's. no.',
    ],
  },
  {
    key: 'name',
    label: 'NAME',
    headerAliases: ['name', 'student name', 'full name'],
  },
  {
    key: 'admissionNumber',
    label: 'ADMISSION NO.',
    headerAliases: ['admission number', 'admission no', 'adm no', 'admission#', 'admission #'],
  },
  {
    key: 'roll',
    label: 'ROLL NO.',
    headerAliases: ['roll', 'roll no', 'roll number', 'roll no.'],
  },
  {
    key: 'email',
    label: 'EMAIL',
    headerAliases: ['email', 'e-mail', 'mail', 'email id', 'email_id'],
  },
];

export function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function pickFirstByAliases(normalizedRow, aliases) {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    if (Object.prototype.hasOwnProperty.call(normalizedRow, key)) {
      return normalizedRow[key];
    }
  }
  return '';
}
