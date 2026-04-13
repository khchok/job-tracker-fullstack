import Image from "next/image";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface AuthorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthorModal({ open, onOpenChange }: AuthorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="p-0 overflow-hidden gap-0 max-w-sm sm:max-w-md"
      >
        <div className="flex">
          {/* Left accent panel */}
          <div className="bg-blue-700 px-5 py-6 flex flex-col items-center justify-center gap-3 min-w-[100px]">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/30">
              <Image
                src="/images/icons/profile.jpg"
                alt="Chok Khar Hui"
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-white text-sm font-semibold text-center leading-tight">
              Chok Khar Hui
            </div>
            <div className="text-white/70 text-xs text-center">
              Software Engineer
            </div>
          </div>

          {/* Right content */}
          <div className="px-5 py-6 flex flex-col gap-4 flex-1">
            <p className="text-sm text-gray-500 leading-relaxed">
              A personal job tracker — built to learn, shared to inspire.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/khchok"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Image src="/images/icons/social.png" alt="GitHub" width={16} height={16} className="shrink-0" />
                github.com/khchok
              </a>
              <a
                href="https://www.linkedin.com/in/khar-hui-chok-96a852203"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Image src="/images/icons/linkedin.png" alt="LinkedIn" width={16} height={16} className="shrink-0" />
                LinkedIn Profile
              </a>
              <a
                href="mailto:chok072056@gmail.com"
                className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Image src="/images/icons/mail.png" alt="Email" width={16} height={16} className="shrink-0" />
                chok072056@gmail.com
              </a>
              <a
                href="https://wa.me/60182586282"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Image src="/images/icons/smartphone.png" alt="WhatsApp" width={16} height={16} className="shrink-0" />
                +60 18-258 6282
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
