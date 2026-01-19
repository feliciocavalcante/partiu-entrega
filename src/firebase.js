import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Essas informações você copia da engrenagem (Configurações do Projeto) no Console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAlSxbaaDNlcXdrstT2jqnrVD2Nb3Uo3u8",
  authDomain: "partiuentrega-5224e.firebaseapp.com",
  projectId: "partiuentrega-5224e",
  storageBucket: "partiuentrega-5224e.firebasestorage.app",
  messagingSenderId: "1059630874971",
  appId: "1:1059630874971:web:3e8d3543dcc0f6c79dda7e"
};

const app = initializeApp(firebaseConfig);

// Exportamos o 'db' para usar nos nossos componentes
export const db = getFirestore(app);