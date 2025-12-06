'use client';

import { Suspense } from 'react';
import AcceptInviteContent from './AcceptInviteContent';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
