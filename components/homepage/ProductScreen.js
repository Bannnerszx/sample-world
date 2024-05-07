import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Linking, FlatList, Pressable, TextInput, Modal, Animated as AnimatedRN, useWindowDimensions } from 'react-native';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, Fontisto, MaterialCommunityIcons, Octicons } from 'react-native-vector-icons';
import { firebaseConfig, db, where, getFirestore } from '../../firebaseConfig';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, serverTimestamp, addDoc, collection, getDocs, setDoc, query, orderBy, limit, arrayUnion, updateDoc } from "firebase/firestore";
import { AuthContext } from '../../context/AuthProvider';
import logo4 from '../../assets/RMJ logo for flag transparent.png'
import carSample from '../../assets/2.jpg'
import { projectExtensionFirestore, projectExtensionFirebase, projectExtensionStorage } from '../../firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL, } from 'firebase/storage';
import axios, { isCancel } from 'axios';
import { FlatGrid } from 'react-native-super-grid';
import gifLogo from '../../assets/rename.gif'
import moment from 'moment';
import Animated, {
    Extrapolate,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,

} from "react-native-reanimated"
import ImageGallery from "react-image-gallery";
import 'react-image-gallery/styles/css/image-gallery.css'; // Import the default styles
import '../../assets/reactimage.css'
import { GestureHandlerRootView, enableLegacyWebImplementation } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel"
import logo1 from '../../assets/RMJ Cover Photo for Facebook.jpg';
import { Feather } from '@expo/vector-icons';



const StickyHeader = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const searchQueryWorldRef = useRef('');
    const handleChangeQuery = (value) => {
        searchQueryWorldRef.current = value;
    };

    const handleSearch = () => {
        if (searchQueryWorldRef.current.trim() !== '') {
            navigate(`/SearchCar?searchTerm=${searchQueryWorldRef.current}`)
        }
    };
    const [scrollY] = useState(new AnimatedRN.Value(0));


    {/* <>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
                            <TouchableOpacity onPress={() => navigate(`/ProfileFormTransaction`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text>Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
                            <TouchableOpacity onPress={logout} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text >Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </> */}

    return (
        <AnimatedRN.View style={{
            borderBottomWidth: 1,
            borderBottomColor: '#aaa',
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            borderTopColor: 'blue',
            borderTopWidth: 2,
            backgroundColor: 'lightblue',
            justifyContent: 'center',
            backgroundColor: '#fff',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(3, 3, 3, 0.3)',
            transform: [
                {
                    translateY: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, -100],
                        extrapolate: 'clamp'
                    })
                }
            ]
        }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <TouchableOpacity
                    onPress={() => navigate('/')}
                    style={{ justifyContent: 'center', flex: 1 }}
                >

                    <Image
                        source={{ uri: logo4 }}
                        style={{
                            flex: 1,
                            aspectRatio: 1
                        }}
                        resizeMode='contain'
                    />

                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: 3
                }}>
                    {/* <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
                    <TextInput
                        placeholder='Search by make, model, or keyword'
                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
                        textAlignVertical='center'
                        placeholderTextColor={'gray'}
                        defaultValue={searchQueryWorldRef.current}
                        onChangeText={handleChangeQuery}
                        onSubmitEditing={handleSearch}
                    /> */}
                    <Text style={{ flex: 1, fontWeight: 'bold' }}>Used Car Stock</Text>
                    <Text style={{ flex: 1, fontWeight: 'bold' }}>How to Buy</Text>
                    <Text style={{ flex: 1, fontWeight: 'bold' }}>About Us</Text>
                    <Text style={{ flex: 1, fontWeight: 'bold' }}>Local Introduction</Text>
                    <Text style={{ flex: 1, fontWeight: 'bold' }}>Contact Us</Text>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1 }} />
                </View>
                {user ? (


                    < View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto', flex: 1, padding: 5 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => navigate(`/Favorite`)} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <AntDesign name="heart" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Favorite</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/ProfileFormTransaction`)} style={{ backgroundColor: '#E5EBFD', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <FontAwesome name="user" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={logout} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <Entypo name="log-out" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                ) : (

                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto', flex: 1, padding: 5 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <AntDesign name="heart" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Favorite</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/SignUp`)} style={{ backgroundColor: '#E5EBFD', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <MaterialCommunityIcons name="account-plus" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/LoginForm`)} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <Octicons name="sign-in" size={25} color={'blue'} />
                            <Text style={{ color: 'blue' }}>Log In</Text>
                        </TouchableOpacity>
                    </View>


                )}
            </View>
        </AnimatedRN.View>
    )
};
const SearchCountry = ({ setIsError, isError, handleSelectCountry, selectedCountry, setSelectCountry, setSelectPort }) => {
    const { userEmail } = useContext(AuthContext);
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    }
    if (selectedCountry) {
        console.log('SELECTED COUNTRY IN SEARCH COUNTRY', selectedCountry)
    }
    const [checkCountry, setCheckCountry] = useState(null);
    useEffect(() => {
        const fetchCountryData = async () => {
            // Check if userEmail is not null or undefined
            if (userEmail) {
                const userEmailDoc = doc(projectExtensionFirestore, 'accounts', userEmail);

                try {
                    const docSnapshot = await getDoc(userEmailDoc);

                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        console.log('Fetched user data:', userData);

                        // Access the 'country' field directly
                        const countryData = userData.country;
                        console.log('Fetched country data:', countryData);

                        // Set checkCountry with the fetched country data
                        setCheckCountry(countryData);
                    } else {
                        console.log('Document does not exist!');
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    // Handle the error, e.g., display an error message.
                }
            } else {
                console.log('userEmail is null or undefined');
            }
        };

        fetchCountryData();
    }, [userEmail]);

    const [countryData, setCountryData] = useState([]);
    useEffect(() => {
        const fetchCountries = async () => {
            const countryRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

            try {
                const docSnapshot = await getDoc(countryRef);
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const prioritizedCountries = ['Zambia', 'Tanzania', 'Mozambique', 'Kenya', 'Uganda', 'Zimbabwe', 'D_R_Congo'];
                    const prioritizedSorted = prioritizedCountries.filter(country => country in data);

                    // Sort the rest of the countries alphabetically
                    const otherCountriesSorted = Object.keys(data)
                        .filter(country => !prioritizedCountries.includes(country))
                        .sort();

                    // Combine the arrays
                    const sortedCountries = [...prioritizedSorted, ...otherCountriesSorted];

                    setCountryData(sortedCountries);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
            }
        };

        fetchCountries();
    }, []);

    const handleClear = () => {
        setSelectCountry('');
        setSelectPort('');
    }
    //countries and ports ends here
    return (
        <View style={{
            flex: 3, padding: 5, minWidth: 150,

        }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: isError === true ? 'red' : '#d5d5d5',
                    borderWidth: 1,
                    borderRadius: 3
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{selectedCountry ? selectedCountry.replace(/_/g, '.') : 'Select Country'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleClear}>
                        <AntDesign name="close" size={15} color="blue" />
                    </TouchableOpacity>
                    <AntDesign
                        name="down"
                        size={15}
                        style={[
                            { transitionDuration: '0.3s' },
                            isActive && {
                                transform: [{ rotate: '180deg' }],
                            },
                        ]}
                        color="blue"
                    />
                </View>
            </Pressable>
            {isActive && (
                <View style={{
                    position: 'absolute',
                    top: 40, // Adjust according to the height of the Pressable
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    maxHeight: 200,
                    margin: 5
                }}>
                    <FlatList
                        data={countryData} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleSelectCountry(item); handleIsActive(); setIsError(false) }}
                            >
                                <Text style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item.replace(/_/g, '.')}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}

        </View>
    )
};
const SearchPort = ({ isErrorPort, setIsErrorPort, selectedCountry, handleSelectPort, selectedPort }) => {
    console.log('isErrorPort', isErrorPort)
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    }
    const [ports, setPorts] = useState([]);
    console.log('PORTS FROM SEARCHPORT', ports)
    useEffect(() => {
        if (selectedCountry) {
            const fetchPorts = async () => {
                const countriesDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

                try {
                    const docSnapshot = await getDoc(countriesDocRef);
                    if (docSnapshot.exists()) {
                        const countriesData = docSnapshot.data();
                        // Assuming each country's data is structured as an object within CountriesDoc
                        const countryData = countriesData[selectedCountry];
                        if (countryData && countryData.nearestPorts) {
                            setPorts(countryData.nearestPorts); // Set ports with the nearestPorts array
                        } else {
                            console.log(`No nearestPorts data found for ${selectedCountry}`);
                            setPorts([]); // Reset ports if no data is found
                        }
                    } else {
                        console.log("CountriesDoc document does not exist!");
                        setPorts([]);
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                }
            };

            fetchPorts();
        } else {
            return;
        }
    }, [selectedCountry]);



    const [checkCountry, setCheckCountry] = useState(null);
    return (
        <View style={{ flex: 3, padding: 5, minWidth: 150 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: isErrorPort === true ? 'red' : '#d5d5d5',
                    borderWidth: 1,
                    borderRadius: 3
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{selectedPort ? selectedPort : 'Select Port'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <AntDesign
                        name="down"
                        size={15}
                        style={[
                            { transitionDuration: '0.3s' },
                            isActive && {
                                transform: [{ rotate: '180deg' }],
                            },
                        ]}
                        color="blue"
                    />
                </View>
            </Pressable>
            {isActive && (
                <View style={{
                    position: 'absolute',
                    top: 40, // Adjust according to the height of the Pressable
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    maxHeight: 200,
                    margin: 5
                }}>

                    <FlatList
                        data={ports} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(); handleSelectPort(item); setIsErrorPort(false) }}
                            >
                                <Text style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
            )}

        </View>
    )
};

const Insurance = ({ setInsurance, insurance, handleToggleInsurance }) => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });



    const [toggle, setToggle] = useState(false);
    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;

    const handleToggle = () => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 10,
            useNativeDriver: false,
        }).start();

        setToggle(!toggle);
        setInsurance(!toggle)
    };

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Insurance</Text>
        </View>
    )
}
const Inspection = ({ isToggleDisabled, toggle, handleToggleInspection, selectedCountry, setToggle, toggleAnim, switchTranslate, switchColor, handleToggle }) => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });





    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle} disabled={isToggleDisabled || !selectedCountry}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Inspection</Text>
        </View>
    )
}
const Warranty = () => {
    const styles = StyleSheet.create({
        switch: {
            width: 50, // Width of the outer switch component
            height: 26, // Height of the outer switch component
            borderRadius: 13, // Half of the height to make it rounded
            padding: 2, // Padding inside the switch component
            justifyContent: 'center'
        },
        toggle: {
            width: 22, // Width of the inner toggle button
            height: 22, // Height of the inner toggle button
            borderRadius: 11, // Half of the height to make it circular
            backgroundColor: 'white', // Color of the toggle button
        }
    });



    const [toggle, setToggle] = useState(false);
    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;

    const handleToggle = () => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 10,
            useNativeDriver: false,
        }).start();

        setToggle(!toggle);
    };

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Pressable onPress={handleToggle}>
                <AnimatedRN.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <AnimatedRN.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </AnimatedRN.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Warranty</Text>
        </View>
    )
}
const Calculate = ({ selectedPort, setProfitMap, totalPriceCalculation, setCalculatePrice }) => {

    const handleCalculate = () => {
        const formattedTotalPrice = totalPriceCalculation ? parseInt(totalPriceCalculation).toLocaleString() : '000';
        setCalculatePrice(formattedTotalPrice);
    }


    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end', // Center the buttons
            alignItems: 'flex-end', // Vertically center items in the container
            padding: 10,
            flex: 1,
            zIndex: - 5// Add some padding around the container
        }}>
            <Pressable
                onPress={() => {
                    // Your onPress handler code for reset
                }}
                style={({ pressed }) => ({
                    flex: 1, // Do not grow, take as much space as needed
                    opacity: pressed ? 0.5 : 1,
                    backgroundColor: '#d5d5d5', // Light grey background for the Reset button
                    marginRight: 10, // Add margin to the right for spacing
                    borderRadius: 3, // Rounded corners for the buttons
                    paddingHorizontal: 15, // Horizontal padding
                    height: 35, // Fixed height for the button
                    justifyContent: 'center', // Center content vertically
                    alignItems: 'center', // Center content horizontally
                })}
            >
                <Text style={{
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'white' // Ensure text is centered
                }}>Reset</Text>
            </Pressable>
            <Pressable
                onPress={() => {
                    handleCalculate()
                }}
                style={({ pressed, hovered }) => ({
                    flex: 2, // Takes twice the space compared to Reset
                    opacity: pressed ? 0.5 : 1,
                    backgroundColor: hovered ? 'black' : '#191919', // Blue background for Calculate button
                    borderRadius: 5, // Rounded corners for the buttons
                    paddingHorizontal: 20, // Horizontal padding
                    height: 35, // Fixed height for the button
                    justifyContent: 'center', // Center content vertically
                    alignItems: 'center', // Center content horizontally
                })}
            >
                <Text
                    selectable={false}
                    style={{
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center' // Ensure text is centered
                    }}>Calculate</Text>
            </Pressable>
        </View>

    )
};
const ChatWithUs = () => {
    const styles = StyleSheet.create({
        container: {
            padding: 10,
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
            width: '100%', // Take full width of the container
            height: 100, // Set your desired height
        },
        termsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            marginRight: 10
        },
        termsText: {
            fontSize: 12,
            marginLeft: 8,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: 240
        },
        button: {
            backgroundColor: '#007bff',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            alignSelf: 'flex-start',
            marginLeft: 10
        },
        buttonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });
    const [agree, setAgree] = useState(false);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Write your message here"
                multiline={true} // Allows for multiple lines of text
                numberOfLines={4} // Sets the number of lines
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={styles.termsContainer}
                    onPress={() => setAgree(!agree)}
                >

                    <MaterialCommunityIcons
                        name={agree ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                        size={24}
                        color="black"
                    />
                    <Text style={styles.termsText} numberOfLines={1} ellipsizeMode='tail'>
                        I agree to Privacy Policy and Terms of Agreement
                    </Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <Pressable
                    onPress={() => {
                        // Your onPress handler code for calculate
                    }}
                    style={({ pressed, hovered }) => ({
                        flex: 2, // Takes twice the space compared to Reset
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: hovered ? '#bdceff' : '#7b9cff', // Blue background for Calculate button
                        borderRadius: 20, // Rounded corners for the buttons
                        paddingHorizontal: 20, // Horizontal padding
                        height: 40, // Fixed height for the button
                        justifyContent: 'center', // Center content vertically
                        alignItems: 'center', // Center content horizontally
                    })}
                >
                    <Text
                        selectable={false}
                        style={{
                            color: 'white',
                            fontWeight: '600',
                            textAlign: 'center' // Ensure text is centered
                        }}>Chat with us</Text>
                </Pressable>
            </View>
        </View>
    );
}

