import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { User, X, Camera } from 'lucide-react';
import { supabase } from '../services/supabase';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    if (!profile?.id) {
      alert('Erro: Usuário não identificado');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const file = e.target.files[0];
    
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas imagens JPG, PNG e GIF são permitidas');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      setLoading(true);
      
      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setProfile({ ...profile, avatar_url: publicUrl });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao atualizar avatar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          vehicle_plate: formData.vehicle_plate,
          postal_code: formData.postal_code,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 safe-bottom safe-top">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="heading-responsive font-semibold">Perfil do Usuário</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto scroll-container flex-1">
          <div className="flex justify-center">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 bg-gray-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div className="absolute bottom-0 right-0">
                <label className="cursor-pointer p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file"
                    accept="image/*"
                    disabled={loading}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Nome</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 text-responsive"
                />
              ) : (
                <p className="font-medium text-responsive">{profile?.name || 'Não informado'}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
              <p className="font-medium text-responsive">{profile?.email || 'Não informado'}</p>
            </div>
            
            {/* Add other editable fields similar to the name field */}
            
            {isEditing ? (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                Editar Perfil
              </button>
            )}
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Versão do aplicativo: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}