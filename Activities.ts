import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export type Activity = {
    id: string
    displayName: string
}

export function NewActivity(displayName: string): Activity {
    return {
        id: uuidv4(),
        displayName: displayName,
    }
}
  
export async function GetActivities(): Promise<Activity[] | undefined> {
    try {
        const activitiesAsString: string | null = await AsyncStorage.getItem('@activities');
        const activities: Activity[] = activitiesAsString === null ? [] : JSON.parse(activitiesAsString);
        return activities;
    } catch (e: any) {
        console.log(e);
        Promise.reject(e);
    }
}

export async function SetActivities(activities: Activity[]): Promise<void> {
    try {
        await AsyncStorage.setItem('@activities', JSON.stringify(activities));
    } catch (e: any) {
        console.log(e);
        Promise.reject(e);
    }
}

export async function GetActivityDisplayName(id: string): Promise<string | null | undefined> {
    try {
        const activities: Activity[] = (await GetActivities())!;
        const activitiesMatchingId: Activity[] = activities.filter(activity => activity.id === id);
        if (activitiesMatchingId.length === 0) {
            // The id was not found in the array of activities
            return null;
        } else {
            return activitiesMatchingId[0].displayName;
        }
    } catch (e: any) {
        console.log(e);
        Promise.reject(e);
    }
}
