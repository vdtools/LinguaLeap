
'use server';

import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore';
import { z } from 'zod';
import type { Video } from '@/lib/mock-data';

// --- Type Definitions ---
export type Chapter = {
    id: string;
    title: string;
    description: string;
    content: string;
    quiz: any[];
};

export type ChapterWithStatus = Chapter & {
    status: "completed" | "in_progress" | "locked";
    href: string;
};

export type UserProgressData = {
    id: string;
    email: string;
    beginnerJourney: Record<string, string>;
    grammarDeepDive: Record<string, string>;
    points: number;
    level: number;
    dailyStreak: number;
    lastLogin?: Timestamp;
}

// --- Firebase Admin SDK Initialization ---
let adminDb: admin.firestore.Firestore;

try {
    if (!getApps().length) {
        const serviceAccount = require('../../../service-account-key.json');
        initializeApp({
            credential: cert(serviceAccount)
        });
    }
    adminDb = admin.firestore();
} catch (error: any) {
    console.error("❌❌❌ FATAL ERROR: Firebase Admin SDK initialization failed!", error.code, error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error("Could not find 'service-account-key.json'. Make sure the file exists in the project root.");
    }
    // @ts-ignore
    adminDb = null;
}


// --- Data Fetching Actions ---

/**
 * Fetches chapters for a given learning path (syllabus).
 * Returns a standardized response object.
 */
export async function getSyllabusChapters(path: string): Promise<{ success: boolean; data?: Chapter[]; error?: string; }> {
    noStore();
    if (!adminDb) {
        return { success: false, error: 'FATAL: adminDb not initialized for getSyllabusChapters.' };
    }
    try {
        const docRef = adminDb.collection('syllabus').doc(path);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { success: false, error: `Syllabus document NOT FOUND at syllabus/${path}` };
        }
        
        const data = docSnap.data();
        if (!data) {
             return { success: false, error: `Syllabus document exists at syllabus/${path} but has no data.` };
        }

        const chaptersArray = Object.keys(data).map(key => {
            const chapterData = data[key];
            return {
                id: key,
                title: chapterData.title || "No Title",
                description: chapterData.description || "No Description",
                content: chapterData.content || "",
                quiz: chapterData.quiz || [],
            };
        }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

        return { success: true, data: chaptersArray };
    } catch (error: any) {
        console.error("Error in getSyllabusChapters:", error);
        return { success: false, error: `Server error: ${error.message}` };
    }
}


/**
 * GOLDEN CODE: Fetches a learning path and merges it with user progress.
 * Uses Promise.allSettled for resilience. This ensures that even if user progress
 * fetching fails, the chapter list will still be returned (as "locked").
 */
export async function getLearningPathWithProgress(userId: string, path: 'beginnerJourney' | 'grammarDeepDive'): Promise<{ success: boolean; data?: ChapterWithStatus[]; error?: string; }> {
    noStore();
    if (!adminDb) {
        return { success: false, error: `[getLearningPathWithProgress] FATAL: adminDb not initialized.` };
    }
    try {
        // Use Promise.allSettled to ensure that even if one promise fails, the other can proceed.
        const [chaptersResult, progressResult] = await Promise.allSettled([
            getSyllabusChapters(path),
            adminDb.collection('userProgress').doc(userId).get()
        ]);

        // Handle case where chapters could not be fetched. This is a critical failure.
        if (chaptersResult.status === 'rejected' || !chaptersResult.value.success || !chaptersResult.value.data) {
            const reason = chaptersResult.status === 'rejected' ? chaptersResult.reason : chaptersResult.value.error;
            return { success: false, error: `Could not fetch syllabus chapters. Reason: ${reason}` };
        }
        const chapters = chaptersResult.value.data;

        // Safely access user progress. If it fails or doesn't exist, proceed without it.
        let userProgressForPath: Record<string, string> | undefined;
        if (progressResult.status === 'fulfilled' && progressResult.value.exists) {
            userProgressForPath = progressResult.value.data()?.[path];
        }

        // Merge chapter data with user progress. Default status is 'locked'.
        const mergedData = chapters.map(chapter => {
            const status = (userProgressForPath && userProgressForPath[chapter.id]) || 'locked';
            return {
                ...chapter,
                status: status as "completed" | "in_progress" | "locked",
                href: `/learn/${path}/${chapter.id}`,
            };
        });

        // Set the first locked chapter to 'in_progress' if none are currently in progress or completed.
        const isAnyInProgressOrCompleted = mergedData.some(c => c.status === 'in_progress' || c.status === 'completed');
        if (!isAnyInProgressOrCompleted && mergedData.length > 0) {
            mergedData[0].status = 'in_progress';
        } else {
             // If some are completed but none are "in_progress", find the first "locked" one and unlock it.
             const firstLockedIndex = mergedData.findIndex(c => c.status === 'locked');
             const anyInProgress = mergedData.some(c => c.status === 'in_progress');
             if (firstLockedIndex > -1 && !anyInProgress) {
                 mergedData[firstLockedIndex].status = 'in_progress';
             }
        }
        
        return { success: true, data: mergedData };
    } catch (error: any) {
        console.error("Error in getLearningPathWithProgress:", error);
        return { success: false, error: `Server error: ${error.message}` };
    }
}


