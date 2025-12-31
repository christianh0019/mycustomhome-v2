
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { DocItem, DraggableField } from '../components/DocumentComponents';

export const PDFService = {
    async generateSignedPDF(doc: DocItem, fields: DraggableField[]): Promise<Uint8Array> {
        let pdfDoc: PDFDocument;

        if (doc.file_url && doc.file_url.toLowerCase().endsWith('.pdf')) {
            // Load existing PDF
            const existingPdfBytes = await fetch(doc.file_url).then(res => res.arrayBuffer());
            pdfDoc = await PDFDocument.load(existingPdfBytes);
        } else {
            // Create new blank PDF (A4 size default)
            pdfDoc = await PDFDocument.create();
            const numPages = doc.metadata?.numPages || 1;
            for (let i = 0; i < numPages; i++) {
                pdfDoc.addPage([595, 842]); // A4 size in points
            }
        }

        const pages = pdfDoc.getPages();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Define mapping scale if needed. 
        // react-pdf and our canvas renders at 595px width. PDF points are also 1/72 inch.
        // If the canvas width matches the PDF page width (595), the coordinates should map 1:1.
        // However, PDF coordinate system starts at Bottom-Left, while HTML/Canvas is Top-Left.
        // We need to flip the Y coordinate: pdfY = pageHeight - canvasY - fieldHeight

        for (const field of fields) {
            if (!field.value) continue;

            const pageIndex = (field.pageNumber || 1) - 1;
            if (pageIndex >= pages.length) continue;

            const page = pages[pageIndex];
            const { height } = page.getSize();

            // Coordinates
            const x = field.x;
            const y = height - field.y - (field.height || 20); // Flip Y

            if (field.type === 'signature' && field.value.startsWith('data:image')) {
                // Embed Signature Image
                try {
                    const pngImage = await pdfDoc.embedPng(field.value);
                    page.drawImage(pngImage, {
                        x,
                        y,
                        width: field.width || 100,
                        height: field.height || 50,
                    });
                } catch (e) {
                    console.error('Error embedding signature:', e);
                }
            } else {
                // Draw Text (Text, Date, Initials, Checkbox)
                let text = field.value;
                if (field.type === 'checkbox') {
                    text = field.value === 'checked' ? 'X' : ''; // Use X for checkbox
                }

                if (text) {
                    page.drawText(text, {
                        x: x + 5, // slight padding
                        y: y + 5, // slight padding upward?? createText is baseline.
                        // Actually drawText y is baseline.
                        // If we flip Y to be bottom-left of the box, we need to add padding for the baseline.
                        // Let's approximate: y + height/2 - fontSize/2? 
                        // Simplified: y + 5 works for MVP alignment usually.
                        size: 10,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                    });
                }
            }
        }

        return await pdfDoc.save();
    }
};
