'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createItem, getCategories, getZones, uploadImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Tag, Upload, X, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewItem() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '',
    description: '',
    category_id: '' as number | '',
    zone_id: '' as number | '',
    color: '',
    brand: '',
    custody_location: '',
    reward_note: '',
    image_public_url: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_public_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg('');
      let uploadedUrl = formData.image_public_url;

      if (selectedFile) {
        setIsUploading(true);
        try {
          const res = await uploadImage(selectedFile);
          uploadedUrl = res.url;
        } catch (err: any) {
          console.error('Failed to upload image:', err);
          // Fallback to data preview if upload fails
          uploadedUrl = imagePreview || '';
        } finally {
          setIsUploading(false);
        }
      }

      return createItem({
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        zone_id: formData.zone_id ? Number(formData.zone_id) : undefined,
        color: formData.color.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        custody_location: formData.custody_location.trim() || undefined,
        reward_note: formData.reward_note.trim() || undefined,
        image_public_url: uploadedUrl || undefined,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      router.push(`/items/${data.id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.detail || 'Failed to submit report. Please check the fields.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Please enter a title for the item.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 font-medium">
        <ArrowLeft size={16} />
        <span>Back to Feed</span>
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post a Campus Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill out the details to help connect with the rightful owner or finder.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Switch */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'lost' })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  formData.type === 'lost'
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-400/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'found' })}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  formData.type === 'found'
                    ? 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                I Found Something
              </button>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Item Photograph
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-56 bg-gray-100 flex items-center justify-center group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-indigo-50/20 transition group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 text-gray-400 group-hover:text-indigo-600 rounded-full flex items-center justify-center mb-2 transition">
                  <Camera size={24} />
                </div>
                <p className="font-medium text-sm text-gray-700">Click to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP (Max 5MB)</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              required
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. Black AirPods Pro Case, Blue Dell Laptop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category & Zone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition cursor-pointer"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value ? Number(e.target.value) : '',
                  })
                }
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Campus Zone
              </label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition cursor-pointer"
                value={formData.zone_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    zone_id: e.target.value ? Number(e.target.value) : '',
                  })
                }
              >
                <option value="">Select Campus Zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Color
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. Matte Black, Red & White"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. Apple, Nike, Casio, Dell"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          {/* Custody Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              {formData.type === 'found' ? 'Where is it currently held?' : 'Where was it last seen?'}
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder={
                formData.type === 'found'
                  ? 'e.g. Deposited with Library Helpdesk, Security Office Room 102'
                  : 'e.g. 2nd floor library study carrel #14'
              }
              value={formData.custody_location}
              onChange={(e) => setFormData({ ...formData, custody_location: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Detailed Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 h-28 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Describe distinctive identifiers, keychains, scratches, stickers, contents, or circumstances..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Reward Note (if Lost) */}
          {formData.type === 'lost' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Reward Offer (Optional)
              </label>
              <input
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. $15 coffee card, gratitude & lunch treat"
                value={formData.reward_note}
                onChange={(e) => setFormData({ ...formData, reward_note: e.target.value })}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition text-base shadow-sm"
            disabled={mutation.isPending || isUploading}
          >
            {mutation.isPending || isUploading ? 'Submitting Report...' : 'Post Report to Feed'}
          </Button>
        </form>
      </div>
    </div>
  );
}
