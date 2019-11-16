const admin = require("firebase-admin");
const serviceAccount = require("../key/admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gazump-46a24.firebaseio.com"
});

// export { userNameChanged } from './user-name-changed';
export { completeContactRequest } from './contact-request';
export {
    subscribeToTopic,
    unsubscribeFromTopic,
    notifyMembers,
    newContactRequest,
    newChatMessage,
    sendNotification,
} from './fcm';