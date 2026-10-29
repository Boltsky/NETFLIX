import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusable, useFocus } from '../focus/FocusContext';
import { Plus, Edit2, Lock, Check, Trash2, X, Star, ShieldCheck } from 'lucide-react';
import { NetflixProfile } from '../../types';

export type { NetflixProfile };

export const BOLT_PROFILE: NetflixProfile = {
  id: 'bolt',
  name: 'BOLT',
  avatarBg: 'bg-[#E50914]',
  isVip: true,
  isDefault: true
};

const INITIAL_PROFILES: NetflixProfile[] = [
  BOLT_PROFILE,
  { id: 'p-sarah', name: 'Sarah', avatarBg: 'bg-[#1E88E5]' },
  { id: 'p-kids', name: 'Kids', avatarBg: 'bg-[#FDD835]', isKids: true },
  { id: 'p-guest', name: 'Guest', avatarBg: 'bg-[#00ACC1]' }
];

export const AVATAR_COLORS = [
  { id: 'red', name: 'Signature Red', class: 'bg-[#E50914]' },
  { id: 'blue', name: 'Ocean Blue', class: 'bg-[#1E88E5]' },
  { id: 'yellow', name: 'Golden Yellow', class: 'bg-[#FDD835]' },
  { id: 'teal', name: 'Cyan Teal', class: 'bg-[#00ACC1]' },
  { id: 'purple', name: 'Royal Purple', class: 'bg-[#8E24AA]' },
  { id: 'green', name: 'Emerald Green', class: 'bg-[#10B981]' }
];

const STORAGE_KEY = 'cinewave_profiles_v2';
const memoryProfilesStore: Record<string, string> = {};

function safeStorageGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryProfilesStore[key] || null;
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryProfilesStore[key] = value;
}

export function getStoredProfiles(): NetflixProfile[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY);
    if (!raw) return INITIAL_PROFILES;
    const parsed: NetflixProfile[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_PROFILES;

    // Guarantee BOLT is always at index 0 and marked immutable/VIP
    const withoutBolt = parsed.filter(p => p.id !== 'bolt' && p.name.toUpperCase() !== 'BOLT');
    return [BOLT_PROFILE, ...withoutBolt];
  } catch {
    return INITIAL_PROFILES;
  }
}

