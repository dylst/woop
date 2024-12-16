import readline from 'readline';
import { userLogout } from '../userLogOut'; // Adjust the path as needed

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  try {
    const confirmation = await askQuestion('Do you want to log out? (yes/no): ');

    if (confirmation.toLowerCase() === 'yes') {
      console.log('Logging out...');
      const success = await userLogout();

      if (success) {
        console.log('User logged out successfully.');
      } else {
        console.error('Logout failed.');
      }
    } else {
      console.log('Logout cancelled.');
    }
  } catch (error) {
    console.error('Error during logout test:', error);
  } finally {
    rl.close();
  }
})();
