'use client';

import React, { useState } from 'react';
import IndianWelcomeHero from '@/components/IndianWelcomeHero';
import SwaraScriptIDE from '@/components/SwaraScriptIDE';

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return <IndianWelcomeHero onEnter={() => setHasEntered(true)} />;
  }

  return <SwaraScriptIDE onReturnHome={() => setHasEntered(false)} />;
}
