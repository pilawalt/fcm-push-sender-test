const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const fs = require('fs');
const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');

console.log('**************************');
console.log('  Starting FCM Push Test  ');
console.log('**************************');

const keysDirectory = './Keys/';

let serviceAccountPath = '';
let regisID = '';
let projectId = '';

(async function () {
  try {
    const availableKeys = fs.readdirSync(keysDirectory)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(keysDirectory, file)); 
    if (availableKeys.length === 0) {
      console.log('No service account JSON files found in the directory.');
      return;
    }

    // Prompt the user to select the project key file from the available options
    const project = await prompt([
      {
        type: 'list',
        name: 'ProjectKey',
        message: 'Please select your service account key file:',
        choices: availableKeys,
      },
    ]);

    serviceAccountPath = project.ProjectKey;
    console.log(`Service Account Path set to: ./${serviceAccountPath}`);

    const key = require(`./${serviceAccountPath}`); 
    projectId = key.project_id; 

    const regisIDResponse = await prompt([
      {
        type: 'input',
        name: 'RegisID',
        message: 'Please enter the Android registration ID:',
      },
    ]);

    regisID = regisIDResponse.RegisID;

    if (!regisID) {
      console.log('Registration ID is empty.');
      return onErr('No Registration ID provided.');
    }

    const targetTypeResponse = await prompt([
      {
        type: 'list',
        name: 'TargetType',
        message: 'Send message to:',
        choices: ['Token', 'Topic'],
      },
    ]);

    let target = '';
    if (targetTypeResponse.TargetType === 'Token') {
      target = regisID;
    } else {
      const topicResponse = await prompt([
        {
          type: 'input',
          name: 'Topic',
          message: 'Enter the topic name:',
        },
      ]);
      target = `/topics/${topicResponse.Topic}`;
    }

    const templateResponse = await prompt([
      {
        type: 'list',
        name: 'Confirm',
        message: 'Would you like to use the FCM payload template?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (templateResponse.Confirm === 'Yes') {
      await handleSendMessageLoop(sendMessageTemplate, target);
    } else {
      await handleSendMessageLoop(sendMessage, target);
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
  const accessToken = await getAccessToken(`./${serviceAccountPath}`);

  const message = {
    message: {
      token: registrationToken,
      notification: {
        title: 'Notification Title',
        body: 'This is the body of the FCM notification.',
      },
      data: {
        title: 'Custom Data Title',
        body: 'This is the body of the custom data.',
        link: 'pushnotificationcenter://associationmember/4322', // Example of passing custom data for navigation
      },
    },
  };

  await sendMessageToFCM(message, accessToken);
}

async function sendMessage(registrationToken) {
  const accessToken = await getAccessToken(`./${serviceAccountPath}`);

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

  await sendMessageToFCM(message, accessToken);
}

async function sendMessageToFCM(message, accessToken) {
  console.log('Ready for delivery!');
  console.log('##### Message Details #####');
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
      message: 'Are you sure you want to send the message?',
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
      console.log('Message successfully sent. Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('Something has gone wrong!', error.response.data);
      } else {
        console.log('Request failed:', error.message);
      }
    }
  } else {
    console.log('Message sending has been canceled.');
  }
}

async function handleSendMessageLoop(sendFunction, regisID) {
  let continueSending = true;

  while (continueSending) {
    await sendFunction(regisID);

    const continueResponse = await prompt([
      {
        type: 'list',
        name: 'Continue',
        message: 'Do you want to send another message with the same data?',
        choices: ['Yes', 'No'],
      },
    ]);

    continueSending = continueResponse.Continue === 'Yes';
  }

  console.log('Message sending process completed.');
}

function onErr(err) {
  console.log('Error:', err);
  return 1;
}