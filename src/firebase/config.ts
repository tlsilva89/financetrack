import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "###",
  authDomain: "###",
  projectId: "###",
  storageBucket: "###",
  messagingSenderId: "###",
  appId: "###",
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Obter instâncias de serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

// Habilitar persistência offline para o Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn(
      "Persistência do Firestore não pode ser habilitada: múltiplas abas abertas."
    );
  } else if (err.code === "unimplemented") {
    console.warn("Persistência do Firestore não é suportada neste navegador.");
  } else {
    console.error("Erro ao habilitar persistência do Firestore:", err);
  }
});

// Importar funções necessárias para a função initializeUserData
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Função para inicializar dados do usuário após o primeiro login
export const initializeUserData = async (userId: string) => {
  try {
    // Verificar se o documento do usuário já existe
    const userDocRef = doc(db, `users/${userId}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Criar documento de usuário com metadados
      await setDoc(userDocRef, {
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      console.log("Dados iniciais do usuário criados com sucesso");
    } else {
      // Atualizar último login
      await updateDoc(userDocRef, {
        lastLogin: new Date(),
      });
    }
  } catch (error) {
    console.error("Erro ao inicializar dados do usuário:", error);
  }
};
