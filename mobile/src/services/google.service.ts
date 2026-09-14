import {GoogleSignin, isSuccessResponse} from "@react-native-google-signin/google-signin";
import {getGoogleClientId} from "./auth.service";

export async function requestGoogleIdToken(): Promise<string | null> {
  const clientId = await getGoogleClientId();
  if (!clientId) throw new Error("Google sign-in has not been configured on the server yet.");
  GoogleSignin.configure({webClientId: clientId});
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  if (!response.data.idToken) throw new Error("Google did not return an ID token. Check the Android OAuth configuration.");
  return response.data.idToken;
}
