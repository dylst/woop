import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions } from 'react-native';


function Users() {
  const [activeTab, setActiveTab] = useState('login');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordRetype, setRegPasswordRetype] = useState('');

  // Forgot states
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginTab = () => {
    setActiveTab('login');
  };

  const handleRegTab = () => {
    setActiveTab('register');
  };

  const handleForgotTab = () => {
    setActiveTab('forgot');
  };

  const loginUser = () => {
    if (loginEmail === '' || loginPassword === '') {
      alert('Please enter your email and password.');
    } else {
      alert(`Logging in as ${loginEmail}`);
    }
  };

  const registerUser = () => {
    if (!regEmail || !regPassword || !regPasswordRetype) {
      alert('Please fill in all fields.');
      return;
    }
    if (regPassword !== regPasswordRetype) {
      alert('Passwords do not match.');
      return;
    }
    // Registration logic here
    alert(`Registered with email: ${regEmail}`);
  };

  const forgotPassword = () => {
    if (!forgotEmail) {
      alert('Please enter your registered email.');
      return;
    }
    // Forgot password logic here
    alert(`Password reset email sent to ${forgotEmail}`);
  };

  const { width: screenWidth } = Dimensions.get('window');
  const logoSize = screenWidth * 0.5; 


  const renderSocialSignUp = () => (
    <View style={styles.socialContainer}>
      <Text style={styles.socialText}>Or sign up with</Text>
      <View style={styles.socialIcons}>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-google" size={24} color="#EA4335" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-apple" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Sign In Here!</Text>
        <View style={styles.topBarIcons}>
          <Ionicons name="notifications" size={24} color="#000" />
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* WoopLogo */}
      <View style={styles.WoopLogo}>
  <Image
    source={require('@/assets/images/Logo.png')}
    style={{ width: logoSize, height: logoSize, resizeMode: 'contain' }}
  />
</View>


      {/* Tabs */}
      <View style={styles.tabButtonsContainer}>
        <TouchableOpacity onPress={handleLoginTab}>
          <Text style={[styles.tabButton, activeTab === 'login' && styles.activeTab]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegTab}>
          <Text style={[styles.tabButton, activeTab === 'register' && styles.activeTab]}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotTab}>
          <Text style={[styles.tabButton, activeTab === 'forgot' && styles.activeTab]}>Forgot</Text>
        </TouchableOpacity>
      </View>

      {/* Login Form */}
      {activeTab === 'login' && (
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text>Email:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text>Password:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity onPress={loginUser} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Sign In</Text>
          </TouchableOpacity>

          {renderSocialSignUp()}
        </View>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text>Email:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text>Password:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text>Retype Password:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Retype your password"
              value={regPasswordRetype}
              onChangeText={setRegPasswordRetype}
              secureTextEntry
            />
          </View>
          <TouchableOpacity onPress={registerUser} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Register</Text>
          </TouchableOpacity>

          {renderSocialSignUp()}
        </View>
      )}

      {/* Forgot Form */}
      {activeTab === 'forgot' && (
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text>Enter your registered email:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity onPress={forgotPassword} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Send Reset Email</Text>
          </TouchableOpacity>

          {renderSocialSignUp()}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  WoopLogo: {
    resizeMode: 'contain',
    alignItems: 'center',
    marginVertical: 20,
  },
  tabButton: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#999',
  },
  activeTab: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  submitButton: {
    backgroundColor: '#2897ba',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  socialContainer: {
    alignItems: 'center',
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIconWrapper: {
    marginHorizontal: 10,
  },
});

export default Users;
