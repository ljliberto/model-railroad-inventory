# Google Drive Integration Setup

This guide explains how to set up Google Drive export functionality for the Model Railroad Inventory application.

## Overview

The application now supports exporting your inventory directly to Google Drive. This feature uses Google's OAuth 2.0 authentication and the Google Drive API to securely upload Excel files to your personal Google Drive.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Model Railroad Inventory")
4. Click "Create"

### 2. Enable the Google Drive API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for personal use)
   - App name: "Model Railroad Inventory"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Skip this step (click "Save and Continue")
   - Test users: Add your Google account email
   - Click "Save and Continue"
4. Back to creating OAuth client ID:
   - Application type: "Web application"
   - Name: "Model Railroad Inventory Web Client"
   - Authorized JavaScript origins:
     - Add `http://localhost:5173` (for development)
     - Add your production URL if deploying
   - Authorized redirect URIs: Leave empty for this use case
   - Click "Create"
5. Copy the **Client ID** shown in the popup

### 4. Create an API Key

1. Still in "Credentials", click "Create Credentials" → "API Key"
2. Copy the **API Key** shown
3. (Optional but recommended) Click "Restrict Key":
   - API restrictions: Select "Restrict key"
   - Check "Google Drive API"
   - Click "Save"

### 5. Configure the Application

1. Navigate to the `client` directory of the project
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your credentials:
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your-actual-api-key
   ```
4. Save the file

### 6. Restart the Development Server

If the application is running, restart it to load the new environment variables:
```bash
npm run dev
```

## Usage

Once configured:

1. **Export**: Click the "Export to Excel" button in the inventory section
2. **Choose Destination**: A modal will appear with two options:
   - **Export to this Device**: Downloads the file to your computer
   - **Export to Google Drive**: Uploads to your Google Drive
3. **Google Drive Flow** (if you choose Google Drive):
   - If not signed in, you'll be prompted to sign in to Google
   - After signing in, a folder picker will appear
   - Select the folder where you want to save the file
   - Click "Select" to upload
4. **Sign Out** (optional): If signed in to Google, you can sign out from the export modal

The exported file will be named: `ModelRailroadInventory-YYYY-MM-DD.xlsx`

## Security Notes

- **Keep credentials private**: Never commit `.env` files to version control
- **Scopes**: The app only requests `drive.file` scope, which allows it to manage only files it creates
- **OAuth consent**: For personal use, you can keep the app in "Testing" mode
- **Production deployment**: Update authorized JavaScript origins with your production URL

## Troubleshooting

### "Google Drive integration not configured" warning in console
- Ensure `.env` file exists in the `client` directory
- Verify environment variable names start with `VITE_`
- Restart the dev server after creating/editing `.env`

### Google Drive option not showing in export modal
- Check the browser console for Google API initialization errors
- Verify both `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` are set
- Make sure authorized JavaScript origins include your current URL

### "Sign in failed" error
- Check that authorized JavaScript origins include your current URL
- Verify OAuth consent screen is properly configured
- Clear browser cache and cookies for Google accounts

### Folder picker doesn't appear
- Ensure you're signed in to Google (check the export modal footer)
- Check browser console for picker API errors
- Verify the API key is correctly configured

### "Upload failed" error
- Ensure Google Drive API is enabled in your project
- Check that you're signed in to Google
- Verify API key restrictions don't block the Drive API

## File Location

When uploading to Google Drive, you can choose which folder to save the file in using the folder picker. The file will be saved with the name:

```
ModelRailroadInventory-YYYY-MM-DD.xlsx
```

You can rename or move it within Google Drive after upload.

## Privacy

- Files are uploaded directly to your personal Google Drive
- You choose which folder to save files in using Google's folder picker
- No data is sent to any other servers
- The app only accesses files it creates (not other Drive files)
- You can revoke access anytime from [Google Account Settings](https://myaccount.google.com/permissions)
