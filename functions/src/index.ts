const admin = require("firebase-admin");
const serviceAccount = require("../key/admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gazump-46a24.firebaseio.com"
});

export { completeContactRequest } from './contact-request';
export { updateUserName } from './update-user-name';
export {
    subscribeToTopic,
    unsubscribeFromTopic,
    notifyMembers,
    newContactRequest,
    newChatMessage,
    sendNotification,
} from './fcm';