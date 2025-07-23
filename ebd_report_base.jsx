import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [report, setReport] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchReports();
      }
    });
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Erro ao logar: " + err.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Erro ao logar com Google: " + err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const submitReport = async () => {
    if (!report) return;
    await addDoc(collection(db, "relatorios"), {
      conteudo: report,
      criadoEm: new Date(),
      criadoPor: user.email,
    });
    setReport("");
    fetchReports();
  };

  const fetchReports = async () => {
    const snapshot = await getDocs(collection(db, "relatorios"));
    const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setReports(lista);
  };

  if (!user) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-2">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
          Entrar
        </button>
        <button onClick={loginWithGoogle} className="bg-red-600 text-white px-4 py-2 rounded">
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Bem-vindo, {user.email}</h1>
        <button onClick={logout} className="text-red-600">Sair</button>
      </div>

      <textarea
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Escreva o relatório aqui..."
        className="border p-2 w-full mb-2"
      />
      <button onClick={submitReport} className="bg-green-600 text-white px-4 py-2 rounded">
        Enviar Relatório
      </button>

      <h2 className="text-lg font-bold mt-6 mb-2">Relatórios Enviados</h2>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="border p-2 rounded">
            <p className="text-sm text-gray-700">{r.conteudo}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(r.criadoEm.seconds * 1000).toLocaleString()} - {r.criadoPor}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
// Note: Replace the placeholders in firebaseConfig with your actual Firebase project details.
// Ensure you have the necessary Firebase services enabled in your Firebase console.
// This code provides a basic structure for user authentication and report submission using Firebase.
// You can expand it further with additional features like error handling, validation, and styling as nee