import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore();

export const updateUserName = functions.https.onCall(

    // using batch.set instead of update
    // if a users contacts doc is not there any more then instead of the batch failing it will create a new one.
    // saves the updateUserName from failing but it could creat 'ghost' userDocs? something to watch out for.

    async (data, context) => {
        const userId = context && context.auth && context.auth.uid;
        const userName = data.userName;
        if (!userId || !userName) {
            console.log('Missing parameters', data);
            return;
        }
        const batch = db.batch()
        const userRef = db.collection('users').doc(userId);
        const userSnapshot = await userRef.get();
        const userDoc = userSnapshot.data();
        if (!userDoc) {
            console.log('No userDoc', userDoc);
            return;
        }
        batch.set(userRef, { userName }, { merge: true });

        // update all contacts
        Object.keys(userDoc.connections).map(contactId => {
            batch.set(db.collection('users').doc(contactId), {
                    [`connections.${userId}.userName`] : userName,
            }, { merge: true })
        })

        // find any current contactRequests
        await db.collection('contactRequests')
            .where('requester', '==', userId)
            .get().then(query => {
                query.forEach( contactRequest => {
                    batch.set(contactRequest.ref, {
                        requesterUserName : userName,
                    }, { merge: true })
                })
            })

        return batch.commit();
    }
)