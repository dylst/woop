import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

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

  const handleLoginTab = () => setActiveTab('login');
  const handleRegTab = () => setActiveTab('register');
  const handleForgotTab = () => setActiveTab('forgot');

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
    alert(`Registered with email: ${regEmail}`);
  };

  const forgotPassword = () => {
    if (!forgotEmail) {
      alert('Please enter your registered email.');
      return;
    }
    alert(`Password reset email sent to ${forgotEmail}`);
  };

  const renderSocialSignUp = () => (
    <View style={styles.socialContainer}>
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Sign in with</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.socialIcons}>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-google" size={30} color="#2897ba" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-apple" size={30} color="#2897ba" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialIconWrapper}>
          <Ionicons name="logo-facebook" size={30} color="#2897ba" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* White elliptical shape in the middle */}
      <View style={styles.whiteEllipse} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}></Text>
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
          <Text style={styles.inputLabel}>
            <Ionicons name="person-outline" size={16} color="#2897ba" /> Enter username or email
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={25} color="#2897ba" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Username or email"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>
            <Ionicons name="lock-closed-outline" size={16} color="#2897ba" /> Enter password
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={25} color="#2897ba" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={loginUser} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotTab}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          {renderSocialSignUp()}

          <View style={styles.bottomLinks}>
            <Text style={styles.bottomText}>Don’t already have an account? </Text>
            <TouchableOpacity onPress={handleRegTab}>
              <Text style={styles.bottomLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>
            <Ionicons name="person-outline" size={16} color="#2897ba" /> Enter email
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#2897ba" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>
            <Ionicons name="lock-closed-outline" size={16} color="#2897ba" /> Enter password
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#2897ba" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.inputLabel}>
            <Ionicons name="lock-closed-outline" size={16} color="#2897ba" /> Retype password
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#2897ba" style={styles.inputIcon} />
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

          <View style={styles.bottomLinks}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginTab}>
              <Text style={styles.bottomLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Forgot Form */}
      {activeTab === 'forgot' && (
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Enter your registered email:</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#2897ba" style={styles.inputIcon} />
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

          <View style={styles.bottomLinks}>
            <Text style={styles.bottomText}>Remembered your password? </Text>
            <TouchableOpacity onPress={handleLoginTab}>
              <Text style={styles.bottomLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2EFFD', // Blue background
  },
  whiteEllipse: {
    position: 'absolute',
    // Adjust these values to achieve your desired ellipse shape and position
    top: height * 0.15,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.7,
    backgroundColor: '#fff',
    borderRadius: width,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: -30,
    zIndex: 1, // Ensure logo appears above ellipse
  },
  logoImage: {
    width: 150,
    height: 150,
    flex: 1,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2897ba',
    marginTop: 10,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  tabButton: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#999',
    paddingBottom: 5,
  },
  activeTab: {
    color: '#2897ba',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#2897ba',
  },
  formContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
    zIndex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2897ba',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#2897ba',
    borderRadius: 25,
    paddingLeft: 40, 
    paddingRight: 15,
    height: 45,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2897ba',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  socialContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#666',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIconWrapper: {
    marginHorizontal: 10,
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
  },
  bottomLink: {
    fontSize: 14,
    color: '#2897ba',
    textDecorationLine: 'underline',
  },
});

export default Users;

