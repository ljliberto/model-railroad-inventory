// Google API TypeScript declarations
// This file provides type definitions for the Google API client library

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
        drive?: {
          files: {
            create: (params: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
            listen: (callback: (isSignedIn: boolean) => void) => void;
          };
          signIn: () => Promise<void>;
          signOut: () => Promise<void>;
          currentUser: {
            get: () => {
              getAuthResponse: () => {
                access_token: string;
              };
            };
          };
        };
      };
    };
    google: {
      picker: {
        PickerBuilder: new () => {
          addView: (view: any) => any;
          setOAuthToken: (token: string) => any;
          setDeveloperKey: (key: string) => any;
          setCallback: (callback: (data: any) => void) => any;
          build: () => {
            setVisible: (visible: boolean) => void;
          };
        };
        ViewId: {
          FOLDERS: any;
        };
        Action: {
          PICKED: string;
          CANCEL: string;
        };
      };
    };
  }
}

export {};
