const prompt = require('prompt');
const FCM = require('fcm-node');

console.log('--------------------------');
console.log('Welcome To Push Test FCM');
console.log('--------------------------');

prompt.start();

const fcmKeyObj = [
    {
      app: 'YOUR-APP-NAME', key: 'YOUR-FCM-KEY',
    }
];

let serverKey = '';
let regisID = '';

console.log('Please input your project name?');
prompt.get(['ProjectName'], function (err, project) {
    if (err) { return onErr(err); }
    console.log('Project: ' + project.ProjectName);
        for (i = 0; i < fcmKeyObj.length; i++) {
            if (fcmKeyObj[i].app === project.ProjectName) {
                serverKey = fcmKeyObj[i].key
                console.log(`ServerKey is ${serverKey}`);
            }else{
                serverKey = fcmKeyObj[0].key
                console.log('Wrong project name set to default');
                console.log(`ServerKey is ${serverKey}`);
            }
        }
        console.log('Please input registration id android?');
        prompt.get(['RegisID'], function (err, data) {
            if (err) { return onErr('No RegisID'); }
            regisID = data.RegisID
            console.log('Please input descriptions of messange?');
            if (regisID === '') {
                console.log('RegisID: ' + 'blank');
                onErr('No RegisID');
            } else {
                console.log('Use fcm payload template? "type -y for confirm"');
                prompt.get(['Confirm'], function (err, template) {
                    if(template.Confirm == '-y'){
                        sendMessageTemplate(regisID);
                    }else{
                        sendMessage(regisID);
                    }
                });
            }
        });
});

const sendMessageTemplate = (registrationToken) => {
    const fcm = new FCM(serverKey);
    const messageTp = {
        to: registrationToken,
        notification: {
            title: 'Title of fcm push notification',
            body: 'Body of fcm push notification',
        },
        data: {
            title: 'Title of fcm push notification',
            body: 'Body of fcm push notification',
            msgcnt: 1,
            style: 'inbox',
            summaryText: 'There are %n% notifications',
            ledColor: [0, 51, 255, 255],
            vibrationPattern: [200, 700, 0, 0],
            priority: 'high',
            userInfo: {id: 1, type: "session"},
        }
    };
    console.log('Ready to send!');
    console.log('#####Payload detail#####');
    console.log(`To: ${messageTp.to}`);
    console.log(`Title: ${messageTp.notification.title}`);
    console.log(`Body: ${messageTp.notification.body}`);
    console.log('Data:');
    console.log(messageTp.data);
    console.log('########################');
    console.log('Are you sure to send? "type -y for confirm"');
    prompt.get(['Input'], function (err, result) {
        if (err) { return onErr('Message not send'); }
        if (result.Input === '-y') {
            fcm.send(messageTp, function(err, response){
                if (err) {
                    console.log('Something has gone wrong!', err);
                } else {
                    console.log('Successfully sent with response: ', response);
                }
            });
        } else {
            onErr('Message will not send ^^');
        }
    });
}

const sendMessage = (registrationToken) => {
    const fcm = new FCM(serverKey);
    prompt.get(['Title', 'Messange', 'Count'], function (err, messange) {
        if (err) { return onErr('No Descriptions'); }
        console.log('Title: ' + messange.Title);
        console.log('Messange: ' + messange.Messange);
        console.log('Count: ' + messange.Count);
        const message = {
            to: registrationToken,
            notification: {
                title: messange.Title,
                body: messange.Messange,
                badge: 1
            },
            data: {
                title: messange.Title,
                body: messange.Messange,
                msgcnt: messange.Count,
                style: 'inbox',
                summaryText: 'There are %n% notifications',
                ledColor: [0, 51, 255, 255],
                vibrationPattern: [200, 700, 0, 0],
            }
        };
        console.log('Ready to send!');
        console.log('#####Payload detail#####');
        console.log(`To: ${message.to}`);
        console.log(`Title: ${message.notification.title}`);
        console.log(`Body: ${message.notification.body}`);
        console.log('Data:');
        console.log(message.data);
        console.log('########################');
        console.log('Are you sure to send? "type -y for confirm"');
        prompt.get(['Input'], function (err, result) {
            if (err) { return onErr('Message not send'); }
            if (result.Input === '-y') {
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log('Something has gone wrong!', err);
                    } else {
                        console.log('Successfully sent with response: ', response);
                    }
                });
            } else {
                onErr('Message will not send ^^');
            }
        });
    });
}

const onErr = (err) => {
    console.log(err);
    return 1;
};