export async function getLessonContent(path: string, chapterId: string): Promise<{ success: boolean; data?: Chapter, error?: string; }> {
    noStore();
    if (!adminDb) return { success: false, error: 'FATAL: adminDb not initialized.' };
    try {
        const docRef = adminDb.collection('syllabus').doc(path);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data[chapterId]) {
                const lessonData: Chapter = { id: chapterId, ...data[chapterId] };
                return { success: true, data: lessonData };
            }
        }
        return { success: false, error: `Lesson content for ${path}/${chapterId} not found.` };
    } catch (error: any) {
        console.error(`Error fetching lesson content for ${path}/${chapterId}:`, error);
        return { success: false, error: `Server error: ${error.message}` };
    }
}


export async function getAllUserProgress(): Promise<{ success
: boolean; data?: UserProgressData[], error?: string; }> {
    noStore();
    if (!adminDb) {
        return { success: false, error: 'FATAL: adminDb not initialized' };
    }
    try {
        const listUsersResult = await getAuth().listUsers();
        const progressSnapshot = await adminDb.collection('userProgress').get();
        
        const progressMap = new Map();
        progressSnapshot.forEach(doc => {
            progressMap.set(doc.id, doc.data());
        });

        const allUsersData = listUsersResult.users.map(userRecord => {
            const progress = progressMap.get(userRecord.uid) || {};
            return {
                id: userRecord.uid,
                email: userRecord.email || 'N/A',
                beginnerJourney: progress.beginnerJourney || {},
                grammarDeepDive: progress.grammarDeepDive || {},
                points: progress.points || 0,
                level: progress.level || 1,
                dailyStreak: progress.dailyStreak || 0,
            };
        });
        return { success: true, data: allUsersData };

    } catch (error: any) {
        console.error('Error fetching all user progress:', error);
        return { success: false, error: error.message };
    }
}

export async function getVideos(): Promise<{ success: boolean; data?: (Video & { docId: string })[]; error?: string; }> {
    noStore();
    if (!adminDb) {
        return { success: false, error: 'FATAL: adminDb not initialized' };
    }
    try {
        const videoSnapshot = await adminDb.collection('videoLibrary').get();
        if (videoSnapshot.empty) {
            return { success: true, data: [] };
        }
        const videoData = videoSnapshot.docs.map(doc => ({ docId: doc.id, ...(doc.data() as Video) }));
        return { success: true, data: videoData };
    } catch (error: any) {
        console.error('Failed to fetch videos from Firestore:', error);
        return { success: false, error: error.message };
    }
}


// --- Data Mutation Actions ---

