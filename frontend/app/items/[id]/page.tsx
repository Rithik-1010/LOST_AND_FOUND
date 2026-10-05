'use client';

import { useQuery } from '@tanstack/react-query';
import { getItem } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { use } from 'react';

export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', unwrappedParams.id],
    queryFn: () => getItem(Number(unwrappedParams.id)),
  });

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-200 rounded-2xl max-w-2xl mx-auto"></div>;
  if (error || !item) return <div className="text-center p-8">Item not found.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="relative h-72 bg-gray-100 flex items-center justify-center">
        <Button variant="outline" size="icon" className="absolute top-4 left-4 rounded-full bg-white/80 backdrop-blur" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        {item.image_public_url ? (
           <img src={item.image_public_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400">No Image Provided</div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge className={`mb-2 ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
              {item.type.toUpperCase()}
            </Badge>
            <h1 className="text-2xl font-bold">{item.title}</h1>
          </div>
          <Badge variant="outline" className="text-gray-500">{item.status.toUpperCase()}</Badge>
        </div>

        <div className="flex gap-4 text-sm text-gray-500 mb-6 border-b pb-6">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{item.zone?.name || 'Campus'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{item.description || 'No description provided.'}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-8 flex gap-3">
          <ShieldAlert className="text-amber-500 shrink-0" />
          <div className="text-sm text-amber-800">
            For security, do not share personal contact information publicly. Use the claim system to securely contact the finder.
          </div>
        </div>

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg rounded-xl">
          {item.type === 'lost' ? 'I Found This' : 'Claim This Item'}
        </Button>
      </div>
    </div>
  );
}
