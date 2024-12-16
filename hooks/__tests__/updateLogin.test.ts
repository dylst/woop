import readline from 'readline';
import { updateLogin } from '../updateLogin'; // Adjust the path to your updateLogin function file

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  try {
    const currentEmail = await askQuestion('Enter your current email: ')
    const currentPassword = await askQuestion('Enter your current password: ')
    const email = await askQuestion('Enter the email to update: ');
    const password = await askQuestion('Enter the new password: ');


    console.log('Attempting to update user login...');
    const data = await updateLogin(email, password, currentEmail, currentPassword);

    if (data) {
      console.log('Update successful:', data);
    } else {
      console.error('Update failed.');
    }
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    rl.close();
  }
})();