const chapterSchema = z.object({
  chapterId: z.string().min(1, "Chapter ID is required."),
  title: z.string().min(3, "Title must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(200),
  content: z.string().min(20, "Content must be at least 20 characters."),
  quiz: z.array(z.object({
    questionText: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
  })).optional(),
});


const verifyAdmin = async (authToken: string | null) => {
    if (!authToken) return false;
    try {
        const decodedToken = await getAuth().verifyIdToken(authToken);
        return decodedToken.admin === true;
    } catch {
        return false;
    }
};

/**
 * [THE GOLDEN CODE] This is the definitive, robust function for saving or updating a syllabus chapter.
 * It uses a single `set` with `merge: true` to handle both create and edit operations.
 * It correctly checks for existing IDs ONLY when creating a new chapter.
 * CRITICAL FIX: It now correctly converts FormData to an object and handles quiz parsing for reliable validation.
 */
export async function saveSyllabusChapter(
    prevState: any, 
    formData: FormData
): Promise<{ success: boolean; message: string; errors?: any; savedChapter?: Chapter; }> {
    if (!adminDb) {
        return { success: false, message: 'FATAL: adminDb not initialized for saveSyllabusChapter.' };
    }
    
    // Convert FormData to a standard object for easier processing.
    const formObject = Object.fromEntries(formData.entries());

    if (!await verifyAdmin(formObject.authToken as string)) {
        return { success: false, message: 'Authentication failed. Not an admin.' };
    }

    const isEditing = formObject.isEditing === 'true';
    const path = formObject.path as string;
    
    // Safely parse the quiz data from the form.
    let parsedQuizData;
    try {
        if (formObject.quiz && typeof formObject.quiz === 'string') {
            parsedQuizData = JSON.parse(formObject.quiz);
        } else {
            parsedQuizData = [];
        }
    } catch (e) {
        return { success: false, message: 'Invalid quiz format. Could not parse JSON.' };
    }
    
    // Prepare a clean object specifically for Zod validation.
    const dataForZod = {
        ...formObject,
        quiz: parsedQuizData,
    };

    const validatedFields = chapterSchema.safeParse(dataForZod);
    
    if (!validatedFields.success) {
        console.log("Zod validation failed:", validatedFields.error.flatten());
        return {
            success: false, message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { chapterId, ...dataToSave } = validatedFields.data;
    
    // CRITICAL FIX: Remove properties that should not be saved to Firestore.
    // This prevents validation errors and keeps the database clean.
    delete (dataToSave as any).authToken;
    delete (dataToSave as any).isEditing;
    delete (dataToSave as any).path;

    const syllabusRef = adminDb.collection('syllabus').doc(path);

    try {
        // Only check for an existing chapter ID if we are CREATING a new one.
        if (!isEditing) {
            const docSnap = await syllabusRef.get();
            if (docSnap.exists && docSnap.data()?.[chapterId]) {
                 return { success: false, message: `Chapter ID "${chapterId}" already exists.`, errors: { chapterId: ['This ID is already taken.'] } };
            }
        }
        
        // This single command handles both creation and updates robustly.
        // It creates or merges a field (named after the chapterId) within the syllabus document.
        await syllabusRef.set({
            [chapterId]: dataToSave
        }, { merge: true });

        // Revalidate relevant paths to ensure fresh data is shown to the user.
        revalidatePath('/admin');
        revalidatePath(`/${path}`);
        revalidatePath(`/learn/${path}/${chapterId}`);
        
        const savedChapter: Chapter = { id: chapterId, ...dataToSave, quiz: dataToSave.quiz || [] };
        const message = isEditing ? `Chapter "${validatedFields.data.title}" updated successfully!` : `Chapter "${validatedFields.data.title}" created successfully!`;
        return { success: true, message, savedChapter };

    } catch (error: any) {
        console.error("Error saving chapter: ", error);
        return { success: false, message: `Server error: ${error.message}` };
    }
}



export async function deleteSyllabusChapter(path: string, chapterId: string, authToken: string): Promise<{ success: boolean, message: string }> {
    if (!adminDb) {
        return { success: false, message: 'FATAL: adminDb not initialized for deleteSyllabusChapter.' };
    }
    if (!await verifyAdmin(authToken)) {
        return { success: false, message: 'Authentication failed. Not an admin.' };
    }
    try {
        // Use FieldValue.delete() to remove a specific chapter field from the document.
        await adminDb.collection('syllabus').doc(path).update({
            [chapterId]: FieldValue.delete()
        });
        revalidatePath('/admin');
        revalidatePath(`/${path}`);
        return { success: true, message: `Chapter "${chapterId}" deleted.` };
    } catch (error: any) {
        console.error("Error deleting chapter: ", error);
        return { success: false, message: `Server error: ${error.message}` };
    }
}

/**
 * GOLDEN CODE: Transactionally updates user progress.
 * Prevents double-points and handles unlocking the next chapter.
 */
export async function updateUserProgress(userId: string, path: 'beginnerJourney' | 'grammarDeepDive', chapterId: string): Promise<{ success: boolean; message?: string, error?: string }> {
    if (!adminDb || !userId) {
        return { success: false, error: "Authentication or Database error." };
    }

    const userProgressRef = adminDb.collection('userProgress').doc(userId);

    try {
        await adminDb.runTransaction(async (transaction: Transaction) => {
            const progressDoc = await transaction.get(userProgressRef);

            const data = progressDoc.data() || {};
            const currentPathProgress = data[path] || {};
            
            // Do nothing if chapter is already completed. Prevents double points.
            if (currentPathProgress[chapterId] === 'completed') {
                return;
            }

            const currentPoints = data.points || 0;
            const newPoints = currentPoints + 10;
            const newLevel = Math.floor(newPoints / 100) + 1;

            // Fetch chapters to find the next one to unlock
            const chaptersResponse = await getSyllabusChapters(path);
            let nextChapterUpdate = {};
            if (chaptersResponse.success && chaptersResponse.data) {
                 const chapters = chaptersResponse.data;
                 const currentIndex = chapters.findIndex(c => c.id === chapterId);
                 if (currentIndex !== -1 && currentIndex + 1 < chapters.length) {
                    const nextChapterId = chapters[currentIndex + 1].id;
                    // Only unlock if it's currently locked or doesn't exist
                    if (!currentPathProgress[nextChapterId] || currentPathProgress[nextChapterId] === 'locked') {
                        nextChapterUpdate = { [nextChapterId]: 'in_progress' };
                    }
                }
            }

            const updatePayload = {
                points: newPoints,
                level: newLevel,
                [path]: {
                    ...currentPathProgress,
                    [chapterId]: 'completed',
                    ...nextChapterUpdate,
                },
            };
            
            transaction.set(userProgressRef, updatePayload, { merge: true });
        });

        revalidatePath(`/${path}`);
        revalidatePath('/'); // Revalidate dashboard to show new points/level
        revalidatePath(`/learn/${path}/${chapterId}`);
        return { success: true, message: `Progress for ${chapterId} updated. Points awarded.` };

    } catch (error: any) {
        console.error("Error in updateUserProgress transaction: ", error);
        return { success: false, error: `Transaction failed: ${error.message}` };
    }
}


export async function updateDailyStreak(userId: string): Promise<{ success: boolean; data?: { newStreak: number }; message?: string, error?: string }> {
    if (!adminDb || !userId) {
        return { success: false, error: "Authentication or Database error." };
    }
    const userProgressRef = adminDb.collection('userProgress').doc(userId);

    try {
        let finalStreak: number = 0;
        await adminDb.runTransaction(async (transaction: Transaction) => {
            const progressDoc = await transaction.get(userProgressRef);
            
            const data = progressDoc.exists ? progressDoc.data()! : {};
            const lastLogin = data.lastLogin as Timestamp | undefined;
            const currentStreak = data.dailyStreak || 0;
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            if (!lastLogin) {
                // First login ever
                finalStreak = 1;
            } else {
                const lastLoginDate = lastLogin.toDate();
                const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
                
                // If last login was today, don't change anything
                if (today.getTime() === lastLoginDay.getTime()) {
                    finalStreak = currentStreak; 
                    return; // Exit transaction early
                }
                
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                // If last login was yesterday, increment streak. Otherwise, reset to 1.
                finalStreak = (lastLoginDay.getTime() === yesterday.getTime()) ? currentStreak + 1 : 1;
            }

            const payload = { 
                dailyStreak: finalStreak, 
                lastLogin: Timestamp.now(),
                points: data.points || 0, // Ensure these fields aren't overwritten
                level: data.level || 1,
             };
            transaction.set(userProgressRef, payload, { merge: true });
        });
        
        revalidatePath('/'); // Revalidate dashboard to show updated streak
        return { success: true, data: { newStreak: finalStreak }, message: `Daily streak updated to ${finalStreak}.` };

    } catch (error: any) {
        console.error(`Error updating daily streak for user ${userId}:`, error);
        return { success: false, error: `Server error while updating streak: ${error.message}` };
    }
}


// --- Video Library Actions ---

const videoSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  youtubeVideoId: z.string().min(11, "Must be a valid YouTube Video ID.").max(11),
  category: z.enum(['Grammar', 'Pronunciation', 'Vocabulary', 'Conversation']),
});

export async function addVideo(prevState: any, formData: FormData): Promise<{ success: boolean, message: string, errors: any }> {
    if (!adminDb) {
        return { success: false, message: 'FATAL: adminDb not initialized for addVideo.', errors: {} };
    }
    const authToken = formData.get('authToken') as string;
    if (!await verifyAdmin(authToken)) {
        return { success: false, message: 'Authentication failed. Not an admin.', errors: {} };
    }
    
    const validatedFields = videoSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        youtubeVideoId: formData.get('youtubeVideoId'),
        category: formData.get('category'),
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    try {
        await adminDb.collection('videoLibrary').add(validatedFields.data);
        revalidatePath('/admin');
        revalidatePath('/video-library');
        return { success: true, message: 'Video added successfully!', errors: {} };
    } catch (error: any) {
        console.error('Error adding video:', error);
        return { success: false, message: `Server error: ${error.message}`, errors: {} };
    }
}


export async function deleteVideo(videoId: string, authToken: string): Promise<{ success: boolean, message: string }> {
    if (!adminDb) {
        return { success: false, message: 'FATAL: adminDb not initialized for deleteVideo.' };
    }
    if (!await verifyAdmin(authToken)) {
        return { success: false, message: 'Authentication failed. Not an admin.' };
    }
    try {
        await adminDb.collection('videoLibrary').doc(videoId).delete();
        revalidatePath('/admin');
        revalidatePath('/video-library');
        return { success: true, message: 'Video deleted successfully!' };
    } catch (error: any) {
        console.error('Error deleting video:', error);
        return { success: false, message: `Server error: ${error.message}` };
    }
}

// --- API Key Management Actions ---

export async function getApiKey(userId: string): Promise<{ success: boolean; data?: { apiKey: string }; error?: string }> {
    noStore();
    if (!adminDb || !userId) return { success: false, error: "Database/Auth error" };
    try {
        const docRef = adminDb.collection('userApiKeys').doc(userId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return { success: true, data: docSnap.data() as any };
        }
        return { success: true, data: {} as any };
    } catch (error: any) {
        return { success: false, error: `Server error: ${error.message}` };
    }
}

export async function saveApiKey(userId: string, keys: Record<string, string>): Promise<{ success: boolean, message?: string, error?: string }> {
    if (!adminDb || !userId) {
        return { success: false, error: "Authentication or Database error." };
    }

    const hasAtLeastOneKey = Object.values(keys).some(key => key && key.trim().length > 0);
    if (!hasAtLeastOneKey) {
        return { success: false, error: "At least one API Key must be provided to save." };
    }

    try {
        const docRef = adminDb.collection('userApiKeys').doc(userId);
        await docRef.set(keys, { merge: true });
        revalidatePath('/settings');
        return { success: true, message: "API Keys saved successfully." };
    } catch (error: any) {
        return { success: false, error: `Server error: ${error.message}` };
    }
}

// --- Gamification / Dashboard Actions ---

export async function getUserDashboardStats(userId: string): Promise<{ success: boolean, data?: { points: number, level: number, dailyStreak: number }, error?: string }> {
    noStore();
    if (!adminDb || !userId) return { success: false, error: "Database/Auth error" };
    try {
        const docRef = adminDb.collection('userProgress').doc(userId);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            const data = docSnap.data();
            return {
                success: true,
                data: {
                    points: data?.points ?? 0,
                    level: data?.level ?? 1,
                    dailyStreak: data?.dailyStreak ?? 0,
                }
            };
        } else {
             return {
                success: true,
                data: { points: 0, level: 1, dailyStreak: 0 }
            };
        }
    } catch (error: any) {
        return { success: false, error: `Server error: ${error.message}` };
    }
}

