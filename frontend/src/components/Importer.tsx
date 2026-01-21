import React, { useState, useRef } from 'react';
import { goodreadsService } from '../utils/importer';
import api from '../axios';
import './Importer.css';

/**
 * Props for the Importer component.
 */
interface Props {
    /**
     * Callback function executed after a successful import process (at least one book added).
     * Typically used to close the modal or refresh the data list in the parent component.
     */
    onSuccess?: () => void;
}

/**
 * Importer Component
 * * Provides a UI for uploading a Goodreads CSV export file and orchestrates the import process.
 * It parses the file, fetches book metadata from the backend (via OpenLibrary proxy), 
 * creates book entries, and synchronizes reading status and dates.
 * * Features:
 * - Drag and drop file area (via hidden input).
 * - Real-time progress bar.
 * - Detailed logs console.
 * - Dual-strategy fetching (tries ISBN-13 first, then ISBN-10).
 */
export const Importer: React.FC<Props> = ({ onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handles file selection from the input element.
     * Resets logs and progress when a new file is chosen.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setLog([]);
            setProgress(0);
        }
    };

    /**
     * Executes the import process.
     * 1. Parses the CSV file using `goodreadsService`.
     * 2. Iterates through parsed items and attempts to fetch/create books via API.
     * 3. Updates existing book status/date to match the import data.
     * 4. Updates logs and progress bar.
     */
    const handleImport = async () => {
        if (!file) return;
        setIsProcessing(true);
        setLog([]);
        
        try {
            // Step 1: Parse local CSV
            const items = await goodreadsService.parseCsvFile(file);
            const total = items.length;
            
            setLog(prev => [...prev, `Found ${total} items with ISBN. Starting fetch...`]);

            let successCount = 0;
            
            // Step 2: Process each item
            for (let i = 0; i < total; i++) {
                const item = items[i];
                let createdBook = null;
                let usedIsbn = "";

                // Strategy A: Try fetching by ISBN-13
                if (item.isbn13) {
                    try {
                        const res = await api.post(`/api/Books/fetch/${item.isbn13}`);
                        if (res.data && res.data.id) {
                            createdBook = res.data;
                            usedIsbn = item.isbn13;
                        }
                    } catch (e) { /* Ignore error, proceed to fallback */ }
                }

                // Strategy B: Fallback to ISBN-10 if Strategy A failed
                if (!createdBook && item.isbn10) {
                    try {
                        const res = await api.post(`/api/Books/fetch/${item.isbn10}`);
                        if (res.data && res.data.id) {
                            createdBook = res.data;
                            usedIsbn = item.isbn10;
                        }
                    } catch (e) { /* Ignore error */ }
                }

                // Step 3: Handle result
                if (createdBook) {
                    try {
                        // The 'fetch' endpoint sets default status (ToRead) and date (Now).
                        // We must update it to match the historical data from the CSV.
                        await api.put(`/api/Books/${createdBook.id}`, {
                            ...createdBook,
                            status: item.status,
                            addedAt: item.addedAt
                        });
                        successCount++;
                    } catch (updateErr) {
                        console.warn("Failed to update status for:", item.titleHint);
                    }
                } else {
                    const isbnDisplay = [item.isbn13, item.isbn10].filter(Boolean).join(" / ");
                    setLog(prev => [...prev, `Not found in database: "${item.titleHint}" (${isbnDisplay})`]);
                }

                // Update progress
                setProgress(Math.round(((i + 1) / total) * 100));
            }

            setLog(prev => [...prev, `Completed! Imported ${successCount} of ${total} books.`]);

            if (successCount > 0 && onSuccess) {
                setTimeout(onSuccess, 1500);
            }

        } catch (err) {
            console.error(err);
            setLog(prev => [...prev, "Critical CSV processing error."]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="importer-wrapper">
            <div className="importer-header">
                <h3>Import z Goodreads</h3>
                <p>Wgraj plik CSV. Pobieranie danych z OpenLibrary.</p>
            </div>
            
            {/* File Drop Area */}
            <div 
                className={`file-drop-area ${file ? 'has-file' : ''}`}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    disabled={isProcessing}
                    ref={fileInputRef}
                    hidden
                />
                <div className="file-icon">{file ? '📄' : ''}</div>
                <div className="file-info">
                    {file ? (
                        <span className="file-name">{file.name}</span>
                    ) : (
                        <span>Kliknij, aby wybrać plik CSV</span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {(isProcessing || progress > 0) && (
                <div className="progress-section">
                    <div className="progress-labels">
                        <span>Postęp</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
            )}

            {/* Logs Console */}
            {log.length > 0 && (
                <div className="import-logs">
                    {log.map((l, i) => <div key={i} className="log-entry">{l}</div>)}
                </div>
            )}

            <div className="importer-actions">
                <button 
                    className="btn-primary-import" 
                    onClick={handleImport} 
                    disabled={!file || isProcessing}
                >
                    {isProcessing ? 'Importowanie...' : 'Rozpocznij Import'}
                </button>
            </div>
        </div>
    );
};