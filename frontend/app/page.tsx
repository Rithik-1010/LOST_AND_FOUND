'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getItems, getCategories, getZones, Item } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Search, Filter, Gift, Sparkles, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedZone, setSelectedZone] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
  });

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', typeFilter, selectedCategory, selectedZone, searchQuery],
    queryFn: () =>
      getItems({
        type: typeFilter === 'all' ? undefined : typeFilter,
        category_id: selectedCategory ? Number(selectedCategory) : undefined,
        zone_id: selectedZone ? Number(selectedZone) : undefined,
        search: searchQuery.trim() || undefined,
      }),
  });

  const resetFilters = () => {
    setTypeFilter('all');
    setSelectedCategory('');
    setSelectedZone('');
    setSearchQuery('');
  };

  const hasActiveFilters = typeFilter !== 'all' || selectedCategory !== '' || selectedZone !== '' || searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
              <Sparkles size={14} />
              <span>Campus Smart Lost & Found</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Reconnecting Campus Possessions</h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Lost an item or found someone's belongings? Post reports, browse verified campus feeds, and claim items securely.
            </p>
          </div>
          <Link
            href="/items/new"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-5 py-2.5 rounded-xl transition shadow-sm shrink-0"
          >
            + Report Item
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items by name, brand, color, description..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Type Toggle Buttons */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'lost'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                typeFilter === 'found'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Zone Dropdown */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : '')}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Campus Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 h-8 px-2"
            >
              Reset Filters
            </Button>
          )}

          <div className="ml-auto text-gray-400">
            {items ? `${items.length} item${items.length === 1 ? '' : 's'} listed` : ''}
          </div>
        </div>
      </div>

      {/* Item Feed Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          Failed to load campus items. Please verify the backend is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items?.map((item: Item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="group">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full border border-gray-100 shadow-sm overflow-hidden flex flex-col group-hover:-translate-y-1 bg-white">
                <div className="h-48 bg-gray-100 w-full flex items-center justify-center relative overflow-hidden">
                  {item.image_public_url ? (
                    <img
                      src={item.image_public_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm font-medium">No Image Available</div>
                  )}

                  {/* Top Left: Item Type */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge
                      className={`${
                        item.type === 'lost'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } uppercase tracking-wider font-bold shadow-sm`}
                    >
                      {item.type}
                    </Badge>
                    {item.status !== 'lost' && item.status !== 'found' && (
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm text-xs capitalize">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Top Right: Reward if any */}
                  {item.reward_note && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1">
                      <Gift size={12} />
                      <span>Reward</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {item.category && (
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                        {item.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-base text-gray-900 group-hover:text-indigo-600 transition line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1 font-medium text-gray-600">
                      <MapPin size={13} className="text-indigo-500 shrink-0" />
                      <span className="truncate max-w-[140px]">{item.zone?.name || 'Campus'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={13} />
                      <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {items?.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No items match your filters</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Try searching with different keywords, clearing filters, or report this item if you found or lost it!
              </p>
              {hasActiveFilters && (
                <Button onClick={resetFilters} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
