import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Eraser, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSign: (signatureDataUrl: string) => void;
    documentTitle: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSign, documentTitle }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    // Initialize Canvas
    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size to match display size for high DPI
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                ctx.scale(2, 2);

                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000'; // Default pen color
            }
        }
    }, [isOpen]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (canvas && hasSignature) {
            const dataUrl = canvas.toDataURL('image/png');
            onSign(dataUrl);
            clearCanvas(); // Reset for next time
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Sign Document</h3>
                                <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                Acting as: <span className="font-semibold text-zinc-900 dark:text-white">Homeowner</span> • Doc: {documentTitle}
                            </p>
                        </div>

                        {/* Canvas Area */}
                        <div className="p-6 bg-zinc-100 dark:bg-black/50 flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="relative w-full aspect-[3/2] bg-white rounded-xl shadow-inner border border-zinc-200 dark:border-none overflow-hidden touch-none">
                                {/* Dotted Line for Signature */}
                                <div className="absolute bottom-10 left-8 right-8 h-px bg-zinc-300 border-b border-dashed border-zinc-400 pointer-events-none" />
                                <div className="absolute bottom-4 left-8 text-[10px] uppercase text-zinc-400 pointer-events-none">X Sign Here</div>

                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-full cursor-crosshair"
                                />
                            </div>

                            <div className="w-full flex justify-between items-center px-2">
                                <button
                                    onClick={clearCanvas}
                                    className="text-xs text-zinc-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <Eraser size={12} /> Clear
                                </button>
                                <div className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                    <PenTool size={10} /> Digital Ink
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                            <button
                                onClick={handleConfirm}
                                disabled={!hasSignature}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${hasSignature
                                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-lg'
                                        : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 cursor-not-allowed'
                                    }`}
                            >
                                <Check size={16} /> Adopt & Sign
                            </button>
                            <p className="text-[9px] text-center text-zinc-400 mt-3">
                                By clicking sign, you agree to legally bind your digital signature to this document.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