const SquareGrays = () => {
    const styles = StyleSheet.create({
        container: {
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        square: {
            width: 8,
            height: 8,
            backgroundColor: 'gray',
            marginLeft: 1,
        },
    });

    const createOddRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 === 0) ? 'gray' : 'transparent';
            return (
                <View key={`odd-${index}`} style={[styles.square, { backgroundColor }]} />
            );
        })
    );

    // Function to create a row of gray squares at even positions
    const createEvenRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 !== 0) ? 'gray' : 'transparent';
            return (
                <View key={`even-${index}`} style={[styles.square, { backgroundColor }]} />
            );
        })
    );

    return (
        <View style={styles.container}>
            <View style={styles.row}>{createOddRowOfSquares()}</View>
            <View style={styles.row}>{createEvenRowOfSquares()}</View>
        </View>
    );
};
const GetDataFeature = () => {

    const { carId } = useParams();
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const [featureStatusSafety, setFeatureStatusSafety] = useState(false);
    const [featureStatusComfort, setFeatureStatusComfort] = useState(false);
    const [featureStatusInterior, setFeatureStatusInterior] = useState(false);
    const [featureStatusExterior, setFeatureStatusExterior] = useState(false);
    const [featureStatusSelling, setFeatureStatusSelling] = useState(false);
    const vehicleId = carId;


    // Define allData before using it
    const featureData = [
        {
            category: 'Safety System',
            data: [
                { name: 'Anti-Lock Braking System (ABS)', value: featureStatusSafety.SafetySystemAnBrSy },
                { name: 'Driver Airbag', value: featureStatusSafety.SafetySystemDrAi },
                { name: 'Passenger Airbag', value: featureStatusSafety.SafetySystemPaAi },
                { name: 'Safety Airbag', value: featureStatusSafety.SafetySystemSiAi }
            ]
        },
        {
            category: 'Comfort',
            data: [
                { name: 'Air Conditioner (Front)', value: featureStatusComfort.ComfortAiCoFr }, // Initialize with null
                { name: 'Air Conditioner (Rear)', value: featureStatusComfort.ComfortAiCoRe },
                { name: 'AM/FM Radio', value: featureStatusComfort.ComfortAMFMRa },
                { name: 'AM/FM Stereo', value: featureStatusComfort.ComfortAMFMSt },
                { name: 'CD Player', value: featureStatusComfort.ComfortCDPl },
                { name: 'CD Changer', value: featureStatusComfort.ComfortCDCh },
                { name: 'Cruise Speed Control', value: featureStatusComfort.ComfortCrSpCo },
                { name: 'Digital Speedometer', value: featureStatusComfort.ComfortDiSp },
                { name: 'DVD Player', value: featureStatusComfort.ComfortDVDPl },
                { name: 'Hard Disk Drive', value: featureStatusComfort.ComfortHDD },
                { name: 'Navigation System (GPS)', value: featureStatusComfort.ComfortNaSyGPS },
                { name: 'Power Steering', value: featureStatusComfort.ComfortPoSt },
                { name: 'Premium Audio System', value: featureStatusComfort.ComfortPrAuSy },
                { name: 'Remote Keyless System', value: featureStatusComfort.ComfortReKeSy },
                { name: 'Tilt Steering Wheel', value: featureStatusComfort.ComfortTiStWh },
            ],
        },
        {
            category: 'Interior',
            data: [
                { name: 'Leather Seats', value: featureStatusInterior.InteriorLeSe },
                { name: 'Power Door Locks', value: featureStatusInterior.InteriorPoDoLo },
                { name: 'Power Mirrors', value: featureStatusInterior.InteriorPoMi },
                { name: 'Power Seats', value: featureStatusInterior.InteriorPose },
                { name: 'Power Windows', value: featureStatusInterior.InteriorPoWi },
                { name: 'Rear Window Defroster', value: featureStatusInterior.InteriorReWiDe },
                { name: 'Rear Window Wiper', value: featureStatusInterior.InteriorReWiWi },
                { name: 'Third Row Seats', value: featureStatusInterior.InteriorThRoSe },
                { name: 'Tinted Glass', value: featureStatusInterior.InteriorTiGl }
            ]
        },
        {
            category: 'Exterior',
            data: [
                { name: 'Alloy Wheels', value: featureStatusExterior.ExteriorAlWh },
                { name: 'Power Sliding Door', value: featureStatusExterior.ExteriorPoSlDo },
                { name: 'Sunroof', value: featureStatusExterior.ExteriorSuRo }
            ]
        },
        {
            category: 'Selling Points',
            data: [
                { name: 'Customized Wheels', value: featureStatusSelling.SellingPointsCuWh },
                { name: 'Fully Loaded', value: featureStatusSelling.SellingPointsFuLo },
                { name: 'Maintenance History Available', value: featureStatusSelling.SellingPointsMaHiAv },
                { name: 'Brand New Tires', value: featureStatusSelling.SellingPointsBrNeTi },
                { name: 'No Accident History', value: featureStatusSelling.SellingPointsNoAcHi },
                { name: 'Non-Smoking Previous Owner', value: featureStatusSelling.SellingPointsNoSmPrOw },
                { name: 'One Owner History', value: featureStatusSelling.SellingPointsOnOwHi },
                { name: 'Performance-Rated Tires', value: featureStatusSelling.SellingPointsPeRaTi },
                { name: 'Repainted Body', value: featureStatusSelling.SellingPointsReBo },
                { name: 'Turbo Engine', value: featureStatusSelling.SellingPointsTuEn },
                { name: 'Upgraded Audio System', value: featureStatusSelling.SellingPointsUpAuSy }
            ]
        }
        // Add more categories and their features as needed
    ];

    const renderVehicleFeaturesCategory = ({ item }) => {
        const styles = StyleSheet.create({
            container: {
                paddingTop: "60px",
                margin: 'auto',
            },
            containerBox: {
                justifyContent: 'center',
                borderRadius: 5,
                alignItems: 'flex-start',
            },
            categoryContainer: {
                marginBottom: 20,
            },
            category: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            },
            specificationItem: {
                fontSize: 16,
                marginBottom: 5,
            },
            category: {
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            },
            rowContainer: {
                flexDirection: 'row',
                marginBottom: 5,
            },
            columnContainer: {
                paddingHorizontal: 5,
            },
            createButton: {
                backgroundColor: 'blue',
                color: 'white',
                padding: 10,
                borderRadius: 5,
            },
        });

        // Create rows with four items in each row
        const numColumns = screenWidth < 768 ? 2 : 4;
        const rows = [];

        for (let i = 0; i < item.data.length; i += numColumns) {
            const rowData = item.data.slice(i, i + numColumns);
            rows.push(
                <View key={i} style={styles.rowContainer}>
                    {rowData.map((feature, index) => (
                        <View key={index} style={[styles.columnContainer, { width: screenWidth < 768 ? '50%' : '25%' }]}>
                            <View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: feature.value ? '#454545' : '#fff',
                                        borderWidth: 1,
                                        borderColor: feature.value ? '#454545' : '#D5D5D5',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 40,
                                        marginBottom: 5,
                                        maxWidth: '100%',
                                        margin: 5,
                                        padding: 2,
                                    }}
                                >
                                    <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: feature.value ? 'white' : '#D5D5D5', fontSize: 12, fontWeight: '600' }}>{feature.name}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            );
        }

        return (
            <View style={styles.categoryContainer}>
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    color: '#706E6E'
                }}>{item.category}</Text>
                {rows}
            </View>
        );
    };

    useEffect(() => {
        const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
        const unsubscribe = onSnapshot(vehicleDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    if (data && data.comfort) {
                        setFeatureStatusComfort(data.comfort);
                        // Update state with comfortData
                    }
                    if (data && data.safetySystem) {
                        setFeatureStatusSafety(data.safetySystem);
                    }
                    if (data && data.interior) {
                        setFeatureStatusInterior(data.interior)
                    }
                    if (data && data.exterior) {
                        setFeatureStatusExterior(data.exterior)
                    }
                    if (data && data.sellingPoints) {
                        setFeatureStatusSelling(data.sellingPoints)
                    }
                } else {
                    console.log('Document does not exist.');
                }
            },
            (error) => {
                console.error('Error getting document:', error);
            }
        );

        // Return a cleanup function to unsubscribe from the snapshot listener when the component unmounts
        return () => unsubscribe();
    }, []);


    return (
        <View style={{ flex: 1 }}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontWeight: '700', fontSize: '2em', marginRight: '3%' }}>Features</Text>
                <SquareGrays />

            </View>
            <FlatList
                style={{ marginTop: '3%' }}
                data={featureData}
                renderItem={renderVehicleFeaturesCategory}
                keyExtractor={(item, index) => `${item.category}-${index}`}
            />
        </View>
    );
};
const GetDataSpecifications = () => {

    const { carId } = useParams();
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const vehicleId = carId;
    const [vehicleData, setVehicleData] = useState({});

    const specsData = [
        {
            category: 'Full Vehicle Specifications',
            data: [
                { name: 'Make', value: vehicleData.make },
                { name: 'Model', value: vehicleData.model },
                { name: 'Registration Year', value: `${vehicleData.regYear} / ${vehicleData.regMonth}` },
                { name: 'Reference Number', value: vehicleData.referenceNumber },
                { name: 'Chassis/Frame Number', value: vehicleData.chassisNumber },
                { name: 'Model Code', value: vehicleData.modelCode },
                { name: 'Engine Code', value: vehicleData.engineCode }
            ]
        },
        {
            category: 'Engine and Perfomance',
            data: [
                { name: 'Engine Displacement (cc)', value: `${vehicleData.engineDisplacement}cc` },
                { name: 'Steering', value: vehicleData.steering },
                { name: 'Mileage', value: `${vehicleData.mileage} km` },
                { name: 'Transmission', value: vehicleData.transmission },
                { name: 'External Color', value: vehicleData.exteriorColor }
            ]
        },
        {
            category: 'Interior and Seating',
            data: [
                { name: 'Number of Seats', value: vehicleData.numberOfSeats },
                { name: 'Doors', value: vehicleData.doors }
            ]
        },
        {
            category: 'Fuel and Drivetrain',
            data: [
                { name: 'Fuel', value: vehicleData.fuel },
                { name: 'Drive Type', value: vehicleData.driveType },
            ],

        },
        {
            category: 'Dimensions and Weight',
            data: [
                { name: 'Dimension', value: `${vehicleData.dimensionLength}cm x ${vehicleData.dimensionWidth}cm x ${vehicleData.dimensionHeight}cm (${vehicleData.dimensionCubicMeters}m³) ` },
                { name: 'Weight', value: `${vehicleData.weight}kg` }
            ]
        },
        {
            category: 'Body Type',
            data: [
                { name: 'Body Type', value: vehicleData.bodyType },
            ]
        }
    ]

    useEffect(() => {
        const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', vehicleId);
        const unsubscribe = onSnapshot(vehicleDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setVehicleData(data);
                } else {
                    console.log('Document does not exist');
                    return (
                        <View style={{ justifyContent: 'center' }}>
                            <Text>NO VIEW HERE!</Text>
                        </View>
                    )
                }
            },
            (error) => {
                console.error('Error getting document', error);
            }
        );
        return () => unsubscribe();

    }, []);

    const [imageUrls, setImageUrls] = useState({});


    useEffect(() => {
        const folderRef = ref(projectExtensionStorage, vehicleData.referenceNumber);
        // Function to fetch the first image URL for a folder
        const fetchImageURL = async (folderRef) => {
            try {
                // List all items (images) in the folder
                const result = await listAll(folderRef);

                if (result.items.length > 0) {
                    // Get the download URL for the first image in the folder
                    const imageUrl = await getDownloadURL(result.items[0]);
                    // Update the imageUrls state with the new URL
                    setImageUrls((prevImageUrls) => ({
                        ...prevImageUrls,
                        [vehicleData.referenceNumber]: imageUrl,
                    }));

                } else {
                    // If the folder is empty, you can add a placeholder URL or handle it as needed
                }
            } catch (error) {
                console.error('Error listing images for folder', vehicleData.referenceNumber, ':', error);
            }
        };

        // Fetch image URL for the vehicleData's referenceNumber
        fetchImageURL(folderRef);
    }, [vehicleData.referenceNumber]);
    const renderSpecificationItem = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, backgroundColor: '#454545', padding: 10, margin: 5, }}>
                    <Text style={[styles.specificationItem, { color: 'white' }]}>{item.name}</Text>
                </View>
                <View style={{ flex: 1, padding: 10, margin: 5, borderWidth: 1, borderColor: '#706E6E' }}>
                    <Text style={{ fontSize: 16, color: '#706E6E', fontWeight: '300' }}>{item.value || 'N/A'}</Text>
                </View>
            </View>
        );
    };

    const renderSpecificationCategory = ({ item }) => {
        return (
            <View style={[styles.categoryContainer]}>


                <FlatList
                    style={{ marginTop: '3%' }}
                    data={item.data}
                    renderItem={renderSpecificationItem}
                    keyExtractor={(specItem) => specItem.name}
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontWeight: '700', fontSize: '2em', marginRight: '3%' }}>Full Vehicle Specifications</Text>
                <SquareGrays />
            </View>
            <FlatList
                data={specsData}
                renderItem={renderSpecificationCategory}
                keyExtractor={(item) => item.category}
            />
        </View>
    )

};


