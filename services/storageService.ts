import { ResumeSnapshot, MasterProfile } from '../types';

const STORAGE_KEY = 'resume_tailor_snapshots';
const MASTER_PROFILE_KEY = 'resume_tailor_master_profile';

export const saveSnapshot = (snapshot: ResumeSnapshot): void => {
  const existing = getSnapshots();
  // If ID exists, update it, otherwise add to top
  const others = existing.filter(s => s.id !== snapshot.id);
  const updated = [snapshot, ...others];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save snapshot (Storage Quota likely exceeded)", e);
    alert("Failed to save. Local storage might be full.");
  }
};

export const getSnapshots = (): ResumeSnapshot[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteSnapshot = (id: string): void => {
  const existing = getSnapshots();
  const updated = existing.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const saveMasterProfile = (profile: MasterProfile): void => {
    try {
        localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
        console.error("Failed to save master profile", e);
    }
};

export const getMasterProfile = (): MasterProfile | null => {
    const data = localStorage.getItem(MASTER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
};
