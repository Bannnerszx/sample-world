import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Image, Dimensions } from 'react-native';
import { getAuth, applyActionCode } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import car1 from '../assets/RMJ logo for flag.jpg';
import { Octicons, Ionicons, AntDesign, Feather, Entypo, FontAwesome, FontAwesome5 } from 'react-native-vector-icons';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage, projectExtensionFirebase } from '../firebaseConfig';
const EmailVerificationHandler = () => {

    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const auth = getAuth();
        const actionCode = getActionFromUrl();
        const isAccessFromAllowedUrl = location.pathname === '/VerifyEmail';

        if (actionCode && isAccessFromAllowedUrl) {
            applyActionCode(auth, actionCode)
                .then(() => {
                    setVerified(true);
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setError('Unauthorized access.');
            navigate('/');
        }
    }, [navigate, location]);

    const getActionFromUrl = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('oobCode');
    };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const gotoLogin = () => {
        navigate('/LoginForm')
    }
    const cardStyle = {
        width: screenWidth * 0.9, // 90% of screen width
        maxWidth: 900, // Maximum width
        alignSelf: 'center',
        backgroundColor: '#fff', // Card background color
        borderRadius: 5,
        backgroundColor: '#629FE5', // Rounded corners for card
        ...(screenWidth < 768 && {
            shadowColor: '#000', // Shadow Color
            shadowOffset: { width: 0, height: 4 }, // Shadow Offset
            shadowOpacity: 0.3, // Shadow Opacity
            shadowRadius: 5, // Shadow Radius
            elevation: 6, // Elevation for Android
        }),
        padding: 20, // Inner spacing
        alignItems: 'center', // Align items to center for vertical alignment
        marginBottom: 20,
        height: screenWidth < 768 ? '100%' : 500 // Space below the card
    };
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={[cardStyle]}>  {/* Add flex: 1 to the card style */}
                <View style={{ justifyContent: 'space-between', width: '100%' }}>  {/* Wrap content in a flex container */}
                    {/* Top Content */}
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={car1}
                            style={{
                                width: '100%',
                                height: 200,
                                borderRadius: 5,
                                marginBottom: 10,
                            }}
                            resizeMode="contain"
                        />


                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', fontSize: 22, color: 'white' }}>Your email has been verified.</Text>
                            <Text style={{ fontWeight: '700', fontSize: 22, color: 'white' }}>You can now sign in with your account.</Text>
                        </View>

                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', height: 100 }}>
                            {/* Green Circle */}
                            <View style={{
                                width: 100,
                                height: 100,
                                borderRadius: 50, // Half of width/height for perfect circle
                                backgroundColor: '#00cc00',
                                justifyContent: 'center', // Center content (icon) inside the circle
                                alignItems: 'center',
                            }}>
                                {/* Entypo Icon */}
                                <Entypo name="check" size={80} color={'#fff'} />
                            </View>
                        </View>
                    </View>
                    {/* Bottom Content */}
                    <View style={{ alignItems: 'center' }}>
                        <Pressable
                            style={({ pressed, hovered }) => [
                                {
                                    borderColor: '#629FE5',
                                    borderWidth: 2,
                                    borderRadius: 5,
                                    opacity: pressed ? 0.5 : 1,
                                    width: '100%',
                                    maxWidth: 450,
                                    maxHeight: 50,
                                    height: 50, // fixed height for better control
                                    backgroundColor: hovered ? '#f9f9f9' : '#FFF',
                                    justifyContent: 'center', // Center content vertically
                                    alignItems: 'center',
                                    marginTop: 25
                                },
                            ]}
                            onPress={gotoLogin}
                        >
                            <Text style={{ color: '#629FE5' }}>Go to login</Text>
                        </Pressable>

                        {error && <Text>{error}</Text>}
                    </View>
                </View>
            </View>

        </View>
    )
}
export default EmailVerificationHandler;