const MakeAChat = ({ allImageUrl, setIsErrorPort, setIsError, insurance, textInputRef, isCheck, ip, ipCountry, freightOrigPrice, JapanPort, selectedCountry, selectedPort, profitMap, currency, carId, carName, userEmail, inspectionIsRequired, inspectionName, toggleInspection, toggleWarranty, toggleInsurance, portPrice, currentCurrency, toggle, setToggle }) => {
    //MAKE MODAL



    const { login } = useContext(AuthContext);
    //SEND INQUIRY
    const [modalVisible, setModalVisible] = useState(false);
    const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
    // Function to open the modal
    const openModal = () => {
        setModalVisible(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);
    };
    const openAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(true);
    };

    // Function to close the "Already Inquired" modal
    const closeAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(false);
    };



    useEffect(() => {
        // Check if userEmail is available before proceeding
        if (userEmail) {
            // Fetch user transactions only when userEmail is available
            const fetchUserTransactions = async () => {
                try {
                    const transactionsSnapshot = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));
                    const transactionsDataArray = transactionsSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setUserTransactions(transactionsDataArray);
                } catch (error) {
                    console.log('Error fetching user transactions:', error);
                }
            };
            // Call the fetchUserTransactions function to populate userTransactions
            fetchUserTransactions();
        }
    }, [userEmail]);
    //MAKE MODAL HERE
    const navigate = useNavigate(); // Use the useNavigate hook here

    const [carData, setCarData] = useState([]);
    console.log('CHECK THE CHASSIS:', carData.chassisNumber);
    const [carRefNumber, setCarRefNumber] = useState('');
    useEffect(() => {
        const fetchRefNumber = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarRefNumber(vehicleData.referenceNumber);
                }
            } catch (error) {
                console.error('Error fetching vehicle data: ', error);
            }
        };
        if (carId) {
            fetchRefNumber();
        }
    }, [carId])
    //FETCH CAR DATA
    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (carId) {
            fetchCarData();
        }
    }, [carId]);
    const [userTransactions, setUserTransactions] = useState([]);
    const handleCreateConversation = async () => {
        //MAKE INQUIRY
        const textInput = textInputRef.current;
        if (!userEmail) {

            navigate('/LoginForm');
            return;
        }
        if (!carData) {
            console.error('Invalid product data or missing id:', carData);
            return; // Exit the function to prevent further errors
        }
        if (!isCheck || !selectedCountry || !selectedPort) {
            setIsErrorPort(true);
            setIsError(true);
            console.error('PLEASE CHECK THE PRIVACY')
            return;
        }



        const productIdString = carId;
        console.log('CAR ID: ', productIdString);
        // Check if the product is already in the user's transactions
        const userEmailAddress = userEmail; // Replace this with the actual user's email
        if (!userEmailAddress) {
            console.error('User email address is not available.');
            return;
        }


        //PORT OF JAPAN

        //PORT OF JAPAN

        //formatted time
        const response = await axios.get('http://worldtimeapi.org/api/timezone/Asia/Tokyo');
        const { datetime } = response.data;
        const month = moment(datetime).format('MM');
        const monthWithDay = moment(datetime).format('MM/DD');
        const date = moment(datetime).format('YYYY/MM/DD');
        const day = moment(datetime).format('DD');
        const time = moment(datetime).format('HH:mm');
        const timeWithMinutesSeconds = moment(datetime).format('HH:mm:ss');
        const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
        //formatted time
        try {
            // const transactionRefExtension = doc(collection(projectExtensionFirestore, 'accounts', userEmailAddress, 'transactions'), productIdString);

            // const transacionDocExtension = await getDoc(transactionRefExtension);


            // if (transacionDocExtension.exists()) {
            //     openAlreadyInquiredModal();
            //     return;
            // }

            // // If the product is not already in transactions, add it
            // setUserTransactions((prevTransactions) => [...prevTransactions, carData]);

            // Add the product to the "Transactions" collection in Firebase

            // await setDoc(transactionRefExtension, {
            //     ...carData,
            //     productId: productIdString,

            // });


            // Fetch IP Address

            const chatId = `chat_${carId}_${userEmail}`;
            //NEW DATE FEATURE

            //NEW DATE FEATURE
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const accountTransaction = doc(projectExtensionFirestore, 'accounts', userEmail);
            const newTransaction = {

                carName: carData?.carName,
                imageUrl: allImageUrl[0],
                referenceNumber: carData?.referenceNumber,
                stockId: carData?.stockID
            }
            await updateDoc(accountTransaction, {
                transactions: arrayUnion(newTransaction)
            })

            const messageData = {

                sender: userEmail, // Sender's email
                text: textInput ? textInput : `You are now inquiring with this product.`,
                timestamp: formattedTime,
                ip: ip,
                ipCountry: ipCountry
            };

            // Set the message data in the new message document
            await setDoc(newMessageDocExtension, messageData);



            console.log('Product added to transactions successfully!');
            // Show the main modal indicating that the inquiry was successful
            openModal();
        } catch (error) {
            console.error('Error checking or adding product to transactions:', error);
        }

        //MAKE CHAT HERE
        // Constant recipientEmail
        const recipientEmail = ['marc@realmotor.jp', 'yamazaki@carcon-net.com',];

        // Validate recipientEmail and create a new chat conversation in Firestore


        // Generate a unique chat ID using a combination of carId and userEmail
        const chatId = `chat_${carId}_${userEmail}`;

        // Reference the chats collection

        const chatsCollectionExtension = collection(projectExtensionFirestore, 'chats');
        const chassisNumber = carData.chassisNumber;
        const year = carData.regYear;
        const model = carData.model;
        // Create a new document within the chats collection with the generated chatId

        await setDoc(doc(chatsCollectionExtension, chatId), {
            lastMessageDate: formattedTime,
            read: false,
            readBy: [],
            lastMessage: textInput ? textInput : 'You are now inquiring with this product.',
            lastMessageSender: userEmail,
            customerRead: true,
            participants:
            {
                salesRep: recipientEmail,
                customer: userEmail,
            },

            carData,

            stepIndicator: {
                value: 1,
                stepStatus: "Negotiation",
                sideBarNotification: false,
            },
            inspectionIsRequired: inspectionIsRequired,
            inspectionName: inspectionName,
            inspection: toggle,
            warranty: false,
            insurance: insurance,
            currency: currency,
            freightPrice: profitMap,
            dateOfTransaction: formattedTime,
            country: selectedCountry,
            port: selectedPort,
            freightOrigPrice: freightOrigPrice,
        });

        // Navigate to the ChatScreen with the chat ID
        const path = `/ProfileFormChatGroup/${chatId}`;

        // // Use navigation to navigate to the specified path
        navigate(path);


        //I'LL COME BACK TO THIS SO THAT IT WILL GO TO CHAT
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => handleCreateConversation(carId, carName)}
                style={{
                    backgroundColor: 'blue', justifyContent: 'center',
                    alignItems: 'center',
                    height: 50,
                    borderRadius: 3,
                    marginVertical: 20
                }}>
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '500', fontStyle: 'italic' }}>Send Inquiry</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={alreadyInquiredModalVisible}
                onRequestClose={closeAlreadyInquiredModal}
            >
                <TouchableOpacity
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    activeOpacity={1}
                    onPress={closeAlreadyInquiredModal}
                >
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            You've already inquired about this vehicle.
                        </Text>
                        <Text style={{ fontSize: 16, marginBottom: 20 }}>
                            Please review your inquiry history in your profile.
                        </Text>
                        <TouchableOpacity
                            style={{ backgroundColor: '#007BFF', padding: 10, borderRadius: 5 }}
                            onPress={() => {
                                closeAlreadyInquiredModal();
                                navigate('/ProfileFormTransaction');
                            }}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Go to Profile</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};


