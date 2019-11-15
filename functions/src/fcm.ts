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
        console.log('accepterRef is', accepterRef);

        accepterRef.get()
            .then((query): any => {
                if (!query.docs[0]){
                    console.log(`No matching user docs for email ${request.accepterEmail}`);
                    return;
                }
                const accepterDoc = query.docs[0].data();
                console.log('accepterDoc is', accepterDoc);

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
                return sendNotification('notifyChatMessage', memberId, 'New Message', newMsg.message)
            })
        })
    })

export const sendNotification = function(notificationType: string, userId: string, title: string, body: string) {
    return db.collection('users')
        .doc(userId).get()
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
                }
            }
            console.log(`Sending notification to ${userId} with tokens`, userDoc.fcmTokens);
            return admin.messaging().sendToDevice(userDoc.fcmTokens, payload);
        }, err => {
            console.log(`Couldn't get the user ${userId}`);
            throw new Error(err);
        });
}