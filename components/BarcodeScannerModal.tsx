import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, BarcodeIcon } from './icons';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedData: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      setError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError('خطا در دسترسی به دوربین. لطفاً مجوزهای لازم را در تنظیمات مرورگر خود بدهید.');
        }
      } else {
        setError('دوربین در این مرورگر پشتیبانی نمی‌شود.');
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };

    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    // In a real application, a library would decode the barcode from the video stream.
    // Here, we simulate finding the barcode for the "Milk" product.
    onScan('111222333'); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">اسکن بارکد</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="relative flex-1 bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center p-8 text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto max-h-[60vh] object-contain" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-1/3 border-4 border-dashed border-green-400 rounded-lg opacity-75"></div>
                </div>
            </>
          )}
        </div>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleSimulateScan} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary"
          >
            <BarcodeIcon className="w-5 h-5"/>
            <span>شبیه‌سازی اسکن (بارکد نمونه: 111222333)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
