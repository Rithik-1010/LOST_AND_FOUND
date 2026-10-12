'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, Item, Claim } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User as UserIcon,
  Award,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  FileCheck,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'items' | 'claims'>('items');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="animate-pulse h-48 bg-gray-200 rounded-2xl"></div>
        <div className="animate-pulse h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto p-8 shadow-sm">
        <p className="text-red-600 font-semibold mb-4">Failed to load user profile.</p>
        <Link href="/" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} />
                <span>Verified Student</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{profile.email}</p>
            <div className="flex gap-3 text-xs text-gray-500 mt-2 font-medium">
              <span>{profile.department || 'Computer Science'}</span>
              <span>•</span>
              <span>Year {profile.year || 'Senior'}</span>
            </div>
          </div>
        </div>

        {/* Karma / Reputation Banner */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-4 self-stretch md:self-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award size={24} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Campus Karma Score</div>
            <div className="text-2xl font-black text-amber-900 flex items-center gap-1">
              <span>{profile.karma}</span>
              <span className="text-xs font-semibold text-amber-700">pts</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              Rank: <strong>Good Samaritan</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px ${
            activeTab === 'items'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package size={16} />
          <span>My Reported Items ({profile.items.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition border-b-2 -mb-px ${
            activeTab === 'claims'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileCheck size={16} />
          <span>My Claims ({profile.claims.length})</span>
        </button>
      </div>

      {/* Tab 1: Reported Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">Items You Reported</h2>
            <Link
              href="/items/new"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-800"
            >
              <PlusCircle size={14} />
              <span>Report New Item</span>
            </Link>
          </div>

          {profile.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.items.map((item: Item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image_public_url ? (
                        <img src={item.image_public_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={28} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-[10px] font-bold uppercase ${
                              item.type === 'lost' ? 'bg-red-500' : 'bg-green-600'
                            }`}
                          >
                            {item.type}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-gray-500 capitalize">
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                        <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                        <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          Details <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
              <Package size={36} className="text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">No items reported yet</h3>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Have you found something around campus or lost a personal item?
              </p>
              <Link href="/items/new" className="inline-block bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-xs">
                Post an Item
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Submitted Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800">Claims You Filed</h2>

          {profile.claims.length > 0 ? (
            <div className="space-y-3">
              {profile.claims.map((claim: Claim) => (
                <div key={claim.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/items/${claim.item_id}`}
                        className="font-bold text-sm text-indigo-600 hover:underline flex items-center gap-1.5"
                      >
                        <span>Item #{claim.item_id}: {claim.item?.title || 'Reported Item'}</span>
                        <ArrowRight size={14} />
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Filed {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
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

                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 border border-gray-100">
                    <span className="font-semibold text-gray-500">Your Submitted Proof: </span>
                    <span>{claim.answers_json?.proof_description || 'No proof details.'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
              <FileCheck size={36} className="text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-700">No active claims filed</h3>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Browse the campus feed to find your lost belongings and file a claim.
              </p>
              <Link href="/" className="inline-block bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl text-xs">
                Browse Campus Feed
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