const CarouselSampleAnimations = ({ animationValue, label, onPress }) => {
    const translateY = useSharedValue(0)

    const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [0.5, 1, 0.5],
            Extrapolate.CLAMP
        )

        return {
            opacity
        }
    }, [animationValue])

    const labelStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            animationValue.value,
            [-1, 0, 1],
            [1, 1.5, 1],
            Extrapolate.CLAMP
        )

        const color = interpolateColor(
            animationValue.value,
            [-1, 0, 1],
            ["#b6bbc0", "#0071fa", "#b6bbc0"]
        )

        return {
            transform: [{ scale }, { translateY: translateY.value }],
            color
        }
    }, [animationValue, translateY])

    const onPressIn = React.useCallback(() => {
        translateY.value = withTiming(-8, { duration: 250 })
    }, [translateY])

    const onPressOut = React.useCallback(() => {
        translateY.value = withTiming(0, { duration: 250 })
    }, [translateY])

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Animated.View
                style={[
                    {
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",

                    },
                    containerStyle
                ]}
            >

                <Animated.Image
                    source={{ uri: label }}
                    style={[labelStyle, { width: '100%', height: undefined, aspectRatio: 1, borderWidth: 1, flex: 3 }]}
                    resizeMode='contain'
                />
                {/* <Animated.Text style={[{ fontSize: 18, color: "#26292E" }, labelStyle]}>
                    'Hello'
                </Animated.Text> */}
            </Animated.View>
        </Pressable>
    )
}




const FullscreenImageView = ({ src, onClose }) => (
    <div className="fullscreen-container" onClick={onClose}>
        <img src={src} alt="Fullscreen" className="fullscreen-image" />
    </div>
);

const LoadingImageGallery = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);
    const renderCustomImage = (item) => {


        return (

            <img src={item.original} alt={item.originalAlt} className="custom-image" loading="lazy" />

        );
    };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const blankItems = [
        { original: carSample, thumbnail: carSample, originalAlt: '' }, // Add as many blank items as needed
    ];
    const renderCustomLeftNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                left: '10px', // Adjust this value as needed
            }}

        >
            <AntDesign name="left" size={25} color="#fff" />
        </button>
    );

    const renderCustomRightNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                right: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="right" size={25} color="#fff" />
        </button>


    );
    const thumbnailPosition = screenWidth >= 1280 ? 'bottom' : (screenWidth >= 992 ? 'right' : (screenWidth >= 768 ? 'right' : 'bottom'));

    return (
        <ImageGallery
            items={blankItems}
            showFullscreenButton={true}
            showPlayButton={false} // Hide autoplay button
            showThumbnails={true} // Hide thumbnails
            thumbnailPosition={thumbnailPosition}
            renderLeftNav={isFullscreen ? undefined : renderCustomLeftNav}
            renderRightNav={isFullscreen ? undefined : renderCustomRightNav}
            infinite={true}
            renderItem={renderCustomImage}
        />
    );
};
const CarouselSample = ({ allImageUrl }) => {

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);





    const [imagesLoading, setImagesLoading] = useState(true);
    useEffect(() => {
        if (allImageUrl && allImageUrl.length > 0) {
            setImagesLoading(false);
        } else {
            setImagesLoading(true);
        }
    }, [allImageUrl]);


    const formattedImages = allImageUrl.map(url => ({
        original: url,
        thumbnail: url, // You can set thumbnail to the same URL if thumbnails are not available
        // You can add more properties like description, alt text, etc. if needed
    }));
    const renderCustomLeftNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                left: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="left" size={25} color="#fff" />
        </button>
    );
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const FullScreenButton = () => {
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <button
                    onClick={openModal}
                    className="custom-fullscreen"
                    style={{
                        right: '10px', // Adjust this value as needed
                    }}
                >
                    <Feather name='check-square' size={20} />
                </button>
                {modalVisible === true && (
                    <View style={{ backgroundColor: 'white', width: '100%', height: '100%', position: 'absolute', top: '150%', left: 0 }}>
                        <Image
                            source={{ uri: formattedImages[0].original }}
                            style={{ width: 750, height: 550 }} // Set your modal image dimensions here
                            resizeMode="contain"
                        />
                    </View>

                )}
            </View>
        );
    };
    const renderCustomRightNav = (onClick, disabled) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="custom-nav-button" // Apply the CSS class
            style={{
                right: '10px', // Adjust this value as needed
            }}
        >
            <AntDesign name="right" size={25} color="#fff" />
        </button>
    );
    const thumbnailPosition =
        screenWidth >= 1280
            ? 'right'

            : 'bottom';



    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);


    const renderCustomImage = (item) => {
        const handleImagePress = () => {
            setFullscreenImage(item.original);
            setIsFullscreen(true);
        };

        return (
            <Pressable onPress={handleImagePress}>
                <img src={item.original} alt={item.originalAlt} className="custom-image" />
            </Pressable>
        );
    };


    if (imagesLoading) {

        return <LoadingImageGallery />;
    } else {
        // Render the actual carousel if images have been loaded
        return (
            <View style={{ width: '100%' }}>
                <ImageGallery
                    items={formattedImages}
                    showFullscreenButton={false}
                    showPlayButton={false} // Hide autoplay button
                    showThumbnails={true} // Hide thumbnails
                    thumbnailPosition={thumbnailPosition}
                    renderLeftNav={isFullscreen ? undefined : renderCustomLeftNav}
                    renderRightNav={isFullscreen ? undefined : renderCustomRightNav}
                    infinite={true}
                    renderItem={renderCustomImage}
                />
                {isFullscreen && <FullscreenImageView src={fullscreenImage} onClose={() => setIsFullscreen(false)} />}
            </View>
        );

    }

}


