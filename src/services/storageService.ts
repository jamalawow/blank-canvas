import { MasterProfile, ResumeSnapshot } from '../types';

const MASTER_PROFILE_KEY = 'resume_tailor_master_profile';
const SNAPSHOTS_KEY = 'resume_tailor_snapshots';

// Master Profile operations
export const saveMasterProfile = (profile: MasterProfile): void => {
  try {
    localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save master profile:', error);
  }
};

export const getMasterProfile = (): MasterProfile | null => {
  try {
    const stored = localStorage.getItem(MASTER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load master profile:', error);
    return null;
  }
};

// Snapshot operations
export const saveSnapshot = (snapshot: ResumeSnapshot): void => {
  try {
    const snapshots = getSnapshots();
    snapshots.unshift(snapshot); // Add to beginning
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('Failed to save snapshot:', error);
  }
};

export const getSnapshots = (): ResumeSnapshot[] => {
  try {
    const stored = localStorage.getItem(SNAPSHOTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load snapshots:', error);
    return [];
  }
};

export const deleteSnapshot = (id: string): void => {
  try {
    const snapshots = getSnapshots().filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error('Failed to delete snapshot:', error);
  }
};

// Export data
export const exportData = (): string => {
  const data = {
    masterProfile: getMasterProfile(),
    snapshots: getSnapshots(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

// Import data
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.masterProfile) {
      saveMasterProfile(data.masterProfile);
    }
    if (data.snapshots) {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(data.snapshots));
    }
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
