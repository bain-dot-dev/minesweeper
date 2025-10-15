# Minesweeper Game - World ID Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# World ID Configuration
# Get these values from the World ID Developer Portal
NEXT_PUBLIC_APP_ID=app_your_app_id_here
NEXT_PUBLIC_ACTION=your_action_id_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Setup Steps

### ⚠️ **CRITICAL: App ID Configuration**

The `NEXT_PUBLIC_APP_ID` is **required** for MiniKit to function. Without it, you'll see the error "App ID not provided during install".

1. **Create a World ID App** (REQUIRED):

   - Go to the [World ID Developer Portal](https://developer.worldcoin.org/)
   - Create a new app
   - Copy the `APP_ID` and set it as `NEXT_PUBLIC_APP_ID`
   - **This step is mandatory** - the app won't work without it

2. **Create an Incognito Action** (Optional - for World ID verification):

   - In the Developer Portal, go to "Incognito Actions"
   - Create a new action for your minesweeper game
   - Copy the `ACTION_ID` and set it as `NEXT_PUBLIC_ACTION`

3. **Set NextAuth Secret**:
   - Generate a random secret for NextAuth
   - You can use: `openssl rand -base64 32`

### 🔧 **Environment Variables Priority**

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_APP_ID=app_your_actual_app_id_here  # ← This is CRITICAL
NEXT_PUBLIC_ACTION=your_action_id_here          # ← Optional for World ID verification
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 📱 **Testing Requirements**

According to World ID documentation:

- **MiniKit ONLY works inside World App** - not in regular browsers
- **Use tunneling services** for local testing (ngrok, zrok, tunnelmole)
- **Test with QR codes** using the World ID testing tool
- **HTTPS required** for production deployment

## Authentication Flow

The implementation follows World ID best practices with **hybrid authentication methods**:

### 🌐 **Browser Environment (IDKit)**

- **Purpose**: World ID verification for users in regular browsers
- **Method**: Uses `IDKitWidget` from `@worldcoin/idkit`
- **Benefits**: Works in any browser, QR code verification
- **Security**: Server-side proof validation using `verifyCloudProof`

### 📱 **World App Environment (MiniKit)**

- **Purpose**: World ID verification for users in World App
- **Method**: Uses `MiniKit.commandsAsync.verify()` with incognito actions
- **Benefits**: Native World App integration, seamless verification
- **Security**: Server-side proof validation using `verifyCloudProof`

## Key Features

- ✅ **Hybrid Authentication** - IDKit for browsers, MiniKit for World App
- ✅ **World ID Verification** for both environments
- ✅ **Server-side validation** for all authentication methods
- ✅ **Username input** with validation for World ID verification
- ✅ **Error handling** and user feedback with LiveFeedback components
- ✅ **Responsive UI** with loading states
- ✅ **Environment detection** - automatically shows appropriate verification method
- ✅ **Proper security** - all proofs verified server-side
- ✅ **Minesweeper Game** - Complete game implementation with authentication

## Usage

### 🌐 **In Browser**

1. **World ID Verification**: Users verify their identity using QR code
2. **Username Input**: Enter username for verification signal
3. **Game Access**: After successful verification, access the minesweeper game

### 📱 **In World App**

1. **World ID Verification**: Users verify their human identity using World ID
2. **Username Input**: Enter username for verification signal
3. **Game Access**: After successful verification, access the minesweeper game

## Security Notes

- All authentication proofs are verified server-side
- World ID verification uses incognito actions to prevent replay attacks
- Never trust client-side data - always verify on the backend
- Simplified auth system focused on World ID verification only

## Troubleshooting

### Common Issues

1. **"App ID not provided during install"**

   - **Cause**: Missing or incorrect `NEXT_PUBLIC_APP_ID` environment variable
   - **Solution**: Ensure your `.env.local` file contains the correct app ID from the World ID Developer Portal
   - **Format**: Must start with `app_` (e.g., `app_staging_12345`)
   - **Note**: MiniKitProvider doesn't need the appId prop - it's handled internally

2. **MiniKit commands not working**

   - **Cause**: App not running in World App environment
   - **Solution**: Test your app by opening it in World App, not in a regular browser

3. **Verification level issues**

   - **Cause**: Using Device verification level instead of Orb
   - **Solution**: Use `VerificationLevel.Orb` as the default (recommended by World ID docs)
   - **Note**: Device verification is less secure and not recommended for production

4. **Verification failing**

   - **Cause**: Incorrect action ID or app ID configuration
   - **Solution**: Double-check both `NEXT_PUBLIC_APP_ID` and `NEXT_PUBLIC_ACTION` in your environment variables

5. **Wallet authentication not working**
   - **Cause**: Missing NextAuth configuration
   - **Solution**: Ensure `NEXTAUTH_SECRET` is set and the app is running on the correct URL

### Testing Your Setup

1. **Check Environment Variables**:

   ```bash
   # In your terminal, verify your .env.local file exists and contains:
   cat .env.local
   ```

2. **Test in World App**:

   - Deploy your app to a public URL (use ngrok for local testing)
   - Open the URL in World App
   - Try both authentication methods

3. **Check Console Logs**:
   - Open browser dev tools
   - Look for any MiniKit-related errors
   - Verify the app ID is being loaded correctly
