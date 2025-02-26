import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';

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
import { useNavigation, useRouter } from 'expo-router';
import { useUser } from './context/UserContext';

const { width, height } = Dimensions.get('window');

function Users() {
  const [activeTab, setActiveTab] = useState('login');


  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordRetype, setRegPasswordRetype] = useState('');
  const [regErrors, setRegErrors] = useState("");
  const [emailErrors, setEmailErrors] = useState("")
  const [passwordErrors, setPasswordErrors] = useState("")

  // Forgot states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErrors, setForgetErrors] = useState("");
  const [showForgotEmail, setShowForgotEmail] = useState(false);

  const handleLoginTab = () => setActiveTab('login');
  const handleRegTab = () => setActiveTab('register');
  const handleForgotTab = () => setActiveTab('forgot');

  // Used for redirecting 
  const router = useRouter();

  const { user, setUser } = useUser();

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const loginUser = async () => {

    setLoginError("")

    if (loginEmail === '' || loginPassword === '') {
      setLoginError('Please enter your email and password.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      })
      if (error) {
        setLoginError("There was an error logging")
        console.error(error.message)
      } else if (data && data.user) {
        if (!data.user.email_confirmed_at) {
          setLoginError("Please confirm your email address");
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("User is authenticated:", session.user);

          const { data: existingProfile, error: profileFetchError } = await supabase
            .from('profile')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          if (profileFetchError) {
            console.error('Error fetching profile:', profileFetchError.message);
          }

          if (!existingProfile) {
            const { data: newProfile, error: newProfileError } = await supabase
              .from('profile')
              .insert([
                {
                  id: data.user.id,
                  username: regUsername || data.user.user_metadata.username || 'default_username',
                },
              ])
            if (newProfileError) {
              console.log('Error creating profile:', newProfileError.message);
            }
          }
        } else {
          console.log("No active session. User is not authenticated.");
        }
        //setting user in the context 
        setUser(data.user);
        router.push("/");
      }
    } catch (error) {
      setLoginError("There was an error logging in");
      console.log(error);
    }
  };

  const registerUser = async () => {
    setEmailErrors("")
    setRegErrors("")
    setPasswordErrors("")

    let passValidations = true;

    if (!regUsername || !regEmail || !regPassword || !regPasswordRetype) {
      setRegErrors('Please fill in all fields.');
      passValidations = false;
    }
    if (!validateEmail(regEmail)) {
      setEmailErrors("Email invalid. Try a different one")
      passValidations = false;
    }
    if (regPassword.length < 6) {
      setPasswordErrors("Needs a password longer than 6 characters")
      passValidations = false;
    }
    if (regPassword !== regPasswordRetype) {
      setPasswordErrors('Passwords do not match.');
      passValidations = false;

    }

    if (!passValidations) {
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            username: regUsername
          }
        }
      });
      console.log(data, error);
      if (error) {
        setRegErrors(error.message)
      } else {
        router.push('/');
        // setActiveTab('user'); // have not tested this yet, should make the user return to the login screen instead of the home screen
      }
    } catch (error) {
      setRegErrors('There was error registering');
      console.log(error);
    }
  };

  const forgotPassword = async () => {
    setForgetErrors("")
    setShowForgotEmail(false)

    if (!forgotEmail) {
      setForgetErrors('Please enter your registered email.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    if (error) {
      setForgetErrors('There was an error resetting password');
    } else {
      setShowForgotEmail(true)
    }
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

          {loginError.length > 0 && <Text style={styles.errorText}>{loginError}</Text>}

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
            <Ionicons name="person-outline" size={16} color="#2897ba" /> Enter username
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={16} color="#2897ba" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder='Enter your username'
              value={regUsername}
              onChangeText={setRegUsername}
            />
          </View>
          <Text style={styles.inputLabel}>
            <Ionicons name="mail-outline" size={16} color="#2897ba" /> Enter email
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

            {emailErrors.length > 0 && <Text style={styles.errorText}>{emailErrors}</Text>}
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
            {passwordErrors.length > 0 && <Text style={styles.errorText}>{passwordErrors}</Text>}

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

          {regErrors.length > 0 && <Text style={styles.errorText}>{regErrors}</Text>}

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

          {forgotErrors.length > 0 && <Text style={styles.errorText}>{forgotErrors}</Text>}
          {showForgotEmail && <Text>{showForgotEmail}</Text>}

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
    marginBottom: -60,
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
    marginBottom: 10,
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
    marginBottom: 5,
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
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Users;

