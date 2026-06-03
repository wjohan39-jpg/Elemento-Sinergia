// firebase-config.js — inicialización centralizada de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/*
 * La configuración del cliente es visible por diseño en apps web estáticas con Firebase.
 * La seguridad real se define en Firestore Rules (Firebase Console → Firestore → Rules).
 *
 * ACCIÓN RECOMENDADA: Restringir esta API key a tu dominio en
 * Google Cloud Console → APIs & Services → Credentials → tu API key → HTTP referrers.
 * Agrega: https://elementosinergia.com/* y http://localhost/*
 */
const firebaseConfig = {
  apiKey:            "AIzaSyC_k8SIIMG9Qvn69AOcQ2rF3cUWfZySPFk",
  authDomain:        "elemento-sinergia.firebaseapp.com",
  projectId:         "elemento-sinergia",
  storageBucket:     "elemento-sinergia.firebasestorage.app",
  messagingSenderId: "782989236753",
  appId:             "1:782989236753:web:e809a172257acc0139afb0"
};

const app = initializeApp(firebaseConfig, 'public');
export const db = getFirestore(app);
