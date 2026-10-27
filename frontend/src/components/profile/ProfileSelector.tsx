import React from 'react';
import { useFocusable } from '../focus/FocusContext';
import { Plus, Edit2 } from 'lucide-react';

export interface NetflixProfile {
  id: string;
  name: string;
  avatarBg: string;
  isKids?: boolean;
}

const DEFAULT_PROFILES: NetflixProfile[] = [
  { id: 'p1', name: 'Alex', avatarBg: 'bg-[#E50914]' },
  { id: 'p2', name: 'Sarah', avatarBg: 'bg-[#1E88E5]' },
  { id: 'p3', name: 'Kids', avatarBg: 'bg-[#FDD835]', isKids: true },
  { id: 'p4', name: 'Guest', avatarBg: 'bg-[#00ACC1]' }
];

interface ProfileSelectorProps {
  onSelectProfile: (profile: NetflixProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectProfile }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#141414] flex flex-col items-center justify-center select-none animate-fadeIn">
      {/* Netflix Top Wordmark */}
      <div className="absolute top-10 left-12">
        <span className="text-3xl font-black tracking-tighter text-[#E50914] font-sans">
          NETFLIX
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide mb-12">
        Who's watching?
      </h1>

      {/* Profiles Row */}
      <div className="flex items-center space-x-6 md:space-x-8 mb-16">
        {DEFAULT_PROFILES.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSelect={() => onSelectProfile(profile)}
          />
        ))}

        {/* Add Profile Item */}
        <AddProfileCard onAdd={() => onSelectProfile(DEFAULT_PROFILES[0])} />
      </div>

      {/* Manage Profiles Button */}
      <ManageProfilesButton onManage={() => onSelectProfile(DEFAULT_PROFILES[0])} />
    </div>
  );
};

const ProfileCard: React.FC<{
  profile: NetflixProfile;
  onSelect: () => void;
}> = ({ profile, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `profile-${profile.id}`,
    groupId: 'profile-selection',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className="flex flex-col items-center space-y-3 cursor-pointer group tv-focusable"
    >
      <div
        className={`w-28 h-28 md:w-36 md:h-36 rounded-md overflow-hidden flex items-center justify-center transition-all duration-200 border-2 ${
          profile.avatarBg
        } ${
          isFocused
            ? 'scale-110 border-white shadow-2xl ring-4 ring-white/30'
            : 'border-transparent opacity-85 hover:opacity-100'
        }`}
      >
        {/* Netflix Iconic Smiley Face Avatar */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex space-x-4 mb-2">
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </div>
          <div className="w-10 h-4 border-b-4 border-white rounded-b-full" />
        </div>
      </div>
      <span
        className={`text-sm md:text-base font-medium transition-colors ${
          isFocused ? 'text-white font-bold scale-105' : 'text-zinc-400 group-hover:text-zinc-200'
        }`}
      >
        {profile.name}
      </span>
    </div>
  );
};

const AddProfileCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: 'profile-add',
    groupId: 'profile-selection',
    onEnter: onAdd
  });

  return (
    <div
      ref={ref}
      onClick={onAdd}
      className="flex flex-col items-center space-y-3 cursor-pointer group tv-focusable"
    >
      <div
        className={`w-28 h-28 md:w-36 md:h-36 rounded-md border-2 border-zinc-700 flex items-center justify-center bg-zinc-900 transition-all duration-200 ${
          isFocused
            ? 'scale-110 border-white bg-zinc-800 shadow-2xl ring-4 ring-white/30'
            : 'opacity-70 hover:opacity-100'
        }`}
      >
        <Plus className={`w-12 h-12 ${isFocused ? 'text-white' : 'text-zinc-500'}`} />
      </div>
      <span className={`text-sm md:text-base font-medium ${isFocused ? 'text-white font-bold' : 'text-zinc-500'}`}>
        Add Profile
      </span>
    </div>
  );
};

const ManageProfilesButton: React.FC<{ onManage: () => void }> = ({ onManage }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: 'profile-manage-btn',
    groupId: 'profile-manage',
    onEnter: onManage
  });

  return (
    <button
      ref={ref}
      onClick={onManage}
      className={`flex items-center space-x-2 px-6 py-2.5 rounded-sm border uppercase text-xs font-semibold tracking-widest transition-all tv-focusable ${
        isFocused
          ? 'scale-105 bg-white text-black border-white shadow-lg'
          : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
      }`}
    >
      <Edit2 className="w-3.5 h-3.5" />
      <span>Manage Profiles</span>
    </button>
  );
};
