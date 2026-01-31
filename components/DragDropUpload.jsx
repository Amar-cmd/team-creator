'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import styles from './DragDropUpload.module.css';

/**
 * Big dashed upload area.
 * Enhancements:
 * - Shows "Uploaded: <filename>" state so user isn't left hanging
 * - Allows replacing file via "Change file" CTA
 */
export default function DragDropUpload({
  onFileSelected,
  disabled = false,
  uploadedFileName = '',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const hasUploaded = useMemo(() => Boolean(uploadedFileName), [uploadedFileName]);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;

      const name = file.name.toLowerCase();
      const isExcelOrCsv = name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
      if (!isExcelOrCsv) {
        onFileSelected(null, 'Please upload an Excel (.xls/.xlsx) or CSV file.');
        return;
      }

      onFileSelected(file, null);
    },
    [onFileSelected]
  );

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${hasUploaded ? styles.uploaded : ''}`}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        disabled={disabled}
        aria-label={hasUploaded ? 'File uploaded. Click to change file' : 'Upload Excel/CSV file'}
      >
        <div className={styles.icon}>
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 13h8M8 17h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className={styles.text}>
          {!hasUploaded ? (
            <>
              <div className={styles.linkText}>↑ Upload Excel/CSV file</div>
              <div className={styles.subText}>Click or drag & drop here</div>
            </>
          ) : (
            <>
              <div className={styles.successText}>✅ File uploaded</div>
              <div className={styles.fileName} title={uploadedFileName}>
                {uploadedFileName}
              </div>
              <div className={styles.changeHint}>Click to replace</div>
            </>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        accept=".xls,.xlsx,.csv"
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  );
}
