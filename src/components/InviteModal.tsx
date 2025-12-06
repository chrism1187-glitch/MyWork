'use client';

import { useState } from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

interface Invite {
  id: string;
  email: string;
  token: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

export default function InviteModal({ isOpen, onClose, currentUserEmail }: Props) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          createdBy: currentUserEmail,
        }),
      });

      if (response.ok) {
        const invite = await response.json();
        setInvites([invite, ...invites]);
        setInviteEmail('');
        
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/accept-invite?token=${invite.token}`;
        toast.success(`Invite sent to ${inviteEmail}\n\nShare this link: ${inviteLink}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Error sending invite');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedToken(token);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites');
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  // Fetch invites on open
  if (isOpen && invites.length === 0) {
    fetchInvites();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Invite Team Members</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Invite Form */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={handleSendInvite}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-semibold flex items-center gap-2"
              >
                <Mail size={18} />
                Send Invite
              </button>
            </div>
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Pending Invites</h3>
              {invites
                .filter((i) => i.status === 'pending')
                .map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 bg-slate-50 rounded-lg border border-gray-200 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{invite.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(invite.token)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title="Copy invite link"
                    >
                      {copiedToken === invite.token ? (
                        <Check size={18} className="text-emerald-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Accepted Invites */}
          {invites.some((i) => i.status === 'accepted') && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Accepted</h3>
              {invites
                .filter((i) => i.status === 'accepted')
                .map((invite) => (
                  <div key={invite.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-gray-900">{invite.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Joined: {new Date(invite.acceptedAt || '').toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
