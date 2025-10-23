// import * as fs from 'fs';
// import readline from 'readline';
// import { google } from 'googleapis';
// import * as path from 'path';

// // Path to your credentials JSON
// const CREDENTIALS_PATH = path.join(__dirname, 'src', 'config', 'client_secret.json');
// const TOKEN_PATH = path.join(__dirname, 'src', 'config', 'tokens.json');

// const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
// const { client_id, client_secret } = credentials.installed; // OOB works with "installed" type
// const redirect_uris = ['urn:ietf:wg:oauth:2.0:oob'];

// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// );

// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// // Generate auth URL
// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: 'offline',
//   scope: SCOPES,
// });

// console.log('Authorize this app by visiting this URL:');
// console.log(authUrl);

// // Prompt user for code
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question('Enter the code from that page here: ', async (code) => {
//   rl.close();
//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save the tokens for future use
//     fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
//     console.log('Token stored to', TOKEN_PATH);
//   } catch (err) {
//     console.error('Error retrieving access token', err);
//   }
// });
