'use client';

import { useQuery } from '@tanstack/react-query';
import { getItems } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: getItems,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campus Feed</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer bg-white text-gray-700 hover:bg-gray-100">All</Badge>
          <Badge variant="default" className="cursor-pointer bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Lost</Badge>
          <Badge variant="default" className="cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Found</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl">
          Failed to load items. Make sure backend is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map(item => (
            <Link key={item.id} href={`/items/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-0 shadow-sm overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-100 w-full flex items-center justify-center relative">
                  {item.image_public_url ? (
                     <img src={item.image_public_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className={item.type === 'lost' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{item.zone?.name || 'Campus'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {items?.length === 0 && (
             <div className="col-span-full text-center p-12 text-gray-500">
               No items found. Be the first to report!
             </div>
          )}
        </div>
      )}
    </div>
  );
}
