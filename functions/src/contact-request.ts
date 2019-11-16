import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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
    if (data && data.requester && data.accepter) {
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
                    },
                contactRequests: admin.firestore.FieldValue.arrayRemove({
                    email: accepterData.email,
                    requestId: context.params.requestId,
                })
            })
            batch.update(requesterRef, {
                [`connections.${accepterSnapshot.id}`]: {
                    email: accepterData.email,
                    userName: accepterData.userName,
                }
            })
            batch.delete(db.doc(`contactRequests/${context.params.requestId}`));
            await batch.commit();
            console.log(`Successfully connected requester: ${requesterSnapshot.id} to accepter: ${accepterSnapshot.id}`)
        } else {
            console.log(`Couldn't find both parties, requester: ${requesterSnapshot.id}, accepter: ${accepterSnapshot.id}`)
        }
    } else {
        console.log('Missing requester or accepter data is', data);
    }
});