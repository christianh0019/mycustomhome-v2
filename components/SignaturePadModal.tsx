
import React, { useRef, useEffect, useState } from 'react';
import { X, Check, Trash2, Undo } from 'lucide-react';

interface SignaturePadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dataUrl: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({ isOpen, onClose, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size to match display size for retina sharpness
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                ctx.scale(2, 2);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [isOpen]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
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
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling on touch
        const { x, y } = getPos(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasSignature(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">Sign Document</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-black">
                    <div className="bg-white border-2 border-dashed border-zinc-200 rounded-xl overflow-hidden relative touch-none select-none">
                        <canvas
                            ref={canvasRef}
                            style={{ width: '100%', height: '200px' }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="cursor-crosshair"
                        />
                        {!hasSignature && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 font-serif text-2xl opacity-50">
                                Sign Here
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#0A0A0A]">
                    <button
                        onClick={clear}
                        className="px-4 py-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Clear
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasSignature}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg
                            ${hasSignature
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <Check size={16} /> Apply Signature
                    </button>
                </div>
            </div>
        </div>
    );
};