// const flatListRef = useRef();
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const itemHeight = 250; // The height of the image with margin
//     const viewHeight = 500; // The height of the visible FlatList area
//     const numItems = 1; // Number of items to display in view
//     const maxIndex = Math.ceil(allImageUrl.length / numItems) - 1;

//     // Ensure the FlatList only displays 3 items at a time
//     const getItemLayout = (data, index) => ({
//         length: itemHeight,
//         offset: itemHeight * index,
//         index,
//     });

//     // Handler for the up button
//     const handleUp = () => {
//         setCurrentIndex((prevIndex) => {
//             const newIndex = Math.max(prevIndex - numItems, 0);
//             flatListRef.current.scrollToIndex({ animated: true, index: newIndex });
//             return newIndex;
//         });
//     };

//     // Handler for the down button
//     const handleDown = () => {
//         setCurrentIndex((prevIndex) => {
//             const newIndex = Math.min(prevIndex + numItems, maxIndex * numItems);
//             flatListRef.current.scrollToIndex({ animated: true, index: newIndex });
//             return newIndex;
//         });
//     };
//     return (
//         <View >
//             <TouchableOpacity onPress={handleUp} disabled={currentIndex === 0}>
//                 <Text>UP</Text>
//             </TouchableOpacity>
//             <View style={{ height: viewHeight, width: '100%', justifyContent: 'center' }}>
//                 <FlatList
//                     ref={flatListRef}
//                     data={allImageUrl}
//                     keyExtractor={(item, index) => `image-${index}`}
//                     renderItem={({ item }) => (
//                         <View style={{ backgroundColor: '#f5f5f5', borderRadius: 5, marginBottom: 5, margin: 5 }}>
//                             <Image
//                                 source={{ uri: item }}
//                                 style={{ width: '100%', height: itemHeight }}
//                                 resizeMode='contain'
//                             />
//                         </View>
//                     )}
//                     getItemLayout={getItemLayout}
//                     initialScrollIndex={currentIndex}
//                     scrollEnabled={false}
//                     style={{ flex: 1, width: '100%' }}
//                 />
//             </View>
//             <TouchableOpacity onPress={handleDown} disabled={currentIndex >= maxIndex * numItems}>
//                 <Text>DOWN</Text>
//             </TouchableOpacity>
//         </View>
//     );

// const FetchPort = () => {
//     if (data[currentPort]?.kobePrice !== undefined) {

//         if (invoiceData.departurePort == "Nagoya") {

//             await updateDoc(doc(projectExtensionFirestore, 'chats', selectedChatData.id), {
//                 freightOrigPrice: data[currentPort].nagoyaPrice,
//             });
//             // console.log("Nagoya Price ", data[currentPort].nagoyaPrice);

//         }
//         else if (invoiceData.departurePort == "Yokohama") {
//             await updateDoc(doc(projectExtensionFirestore, 'chats', selectedChatData.id), {
//                 freightOrigPrice: data[currentPort].yokohamaPrice,
//             });
//             // console.log("Yokohama Price ", data[currentPort].yokohamaPrice);

//         }
//         else if (invoiceData.departurePort == "Kyushu") {
//             await updateDoc(doc(projectExtensionFirestore, 'chats', selectedChatData.id), {
//                 freightOrigPrice: data[currentPort].kyushuPrice,
//             });
//             // console.log("Kyushu Price ", data[currentPort].kyushuPrice);

//         }
//         else if (invoiceData.departurePort == "Kobe") {
//             await updateDoc(doc(projectExtensionFirestore, 'chats', selectedChatData.id), {
//                 freightOrigPrice: data[currentPort].kobePrice,
//             });
//             // console.log("Kobe Price ", data[currentPort].kobePrice);

//         }

//         setLastFetchedPort(currentPort); // Update last fetched port
//     } else {
//         console.log('Port data not found for the given port');
//     }
// }


const SearchByTypes = ({ carItems }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const types = [
        { id: '1', logo: 'Logo', name: 'SEDAN', price: '520' },
        { id: '2', logo: 'Logo', name: 'TRUCK', price: '520' },
        { id: '3', logo: 'Logo', name: 'SUV', price: '520' },
        { id: '4', logo: 'Logo', name: 'HATCHBACK', price: '520' },
        { id: '5', logo: 'Logo', name: 'WAGON', price: '520' },
        { id: '6', logo: 'Logo', name: 'BUS', price: '520' },
    ];
    const styles = StyleSheet.create({
        container: {
            padding: 15,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginVertical: 20,
            color: 'white',
            marginLeft: 20,
            marginRight: 20
        },
        itemContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        button: {
            backgroundColor: 'blue',
            borderRadius: 5,
            height: 40,
            maxWidth: 150,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        },

        cardPressable: {
            alignSelf: 'center',
            shadowColor: '#333',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: 10,
            maxWidth: screenWidth < 700 ? 290 : 360,
            width: '100%',

        },
        card: {
            overflow: 'hidden',
            backgroundColor: 'transparent',
        },
        cardImage: {
            width: '100%',
            aspectRatio: 1.3,
            resizeMode: 'cover',
        },
        textContainer: {
            padding: 10,

        },
        carName: {
            alignSelf: 'flex-start',
            fontWeight: '600',
            fontSize: 18,
            color: 'white'
        },
    });
    const renderItem = useCallback(({ item }) => {
        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0, // No decimal places
            maximumFractionDigits: 0, // No decimal places
        }).format(item.fobPrice * 0.0068).replace('.00', '');
        return (
            <Pressable
                style={({ pressed }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                    },
                    styles.cardPressable
                ]}
            >
                <View style={styles.card}>

                    <Image
                        source={{ uri: carSample }}
                        style={styles.cardImage}
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.carName} >
                            {item.carName}
                        </Text>
                        <Text style={{ fontSize: 14, marginTop: 20, color: 'white' }}>
                            {item.regYear}/{item.regMonth}
                        </Text>
                        <Text style={{ fontSize: 14, color: 'blue', color: 'white' }}>
                            {`FOB. US${formattedPrice}`}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }, []);
    let numberOfItemsPerRow;
    if (screenWidth > 992) {
        numberOfItemsPerRow = 6;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 2;
    }
    const spacing = screenWidth > 440 ? 15 : 10;
    const totalSpacing = spacing * (numberOfItemsPerRow - 1);


    const itemDimension = (screenWidth - totalSpacing) / numberOfItemsPerRow;
    return (
        <View style={styles.container}>
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'flex-end',
                    marginTop: -15,
                    marginRight: -15
                }}>
                    <SquareGrays />
                </View>
            )}
            {screenWidth >= 644 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginLeft: -35 }}>

                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'white' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>Recommended Items</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Type</Text>
                    </TouchableOpacity>
                </View>
            )}

            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Search by Type</Text>
                </View>
            )}
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={carItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={itemDimension}
                    spacing={spacing}
                />
            </View>
            {screenWidth < 644 && (
                <TouchableOpacity style={[{
                    marginTop: screenWidth < 644 ? 10 : 0,
                    alignSelf: 'center',
                }, styles.button]}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Type</Text>
                </TouchableOpacity>
            )}
        </View>
    )

};


