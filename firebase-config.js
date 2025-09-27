// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6vgbuxtvA0t__uBXpcxlHNmKGX6swF2I",
    authDomain: "lingualeap-3535f.firebaseapp.com",
    projectId: "lingualeap-3535f",
    storageBucket: "lingualeap-3535f.firebasestorage.app",
    messagingSenderId: "464130080922",
    appId: "1:464130080922:web:2a4d9afe1da32ee4b4df23"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Test Firebase connection
async function testFirebaseConnection() {
    console.log("--- Starting Firebase Connection Test ---");
    const testDocRef = db.collection('test_connection').doc('test_doc');
    
    try {
        console.log("Attempting to write to test_connection/test_doc...");
        await testDocRef.set({
            status: "ok",
            timestamp: new Date()
        });
        console.log("✅ Firestore Write Successful!");
        
        console.log("Attempting to read from test_connection/test_doc...");
        const docSnap = await testDocRef.get();
        if (docSnap.exists) {
            console.log("✅ Firestore Read Successful!");
            console.log("Document data:", docSnap.data());
        } else {
            console.error("❌ Firestore Read FAILED: Document does not exist after successful write.");
        }
    } catch (error) {
        console.error("❌ Firebase Connection FAILED:", error);
    } finally {
        console.log("--- Firebase Connection Test Finished ---");
    }
}

// Upload data to Firestore
async function uploadData(collectionName, docId, data) {
    try {
        await db.collection(collectionName).doc(docId).set(data, { merge: true });
        console.log(`Successfully uploaded data to ${collectionName}/${docId}`);
    } catch (error) {
        console.error(`Error uploading data to ${collectionName}/${docId}:`, error);
    }
}

// Fetch data from Firestore
async function fetchData(collectionName, docId) {
    try {
        const docRef = db.collection(collectionName).doc(docId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            console.log(`Successfully fetched data from ${collectionName}/${docId}`);
            return docSnap.data();
        } else {
            console.log(`No such document found at ${collectionName}/${docId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching data from ${collectionName}/${docId}:`, error);
        return null;
    }
}

// Update daily streak
async function updateDailyStreak(userId) {
    try {
        const userRef = db.collection('userProgress').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const lastLogin = userData.lastLogin;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            let newStreak = userData.dailyStreak || 0;
            
            if (lastLogin) {
                const lastLoginDate = lastLogin.toDate();
                const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
                const daysDiff = Math.floor((today - lastLoginDay) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 1) {
                    // Consecutive day - increment streak
                    newStreak += 1;
                } else if (daysDiff > 1) {
                    // Missed days - reset streak
                    newStreak = 1;
                }
                // If daysDiff === 0, it's the same day, keep streak as is
            } else {
                // First login
                newStreak = 1;
            }
            
            await userRef.update({
                dailyStreak: newStreak,
                lastLogin: firebase.firestore.Timestamp.fromDate(now)
            });
            
            return newStreak;
        }
    } catch (error) {
        console.error('Error updating daily streak:', error);
        return 0;
    }
}

// Get user dashboard stats
async function getUserDashboardStats(userId) {
    try {
        const userData = await fetchData('userProgress', userId);
        if (userData) {
            return {
                success: true,
                data: {
                    points: userData.points || 0,
                    level: userData.level || 1,
                    dailyStreak: userData.dailyStreak || 0
                }
            };
        } else {
            return {
                success: false,
                error: 'User data not found'
            };
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export functions for use in app.js
window.firebaseUtils = {
    auth,
    db,
    testFirebaseConnection,
    uploadData,
    fetchData,
    updateDailyStreak,
    getUserDashboardStats
};