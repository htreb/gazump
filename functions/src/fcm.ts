import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore();

export const subscribeToTopic = functions.https.onCall(
    async (data, context) => {
        await admin.messaging().subscribeToTopic(data.token, data.topic);
        return `subscribed to ${data.topic}`;
    }
);

export const unsubscribeFromTopic = functions.https.onCall(
    async (data, context) => {
        await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
        return `unsubscribed from ${data.topic}`;
    }
)

export const newContactRequest = functions.firestore
    .document('contactRequests/{requestId}')
    .onCreate(async snapshot => {
        const request = snapshot.data() || {};

        // find the user who matches the accepterEmail
        console.log("the accepter is", request.accepterEmail);

        // get their userDoc and the messaging tokens on it
        const accepterRef = db.collection('users')
            .where('email', '==', request.accepterEmail).limit(1)

        accepterRef.get()
            .then((query): any => {
                if (!query.docs[0]){
                    console.log(`No matching user docs for email ${request.accepterEmail}`);
                    return;
                }
                const accepterDoc = query.docs[0].data();
                if (!accepterDoc.fcmTokens || !accepterDoc.fcmTokens.length) {
                    console.log('user does not have any notification tokens stored');
                    return
                }
                // direct the message at them
                const payload = {
                    notification: {
                        title: 'New Contact Request',
                        body: `${request.requesterUserName} (${request.requesterEmail}) wants to connect with you`,
                    }
                }

                return admin.messaging().sendToDevice(accepterDoc.fcmTokens, payload)
            }, err => {
                console.log(`Couldn't get execute the search for the user ${request.accepterEmail}`);
                throw new Error(err);
            })
    })