const StickyFooter = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const styles = StyleSheet.create({
        footerContainer: {
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            padding: 20,
            marginTop: '5%',
            backgroundColor: '#fff',

            // assuming a white background
        },
        linkSection: {
            flex: 1,
            flexDirection: 'row', // Ensures items are laid out in a row
            flexWrap: 'wrap', // Allows items to wrap to the next line
            padding: 10, // Adjusts padding around the entire section
            justifyContent: 'space-between', // Places space between the child items
        },
        item: {
            // Common style for all items
            flex: 1,// Each item takes up half the width of the container
            padding: 5,

            // Padding within each item
            // No justifyContent or alignItems here
        },
        firstColumn: {
            // Specific style for the first column
            alignItems: 'flex-start', // Aligns text to the start of the column
        },
        secondColumn: {
            // Specific style for the second column
            alignItems: 'flex-start',

        },
        title: {
            // Style for the text inside each item
            textAlign: 'left', // Center align text
            fontWeight: '500',
            flex: 1
        },
        sectionTitle: {
            // Style for the section title
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
            paddingBottom: 5,
            marginBottom: 10,
            fontWeight: 'bold'
            // Add other styling like font weight, text transform, etc.
        },
        sectionContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            maxWidth: 1300,
            alignSelf: 'center',
            width: '100%',
            padding: 10
        },
        infoSection: {
            flex: 2,
            maxWidth: screenWidth < 768 ? '100%' : 250,
            marginRight: 20// takes more space for the company info
        },
        logo: {
            width: '100%',
            height: 60, // Adjust height accordingly
            marginBottom: 20,
        },
        companyAddress: {
            marginBottom: 5,
            marginVertical: 10
        },
        companyContact: {
            marginBottom: 5,
            marginVertical: 10
        },
        contactButton: {
            backgroundColor: 'blue',
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginVertical: 10,
            marginTop: 10,
            marginHorizontal: -1,
            borderRadius: 5,
            alignItems: 'center'
        },
        contactButtonText: {
            color: 'white',
        },
        policyLinks: {
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: '#ddd',
            paddingTop: 5,
            marginTop: 10,
            paddingBottom: 5,
        },
        policyText: {
            marginBottom: 5,
            paddingBottom: 5
        },
        linkSection: {
            flex: 1,
            padding: 5
        },

        linkText: {
            marginBottom: 5,
            fontWeight: '500'
        },
        socialMediaSection: {
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end', // Evenly space items apart
            padding: 10,
            paddingVertical: 10,
            alignSelf: 'center',
            maxWidth: 1300,
            width: '100%',

        },
        iconsRow: {
            flexDirection: 'row',
            justifyContent: 'space-evenly', // Center icons horizontally
            alignItems: 'center', // Center icons vertically
            width: '100%', // Take the full width to center icons on the screen
            marginBottom: screenWidth < 768 ? 10 : 5,
            maxWidth: 150,
            alignSelf: screenWidth < 768 ? 'center' : 'flex-end'// Adjust based on the screen width
        },
        copyRightSection: {
            alignItems: screenWidth < 768 ? 'center' : 'flex-end',
            justifyContent: screenWidth < 768 ? 'center' : 'flex-end',
            width: '100%'
        },
        copyRightText: {
            textAlign: 'center', // Center the text horizontally
            fontSize: screenWidth < 768 ? 12 : 14, // Adjust the font size based on the screen width
            marginTop: screenWidth < 768 ? 5 : 10, // Adjust the margin top based on the screen width
        },
        socialIcon: {
            marginHorizontal: screenWidth < 768 ? 5 : 10, // Adjust spacing between icons
        },
        // ... other styles you may need
    });
    const maker = [
        { key: 'TOYOTA' },
        { key: 'MAZDA' },
        { key: 'NISSAN' },
        { key: 'BMW' },
        { key: 'HONDA' },
        { key: 'LAND ROVER' },
        { key: 'MITSUBISHI' },
        { key: 'ISUZU' },
        { key: 'MERCEDES-BENZ' },
        { key: 'JEEP' },
        { key: 'VOLKSWAGEN' },
    ];
    const bodyType = [
        { key: 'Couper' },
        { key: 'Convertible' },
        { key: 'Sedan' },
        { key: 'Wagon' },
        { key: 'Hatchback' },
        { key: 'Van' },
        { key: 'Truck' },
        { key: 'SUV' },
    ];
    const renderItem = ({ item, index }) => {
        // Determine column based on index
        const isFirstColumn = index % 2 === 0;

        return (
            <View style={[styles.item, isFirstColumn ? styles.firstColumn : styles.secondColumn]}>
                <Text style={styles.title}>{item.key}</Text>
            </View>
        );
    };
    const numColumns = screenWidth < 992 ? 1 : 2;

    const renderItemBodyType = ({ item, index }) => {
        return (
            <View style={[styles.item, styles.firstColumn]}>
                <Text style={styles.title}>{item.key}</Text>
            </View>
        );
    };
    return (
        <View style={styles.footerContainer}>
            <View style={styles.sectionContainer}>

                <View style={styles.infoSection}>
                    <Image
                        source={{ uri: gifLogo }}
                        resizeMode='contain'
                        style={styles.logo}
                    />
                    <Text style={styles.companyAddress}>26-2 Takara Tsutsumi-cho, Toyota-city, Aichi 473-90932 Japan</Text>
                    <Text style={styles.companyContact}>Tel +81-565-85-0602</Text>
                    <Text>Fax +81-565-85-0606</Text>
                    <TouchableOpacity style={styles.contactButton}>
                        <Text style={styles.contactButtonText}>Contact Us</Text>
                    </TouchableOpacity>
                    <View style={styles.policyLinks}>
                        <Text style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Terms of Use</Text>
                        <Text style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Privacy Policy</Text>
                        <Text style={[styles.policyText, { marginBottom: -2 }]}>Cookie Policy</Text>
                    </View>
                </View>
                {screenWidth < 768 ? null : (
                    <>
                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Contents</Text>
                            <Text style={styles.linkText}>Used Car Stock</Text>
                            <Text style={styles.linkText}>How to Buy</Text>
                            <Text style={styles.linkText}>About Us</Text>
                            <Text style={styles.linkText}>Local Introduction</Text>
                            <Text style={styles.linkText}>Contact Us</Text>
                        </View>

                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Makers</Text>
                            <FlatList
                                data={maker}
                                renderItem={renderItem}
                                keyExtractor={item => item.key}
                                numColumns={numColumns}
                                scrollEnabled={false}
                                key={numColumns}
                            />
                        </View>

                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Body Types</Text>
                            <FlatList
                                data={bodyType}
                                renderItem={renderItemBodyType}
                                keyExtractor={item => item.key}
                                scrollEnabled={false}
                            />

                        </View>

                        <View style={styles.linkSection}>
                            <Text style={styles.sectionTitle}>Find Car</Text>
                            <Text style={styles.linkText}>Browse All Stock</Text>
                            <Text style={styles.linkText}>Sale Cars</Text>
                            <Text style={styles.linkText}>Recommended Cars</Text>
                            <Text style={styles.linkText}>Luxury Cars</Text>
                        </View>
                    </>
                )}

            </View>

            <View style={styles.socialMediaSection}>
                <View style={styles.iconsRow}>
                    <AntDesign name="linkedin-square" size={20} color={'blue'} />
                    <AntDesign name="twitter" size={20} color={'blue'} />
                    <Ionicons name="logo-facebook" size={20} color={'blue'} />
                    <Entypo name="instagram" size={20} color={'blue'} />
                </View>
                <View style={styles.copyRightSection}>
                    <Text style={styles.copyRightText}>
                        Copyright © Real Motor Japan All Rights Reserved.
                    </Text>
                </View>
            </View>

        </View>
    );
};


const SocialMedia = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 15 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'blue', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 5 }}>
                <AntDesign name={"heart"} size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, fontStyle: 'italic' }}>Add to Shortlist</Text>
            </TouchableOpacity>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: 'auto', // Adjust the width as necessary
                marginLeft: 10
            }}>

                <AntDesign name="facebook-square" size={25} color={'blue'} style={{ marginHorizontal: 5 }} />
                <AntDesign name="twitter" size={25} color={'blue'} style={{ marginHorizontal: 5 }} />
                <AntDesign name="linkedin-square" size={25} color={'blue'} style={{ marginHorizontal: 5 }} />
                <Entypo name="instagram" size={25} color={'blue'} style={{ marginHorizontal: 5 }} />
            </View>
        </View>
    );
};

