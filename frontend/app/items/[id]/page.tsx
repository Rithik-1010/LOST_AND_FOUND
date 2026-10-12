'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, createClaim, updateClaimStatus, updateItemStatus, deleteItem, Claim } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Gift,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Check,
  Building,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const itemId = Number(unwrappedParams.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [proofDescription, setProofDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');
  const [claimErrorMsg, setClaimErrorMsg] = useState('');

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
  });

  const claimMutation = useMutation({
    mutationFn: () =>
      createClaim(itemId, {
        proof_description: proofDescription.trim(),
        contact_info: contactInfo.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      setClaimSuccessMsg('Claim submitted successfully! The owner/finder has been notified.');
      setProofDescription('');
      setContactInfo('');
      setTimeout(() => setShowClaimModal(false), 2000);
    },
    onError: (err: any) => {
      setClaimErrorMsg(err?.response?.data?.detail || 'Failed to submit claim.');
    },
  });

  const updateClaimMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: number; status: string }) =>
      updateClaimStatus(claimId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => updateItemStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      router.push('/');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="animate-pulse h-80 bg-gray-200 rounded-2xl"></div>
        <div className="animate-pulse h-40 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Item Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          This report might have been resolved or deleted by the user.
        </p>
        <Link href="/" className="inline-block bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-sm">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isResolved = item.status === 'verified' || item.status === 'returned';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Nav Back Link */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <div className="flex items-center gap-2">
          {item.status !== 'returned' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatusMutation.mutate('returned')}
              disabled={updateStatusMutation.isPending}
              className="text-xs text-green-700 border-green-200 hover:bg-green-50"
            >
              <Check size={14} className="mr-1" /> Mark Resolved
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this report?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Item Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Photo Header */}
        <div className="relative h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
          {item.image_public_url ? (
            <img src={item.image_public_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-sm font-medium">No photograph attached</div>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <Badge
              className={`${
                item.type === 'lost'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } text-xs font-bold uppercase tracking-wider shadow-sm`}
            >
              {item.type}
            </Badge>
            <Badge variant="outline" className="bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm text-xs capitalize">
              Status: {item.status.replace('_', ' ')}
            </Badge>
          </div>

          {item.reward_note && (
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-950 font-semibold px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5">
              <Gift size={14} />
              <span>Reward Offered</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
              <span>{item.category?.name || 'General Item'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{item.title}</h1>
          </div>

          {/* Quick Meta Chips */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 border-y border-gray-100 py-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-indigo-600 shrink-0" />
              <span className="font-medium">{item.zone?.name || 'Campus Grounds'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-indigo-600 shrink-0" />
              <span>Reported {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            </div>
            {item.brand && (
              <div className="flex items-center gap-1.5">
                <Tag size={16} className="text-indigo-600 shrink-0" />
                <span>Brand: <strong className="text-gray-800">{item.brand}</strong></span>
              </div>
            )}
            {item.color && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-gray-300 bg-gray-400 inline-block"></span>
                <span>Color: <strong className="text-gray-800">{item.color}</strong></span>
              </div>
            )}
          </div>

          {/* Custody Location */}
          {item.custody_location && (
            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
              <Building size={20} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                  {item.type === 'found' ? 'Current Safe Custody Location' : 'Last Known Location'}
                </div>
                <div className="text-sm text-indigo-800 font-medium mt-0.5">{item.custody_location}</div>
              </div>
            </div>
          )}

          {/* Reward Note */}
          {item.reward_note && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <Gift size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Reward Details</div>
                <div className="text-sm text-amber-800 font-medium mt-0.5">{item.reward_note}</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description & Notes</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
              {item.description || 'No additional description provided.'}
            </p>
          </div>

          {/* Verification / Security banner */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-xs text-blue-900">
            <ShieldAlert size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Secure Campus Verification:</strong> To prevent fraud or wrongful pickup, the claimant must provide
              verifiable ownership details (such as wallpaper, serial tags, passcode or specific bag contents).
            </div>
          </div>

          {/* Main Action Button */}
          {!isResolved ? (
            <Button
              onClick={() => {
                setShowClaimModal(true);
                setClaimSuccessMsg('');
                setClaimErrorMsg('');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl text-base shadow-sm"
            >
              {item.type === 'lost' ? 'I Found This Item (Contact Owner)' : 'Claim This Item (Prove Ownership)'}
            </Button>
          ) : (
            <div className="text-center p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              <span>This item has been successfully resolved and returned!</span>
            </div>
          )}
        </div>
      </div>

      {/* Claims Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Claims & Verification Inquiries</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.claims && item.claims.length > 0
                ? `${item.claims.length} claim${item.claims.length === 1 ? '' : 's'} filed on this item`
                : 'No claims filed yet.'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowClaimModal(true)}
            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            + File Claim
          </Button>
        </div>

        {item.claims && item.claims.length > 0 ? (
          <div className="space-y-4 pt-2">
            {item.claims.map((claim: Claim) => (
              <div key={claim.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-sm text-gray-900">
                      Claimant: {claim.claimant?.name || 'Verified Student'}
                    </span>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Submitted {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge
                    className={
                      claim.status === 'approved'
                        ? 'bg-green-600 text-white'
                        : claim.status === 'rejected'
                        ? 'bg-red-600 text-white'
                        : claim.status === 'handed_over'
                        ? 'bg-purple-600 text-white'
                        : 'bg-amber-500 text-white'
                    }
                  >
                    {claim.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-500 text-[11px] uppercase mb-1">Ownership Proof / Message:</div>
                  <div>{claim.answers_json?.proof_description || 'No proof message entered.'}</div>
                  {claim.answers_json?.contact_info && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-indigo-600 font-medium">
                      Contact: {claim.answers_json.contact_info}
                    </div>
                  )}
                </div>

                {/* Owner review actions */}
                {claim.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'approved' })}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3"
                    >
                      <CheckCircle size={14} className="mr-1" /> Approve Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 px-3"
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                  </div>
                )}
                {claim.status === 'approved' && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      onClick={() => updateClaimMutation.mutate({ claimId: claim.id, status: 'handed_over' })}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3"
                    >
                      Confirm Physical Handover
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-xs">
            No claims filed yet. If this item belongs to you, click "File Claim" above.
          </div>
        )}
      </div>

      {/* Interactive Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {item.type === 'lost' ? 'Report Found / Contact Owner' : 'Claim Ownership of Item'}
              </h2>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Provide specific information to prove this item is yours or let the owner know where they can meet you to retrieve it.
            </p>

            {claimSuccessMsg && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{claimSuccessMsg}</span>
              </div>
            )}

            {claimErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{claimErrorMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                claimMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Proof of Ownership / Distinctive Details *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Unique scratches, stickers, contents of the bag, lock-screen image, or where you deposited it..."
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Your Student Contact Info (Phone / Email / Dorm Room)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. alex@college.edu or (555) 019-2834"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClaimModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={claimMutation.isPending || !proofDescription.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  {claimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
