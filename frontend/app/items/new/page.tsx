'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Camera, MapPin } from 'lucide-react';

export default function NewItem() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    color: '',
    brand: ''
  });

  const mutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      router.push('/');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Report Item</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 mb-6">
          <Button 
            type="button" 
            variant={formData.type === 'lost' ? 'default' : 'outline'} 
            className={`w-full ${formData.type === 'lost' ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={() => setFormData({...formData, type: 'lost'})}
          >
            I Lost Something
          </Button>
          <Button 
            type="button" 
            variant={formData.type === 'found' ? 'default' : 'outline'}
            className={`w-full ${formData.type === 'found' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            onClick={() => setFormData({...formData, type: 'found'})}
          >
            I Found Something
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition">
          <Camera size={48} className="mb-2 text-gray-400" />
          <p>Tap to upload a photo</p>
          <p className="text-xs mt-1">AI will try to auto-fill details</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            required 
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="e.g. Blue Hydroflask"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Any specific details?"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Post Item'}
        </Button>
      </form>
    </div>
  );
}
