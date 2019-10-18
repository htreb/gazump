import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

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

export const sendOnFirestoreCreate = functions.firestore
    .document('contactRequests/{contactId}')
    .onCreate(async snapshot => {
        const request = snapshot.data();

        const notification: admin.messaging.Notification = {
            title: 'New Contact request!',
            body: request.email,
    }

    const payload: admin.messaging.Message = {
        notification,
        webpush: {
            notification: {
                vibrate: [200, 100, 200],
                // icon: 'www.someUrlHere.com',
                // actions: [
                //     {
                //         action: 'like',
                //         title: 'wooow',
                //     },
                //     {
                //         action: 'dislike',
                //         title: 'nooope',
                //     }
                // ]
            },
        },

        topic: 'contactRequests'
    }

    return admin.messaging().send(payload);
})
