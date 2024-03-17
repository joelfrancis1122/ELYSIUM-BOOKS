  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDiTZn_zLvCy3A5NjTSmGWOu4QXSmuehII",
    authDomain: "rich-discovery-417406.firebaseapp.com",
    projectId: "rich-discovery-417406",
    storageBucket: "rich-discovery-417406.appspot.com",
    messagingSenderId: "457503730213",
    appId: "1:457503730213:web:cc258de1522962480e2dcc",
    measurementId: "G-HGCRCDB82G"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
