import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useMemo, useContext, StrictMode } from 'react'
import { AppState, StyleSheet, Text, View, Dimensions, useWindowDimensions } from 'react-native';
import { Box, NativeBaseProvider } from 'native-base';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { projectExtensionAuth } from './firebaseConfig';
import SplashScreen from './components/SplashScreen';
import LoginForm from './components/LogInForm';
import SignUpForm from './components/SignUpForm';
import ProfileFormChatGroup from './components/ProfileFormChatGroup'
import ThreeContainers from './components/homepage/CarViewTable';
import { onAuthStateChanged, reload } from 'firebase/auth';
import SearchCar from './components/homepage/SearchCar';
import ProductDetailScreen from './components/homepage/ProductScreen';
import ProfileFormTransaction from './components/ProfileFormTransaction';
import ProfileForm from './components/ProfileForm';
import EmailVerificationHandler from './components/EmailVerificationHandle';
import HomePage from './components/homepage/HomePage';
import SearchCarDesignAlpha from './components/homepage/SearchCarDesignAlpha';
const widthSize = Dimensions.get('window').width
const HEADER_HEIGHT = 160;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // top: '-12%'
    borderWidth: 1,
  },
  header: {
    position: 'fixed',
    flexDirection: 'row',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7b9cff',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: HEADER_HEIGHT,
    zIndex: 1,
    width: 'auto'

  },
  footer: {

    backgroundColor: '#dfe1e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 2,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    height: 'auto',
    width: widthSize,
    marginTop: '100vh'
  },
  headerText: {
    fontSize: '90%',
    color: 'white',
    fontFamily: 'Chivo-Light',

  },
  box: {
    width: 'auto',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  }
});
const App = () => {

  const [userEmails, setUserEmails] = useState(null);
  useEffect(() => {
    // Subscribe to Firebase Auth state changes to handle login persistence
    const unsubscribe = onAuthStateChanged(projectExtensionAuth, async (loggedInUser) => {
      if (loggedInUser) {
        // If the user is logged in and their email is verified, set the userEmail state
        if (loggedInUser.emailVerified) {
          try {
            await reload(loggedInUser);
            setUserEmails(loggedInUser.email);
          } catch (error) {
            console.error('Error reloading user:', error);
          }

        } else {
          // If email is not verified, reset the userEmail state
          setUserEmails(null);

        }
      } else {
        // If the user is logged out, reset the userEmail state
        setUserEmails(null);
      }
    });

    // Clean up the subscription when the component is unmounted
    return () => unsubscribe();
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  setTimeout(() => {
    setIsLoading(false);
  }, 2000); // Adjust the time as needed for your app's actual initialization

  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            exact
            path="/LoginForm"
            element={userEmails ? <Navigate to="/" /> : <LoginForm />}
          />
          <Route exact path="/SignUp" element={<SignUpForm />} />
          <Route exact path="/" element={<ThreeContainers />} />
          <Route exact path="/Home" element={<HomePage />} />
          <Route exact path="/ProfileFormChatGroup/:chatId" element={userEmails ? <ProfileFormChatGroup /> : <Navigate to="/LoginForm" />} />
          <Route
            exact
            path="/SearchCar"
            element={<SearchCar />}
          />
          <Route
            exact
            path='/SearchCarDesign'
            element={<SearchCarDesignAlpha />}
          />
          <Route exact path="/VerifyEmail" element={<EmailVerificationHandler />} />
          <Route exact path="/ProfileFormTransaction" element={userEmails ? <ProfileFormTransaction /> : <Navigate to="/LoginForm" />} />
          <Route exact path="/Profile" element={userEmails ? <ProfileForm /> : <Navigate to="/LoginForm" />} />
          <Route path="/ProductScreen/:carId" element={<ProductDetailScreen />} />
        </Routes>
      </Router>

    </AuthProvider>
  )
}
export default App;