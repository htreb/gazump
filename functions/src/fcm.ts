import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { DocumentReference } from '@google-cloud/firestore';

const db = admin.firestore();

export const subscribeToTopic = functions.https.onCall(
    async (data) => {
        await admin.messaging().subscribeToTopic(data.token, data.topic);
        return `subscribed to ${data.topic}`;
    }
);

export const unsubscribeFromTopic = functions.https.onCall(
    async (data) => {
        await admin.messaging().unsubscribeFromTopic(data.token, data.topic);
        return `unsubscribed from ${data.topic}`;
    }
)

export const notifyMembers = functions.https.onCall(
    async (data, context) => {
        if (data && data.members && data.messageType && data.title && data.body) {
            const uid = context && context.auth && context.auth.uid;
            const members = data.members.filter((memberId: string) => memberId !== uid);
            if (!members.length) {
                console.log('No members left after removing myself', members)
            }
            else {
                members.map((memberId: string) => {
                    console.log('Sending notification to :', memberId);
                    const memberRef = db.collection('users').doc(memberId)
                    return sendNotification(data.messageType, memberRef, data.title, data.body)
                })
            }
        } else {
            console.log('Missing properties', data);
        }

    }
)

export const newContactRequest = functions.firestore
    .document('contactRequests/{requestId}')
    .onCreate(async snapshot => {
        const request = snapshot.data() || {};
        console.log("the accepter email is", request.accepterEmail);

        // query the users to find who need to accept this request
        const queryRef = db.collection('users')
            .where('email', '==', request.accepterEmail).limit(1)

        queryRef.get()
            .then((query): any => {
                if (!query.docs[0]){
                    console.log(`No matching user docs for email ${request.accepterEmail}`);
                    return;
                }
                const accepterRef = query.docs[0].ref;
                const notificationBody = `${request.requesterUserName} wants to connect with you`;
                return sendNotification('notifyContactRequest', accepterRef, 'New Contact Request', notificationBody);
            }, err => {
                console.log(`Couldn't execute the search for the user ${request.accepterEmail}`);
                throw new Error(err);
            })
    })

export const newChatMessage = functions.firestore
    .document('chats/{chatId}')
    .onUpdate((change: functions.Change<any>) => {
        const beforeUpdate = change.before.data();
        const afterUpdate = change.after.data();
        const newMessages:any = {};
        Object.keys(afterUpdate.messages).map(messageId => {
            if (!beforeUpdate.messages || !beforeUpdate.messages[messageId]) {
                newMessages[messageId] = afterUpdate.messages[messageId];
            }
        })
        // Get the other chat members Ids
        return Object.values(newMessages).map((newMsg: any) => {
            const otherMembers = afterUpdate.members.filter((memberId: string) => memberId !== newMsg.from);
            console.log('New chat message, other members ids to send notifications to', otherMembers);
            otherMembers.map((memberId: string) => {
                const memberRef = db.collection('users').doc(memberId)
                return sendNotification('notifyChatMessage', memberRef, 'New Message', newMsg.message)
            })
        })
    })

export const sendNotification = function(notificationType: string, userRef: DocumentReference, title: string, body: string) {
    return userRef.get()
        .then((userDocSnapshot): any => {
            const userDoc = userDocSnapshot.data()
            if (!userDoc || !userDoc.fcmTokens || !userDoc.fcmTokens.length) {
                console.log('User does not have any notification tokens stored');
                return
            }
            if (!userDoc[notificationType]) {
                console.log(`User has ${notificationType} notifications turned off`);
                return;
            }
            const payload = {
                notification: {
                    title,
                    body,
                    "click_action":"https://gazumpd.com"
                }
            }
            console.log(`Sending notification to ${userDoc.email} with tokens`, userDoc.fcmTokens);
            return admin.messaging().sendToDevice(userDoc.fcmTokens, payload);
        }, err => {
            console.log(`Couldn't get the user`);
            throw new Error(err);
        });
}