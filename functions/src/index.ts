import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const userNameChanged = functions.firestore
  .document('/users/{id}')
  .onUpdate((snap, context) => {
    console.log(`userName changed...`);
    let user: any = {};
    if (snap.after) {
      user = snap.after.data();
    }
    const userId = context.params.id;
    return admin
      .firestore()
      .collection(`users/${userId}/chats`)
      .get()
      .then(
        userChats => {
          console.log('got the users current chats: ', userChats);
          userChats.docs.forEach(doc => {
            const chatId = doc.data().id;
            admin
              .firestore()
              .doc(`chats/${chatId}`)
              .get()
              .then(
                chat => {
                  console.log('chat data: ', chat.data());
                  let members = [];
                  const data = chat.data();

                  if (data) {
                    members = data['users'];
                  }

                  console.log('members: ', members);
                  for (const mem of members) {
                    if (mem.id === userId) {
                      mem.userName = user.userName;
                    }
                  }

                  chat.ref
                    .update({
                      users: members
                    })
                    .then(
                      res => {
                        console.log('after userName update: ', res);
                      },
                      err => {
                        console.log('update err: ', err);
                      }
                    );
                },
                err => {
                  console.log('getting chats error: ', err);
                }
              );
          });
        },
        err => {
          console.log('err: ', err);
        }
      );
  });
