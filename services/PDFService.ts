
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
    },

    // New: Generate PDF by taking full-page screenshots (WYSIWYG for RichText)
    async generateFromImages(imageCtxs: { dataUrl: string, width: number, height: number }[]): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();

        for (const img of imageCtxs) {
            const page = pdfDoc.addPage([img.width, img.height]);
            try {
                const pngImage = await pdfDoc.embedPng(img.dataUrl);
                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: img.width,
                    height: img.height,
                });
            } catch (e) {
                console.error('Error embedding page screenshot:', e);
            }
        }

        return await pdfDoc.save();
    },

    // New: Append Signature Certificate Page
    async appendCertificate(pdfBytes: Uint8Array, data: any): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Header
        page.drawText('Signature Certificate', { x: 50, y: height - 50, size: 24, font: fontBold });

        page.drawText(`Reference number: ${data.referenceNumber}`, { x: 50, y: height - 80, size: 10, font });
        page.drawText(`Sent on: ${new Date(data.sentAt).toLocaleString()}`, { x: 350, y: height - 80, size: 10, font });

        let currentY = height - 140;

        // Signers Loop
        // Signers Loop
        for (const signer of data.signers) {
            page.drawText('Signed By', { x: 50, y: currentY, size: 10, font: fontBold });
            page.drawText('Signature', { x: 300, y: currentY, size: 10, font: fontBold });
            currentY -= 20;
            page.drawLine({ start: { x: 50, y: currentY }, end: { x: 545, y: currentY }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
            currentY -= 40;

            page.drawText(signer.name || 'Unknown Signer', { x: 50, y: currentY, size: 12, font: fontBold });
            if (signer.email) page.drawText(signer.email, { x: 50, y: currentY - 15, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

            // Stats
            page.drawText(`Viewed: ${new Date(signer.viewedAt).toLocaleString()}`, { x: 50, y: currentY - 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
            page.drawText(`Signed: ${new Date(signer.signedAt).toLocaleString()}`, { x: 50, y: currentY - 55, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

            page.drawText(`IP Address: ${signer.ip}`, { x: 300, y: currentY - 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
            page.drawText(`Location: ${signer.location}`, { x: 300, y: currentY - 55, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

            // Signature Image
            if (signer.signatureImage && signer.signatureImage.startsWith('data:image')) {
                try {
                    const sigImg = await pdfDoc.embedPng(signer.signatureImage);
                    page.drawImage(sigImg, { x: 300, y: currentY - 10, width: 120, height: 60 });
                } catch (e) {
                    console.error('Error embedding certificate signature', e);
                }
            }
            currentY -= 100;
        }

        // Footer
        page.drawText(`Document completed on ${new Date(data.completedAt).toLocaleString()}`, { x: 50, y: 50, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

        return await pdfDoc.save();
    }
};
