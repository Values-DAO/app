import React from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const ImageModal = ({ isOpen, onClose, imageUrl }: {isOpen: boolean, onClose: () => void, imageUrl: string}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm -top-4" onClick={onClose}>
      <div className="absolute top-4 right-4">
        <Button
          onClick={onClose}
          className="py-2 px-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
        >
          <X className="w-6 h-6 text-white"/>
        </Button>
      </div>
      <div className="max-h-[90vh] max-w-[90vw] relative" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Full screen view" className="max-h-[90vh] max-w-[90vw] object-contain" />
      </div>
    </div>
  );
};

export default ImageModal;
