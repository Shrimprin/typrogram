'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type CongratulationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CongratulationModal({ isOpen, onClose }: CongratulationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          max-w-sm border border-secondary/40 bg-background/30 text-center shadow-[0_0_20px_rgba(34,197,94,0.3)] ring-1
          ring-primary/20 backdrop-blur-lg
        `}
        showCloseButton={true}
      >
        <DialogHeader className="space-y-6">
          <DialogTitle
            className={`
              bg-gradient-to-r from-secondary to-primary bg-clip-text text-center text-2xl font-bold text-transparent
            `}
          >
            CONGRATULATIONS
          </DialogTitle>

          <DialogDescription className="space-y-3 text-center">
            <span>All files have been typed in this repository.</span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