// --- Test/Debug Functions ---

/**
 * Checks the status of the Firebase Admin SDK initialization.
 * THIS IS A READ-ONLY, NON-CRITICAL DEBUG FUNCTION.
 */
export async function checkServerHealth() {
    noStore();
    let serviceAccountFound = false;
    let sdkInitialized = false;
    let errorMessage: string | null = null;
    
    try {
        require('../../../service-account-key.json');
        serviceAccountFound = true;
    } catch (e: any) {
        errorMessage = e.message;
    }

    if (adminDb) {
        sdkInitialized = true;
    }

    return {
        sdkInitialized: sdkInitialized,
        envVarFound: serviceAccountFound,
        message: sdkInitialized ? "✅ Server connection is healthy." : "❌ Server connection has issues.",
        error: errorMessage
    };
}

/**
 * Fetches test chapters from a dedicated collection.
 * THIS IS A READ-ONLY, NON-CRITICAL DEBUG FUNCTION.
 */
export async function getTestChapters() {
    noStore();
    if (!adminDb) {
      console.error('adminDb not initialized for getTestChapters');
      return null;
    }
    try {
      const docRef = adminDb.collection('test_chapters').doc('beginner');
      const docSnap = await docRef.get();
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error in getTestChapters:', error);
      throw error;
    }
}
    

    