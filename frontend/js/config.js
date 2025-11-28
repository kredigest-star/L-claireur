const APP_CONFIG = {
    name: "L'Éclaireur",
    tagline: "La lumière sur l'actualité",
    version: '1.0.0',
    categories: [
        { id: 'politique', name: 'Politique' },
        { id: 'monde', name: 'Monde' },
        { id: 'economie', name: 'Économie' },
        { id: 'sciences', name: 'Sciences' },
        { id: 'culture', name: 'Culture' },
        { id: 'sports', name: 'Sports' }
    ]
};

const firebaseConfig = {
    apiKey: "AIzaSyCcCk909YsrCvlAeQen_1MyWt6DSfZ5Hso",
    authDomain: "leclaireur-8157a.firebaseapp.com",
    projectId: "leclaireur-8157a",
    storageBucket: "leclaireur-8157a.firebasestorage.app",
    messagingSenderId: "656301991544",
    appId: "1:656301991544:web:49c283c2c9618b92542f8d"
};

window.APP_CONFIG = APP_CONFIG;
window.firebaseConfig = firebaseConfig;