export function saveStoredProfiles(profiles: NetflixProfile[]): void {
  try {
    // Guarantee BOLT is always preserved
    const withoutBolt = profiles.filter(p => p.id !== 'bolt' && p.name.toUpperCase() !== 'BOLT');
    const cleaned = [BOLT_PROFILE, ...withoutBolt].slice(0, 5);
    safeStorageSet(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Failed to save profiles to storage:', e);
  }
}

interface ProfileSelectorProps {
  onSelectProfile: (profile: NetflixProfile) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState<NetflixProfile[]>(getStoredProfiles);
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState<NetflixProfile | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [boltNotice, setBoltNotice] = useState<string | null>(null);
  const { setFocusedKey } = useFocus();

  // Keep profiles in sync with localStorage
  useEffect(() => {
    saveStoredProfiles(profiles);
  }, [profiles]);

  // Handle clicking a profile card
  const handleProfileClick = (profile: NetflixProfile) => {
    if (isManaging) {
      if (profile.isDefault || profile.id === 'bolt') {
        setBoltNotice('The default "BOLT" VIP profile is protected and cannot be edited or deleted.');
        setTimeout(() => setBoltNotice(null), 4000);
      } else {
        setEditingProfile(profile);
      }
    } else {
      onSelectProfile(profile);
    }
  };

  // Save edited profile
  const handleSaveProfile = (updated: NetflixProfile) => {
    if (updated.id === 'bolt') return; // Cannot edit BOLT
    setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setEditingProfile(null);
    setFocusedKey(`profile-${updated.id}`);
  };

  // Delete profile
  const handleDeleteProfile = (profileId: string) => {
    if (profileId === 'bolt') return; // Cannot delete BOLT
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    // Clean up profile session data
    try {
      localStorage.removeItem(`cinewave_progress_${profileId}`);
      localStorage.removeItem(`cinewave_watchlist_${profileId}`);
      localStorage.removeItem(`cinewave_history_${profileId}`);
    } catch {}
    setEditingProfile(null);
    setFocusedKey('profile-bolt');
  };

  // Add new profile
  const handleCreateProfile = (newProfile: NetflixProfile) => {
    if (profiles.length >= 5) return;
    setProfiles(prev => [...prev, newProfile]);
    setIsAdding(false);
    setFocusedKey(`profile-${newProfile.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141414] flex flex-col items-center justify-center select-none animate-fadeIn overflow-hidden">
      {/* Netflix Top Wordmark */}
      <div className="absolute top-10 left-12 flex items-center space-x-3">
        <span className="text-3xl font-black tracking-tighter text-[#E50914] font-sans drop-shadow-md">
          NETFLIX
        </span>
        {isManaging && (
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700">
            Profile Manager
          </span>
        )}
      </div>

      {/* Title */}
      <div className="text-center mb-12 space-y-1">
        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide">
          {isManaging ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        {isManaging && (
          <p className="text-sm text-zinc-400">
            Select a profile to customize name, avatar color, or settings.
          </p>
        )}
      </div>

      {/* Bolt Protection Notification Toast */}
      {boltNotice && (
        <div className="absolute top-24 bg-amber-500/20 border border-amber-400/60 text-amber-200 px-5 py-2.5 rounded-lg flex items-center space-x-2.5 backdrop-blur-md shadow-xl animate-bounce">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-medium">{boltNotice}</span>
        </div>
      )}

      {/* Profiles Row */}
      <div className="flex items-center space-x-6 md:space-x-8 mb-16">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isManaging={isManaging}
            onSelect={() => handleProfileClick(profile)}
          />
        ))}

        {/* Add Profile Item (visible if less than 5 profiles) */}
        {profiles.length < 5 && (
          <AddProfileCard onAdd={() => setIsAdding(true)} />
        )}
      </div>

      {/* Manage Profiles / Done Button */}
      {isManaging ? (
        <DoneProfilesButton onDone={() => setIsManaging(false)} />
      ) : (
        <ManageProfilesButton onManage={() => setIsManaging(true)} />
      )}

      {/* Modal: Edit Profile */}
      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onDelete={() => handleDeleteProfile(editingProfile.id)}
          onCancel={() => setEditingProfile(null)}
        />
      )}

      {/* Modal: Add Profile */}
      {isAdding && (
        <AddProfileModal
          onAdd={handleCreateProfile}
          onCancel={() => setIsAdding(false)}
        />
      )}
    </div>
  );
};

const ProfileCard: React.FC<{
  profile: NetflixProfile;
  isManaging: boolean;
  onSelect: () => void;
}> = ({ profile, isManaging, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `profile-${profile.id}`,
    groupId: 'profile-selection',
    onEnter: onSelect
  });

  const isBolt = profile.id === 'bolt' || profile.isDefault;

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className="flex flex-col items-center space-y-3 cursor-pointer group tv-focusable relative"
    >
      <div
        className={`w-28 h-28 md:w-36 md:h-36 rounded-md overflow-hidden flex items-center justify-center transition-all duration-200 border-2 relative ${
          profile.avatarBg
        } ${
          isFocused
            ? isBolt
              ? 'scale-110 border-amber-300 shadow-2xl ring-4 ring-amber-400/40'
              : 'scale-110 border-white shadow-2xl ring-4 ring-white/30'
            : 'border-transparent opacity-85 hover:opacity-100'
        }`}
      >
        {/* VIP Golden Badge for BOLT */}
        {profile.isVip && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-[3px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-[9px] tracking-widest shadow-lg flex items-center gap-0.5 border border-yellow-200 z-20">
            <Star className="w-2.5 h-2.5 fill-black" />
            VIP
          </div>
        )}

        {/* Kids Badge */}
        {profile.isKids && (
          <div className="absolute bottom-2 inset-x-2 py-0.5 bg-black/60 rounded text-center text-[9px] font-bold tracking-widest uppercase text-yellow-300 z-20">
            KIDS
          </div>
        )}

        {/* Netflix Iconic Smiley Face Avatar */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex space-x-4 mb-2">
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </div>
          <div className="w-10 h-4 border-b-4 border-white rounded-b-full" />
        </div>

        {/* Manage Mode Overlay */}
        {isManaging && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
            {isBolt ? (
              <div className="flex flex-col items-center space-y-1 text-amber-400">
                <Lock className="w-8 h-8 drop-shadow" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 bg-black/70 px-1.5 py-0.5 rounded">
                  VIP Default
                </span>
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-black/70 border border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Name & Status */}
      <div className="flex items-center space-x-1.5">
        <span
          className={`text-sm md:text-base font-medium transition-colors ${
            isFocused
              ? isBolt
                ? 'text-amber-300 font-bold scale-105'
                : 'text-white font-bold scale-105'
              : 'text-zinc-400 group-hover:text-zinc-200'
          }`}
        >
          {profile.name}
        </span>
        {profile.isVip && (
          <span className="text-[10px] font-extrabold text-amber-400 border border-amber-400/50 px-1 rounded">
            VIP
          </span>
        )}
      </div>
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
    groupId: 'profile-actions',
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

const DoneProfilesButton: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: 'profile-done-btn',
    groupId: 'profile-actions',
    onEnter: onDone
  });

  return (
    <button
      ref={ref}
      onClick={onDone}
      className={`flex items-center space-x-2 px-8 py-2.5 rounded-sm uppercase text-xs font-bold tracking-widest transition-all tv-focusable shadow-xl ${
        isFocused
          ? 'scale-105 bg-white text-black ring-4 ring-white/40'
          : 'bg-[#E50914] text-white hover:bg-red-700'
      }`}
    >
      <Check className="w-4 h-4 stroke-[3]" />
      <span>Done</span>
    </button>
  );
};

// -------------------------------------------------------------
// Edit Profile Modal
// -------------------------------------------------------------
const EditProfileModal: React.FC<{
  profile: NetflixProfile;
  onSave: (profile: NetflixProfile) => void;
  onDelete: () => void;
  onCancel: () => void;
}> = ({ profile, onSave, onDelete, onCancel }) => {
  const [name, setName] = useState(profile.name);
  const [avatarBg, setAvatarBg] = useState(profile.avatarBg);
  const [isKids, setIsKids] = useState(!!profile.isKids);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { setFocusedKey } = useFocus();

  // Set initial focus to the name input node
  useEffect(() => {
    setFocusedKey('edit-name-input');
  }, [setFocusedKey]);

  // Back / Escape remote button handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Back' || e.key === 'GoBack') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      ...profile,
      name: trimmed,
      avatarBg,
      isKids
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-8 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <Edit2 className="w-6 h-6 text-[#E50914]" />
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          </div>
          <ModalCloseButton id="edit-modal-close" onClose={onCancel} />
        </div>

        {/* Profile Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Profile Name
          </label>
          <div className="flex items-center space-x-2">
            <ModalTextInput
              id="edit-name-input"
              value={name}
              onChange={setName}
              placeholder="Profile Name"
              maxLength={20}
            />
            {name && (
              <ModalClearButton
                id="edit-name-clear"
                onClear={() => {
                  setName('');
                  setFocusedKey('edit-name-input');
                }}
              />
            )}
          </div>
        </div>

        {/* Avatar Preview & Color Selector */}
        <div className="flex items-center space-x-6 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
          <div
            className={`w-20 h-20 rounded-md flex items-center justify-center shrink-0 border-2 border-white/80 shadow-md ${avatarBg}`}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex space-x-2.5 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-6 h-2.5 border-b-2 border-white rounded-b-full" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Avatar Color
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <ColorSwatch
                  key={c.id}
                  colorClass={c.class}
                  isSelected={avatarBg === c.class}
                  onSelect={() => setAvatarBg(c.class)}
                  id={`edit-color-${c.id}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Kids Profile Toggle */}
        <KidsProfileToggle
          isKids={isKids}
          onToggle={() => setIsKids(!isKids)}
          id="edit-toggle-kids"
        />

        {/* Delete Confirmation Box */}
        {showConfirmDelete ? (
          <div className="bg-red-950/40 border border-red-700/80 rounded-lg p-4 space-y-3">
            <p className="text-xs text-red-200">
              Are you sure you want to delete <span className="font-bold text-white">"{profile.name}"</span>? All history and My List saved for this profile will be permanently removed.
            </p>
            <div className="flex items-center space-x-3">
              <ModalButton
                id="edit-confirm-delete-btn"
                label="Confirm Delete"
                isDanger
                onClick={onDelete}
              />
              <ModalButton
                id="edit-cancel-delete-btn"
                label="Cancel"
                onClick={() => setShowConfirmDelete(false)}
              />
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center space-x-3">
              <ModalButton
                id="edit-save-btn"
                label="Save"
                isPrimary
                onClick={handleSave}
              />
              <ModalButton
                id="edit-cancel-btn"
                label="Cancel"
                onClick={onCancel}
              />
            </div>

            {!profile.isDefault && (
              <ModalButton
                id="edit-delete-btn"
                label="Delete Profile"
                isDangerOutline
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setShowConfirmDelete(true)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Add Profile Modal
// -------------------------------------------------------------
const AddProfileModal: React.FC<{
  onAdd: (profile: NetflixProfile) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [avatarBg, setAvatarBg] = useState(AVATAR_COLORS[1].class);
  const [isKids, setIsKids] = useState(false);
  const { setFocusedKey } = useFocus();

  // Set initial focus to the name input node
  useEffect(() => {
    setFocusedKey('add-name-input');
  }, [setFocusedKey]);

  // Back / Escape remote button handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Back' || e.key === 'GoBack') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleCreate = () => {
    const trimmed = name.trim() || 'New User';
    onAdd({
      id: `p-${Date.now()}`,
      name: trimmed,
      avatarBg,
      isKids
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-8 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <Plus className="w-6 h-6 text-[#E50914]" />
            <h2 className="text-2xl font-bold text-white">Add Profile</h2>
          </div>
          <ModalCloseButton id="add-modal-close" onClose={onCancel} />
        </div>

        {/* Profile Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Profile Name
          </label>
          <div className="flex items-center space-x-2">
            <ModalTextInput
              id="add-name-input"
              value={name}
              onChange={setName}
              placeholder="e.g. Alex, Family, Guest"
              maxLength={20}
            />
            {name && (
              <ModalClearButton
                id="add-name-clear"
                onClear={() => {
                  setName('');
                  setFocusedKey('add-name-input');
                }}
              />
            )}
          </div>
        </div>

        {/* Avatar Preview & Color Selector */}
        <div className="flex items-center space-x-6 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
          <div
            className={`w-20 h-20 rounded-md flex items-center justify-center shrink-0 border-2 border-white/80 shadow-md ${avatarBg}`}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex space-x-2.5 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-6 h-2.5 border-b-2 border-white rounded-b-full" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Avatar Color
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <ColorSwatch
                  key={c.id}
                  colorClass={c.class}
                  isSelected={avatarBg === c.class}
                  onSelect={() => setAvatarBg(c.class)}
                  id={`add-color-${c.id}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Kids Profile Toggle */}
        <KidsProfileToggle
          isKids={isKids}
          onToggle={() => setIsKids(!isKids)}
          id="add-toggle-kids"
        />

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-zinc-800">
          <ModalButton
            id="add-save-btn"
            label="Create Profile"
            isPrimary
            onClick={handleCreate}
          />
          <ModalButton
            id="add-cancel-btn"
            label="Cancel"
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Small Reusable TV Modal Components
// -------------------------------------------------------------
const ModalCloseButton: React.FC<{
  id: string;
  onClose: () => void;
}> = ({ id, onClose }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-header',
    onEnter: onClose
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      className={`p-1.5 rounded-full transition-all tv-focusable ${
        isFocused
          ? 'bg-white text-black ring-2 ring-white scale-110 shadow-lg'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      <X className="w-5 h-5" />
    </button>
  );
};

const ModalTextInput: React.FC<{
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}> = ({ id, value, onChange, placeholder, maxLength = 20 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { moveFocus } = useFocus();
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-form',
    onEnter: () => {
      inputRef.current?.focus();
    }
  });

  return (
    <div
      ref={ref}
      onClick={() => inputRef.current?.focus()}
      className={`flex-1 flex items-center rounded-md border transition-all tv-focusable ${
        isFocused
          ? 'bg-zinc-800 border-white ring-2 ring-white/60 shadow-xl'
          : 'bg-zinc-800/90 border-zinc-600 hover:border-zinc-500'
      }`}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            inputRef.current?.blur();
            moveFocus('DOWN');
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            inputRef.current?.blur();
            moveFocus('UP');
          } else if (e.key === 'Enter') {
            inputRef.current?.blur();
          }
        }}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-2.5 text-white font-medium focus:outline-none text-base placeholder-zinc-500"
      />
    </div>
  );
};

const ModalClearButton: React.FC<{
  id: string;
  onClear: () => void;
}> = ({ id, onClear }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-form',
    onEnter: onClear
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClear}
      className={`text-zinc-400 hover:text-white px-3 py-2.5 bg-zinc-800 border rounded-md text-xs font-semibold transition-all tv-focusable ${
        isFocused
          ? 'bg-white text-black border-white ring-2 ring-white/60 scale-105 shadow-md'
          : 'border-zinc-700'
      }`}
    >
      Clear
    </button>
  );
};

const ColorSwatch: React.FC<{
  colorClass: string;
  isSelected: boolean;
  onSelect: () => void;
  id: string;
}> = ({ colorClass, isSelected, onSelect, id }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-colors',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`w-7 h-7 rounded-full transition-transform ${colorClass} ${
        isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
      } ${isFocused ? 'scale-125 ring-4 ring-yellow-400 shadow-xl z-20' : ''}`}
    />
  );
};

const KidsProfileToggle: React.FC<{
  isKids: boolean;
  onToggle: () => void;
  id: string;
}> = ({ isKids, onToggle, id }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-kids-toggle',
    onEnter: onToggle
  });

  return (
    <div
      ref={ref}
      onClick={onToggle}
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
        isFocused
          ? 'bg-zinc-800 border-white ring-2 ring-white/30'
          : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-white">Kids Profile</p>
        <p className="text-xs text-zinc-400">Only show titles suitable for all ages</p>
      </div>
      <div
        className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
          isKids
            ? 'bg-[#E50914] border-[#E50914] text-white'
            : 'border-zinc-600 bg-zinc-800'
        }`}
      >
        {isKids && <Check className="w-4 h-4 stroke-[3]" />}
      </div>
    </div>
  );
};

const ModalButton: React.FC<{
  id: string;
  label: string;
  isPrimary?: boolean;
  isDanger?: boolean;
  isDangerOutline?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}> = ({ id, label, isPrimary, isDanger, isDangerOutline, icon, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: id,
    groupId: 'modal-actions',
    onEnter: onClick
  });

  let baseStyle = 'border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800';
  if (isPrimary) baseStyle = 'bg-[#E50914] border-[#E50914] text-white font-bold hover:bg-red-700';
  if (isDanger) baseStyle = 'bg-red-600 border-red-600 text-white font-bold hover:bg-red-700';
  if (isDangerOutline) baseStyle = 'border-red-800/80 text-red-400 hover:bg-red-950/50 hover:text-red-300';

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2 rounded-md border text-xs font-semibold tracking-wider uppercase transition-all tv-focusable ${baseStyle} ${
        isFocused
          ? 'scale-105 bg-white text-black border-white shadow-xl ring-2 ring-white/50'
          : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
