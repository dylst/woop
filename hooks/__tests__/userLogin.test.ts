import readline from 'readline';
import { userLogin } from '../userLogin'; // Adjust the path as needed

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

(async () => {
  try {
    const email = await askQuestion('Enter your email: ');
    const password = await askQuestion('Enter your password: ');

    console.log('Attempting login...');
    const data = await userLogin(email, password);

    if (data) {
      console.log('Login successful:', data);
    } else {
      console.error('Login failed.');
    }
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    rl.close();
  }
})();
