'use client';

import { VoiceProvider } from './VoiceProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <VoiceProvider>{children}</VoiceProvider>;
}

