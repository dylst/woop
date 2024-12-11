import { useRouter } from 'next/router';
import React, { useState } from 'react';

function AuthComponent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [emailArray, setEmailArray] = useState<string[]>([]);
  const [passwordArray, setPasswordArray] = useState<string[]>([]);

  // Form fields for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form fields for register
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordRetype, setRegPasswordRetype] = useState('');

  // Form fields for forgot
  const [forgotEmail, setForgotEmail] = useState('');

  const handleRegTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setActiveTab('register');
  };

  const handleLoginTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setActiveTab('login');
  };

  const handleForgotTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setActiveTab('forgot');
  };

  const registerUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (regEmail === '') {
      alert('Email required.');
      return;
    } else if (regPassword === '') {
      alert('Password required.');
      return;
    } else if (regPasswordRetype === '') {
      alert('Please retype your password.');
      return;
    } else if (regPassword !== regPasswordRetype) {
      alert("Passwords don't match. Please retype your password.");
      return;
    } else if (emailArray.indexOf(regEmail) === -1) {
      setEmailArray((prev) => [...prev, regEmail]);
      setPasswordArray((prev) => [...prev, regPassword]);

      alert(`${regEmail} Thanks for registration. Try to login now.`);

      // Reset fields
      setRegEmail('');
      setRegPassword('');
      setRegPasswordRetype('');
    } else {
      alert(`${regEmail} is already registered.`);
    }
  };

interface AuthComponentProps {}

interface AuthComponentState {
    activeTab: string;
    emailArray: string[];
    passwordArray: string[];
    loginEmail: string;
    loginPassword: string;
    regEmail: string;
    regPassword: string;
    regPasswordRetype: string;
    forgotEmail: string;
}

const loginUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const i = emailArray.indexOf(loginEmail);

    if (i === -1) {
        if (loginEmail === '') {
            alert('Email required.');
            return;
        }
        alert('Email does not exist. Register first.');
        return;
    } else if (passwordArray[i] !== loginPassword) {
        if (loginPassword === '') {
            alert('Password required.');
            return;
        }
        alert('Password does not match.');
        return;
    } else {
        alert(`${loginEmail} you are logged in now. Welcome to our website!`);
        // Reset fields
        setLoginEmail('');
        router.push('/index'); 
        
    }
};

const forgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailArray.indexOf(forgotEmail) === -1) {
        if (forgotEmail === '') {
            alert('Email required.');
            return;
        }
        alert('Email does not exist.');
        return;
    }

    alert('An email has been sent to you. Check it within 24 hours. Thanks!');
    setForgotEmail('');
};

  // Simple inline style changes based on activeTab
  const selectedTabStyle = { backgroundColor: 'rgb(12, 132, 189)' };
  const defaultTabStyle = { backgroundColor: 'rgba(11, 177, 224, 0.82)' };

  return (
    <div className="auth-container">
      <div className="tab-buttons">
        <button
          id="lt"
          onClick={handleLoginTab}
          style={activeTab === 'login' ? selectedTabStyle : defaultTabStyle}
        >
          Login
        </button>
        <button
          id="rt"
          onClick={handleRegTab}
          style={activeTab === 'register' ? selectedTabStyle : defaultTabStyle}
        >
          Register
        </button>
        <button
          onClick={handleForgotTab}
          style={activeTab === 'forgot' ? selectedTabStyle : defaultTabStyle}
        >
          Forgot
        </button>
      </div>

      {activeTab === 'login' && (
        <div id="login">
          <h2>Login</h2>
          <form onSubmit={loginUser}>
            <input
              id="se"
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              id="sp"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {activeTab === 'register' && (
        <div id="register">
          <h2>Register</h2>
          <form onSubmit={registerUser}>
            <input
              id="re"
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <input
              id="rp"
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
            <input
              id="rrp"
              type="password"
              placeholder="Retype Password"
              value={regPasswordRetype}
              onChange={(e) => setRegPasswordRetype(e.target.value)}
            />
            <button type="submit">Register</button>
          </form>
        </div>
      )}

      {activeTab === 'forgot' && (
        <div id="forgot">
          <h2>Forgot Password</h2>
          <form onSubmit={forgotPassword}>
            <input
              id="fe"
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <button type="submit">Send Reset Email</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AuthComponent;
