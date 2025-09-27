// ===== FIREBASE CONFIGURATION =====

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyBXYZ123...", // Replace with your actual API key
    authDomain: "lingualeap-project.firebaseapp.com", // Replace with your domain
    projectId: "lingualeap-project", // Replace with your project ID
    storageBucket: "lingualeap-project.appspot.com", // Replace with your storage bucket
    messagingSenderId: "123456789", // Replace with your sender ID
    appId: "1:123456789:web:abcdef123456" // Replace with your app ID
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// ===== FIRESTORE HELPER FUNCTIONS =====

// Save chapter data to Firestore
async function saveChapterToFirestore(chapterData) {
    try {
        const db = firebase.firestore();
        const docRef = await db.collection('chapters').add({
            ...chapterData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Chapter saved with ID:', docRef.id);
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error('❌ Error saving chapter:', error);
        return { success: false, error: error.message };
    }
}

// Load chapters from Firestore
async function loadChaptersFromFirestore(courseFilter = null) {
    try {
        const db = firebase.firestore();
        let query = db.collection('chapters').orderBy('order', 'asc');
        
        if (courseFilter) {
            query = query.where('course', '==', courseFilter);
        }
        
        const snapshot = await query.get();
        const chapters = [];
        
        snapshot.forEach(doc => {
            chapters.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Loaded ${chapters.length} chapters from Firestore`);
        return { success: true, chapters };
        
    } catch (error) {
        console.error('❌ Error loading chapters:', error);
        return { success: false, error: error.message };
    }
}

// Update chapter in Firestore
async function updateChapterInFirestore(chapterId, updateData) {
    try {
        const db = firebase.firestore();
        await db.collection('chapters').doc(chapterId).update({
            ...updateData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Chapter updated successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error updating chapter:', error);
        return { success: false, error: error.message };
    }
}

// Delete chapter from Firestore
async function deleteChapterFromFirestore(chapterId) {
    try {
        const db = firebase.firestore();
        await db.collection('chapters').doc(chapterId).delete();
        
        console.log('✅ Chapter deleted successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error deleting chapter:', error);
        return { success: false, error: error.message };
    }
}

// Save user data to Firestore
async function saveUserToFirestore(userData) {
    try {
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(userData.uid);
        
        await userRef.set(userData, { merge: true });
        
        console.log('✅ User data saved successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error saving user data:', error);
        return { success: false, error: error.message };
    }
}

// Load user data from Firestore
async function loadUserFromFirestore(userId) {
    try {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            console.log('✅ User data loaded successfully');
            return { success: true, userData: userDoc.data() };
        } else {
            console.log('ℹ️ User document not found');
            return { success: false, error: 'User not found' };
        }
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        return { success: false, error: error.message };
    }
}

// ===== AUTHENTICATION HELPERS =====

// Sign in with Google
async function signInWithGoogle() {
    try {
        const auth = firebase.auth();
        const provider = new firebase.auth.GoogleAuthProvider();
        
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        
        console.log('✅ Google sign-in successful');
        return { success: true, user: result.user };
        
    } catch (error) {
        console.error('❌ Google sign-in error:', error);
        return { success: false, error: error.message };
    }
}

// Sign out user
async function signOutUser() {
    try {
        const auth = firebase.auth();
        await auth.signOut();
        
        console.log('✅ User signed out successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// ===== STORAGE HELPERS =====

// Upload file to Firebase Storage
async function uploadFileToStorage(file, path) {
    try {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const fileRef = storageRef.child(path);
        
        const uploadTask = await fileRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();
        
        console.log('✅ File uploaded successfully:', downloadURL);
        return { success: true, downloadURL };
        
    } catch (error) {
        console.error('❌ File upload error:', error);
        return { success: false, error: error.message };
    }
}

// ===== ANALYTICS & LOGGING =====

// Log user activity
async function logUserActivity(userId, activity, metadata = {}) {
    try {
        const db = firebase.firestore();
        
        await db.collection('userActivity').add({
            userId,
            activity,
            metadata,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
        
        console.log('✅ User activity logged:', activity);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error logging user activity:', error);
        return { success: false, error: error.message };
    }
}

// ===== OFFLINE SUPPORT =====

// Enable Firestore offline persistence
try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        firebase.firestore().enablePersistence({
            synchronizeTabs: true
        }).then(() => {
            console.log('✅ Firestore offline persistence enabled');
        }).catch((error) => {
            if (error.code === 'failed-precondition') {
                console.log('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (error.code === 'unimplemented') {
                console.log('⚠️ The current browser does not support offline persistence.');
            }
        });
    }
} catch (error) {
    console.log('⚠️ Offline persistence setup skipped:', error.message);
}

// ===== EXPORT FUNCTIONS =====

// Make functions globally available
if (typeof window !== 'undefined') {
    window.firebaseHelpers = {
        saveChapterToFirestore,
        loadChaptersFromFirestore,
        updateChapterInFirestore,
        deleteChapterFromFirestore,
        saveUserToFirestore,
        loadUserFromFirestore,
        signInWithGoogle,
        signOutUser,
        uploadFileToStorage,
        logUserActivity
    };
}

console.log('🔥 Firebase configuration and helpers loaded successfully!');

// ===== IMPORTANT SETUP NOTES =====
/*
TO SET UP FIREBASE FOR YOUR PROJECT:

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing project
3. Go to Project Settings > General > Your apps
4. Add a web app and copy the configuration
5. Replace the firebaseConfig object above with your actual config
6. Enable Authentication > Google sign-in method
7. Create Firestore database in production mode
8. Set up security rules for Firestore:

Rules for Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chapters can be read by authenticated users
    match /chapters/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Restrict this for production
    }
    
    // User activity logging
    match /userActivity/{document} {
      allow create: if request.auth != null;
    }
  }
}
```

9. Enable Firebase Storage if you plan to upload files
10. Test the connection by running the app
*/
