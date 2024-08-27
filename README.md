![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)


# FCM Push Sender Test
A tool for testing Firebase Cloud Messaging (FCM) on mobile apps. It helps send push notifications to make sure everything works correctly and allows developers to check their FCM setup.

## Features
- Send FCM push notifications to test mobile apps.
- Simple setup with minimal dependencies.
- Easy-to-use command-line interface.

## Installation

Clone the repository:
```sh
git clone https://github.com/koonmolo/fcm-push-sender-test.git
```

Navigate to the project directory:
```sh
cd fcm-push-sender-test
```

Install the dependencies:
```sh
npm install
```

## Usage

1. Copy your Firebase Admin SDK private key file to "Keys" folder.
   
2. Update the code to link to the private key file. Example:

To start the FCM push sender, run:
```sh
 npm start

## References

- **Creating a Sender Token:**  
  You can create a sender token from the Firebase console. Visit the following link for more details:  
  [Firebase Console](https://console.firebase.google.com/)

- **Configuring APNs with FCM:**  
  Learn how to configure Apple Push Notification Service (APNs) with Firebase Cloud Messaging (FCM) by following the official documentation:  
  [Configuring APNs with FCM](https://firebase.google.com/docs/cloud-messaging/ios/certs)

- **Adding the Firebase Admin SDK to Your Server:**  
  Set up the Firebase Admin SDK on your server to send push notifications and manage Firebase services. Follow the guide here:  
  [Add the Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
