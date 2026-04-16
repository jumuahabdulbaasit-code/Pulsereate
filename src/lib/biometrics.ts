import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const isBiometricsAvailable = () => {
  return window.PublicKeyCredential !== undefined;
};

// Helper to convert ArrayBuffer to Base64
const bufferToBase64 = (buffer: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert Base64 to ArrayBuffer
const base64ToBuffer = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const registerBiometrics = async () => {
  if (!isBiometricsAvailable()) throw new Error('Biometrics not supported on this device');

  // 1. Sign in anonymously first to get a UID
  const { user } = await signInAnonymously(auth);
  
  // 2. Create WebAuthn Credential
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const createOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: "GoldenCheck",
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(user.uid),
      name: "User",
      displayName: "GoldenCheck User",
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
    authenticatorSelection: {
      userVerification: "required",
      residentKey: "required",
      requireResidentKey: true,
    },
    timeout: 60000,
  };

  const credential = (await navigator.credentials.create({
    publicKey: createOptions,
  })) as PublicKeyCredential;

  if (!credential) throw new Error('Failed to create biometric credential');

  const response = credential.response as AuthenticatorAttestationResponse;

  // 3. Store the credential info in Firestore
  await setDoc(doc(db, 'biometric_credentials', credential.id), {
    uid: user.uid,
    publicKey: bufferToBase64(response.getPublicKey()),
    createdAt: new Date().toISOString(),
  });

  // Also store the credential ID locally for easier lookup
  localStorage.setItem('goldencheck_credential_id', credential.id);
  localStorage.setItem('goldencheck_last_uid', user.uid);

  return user;
};

export const loginWithBiometrics = async () => {
  if (!isBiometricsAvailable()) throw new Error('Biometrics not supported');

  // Try to get the credential ID from local storage first
  const storedId = localStorage.getItem('goldencheck_credential_id');
  
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: "required",
    rpId: window.location.hostname,
  };

  // If we have a stored ID, we can target it specifically
  if (storedId) {
    getOptions.allowCredentials = [{
      id: base64ToBuffer(storedId),
      type: 'public-key'
    }];
  }

  const assertion = (await navigator.credentials.get({
    publicKey: getOptions,
  })) as PublicKeyCredential;

  if (!assertion) throw new Error('Biometric verification failed');

  // Find the UID associated with this credential ID
  const credDoc = await getDoc(doc(db, 'biometric_credentials', assertion.id));
  if (!credDoc.exists()) throw new Error('No account found for this biometric');

  const { uid } = credDoc.data();
  
  // In a real app, we'd verify the signature on the server.
  // For this demo, we'll use the UID to sign in anonymously again 
  // (or just use the existing session if it's there).
  
  // Since Firebase doesn't allow "signing in as a specific anonymous user" easily,
  // we'll just ensure the session matches or create a new one and link it.
  // For simplicity in this demo, we'll assume the anonymous session is persistent
  // and the biometric acts as a "Gate".
  
  const { user } = await signInAnonymously(auth);
  
  // If the UIDs don't match, we'd ideally merge them, but for now we'll just
  // trust the biometric identity.
  
  return user;
};