const ProductDetailScreen = () => {


    //FETCH NEW ARRIVALS
    const [carItems, setCarItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
                const q = query(vehicleCollectionRef, orderBy('dateAdded'), limit(5));

                const querySnapshot = await getDocs(q);
                const newItems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setCarItems(newItems);
            } catch (error) {
                console.error("Error fetching documents: ", error);
            }
            setIsLoading(false);
        };

        fetchItems();
    }, []);
    //FETCH NEW ARRIVALS


    // const totalPriceCalculation = (selectedChatData.fobPrice * selectedChatData.jpyToUsd) + (selectedChatData.m3 * selectedChatData.freightPrice);
    const { carId } = useParams();
    const navigate = useNavigate();
    const [carData, setCarData] = useState({});
    const JapanPort = carData.port
    const carName = carData.carName;
    const { userEmail } = useContext(AuthContext);
    const [userTransactions, setUserTransactions] = useState([]);

    //SEND INQUIRY
    const [modalVisible, setModalVisible] = useState(false);
    const [alreadyInquiredModalVisible, setAlreadyInquiredModalVisible] = useState(false);
    // Function to open the modal
    const openModal = () => {
        setModalVisible(true);
    };
    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);
    };
    const openAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(true);
    };

    // Function to close the "Already Inquired" modal
    const closeAlreadyInquiredModal = () => {
        setAlreadyInquiredModalVisible(false);
    };

    useEffect(() => {
        // Check if userEmail is available before proceeding
        if (userEmail) {
            // Fetch user transactions only when userEmail is available
            const fetchUserTransactions = async () => {
                try {

                    const transactionsSnapshotExtension = await getDocs(collection(projectExtensionFirestore, 'accounts', userEmail, 'transactions'));

                    const transactionsDataArrayExtension = transactionsSnapshotExtension.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))

                    setUserTransactions(transactionsDataArrayExtension);
                } catch (error) {
                    console.log('Error fetching user transactions:', error);
                }
            };
            // Call the fetchUserTransactions function to populate userTransactions
            fetchUserTransactions();
        }
    }, [userEmail]);

    // const handleSendInquiry = async () => {
    //   if (!carData) {
    //     console.error('Invalid product data or missing id:', carData);
    //     return; // Exit the function to prevent further errors
    //   }

    //   const productIdString = carData.id.toString();

    //   // Check if the product is already in the user's transactions
    //   const userEmailAddress = userEmail; // Replace this with the actual user's email
    //   if (!userEmailAddress) {
    //     console.error('User email address is not available.');
    //     return;
    //   }

    //   try {
    //     const transactionRef = doc(collection(db, 'accounts', userEmailAddress, 'transactions'), productIdString);
    //     const transactionDoc = await getDoc(transactionRef);

    //     if (transactionDoc.exists()) {
    //       console.log('Product is already in transactions.');
    //       // Show the modal indicating that the user has already inquired about this product
    //       openAlreadyInquiredModal();
    //     } else {
    //       // If the product is not already in transactions, add it
    //       setUserTransactions((prevTransactions) => [...prevTransactions, carData]);

    //       // Add the product to the "Transactions" collection in Firebase
    //       await setDoc(transactionRef, {
    //         ...carData,
    //         productId: productIdString, // Add the productId field to store the ID of the product
    //       });

    //       console.log('Product added to transactions successfully!');
    //       // Show the main modal indicating that the inquiry was successful
    //       openModal();
    //     }
    //   } catch (error) {
    //     console.error('Error checking or adding product to transactions:', error);
    //   }
    // };
    //SEND INQUIRY ENDS HERE

    //FAVORITES


    //   const handleAddToFavorite = async () => {
    //     if (!carData) {
    //       console.error('Invalid car data or missing id:', carData);
    //       return; // Exit the function to prevent further errors
    //     }

    //     const carIdString = carData.id.toString();

    //     // Check if the car is already in the user's favorites
    //     const isAlreadyFavorite = userFavorites.some((favorite) => favorite.id === carData.id);

    //     console.log('Selected Car:', carData); // Log the selected car

    //     const userEmailAddress = userEmail; // Replace this with the actual user's email
    //     if (!userEmailAddress) {
    //       console.error('User email address is not available.');
    //       return;
    //     }

    //     if (isAlreadyFavorite) {
    //       // If the car is already in favorites, remove it from the userFavorites state
    //       const updatedFavorites = userFavorites.filter((favorite) => favorite.id !== carData.id);
    //       setUserFavorites(updatedFavorites);
    //       // Remove the car from the "favoriteLists" subcollection in Firebase
    //       try {
    //         await deleteDoc(doc(collection(db, 'accounts', userEmailAddress, 'favoriteLists', carIdString)));
    //         console.log('Car removed from favorites successfully!');
    //       } catch (error) {
    //         console.error('Error removing car from favorites:', error);
    //       }
    //     } else {
    //       // If the car is not in favorites, add it to the userFavorites state
    //       setUserFavorites((prevFavorites) => [...prevFavorites, carData]);
    //       // Add the car to the "favoriteLists" subcollection in Firebase
    //       try {
    //         await setDoc(doc(collection(db, 'accounts', userEmailAddress, 'favoriteLists'), carIdString), {
    //           ...carData,
    //           carId: carIdString, // Add the carId field to store the ID of the car
    //         });
    //         console.log('Car added to favorites successfully!');
    //       } catch (error) {
    //         console.error('Error adding car to favorites:', error);
    //       }
    //     }
    //   };
    //FAVORITES ENDS HERE

    //FETCH CAR DATA
    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (carId) {
            fetchCarData();
        }
    }, [carId]); // Empty dependency array to ensure it runs only once


    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //BREAKPOINT
    //save screen


    //save screen


    //COMMENTS TO CARS HERE

    const renderComments = ({ item }) => {

        return (
            <View>
                <View style={{ width: '100%', height: 1, backgroundColor: '#aaa', alignSelf: 'center', marginVertical: 10 }} />
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Text key={star}>{item.ratings >= star ? '⭐' : '☆'}</Text>
                        ))}
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text>3 days ago</Text>
                    </View>

                </View>
                <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                    <Text style={{ color: '#ccc' }}>by Customer Name</Text><Text style={{ fontSize: 12, color: '#4CAF50' }}> Verified Purchaser</Text>
                </View>
                <View style={{ margin: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.comments}</Text>
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#aaa', fontWeight: '600' }}>Sample Car Name</Text>
                    <Text>IMAGE HERE</Text>
                </View>
                {/* <View style={{backgroundColor:'#7b9cff', marginTop: 10}}>
        <Text>REAL MOTOR RESPONSE REPRESENTATIVE</Text>
        <Text>COMMENT OF THE REPRESENTATIVE HERE</Text>
        </View> */}
                <View style={{ marginTop: 5 }}>
                    <Text>LIKES HERE</Text>
                </View>
            </View>
        )
    }
    //make comments for cars

    //make comments for cars here **

    // const [vehicleData, setVehicleData] = useState({});
    // useEffect(() => {
    //     const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
    //     const unsubscribe = onSnapshot(vehicleDocRef,
    //         (docSnapshot) => {
    //             if (docSnapshot.exists()) {
    //                 const data = docSnapshot.data();
    //                 setVehicleData(data);
    //             } else {
    //                 console.log('Document does not exist');
    //                 return (
    //                     <View style={{ justifyContent: 'center' }}>
    //                         <Text>NO VIEW HERE!</Text>
    //                     </View>
    //                 )
    //             }
    //         },
    //         (error) => {
    //             console.error('Error getting document', error);
    //         }
    //     );
    //     return () => unsubscribe();

    // }, []);

    // const [imageUrl, setImageUrl] = useState('');
    // useEffect(() => {
    //     const folderRef = ref(projectExtensionStorage, vehicleData.stockID);

    //     // Function to fetch the first image URL for a folder
    //     const fetchImageURL = async (folderRef) => {
    //         try {
    //             // List all items (images) in the folder
    //             const result = await listAll(folderRef);

    //             if (result.items.length > 0) {
    //                 // Get the download URL for the first image in the folder
    //                 const imageUrl = await getDownloadURL(result.items[0]);
    //                 // Update the imageUrl state with the new URL
    //                 setImageUrl(imageUrl);
    //             } else {
    //                 // If the folder is empty, you can add a placeholder URL or handle it as needed
    //             }
    //         } catch (error) {
    //             console.error('Error listing images for folder', vehicleData.stockID, ':', error);
    //         }
    //     };

    //     // Fetch image URL for the vehicleData's referenceNumber
    //     fetchImageURL(folderRef);
    // }, [vehicleData.stockID]);

    const [allImageUrl, setAllImageUrl] = useState([]);

    useEffect(() => {
        const folderRef = ref(projectExtensionStorage, carId);
        const fetchAllImageUrl = async () => {
            try {
                const result = await listAll(folderRef);
                const urls = await Promise.all(result.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    return url;
                }));
                setAllImageUrl(urls);
            } catch (error) {
                console.error('Error listing images for folder: ', error);
            }
        };
        fetchAllImageUrl(folderRef);
    }, [carId])

    //CUSTOMER MESSAGE HERE


    const textInputRef = useRef(null);
    const handleTextChange = (value) => {
        textInputRef.current = value

    };
    //CUSTOMER MESSAGE HERE
    //CHECKMARK
    const [isCheck, setIsCheck] = useState(false);
    const checkButton = (option) => {
        setIsCheck(option);

    }
    //CHECKMARK
    //COUNTRY PICKER
    const [selectedCountry, setSelectCountry] = useState(null);
    const handleSelectCountry = (option) => {
        setSelectCountry(option)
    };
    //COUNTRY PICKER

    //PORT PICKER
    const [selectedPort, setSelectPort] = useState('');
    const handleSelectPort = (option) => {
        setSelectPort(option)
    };
    //PORT PICKER



    const [currentCurrency, setCurrentCurrency] = useState('');
    useEffect(() => {
        const fetchCurrency = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'currency', 'currency');

            try {
                const docSnapshot = await getDoc(vehicleDocRef);

                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();

                    setCurrentCurrency(data);
                } else {
                    console.log('Document does not exist!');
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        };

        fetchCurrency();
    }, []);
    //FETCH PORTS DOC
    const [profitMap, setProfitMap] = useState('');
    //FETCH PORTS DOC
    //DOLLAR CONVERSION
    const fobDollar = currentCurrency.jpyToUsd * parseFloat(carData.fobPrice);
    const formattedFobDollar = fobDollar ? parseInt(fobDollar).toLocaleString() : '000';
    const [calculatePrice, setCalculatePrice] = useState('');
    const totalPriceCalculation = (parseFloat(carData.fobPrice) * currentCurrency.jpyToUsd) + (parseFloat(carData.dimensionCubicMeters) * parseFloat(profitMap));
    //DOLLAR CONVERSION
    const getFlexDirection = (screenWidth) => {
        if (screenWidth <= 523) {
            return 'column'; // For very small screens
        } else if (screenWidth <= 992) {
            return 'row'; // For small to medium screens
        } else if (screenWidth <= 1075) {
            return 'column'; // For medium screens
        } else {
            return 'row'; // For large screens
        }
    };



    //check inspection
    const [toggle, setToggle] = useState(false);
    const handleToggleInspection = (item) => {
        setToggle(item);

    };

    const toggleAnim = useRef(new AnimatedRN.Value(0)).current;
    const [isToggleDisabled, setIsToggleDisabled] = useState(false);
    const handleToggle = () => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 0 : 1,
            duration: 100, // Increased duration for a more noticeable animation
            useNativeDriver: true, // Change this based on what you are animating
        }).start();

        setToggle(prevToggle => !prevToggle); // Using a callback for the state update
    };

    // Interpolate values for moving the switch and changing the background color
    const switchTranslate = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Adjust these values based on the size of your switch
    });

    const switchColor = toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['grey', '#7b9cff'] // Change colors as needed
    });

    const [inspectionIsRequired, setInspectionIsRequired] = useState('');
    const [inspectionName, setInspectionName] = useState('');
    console.log('PRODUCT DETAILS SCREEN', inspectionIsRequired)
    console.log('PRODUCT DETAILS SCREEN INSPECTION NAME', inspectionName)

    useEffect(() => {
        const fetchInspection = async () => {
            if (selectedCountry === '') {
                setToggle(false);
                return;
            }

            const countriesDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'CountriesDoc');

            try {
                const docSnap = await getDoc(countriesDocRef);
                if (docSnap.exists()) {
                    const selectedCountryData = docSnap.data()[selectedCountry];

                    if (selectedCountryData) {
                        setInspectionIsRequired(selectedCountryData.inspectionIsRequired);
                        setInspectionName(selectedCountryData.inspectionName);
                        switch (selectedCountryData.inspectionIsRequired) {
                            case "Required":
                                setToggle(true); // Ensure the toggle is on for "Required"
                                setIsToggleDisabled(true); // Disable toggle interaction for "Required"
                                break;
                            case "Not-Required":
                                setToggle(false); // Ensure the toggle is off for "Not-Required"
                                setIsToggleDisabled(true); // Disable toggle interaction for "Not-Required"
                                break;
                            case "Optional":
                            default:
                                setIsToggleDisabled(false); // Enable toggle interaction otherwise
                                break;
                        }
                    } else {
                        setToggle(false);
                        setIsToggleDisabled(false);
                    }
                } else {
                    console.log("CountriesDoc does not exist, setting toggle to false");
                    setToggle(false);
                    setIsToggleDisabled(false);
                }
            } catch (error) {
                console.error("Error fetching document:", error);
                setToggle(false);
                setIsToggleDisabled(false);
            }
        };

        fetchInspection();
    }, [selectedCountry]);

    // Separate effect for handling the animation when the toggle state changes
    useEffect(() => {
        AnimatedRN.timing(toggleAnim, {
            toValue: toggle ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [toggle, toggleAnim]);


    //check inspection

    //check insurance
    const [insurance, setInsurance] = useState(false);
    const handleToggleInsurance = (item) => {
        setInsurance(item);
    };
    //check insurance

    //get currency I HAVE ALREADY THIS ONE
    const [currency, setCurrency] = useState({})
    useEffect(() => {
        const fetchCurrencyData = async () => {
            const currencyDocRef = doc(projectExtensionFirestore, 'currency', 'currency');

            try {
                const docSnap = await getDoc(currencyDocRef);
                if (docSnap.exists()) {
                    const currency = docSnap.data()
                    setCurrency(currency);
                } else {
                    console.log('No such document in the database!');
                }
            } catch (error) {
                console.error('Error fetching currency data:', error);
            }
        };

        fetchCurrencyData();
    }, [])


    //get currency

    //profit map

    const [freightOrigPrice, setFreightOrigPrice] = useState('');


    console.log('PROFIT PRICE DAR ES', freightOrigPrice)
    useEffect(() => {
        const fetchInspection = async () => {

            const portDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'PortsDoc');

            try {
                const docSnap = await getDoc(portDocRef);

                if (docSnap.exists()) {
                    const selectedPortData = docSnap.data()[selectedPort];

                    if (selectedPortData) {


                        setProfitMap(selectedPortData.profitPrice || '');
                        if (!JapanPort) {
                            console.error('NO PORT DETECTED')
                            return;
                        } else {
                            if (JapanPort === "Nagoya") {
                                setFreightOrigPrice(selectedPortData.nagoyaPrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Kobe") {
                                setFreightOrigPrice(selectedPortData.kobePrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Yokohama") {
                                setFreightOrigPrice(selectedPortData.yokohamaPrice || ''); // Use fallback if undefined
                            } else if (JapanPort === "Kyushu") {
                                setFreightOrigPrice(selectedPortData.kyushuPrice || ''); // Use fallback if undefined
                            }
                        }
                    } else {
                    }
                } else {
                    console.log("PortDoc does not exist, setting toggle to false");

                }
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchInspection();
    }, [selectedPort]);
    //profit map

    //fetch ip address
    const [ip, setIp] = useState('');
    const [ipCountry, setIpCountry] = useState('');

    // useEffect to fetch IP and Country
    useEffect(() => {
        async function fetchIpAndCountry() {
            try {
                // Fetch the IP address
                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                const fetchedIp = ipResponse.data.ip;
                setIp(fetchedIp);

                // Fetch IP Country
                if (fetchedIp) {
                    const countryResponse = await axios.get(`https://ipapi.co/${fetchedIp}/json/`);
                    const fetchedIpCountry = countryResponse.data.country_name;
                    setIpCountry(fetchedIpCountry);
                }
            } catch (error) {
                console.error("Error fetching IP information:", error);
            }
        }

        fetchIpAndCountry();
    }, []);
    //fetch ip address


    //is check PRIVACY
    const [isError, setIsError] = useState(false);
    const [isErrorPort, setIsErrorPort] = useState(false);
    //is check PRIVACY

    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />


            <View style={{ flex: 1, maxWidth: 1500, width: '100%', margin: 'auto', flexDirection: screenWidth < 992 ? 'column' : 'row', padding: '2%', }}>

                <View style={{
                    flex: screenWidth < 992 ? null : 3,
                }}>
                    <View style={{ flex: 2 }} />

                    <Text style={{ fontSize: '2.5em', fontWeight: 'bold' }}>{carName}</Text>
                    <Text style={{ fontSize: 13, color: 'blue', }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                    {screenWidth < 992 && (
                        <SocialMedia />
                    )}
                    <View style={{ flex: 1 }} />
                    <CarouselSample allImageUrl={allImageUrl} />


                </View>

                {screenWidth > 992 && (
                    <View
                        style={{ marginHorizontal: '1%' }}
                    />
                )}

                <View style={{ flex: 3, width: '100%', zIndex: -100, marginTop: screenWidth < 992 ? 10 : null }}>
                    {screenWidth > 992 && (
                        <SocialMedia />
                    )}
                    <View style={{ backgroundColor: '#E5EBFD', borderTopRightRadius: 5, borderTopLeftRadius: 5 }}>
                        <View style={{ flexDirection: 'row', padding: 10, zIndex: 50, flex: 1, paddingHorizontal: 20 }}>
                            <View style={{ flex: 1, marginLeft: 5 }}>

                                <Text style={{ fontWeight: '700' }}>US$ <Text style={{ fontSize: '3em', fontWeight: '700' }}>{formattedFobDollar}</Text></Text>
                                <Text style={{ color: '#a5a5a5' }}>Current FOB Price</Text>


                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>


                                <Text style={{ fontWeight: '700' }}>US$ <Text style={{ fontSize: '3em', fontWeight: '700' }}>{calculatePrice ? calculatePrice : '000'}</Text></Text>
                                <Text style={{ color: '#a5a5a5' }}>Total Estimated Price</Text>
                            </View>
                        </View>



                    </View>


                    <View style={{ padding: 10, backgroundColor: '#F2F5FE', paddingHorizontal: 20, zIndex: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                        <View style={{ zIndex: 5, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <SearchCountry setIsError={setIsError} isError={isError} setSelectPort={setSelectPort} handleSelectCountry={handleSelectCountry} selectedCountry={selectedCountry} setSelectCountry={setSelectCountry} />

                            <SearchPort setIsErrorPort={setIsErrorPort} isErrorPort={isErrorPort} selectedCountry={selectedCountry} handleSelectPort={handleSelectPort} selectedPort={selectedPort} />

                        </View>

                        <View style={{ zIndex: -2, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: '2%' }}>
                            <View style={{ flex: 3, zIndex: -2, }}>
                                <Inspection
                                    isToggleDisabled={isToggleDisabled}
                                    toggleAnim={toggleAnim}
                                    handleToggle={handleToggle}
                                    switchTranslate={switchTranslate}
                                    switchColor={switchColor}
                                    setToggle={setToggle} toggle={toggle}
                                    handleToggleInspection={handleToggleInspection}
                                    selectedCountry={selectedCountry} />
                            </View>
                            <View style={{ flex: 3, zIndex: -2, }}>
                                <Insurance
                                    setInsurance={setInsurance}
                                    insurance={insurance}
                                    handleToggleInsurance={handleToggleInsurance}
                                />
                            </View>
                        </View>
                        <Calculate selectedPort={selectedPort} setProfitMap={setProfitMap} setCalculatePrice={setCalculatePrice} totalPriceCalculation={totalPriceCalculation} />

                    </View>



                    {/* <View style={{ paddingLeft: 10 }}>
                                        <Warranty />
                                    </View> */}
                    <View style={{ padding: 16, backgroundColor: '#f5f5f5', marginTop: 5 }}>
                        <View style={{ paddingHorizontal: 12 }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                                flex: 1
                            }}>
                                <Text style={{ fontSize: 16, color: '#FFA500' }}>
                                    Please sign up before initiating a chat with us
                                </Text>
                                <TouchableOpacity style={{
                                    backgroundColor: '#FFA500', // Orange color for the 'Sign Up Free' button
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 5
                                }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                        Sign Up Free
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    padding: 10,
                                    borderRadius: 5,
                                    marginBottom: 16,
                                    fontSize: 16,
                                    textAlignVertical: 'top',
                                    backgroundColor: 'white',
                                    height: 90
                                }}
                                placeholder="Write your message here"
                                multiline={true}
                                numberOfLines={2}
                                onChangeText={handleTextChange}
                            />


                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {isCheck ? (
                                    <Feather name='check-square' size={20} onPress={() => checkButton(false)} />
                                ) : (
                                    <Feather name='square' size={20} onPress={() => checkButton(true)} />
                                )}
                                <Text style={{ marginLeft: 8, fontSize: 14 }}>I agree to Privacy Policy and Terms of Agreement</Text>
                            </View>

                            <View style={{
                                marginHorizontal: '20%',
                                justifyContent: 'center',
                                flex: 1

                            }}>
                                <MakeAChat
                                    allImageUrl={allImageUrl}
                                    setIsErrorPort={setIsErrorPort}
                                    setIsError={setIsError}
                                    textInputRef={textInputRef}
                                    isCheck={isCheck}
                                    insurance={insurance}
                                    ip={ip}
                                    ipCountry={ipCountry}
                                    freightOrigPrice={freightOrigPrice}
                                    JapanPort={JapanPort}
                                    selectedCountry={selectedCountry}
                                    selectedPort={selectedPort}
                                    currency={currency}
                                    profitMap={profitMap}
                                    inspectionIsRequired={inspectionIsRequired}
                                    inspectionName={inspectionName}
                                    carId={carId} carName={carName} userEmail={userEmail} setToggle={setToggle} toggle={toggle} />
                            </View>
                        </View>
                    </View>

                </View>



            </View>

            <View style={{

                paddingHorizontal: '2%',
                marginRight: screenWidth > 1600 ? 20 : 0,
                flexDirection: screenWidth <= 992 ? null : 'row',
                maxWidth: 1500,
                alignSelf: 'center',
                width: screenWidth > 1600 ? '100%' : '97%',
                zIndex: -99
            }}>
                <View style={{ marginTop: 10, marginRight: 5, flex: screenWidth <= 992 ? null : 3, }}>
                    <GetDataSpecifications />
                </View>
                <View style={{ marginTop: 10, flex: screenWidth <= 992 ? null : 3, }}>
                    <GetDataFeature />
                </View>
            </View>
            <View style={{ backgroundColor: 'black', marginTop: '2%' }}>
                <SearchByTypes carItems={carItems} />
            </View>
            {/* 
                <View style={{ alignSelf: 'center' }}>
                    <View style={[{ flexDirection: screenWidth > 768 ? 'row' : 'column', width: screenWidth > 1280 ? 1188 : '100%', alignItems: 'flex-start' }, styles.containerBox]}>
                        <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
                            <View style={{ width: '100%', }}>
                                <GetDataSpecifications />
                            </View>
                        </View>
                        <View style={[{ width: screenWidth > 1280 ? 594 : '50%', padding: 10, marginRight: 'auto' }, { width: screenWidth <= 768 ? '100%' : '50%' }]}>
                            <View style={{ width: '100%' }}>
                                <GetDataFeature />
                            </View>
                        </View>
                    </View>
                </View> */}







            <StickyFooter />
        </View>
    );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
    containerBox: {
        justifyContent: 'center',
        borderRadius: 5,
    },
    categoryContainer: {
        marginBottom: 0,
    },
    category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    specificationItem: {
        fontSize: 16,
        marginBottom: 5,
    },
    category: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,

    },
    rowContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    columnContainer: {

        paddingHorizontal: 5
    },
    createButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },


});
