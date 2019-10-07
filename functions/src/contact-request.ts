import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * watches for UPDATES in the "contactRequests" collection
 * If a user sets the accepted field to true and sets their user Id.
 * then this cloud function will batch write the details
 * of the requester to the accepters user docs and vice versa.
 * If successful then deletes the contactRequests doc which called it.
 */
export const completeContactRequest = functions.firestore
.document('contactRequests/{requestId}')
.onUpdate(async (snapshot, context) => {
    const data = snapshot.after.data();
    if (data && data.requester && data.accepter && data.accepted) {
        const requesterRef = db.doc(`users/${data.requester}`);
        const accepterRef = db.doc(`users/${data.accepter}`);
        const requesterSnapshot = await requesterRef.get();
        const accepterSnapshot = await accepterRef.get();
        const requesterData = requesterSnapshot.data();
        const accepterData = accepterSnapshot.data();
        if (requesterData && accepterData) {
            const batch = db.batch()
            batch.update(accepterRef, {
                [`connections.${requesterSnapshot.id}`]: {
                        email: requesterData.email,
                        userName: requesterData.userName,
                    }})
            batch.update(requesterRef, {
                [`connections.${accepterSnapshot.id}`]: {
                    email: accepterData.email,
                    userName: accepterData.userName,
                }})
            await batch.commit();
            console.log(`Successfully connected requester: ${requesterSnapshot.id} to accepter: ${accepterSnapshot.id}`)
            await db.doc(`contactRequests/${context.params.requestId}`).delete();
        } else {
            console.log(`Couldn't find both parties, requester: ${requesterSnapshot.id}, accepter: ${accepterSnapshot.id}`)
        }
    } else {
        console.log('Missing requester, accepter or accepted status, data is', data);
    }
});