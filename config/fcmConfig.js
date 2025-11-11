// fcmService.js
const admin = require('firebase-admin');
const { readFileSync } = require('fs');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  // readFileSync('./serviceAccountKey.json', 'utf-8')
  readFileSync(require('path').join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Function to send push notification
const sendPushNotification = async (fcmToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };


  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const sendGlobalNotification = async (title, body, data, topic = 'global') => {
  const message = {
    notification: {
      title,
      body,
    },
    data: mapDataToString(data),
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Global notification sent to topic '${topic}':`, response);
  } catch (error) {
    console.error('Error sending global notification:', error);
  }
};

const mapDataToString = (data) => {
  const result = {};
  for (const key in data) {
    result[key] = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
  }
  return result;
};

module.exports = {
  sendPushNotification,
  sendGlobalNotification,
  mapDataToString
};
