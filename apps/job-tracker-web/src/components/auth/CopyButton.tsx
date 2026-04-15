import { copyToClipboard } from '@/lib/utils';
import { CheckIcon, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="default"
      size="icon"
      className="ml-2"
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(value);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1000);
      }}
    >
      {copied ? <CheckIcon /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}
