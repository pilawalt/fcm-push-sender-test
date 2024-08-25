const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const { google } = require('googleapis');
const axios = require('axios');

console.log('--------------------------');
console.log('Welcome To Push Test FCM');
console.log('--------------------------');

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

(async function () {
  try {
    const project = await prompt([
      {
        type: 'input',
        name: 'ProjectName',
        message: 'Please input your project name:',
      },
    ]);

    console.log('Project: ' + project.ProjectName);

    let found = false;
    for (let i = 0; i < fcmKeyObj.length; i++) {
      if (fcmKeyObj[i].app === project.ProjectName) {
        serviceAccountPath = fcmKeyObj[i].key;
        console.log(`Service Account Path is ${serviceAccountPath}`);
        found = true;
        break;
      }
    }

    if (!found) {
      serviceAccountPath = fcmKeyObj[0].key;
      console.log('Wrong project name, set to default');
      console.log(`Service Account Path is ${serviceAccountPath}`);
    }

    const key = require(serviceAccountPath);
    projectId = key.project_id;

    const regisIDResponse = await prompt([
      {
        type: 'input',
        name: 'RegisID',
        message: 'Please input registration id android:',
      },
    ]);

    regisID = regisIDResponse.RegisID;

    if (!regisID) {
      console.log('RegisID: blank');
      return onErr('No RegisID');
    }

    const templateResponse = await prompt([
      {
        type: 'list',
        name: 'Confirm',
        message: 'Use FCM payload template?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (templateResponse.Confirm === 'Yes') {
      await sendMessageTemplate(regisID);
    } else {
      await sendMessage(regisID);
    }
  } catch (err) {
    onErr(err.message);
  }
})();

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
  try {
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
          screen: 'Home', // example when pass custom data        
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

    const sendConfirmation = await prompt([
      {
        type: 'list',
        name: 'Confirm',
        message: 'Are you sure to send?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (sendConfirmation.Confirm === 'Yes') {
      try {
        const response = await axios.post(
          `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
          message,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,  // Set the timeout to 10 seconds (10000 milliseconds)
          }
        );
        console.log('Successfully sent with response:', response.data);
      } catch (error) {
        if (error.response) {
          console.log('Something has gone wrong!', error.response.data);
        } else {
          console.log('Request failed:', error.message);
        }
      }
    } else {
      console.log('Message will not be sent ^^');
    }
  } catch (err) {
    onErr(err.message);
  }
}

async function sendMessage(registrationToken) {
  try {
    const accessToken = await getAccessToken(serviceAccountPath);

    const messageDetails = await prompt([
      {
        type: 'input',
        name: 'Title',
        message: 'Title:',
      },
      {
        type: 'input',
        name: 'Message',
        message: 'Message:',
      },
      {
        type: 'input',
        name: 'Count',
        message: 'Count:',
      },
    ]);

    const message = {
      message: {
        token: registrationToken,
        notification: {
          title: messageDetails.Title,
          body: messageDetails.Message,
        },
        data: {
          title: messageDetails.Title,
          body: messageDetails.Message,
          msgcnt: messageDetails.Count,
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

    const sendConfirmation = await prompt([
      {
        type: 'list',
        name: 'Confirm',
        message: 'Are you sure to send?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (sendConfirmation.Confirm === 'Yes') {
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
        if (error.response) {
          console.log('Something has gone wrong!', error.response.data);
        } else {
          console.log('Request failed:', error.message);
        }
      }
    } else {
      console.log('Message will not be sent ^^');
    }
  } catch (err) {
    onErr(err.message);
  }
}

function onErr(err) {
  console.log('Error:', err);
  return 1;
}