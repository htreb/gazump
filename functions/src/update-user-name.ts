import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore();

export const updateUserName = functions.https.onCall(
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
        batch.update(userRef, { userName });

        // update all contacts
        Object.keys(userDoc.connections).map(async contactId => {
            const contactRef = db.collection('users').doc(contactId);
            const contactSnapshot = await contactRef.get()
            if (contactSnapshot.exists) {
                batch.update(contactRef, {
                    [`connections.${userId}.userName`] : userName,
                })
            } else {
                console.log(`Couldn't find contact: ${contactId}`);
            }
        })

        // find any current contactRequests
        await db.collection('contactRequests')
            .where('requester', '==', userId)
            .get().then(query => {
                query.forEach( contactRequest => {
                    batch.update(contactRequest.ref, {
                        requesterUserName : userName,
                    })
                })
            })

        return batch.commit();
    }
)