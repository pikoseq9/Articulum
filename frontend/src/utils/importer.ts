import Papa from 'papaparse';
import { BookStatus } from './types';

/**
 * Represents a simplified book object extracted from the Goodreads CSV export.
 * This structure focuses on the essential fields needed to identify the book 
 * and fetch its full details from an external API (OpenLibrary).
 */
export interface GoodreadsImportItem {
    /**
     * The 13-digit International Standard Book Number, if available.
     * Preferred identifier for fetching book details.
     */
    isbn13: string | null;

    /**
     * The 10-digit International Standard Book Number, if available.
     * Used as a fallback identifier if ISBN-13 is missing or fails.
     */
    isbn10: string | null;

    /**
     * The reading status of the book (e.g., Read, Currently Reading, To Read).
     * Mapped from the Goodreads "Exclusive Shelf" column.
     */
    status: BookStatus;

    /**
     * The date when the book was added to the Goodreads library (ISO 8601 string).
     * Used to preserve the original timeline in the user's history.
     */
    addedAt: string;

    /**
     * The title extracted from the CSV. 
     * Primarily used for logging purposes and error reporting (e.g., "Failed to import 'Title'").
     */
    titleHint: string;
}

/**
 * Constants defining the column indices in a standard Goodreads CSV export.
 * Used for manual parsing recovery when standard header-based parsing fails due to malformed rows.
 */
const COL_IDX = {
    TITLE: 1,
    ISBN: 5,
    ISBN13: 6,
    DATE_ADDED: 15,
    SHELF: 18
};

/**
 * Service responsible for parsing Goodreads CSV export files.
 * It handles file reading, data cleaning (BOM removal, trimming), and mapping raw CSV rows
 * to structured `GoodreadsImportItem` objects. It includes a fallback mechanism for malformed CSV rows.
 */
export class GoodreadsImportService {

    /**
     * Asynchronously parses a user-uploaded CSV file into a list of import items.
     * * @param file - The CSV file object from the file input.
     * @returns A promise that resolves to an array of valid `GoodreadsImportItem` objects.
     */
    public async parseCsvFile(file: File): Promise<GoodreadsImportItem[]> {
        return new Promise((resolve, reject) => {
            Papa.parse<any>(file, {
                header: true,
                skipEmptyLines: true,
                // Removes Byte Order Mark (BOM) and extra whitespace from headers to ensure consistent key matching
                transformHeader: (h) => h.trim().replace(/^\ufeff/, ''),
                complete: (results) => {
                    try {
                        const items = this.mapRowsToItems(results.data);
                        console.log(`Processed ${results.data.length} rows. Found ${items.length} valid items for import.`);
                        resolve(items);
                    } catch (err) {
                        reject(err);
                    }
                },
                error: (err: any) => reject(err)
            });
        });
    }

    /**
     * Maps raw CSV rows to `GoodreadsImportItem` objects.
     * Handles normalization of keys (e.g., "ISBN" vs "isbn"), cleans ISBN strings,
     * and attempts to recover data from malformed rows where all columns are merged into the first column.
     * * @param rows - Array of raw row objects from PapaParse.
     * @returns An array of cleaned and validated import items.
     */
    private mapRowsToItems(rows: any[]): GoodreadsImportItem[] {
        return rows.map((row): GoodreadsImportItem | null => {
            // Attempt to retrieve values using various casing conventions
            let rawIsbn13 = row["ISBN13"] || row["isbn13"];
            let rawIsbn10 = row["ISBN"] || row["isbn"];
            let rawShelf = row["Exclusive Shelf"] || row["exclusive shelf"];
            let rawDate = row["Date Added"] || row["date added"];
            let rawTitle = row["Title"] || row["title"];

            // --- FALLBACK RECOVERY MECHANISM ---
            // Detects if the row is malformed (e.g., entire row merged into "Book Id" due to quoting issues).
            // Attempts to re-parse the "Book Id" field as a CSV string to recover fields by index.
            if ((!rawIsbn13 && !rawIsbn10) && row["Book Id"] && typeof row["Book Id"] === 'string' && row["Book Id"].includes(',')) {
                try {
                    const recovery = Papa.parse(row["Book Id"], { header: false });
                    const fields = recovery.data[0] as string[];
                    
                    // Check if we have enough columns to be confident about the mapping
                    if (Array.isArray(fields) && fields.length > 15) {
                        rawIsbn10 = fields[COL_IDX.ISBN];
                        rawIsbn13 = fields[COL_IDX.ISBN13];
                        rawShelf = fields[COL_IDX.SHELF];
                        rawDate = fields[COL_IDX.DATE_ADDED];
                        rawTitle = fields[COL_IDX.TITLE];
                    }
                } catch (e) {
                    console.warn("Recover failed for:", row["Book Id"]);
                }
            }

            const cleanIsbn13 = this.cleanIsbn(rawIsbn13);
            const cleanIsbn10 = this.cleanIsbn(rawIsbn10);

            // Item must have at least one valid ISBN to be importable via OpenLibrary fetch
            if (!cleanIsbn13 && !cleanIsbn10) return null;

            return {
                isbn13: cleanIsbn13 || null,
                isbn10: cleanIsbn10 || null,
                status: this.mapShelfToStatus(rawShelf),
                addedAt: rawDate ? new Date(rawDate).toISOString() : new Date().toISOString(),
                titleHint: rawTitle || "Untitled"
            };
        }).filter((item): item is GoodreadsImportItem => item !== null);
    }

    /**
     * Cleans raw ISBN strings by removing Excel formatting (e.g., ='...') and non-alphanumeric characters.
     * * @param rawIsbn - The raw ISBN string from the CSV.
     * @returns A clean string containing only digits and 'X' (for ISBN-10 checksum), or empty string.
     */
    private cleanIsbn(rawIsbn: string): string {
        if (!rawIsbn) return "";
        // Removes typical Excel export artifacts (e.g., ="978...") and keeps only valid ISBN chars
        return rawIsbn.replace(/[^0-9X]/g, "");
    }

    /**
     * Maps Goodreads shelf names to the application's internal `BookStatus` enum.
     * * @param shelf - The shelf name from Goodreads (e.g., "currently-reading").
     * @returns The corresponding `BookStatus`. Defaults to `ToRead` if unknown.
     */
    private mapShelfToStatus(shelf: string): BookStatus {
        if (!shelf) return BookStatus.ToRead;
        switch (shelf.trim()) {
            case 'read': return BookStatus.Read;
            case 'currently-reading': return BookStatus.Reading;
            default: return BookStatus.ToRead;
        }
    }
}

export const goodreadsService = new GoodreadsImportService();