import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

admin.initializeApp();
const db = admin.firestore();

export const createUserDocument = functions.auth
    .user() // Trigger 
    .onCreate(async (user) => { // On creation of a user, run this function
        db.collection('users') // Access 'users' collection or creates it if it doesnt exist
            .doc(user.uid) // Creates a reference to a document with the user uid
            .set(JSON.parse(JSON.stringify(user))) // Sets the information in the document to the user
    });