const prompt = require('prompt');
const { google } = require('googleapis');
const axios = require('axios');

console.log('--------------------------');
console.log('Welcome To Push Test FCM');
console.log('--------------------------');

prompt.start();

const fcmKeyObj = [
  // Add more apps to this array as needed
  {
    app: 'Your App Name', 
    key: 'Path to Firebase Admin SDK Private Key File',
  },
];

let serviceAccountPath = '';
let regisID = '';
let projectId = '';  // Store the project ID here

console.log('Please input your project name?');
prompt.get(['ProjectName'], async function (err, project) {
  if (err) { return onErr(err); }
  console.log('Project: ' + project.ProjectName);

  for (i = 0; i < fcmKeyObj.length; i++) {
    if (fcmKeyObj[i].app === project.ProjectName) {
      serviceAccountPath = fcmKeyObj[i].key;
      console.log(`Service Account Path is ${serviceAccountPath}`);
    } else {
      serviceAccountPath = fcmKeyObj[0].key;
      console.log('Wrong project name set to default');
      console.log(`Service Account Path is ${serviceAccountPath}`);
    }
  }

  const key = require(serviceAccountPath);
  projectId = key.project_id;

  console.log('Please input registration id android?');
  prompt.get(['RegisID'], async function (err, data) {
    if (err) { return onErr('No RegisID'); }
    regisID = data.RegisID;

    if (regisID === '') {
      console.log('RegisID: ' + 'blank');
      onErr('No RegisID');
    } else {
      console.log('Use FCM payload template? "type -y for confirm"');
      prompt.get(['Confirm'], async function (err, template) {
        if (template.Confirm == '-y') {
          await sendMessageTemplate(regisID);
        } else {
          await sendMessage(regisID);
        }
      });
    }
  });
});

async function getAccessToken(serviceAccountPath) {
  const key = require(serviceAccountPath);
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/firebase.messaging'],
    null
  );

  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

async function sendMessageTemplate(registrationToken) {
  const accessToken = await getAccessToken(serviceAccountPath);

  const message = {
    message: {
      token: registrationToken,
      notification: {
        title: 'Title of FCM push notification',
        body: 'Body of FCM push notification',
      },
      data: {
        title: 'Title of FCM push notification',
        body: 'Body of FCM push notification',
        userInfo: JSON.stringify({ id: 1, type: 'session' }),
      },
    },
  };

  console.log('Ready to send!');
  console.log('#####Payload detail#####');
  console.log(`To: ${message.message.token}`);
  console.log(`Title: ${message.message.notification.title}`);
  console.log(`Body: ${message.message.notification.body}`);
  console.log('Data:');
  console.log(message.message.data);
  console.log('########################');
  console.log('Are you sure to send? "type -y for confirm"');

  prompt.get(['Input'], async function (err, result) {
    if (err) { return onErr('Message not sent'); }
    if (result.Input === '-y') {
      try {
        const response = await axios.post(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          message,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Successfully sent with response:', response.data);
      } catch (error) {
        console.log('Something has gone wrong!', error);
      }
    } else {
      onErr('Message will not be sent ^^');
    }
  });
}

async function sendMessage(registrationToken) {
  const accessToken = await getAccessToken(serviceAccountPath);

  prompt.get(['Title', 'Message', 'Count'], async function (err, messange) {
    if (err) { return onErr('No Descriptions'); }

    const message = {
      message: {
        token: registrationToken,
        notification: {
          title: messange.Title,
          body: messange.Message,
        },
        data: {
          title: messange.Title,
          body: messange.Message,
          msgcnt: messange.Count,
        },
      },
    };

    console.log('Ready to send!');
    console.log('#####Payload detail#####');
    console.log(`To: ${message.message.token}`);
    console.log(`Title: ${message.message.notification.title}`);
    console.log(`Body: ${message.message.notification.body}`);
    console.log('Data:');
    console.log(message.message.data);
    console.log('########################');
    console.log('Are you sure to send? "type -y for confirm"');

    prompt.get(['Input'], async function (err, result) {
      if (err) { return onErr('Message not sent'); }
      if (result.Input === '-y') {
        try {
          const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,  // Use the projectId here
            message,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('Successfully sent with response:', response.data);
        } catch (error) {
            console.log('Something has gone wrong!', error.response.data); // Add this line
        }
      } else {
        onErr('Message will not be sent ^^');
      }
    });
  });
}

function onErr(err) {
  console.log(err);
  return 1;
}