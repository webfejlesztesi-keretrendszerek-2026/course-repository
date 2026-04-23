/**
 * Firestore collection: users
 * User preferences are embedded to simplify reads. Timestamps stored as ISO strings.
 */
export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  preferences: {
    diet: string[];
    dailyCalorieGoal: number;
    householdSize: number;
    measurementSystem: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string; // Firestore Timestamp
  updatedAt: string; // Firestore Timestamp
}
