import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, FlatList, Pressable, TextInput, Modal, Animated, useWindowDimensions } from 'react-native';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, Fontisto, MaterialCommunityIcons } from 'react-native-vector-icons';
import { firebaseConfig, db, query, where, getFirestore } from '../../firebaseConfig';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, serverTimestamp, addDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { AuthContext } from '../../context/AuthProvider';
import logo4 from '../../assets/RMJ logo for flag transparent.png'
import { projectExtensionFirestore, projectExtensionFirebase, projectExtensionStorage } from '../../firebaseConfig';
import { getStorage, ref, listAll, getDownloadURL, } from 'firebase/storage';
import axios from 'axios';
import moment from 'moment';
import Carousel from 'react-native-reanimated-carousel';

const StickyHeader = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchQueryWorld, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQueryWorld.trim() !== '') {
            // Navigate to SearchCar.js with the searchQuery as a route parameter
            navigate(`/SearchCar/${searchQueryWorld}`);
        }
    };
    const [scrollY] = useState(new Animated.Value(0));
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);


    return (

        <Animated.View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: '#aaa',
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                backgroundColor: 'lightblue',
                justifyContent: 'center',
                backgroundColor: '#fff', // Background color // Gradient effect (won't work in React Native) // CSS gradient
                zIndex: 1000,
                transform: [
                    {
                        translateY: scrollY.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, -100],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }}
        >
            <View style={{ flexDirection: 'row', flex: 1, }}>
                <TouchableOpacity onPress={() => navigate('/')} style={{ flex: 1, justifyContent: 'center', }}>
                    <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 1 }} />
                </TouchableOpacity>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f4f4f4',
                    borderWidth: 0.5,
                    padding: 5,
                    borderRadius: 5,
                    margin: 20,
                    flex: 3
                }}>
                    <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
                    <TextInput
                        placeholder='Search by make, model, or keyword'
                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
                        textAlignVertical='center'
                        placeholderTextColor={'gray'}
                        onChangeText={text => setSearchQuery(text)}
                        onSubmitEditing={handleSearch}// Call handleSearch with the entered text
                    />
                </View>
                {user ? (
                    <>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
                            <TouchableOpacity onPress={() => navigate(`/Profile`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text>Profile</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
                            <TouchableOpacity onPress={logout} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text >Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, }}>
                            <TouchableOpacity onPress={() => navigate(`/SignUp`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
                            <TouchableOpacity onPress={() => navigate(`/LoginForm`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                                <Text >Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    );
};
const SearchCountry = ({ handleSelectCountry, selectedCountry, setSelectCountry, setSelectPort }) => {
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
        setSelectCountry(null);
        setSelectPort('');
    }
    //countries and ports ends here
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 150 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{selectedCountry ? selectedCountry.replace(/_/g, '.') : 'Select Country'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleClear}>
                        <AntDesign name="close" size={15} />
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
                                onPress={() => { handleSelectCountry(item); handleIsActive() }}
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
const SearchPort = ({ selectedCountry, handleSelectPort, selectedPort }) => {
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
        <View style={{ flex: 1, padding: 5, minWidth: 150 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center'
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
                                onPress={() => { handleIsActive(); handleSelectPort(item); }}
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

const Insurance = () => {
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
    const toggleAnim = useRef(new Animated.Value(0)).current;

    const handleToggle = () => {
        Animated.timing(toggleAnim, {
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
                <Animated.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <Animated.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </Animated.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Insurance</Text>
        </View>
    )
}
const Inspection = () => {
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
    const toggleAnim = useRef(new Animated.Value(0)).current;

    const handleToggle = () => {
        Animated.timing(toggleAnim, {
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
                <Animated.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <Animated.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </Animated.View>
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
    const toggleAnim = useRef(new Animated.Value(0)).current;

    const handleToggle = () => {
        Animated.timing(toggleAnim, {
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
                <Animated.View style={[styles.switch, { backgroundColor: switchColor }]}>
                    <Animated.View style={[styles.toggle, { transform: [{ translateX: switchTranslate }] }]} />
                </Animated.View>
            </Pressable>
            <Text style={{ fontSize: 16, marginLeft: 5 }}>Warranty</Text>
        </View>
    )
}
const Calculate = () => {
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'center', // Center the buttons
            alignItems: 'center', // Vertically center items in the container
            padding: 10,
            flex: 3// Add some padding around the container
        }}>
            <Pressable
                onPress={() => {
                    // Your onPress handler code for reset
                }}
                style={({ pressed }) => ({
                    flex: 1, // Do not grow, take as much space as needed
                    opacity: pressed ? 0.5 : 1,
                    backgroundColor: '#f5f5f5', // Light grey background for the Reset button
                    marginRight: 10, // Add margin to the right for spacing
                    borderRadius: 20, // Rounded corners for the buttons
                    paddingHorizontal: 15, // Horizontal padding
                    height: 35, // Fixed height for the button
                    justifyContent: 'center', // Center content vertically
                    alignItems: 'center', // Center content horizontally
                })}
            >
                <Text style={{
                    fontWeight: '600',
                    textAlign: 'center' // Ensure text is centered
                }}>Reset</Text>
            </Pressable>
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

//get the data from carls datanbase sample
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
                                        backgroundColor: feature.value ? '#7b9cff' : '#fff',
                                        borderWidth: 1,
                                        borderColor: feature.value ? '#7b9cff' : '#706E6E',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 40,
                                        marginBottom: 5,
                                        maxWidth: '100%',
                                        margin: 5,
                                        padding: 2,
                                    }}
                                >
                                    <Text adjustsFontSizeToFit numberOfLines={2} style={{ textAlign: 'center', color: feature.value ? 'white' : '#706E6E', fontSize: 12, fontWeight: '600' }}>{feature.name}</Text>
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
        <View>
            <View style={{ width: '100%', paddingRight: 5, height: 50, padding: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#7b9cff', paddingLeft: 10 }} >
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>Features</Text>
                </View>
            </View>
            <FlatList
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
                <View style={{ flex: 1, backgroundColor: '#7b9cff', padding: 10, margin: 5, }}>
                    <Text style={[styles.specificationItem, { color: 'white' }]}>{item.name}</Text>
                </View>
                <View style={{ flex: 1, padding: 10, margin: 5, borderWidth: 1, borderColor: '#706E6E' }}>
                    <Text style={{ fontSize: 16, color: '#706E6E' }}>{item.value || 'N/A'}</Text>
                </View>
            </View>
        );
    };

    const renderSpecificationCategory = ({ item }) => {
        return (
            <View style={[styles.categoryContainer]}>
                {/* <View style={{ backgroundColor: '#7b9cff', padding: 6, marginBottom: 5 }}>
                    <Text style={[styles.category, { color: 'white' }]}>{item.category}</Text>
                </View> */}
                <View style={{ width: '100%', paddingRight: 5, height: 50, padding: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#7b9cff', paddingLeft: 10 }} >
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 22 }}>{item.category}</Text>
                    </View>
                </View>
                <FlatList
                    data={item.data}
                    renderItem={renderSpecificationItem}
                    keyExtractor={(specItem) => specItem.name}
                />
            </View>
        );
    };

    return (
        <View>
            <FlatList
                data={specsData}
                renderItem={renderSpecificationCategory}
                keyExtractor={(item) => item.category}
            />
        </View>
    )

};


const MakeAChat = ({ carId, carName, userEmail, inspectionIsRequired, inspectionName, toggleInspection, toggleWarranty, toggleInsurance, portPrice, currentCurrency }) => {
    //MAKE MODAL


    console.log('Received inspectionName:', inspectionName);

    console.log('Received inspectionIsRequired:', inspectionIsRequired);

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
        if (!userEmail) {
            // If not logged in, redirect to the login form
            navigate('/LoginForm');
            return;
        }
        if (!carData) {
            console.error('Invalid product data or missing id:', carData);
            return; // Exit the function to prevent further errors
        }

        const productIdString = carId;
        console.log('CAR ID: ', productIdString);
        // Check if the product is already in the user's transactions
        const userEmailAddress = userEmail; // Replace this with the actual user's email
        if (!userEmailAddress) {
            console.error('User email address is not available.');
            return;
        }
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
            const transactionRefExtension = doc(collection(projectExtensionFirestore, 'accounts', userEmailAddress, 'transactions'), productIdString);

            const transacionDocExtension = await getDoc(transactionRefExtension);


            if (transacionDocExtension.exists()) {
                openAlreadyInquiredModal();
                return;
            }

            // If the product is not already in transactions, add it
            setUserTransactions((prevTransactions) => [...prevTransactions, carData]);

            // Add the product to the "Transactions" collection in Firebase

            await setDoc(transactionRefExtension, {
                ...carData,
                productId: productIdString,

            });

            const chatId = `chat_${carId}_${userEmail}`;
            //NEW DATE FEATURE

            //NEW DATE FEATURE
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));


            const messageData = {
                sender: userEmail, // Sender's email
                text: `You are now inquiring with this product.`,
                timestamp: formattedTime,
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
            lastMessage: 'You are now inquiring with this product.',
            lastMessageSender: userEmail,
            participants:
            {
                salesRep: recipientEmail,
                customer: userEmail,
            },

            carData,

            stepIndicator: {
                value: 1,
                stepStatus: "Negotiation"
            },
            inspectionIsRequired: inspectionIsRequired,
            inspectionName: inspectionName,
            inspection: toggleInspection,
            warranty: toggleWarranty,
            insurance: toggleInsurance,
            currency: currentCurrency,
            freightPrice: portPrice,
            dateOfTransaction: formattedTime
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
                    backgroundColor: '#FA4D4D', justifyContent: 'center',
                    alignItems: 'center',
                    height: 40,
                    shadowColor: '#000', // Set the shadow color for iOS
                    shadowOffset: { width: 0, height: 4 }, // Set the shadow offset (y = 4)
                    shadowOpacity: 0.25, // Set the shadow opacity (25%)
                    shadowRadius: 4,
                }}>
                <Text style={{ textAlign: 'center', color: 'white' }}>Send Inquiry</Text>
            </TouchableOpacity>
            {/* "Already Inquired" modal */}
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

const CarouselSample = ({ allImageUrl }) => {

    return (
        <View style={{ maxWidth: 200, maxHeight: 370, width: '100%' }}>
            <FlatList
                data={allImageUrl}
                keyExtractor={(item, index) => `image-${index}`}
                renderItem={({ item }) => (
                    <View style={{ backgroundColor: '#f5f5f5', borderRadius: 5, marginBottom: 5, margin: 5 }}>
                        <Image
                            source={{ uri: item }}
                            style={{ width: '100%', height: 150, }}
                            resizeMode='contain'
                        />
                    </View>
                )}
                style={{ flex: 1, width: '100%' }}
            />
        </View>
    )
}

const ProductDetailScreen = () => {
    // const totalPriceCalculation = (selectedChatData.fobPrice * selectedChatData.jpyToUsd) + (selectedChatData.m3 * selectedChatData.freightPrice);
    const { carId } = useParams();
    const navigate = useNavigate();
    const [carData, setCarData] = useState({});
    const { userEmail } = useContext(AuthContext);
    const [userTransactions, setUserTransactions] = useState([]);
    //get inspection
    const [inspectionName, setInspectionName] = useState('');
    const [inspectionIsRequired, setInspectionIsRequired] = useState('');
    const [toggleInspection, setToggleInspection] = useState(false);

    const getInspection = ({ inspection, nameInspection }) => {
        setInspectionIsRequired(inspection);
        setInspectionName(nameInspection);
    };
    console.log('TRUE OR FLASE', toggleInspection)
    useEffect(() => {
        setInspectionStatus(inspectionIsRequired);

        if (inspectionIsRequired === 'Not-Required') {
            setToggleInspection(false);
        }
    }, [inspectionIsRequired, toggleInspection]);
    const [inspectionStatus, setInspectionStatus] = useState('');

    const handleTick = () => {
        if (inspectionStatus === 'Optional') {
            setToggleInspection((prev) => !prev);
        } else if (inspectionStatus === 'Required') {
            setToggleInspection(true)
        } else {
            setToggleInspection(false)
        }
    };
    const [toggleWarranty, setToggleWarranty] = useState(false);
    const handleTickWarranty = () => {
        setToggleWarranty((prev) => !prev);
    };
    const [toggleInsurance, setToggleInsurance] = useState(false);
    const handleTickInsurance = () => {
        setToggleInsurance((prev) => !prev);
    };
    useEffect(() => {
        handleTick()
    }, [inspectionStatus])
    console.log('INSPECTION STATUS', inspectionStatus) // Set the default status


    //get inspection
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

    const [vehicleData, setVehicleData] = useState({});
    useEffect(() => {
        const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
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

    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        const folderRef = ref(projectExtensionStorage, vehicleData.stockID);

        // Function to fetch the first image URL for a folder
        const fetchImageURL = async (folderRef) => {
            try {
                // List all items (images) in the folder
                const result = await listAll(folderRef);

                if (result.items.length > 0) {
                    // Get the download URL for the first image in the folder
                    const imageUrl = await getDownloadURL(result.items[0]);
                    // Update the imageUrl state with the new URL
                    setImageUrl(imageUrl);
                } else {
                    // If the folder is empty, you can add a placeholder URL or handle it as needed
                }
            } catch (error) {
                console.error('Error listing images for folder', vehicleData.stockID, ':', error);
            }
        };

        // Fetch image URL for the vehicleData's referenceNumber
        fetchImageURL(folderRef);
    }, [vehicleData.stockID]);

    const [allImageUrl, setAllImageUrl] = useState([]);
    useEffect(() => {
        const folderRef = ref(projectExtensionStorage, vehicleData.stockID);
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
    }, [vehicleData.stockID])

    const renderImage = ({ item }) => (
        <Image
            source={{ uri: item }}
            style={{
                flex: 1, // Take up all available space within the parent container
                aspectRatio: 1, // Maintain aspect ratio (square images)
                margin: 5, // Add margin between images
                width: '100%',
                height: 150,
                resizeMode: 'cover' // Add border radius to images for rounded corners
            }}
        />
    );
    const scrollViewRef = useRef(null);

    const scrollToTop = () => {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
    };
    useEffect(() => {
        scrollToTop();
    }, []);

    //COUNTRY PICKER
    const [selectedCountry, setSelectCountry] = useState(null);
    const handleSelectCountry = (option) => {
        setSelectCountry(option)
    }
    //COUNTRY PICKER

    //PORT PICKER
    const [selectedPort, setSelectPort] = useState('');
    const handleSelectPort = (option) => {
        setSelectPort(option)
    }
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
    const [profitMap, setProfitMap] = useState([]);
    console.log('PROFIT MAP', profitMap.profitPrice)
    const portPrice = profitMap.profitPrice
    //FETCH PORTS DOC
    //DOLLAR CONVERSION
    const fobDollar = currentCurrency.jpyToUsd * parseFloat(carData.fobPrice);
    const totalPriceCalculation = (parseFloat(carData.fobPrice) * currentCurrency.jpyToUsd) + (parseFloat(carData.dimensionCubicMeters) * parseFloat(profitMap.profitPrice));
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

    return (
        <View style={{ height: '100vh', flex: 3 }}>
            <StickyHeader />

            <ScrollView ref={scrollViewRef}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    <View style={{ flexDirection: screenWidth <= 992 ? 'column' : 'row', flex: 3 }}>
                        <View style={{ padding: 10, flex: 1 }}>

                            <View style={{ maxWidth: screenWidth <= 992 ? '100%' : 750, width: '100%', alignSelf: screenWidth <= 992 ? 'center' : 'flex-end' }}>

                                <Text style={{ fontWeight: 'bold', fontSize: 28, textAlign: 'left', marginBottom: 5 }}>
                                    {vehicleData.carName} C CLASS
                                </Text>

                                <View style={{ flexDirection: 'row', width: '100%' }}>
                                    <View style={{ maxWidth: screenWidth <= 992 ? '100%' : 500, flex: 3 }}>
                                        <Image
                                            source={{ uri: imageUrl }}
                                            style={{ borderRadius: 5, maxWidth: screenWidth <= 992 ? '100%' : 500, height: 370, resizeMode: screenWidth <= 1280 ? 'contain' : 'cover' }}

                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <CarouselSample allImageUrl={allImageUrl} />
                                    </View>
                                </View>
                            </View>

                        </View>



                        <View style={{ flex: screenWidth <= 992 ? 1 : 1, padding: 10, }}>
                            <View style={{ padding: 5, flex: 1 }}>
                                <View style={{ flex: 1, maxWidth: screenWidth <= 992 ? '100%' : 750, width: '100%', alignSelf: screenWidth <= 992 ? 'center' : 'flex-start' }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 28, textAlign: 'left', marginBottom: 5 }}>
                                        {vehicleData.carName} C CLASS
                                    </Text>
                                    <View style={{ flexDirection: 'row', padding: 10, zIndex: 50, flex: 1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Current FOB Price</Text>
                                            <Text style={{ fontWeight: '700' }}>US$ <Text style={{ fontSize: 22, fontWeight: '700' }}>000</Text></Text>


                                            <SearchCountry setSelectPort={setSelectPort} handleSelectCountry={handleSelectCountry} selectedCountry={selectedCountry} setSelectCountry={setSelectCountry} />
                                        </View>




                                        <View style={{ flex: 1 }}>
                                            <Text>Total Estimated Price</Text>
                                            <Text style={{ fontWeight: '700' }}>US$ <Text style={{ fontSize: 22, fontWeight: '700' }}>000</Text></Text>

                                            <SearchPort selectedCountry={selectedCountry} handleSelectPort={handleSelectPort} selectedPort={selectedPort} />
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', padding: 10 }}>
                                        <View style={{ flex: 1, zIndex: -2 }}>
                                            <Text>Additional</Text>
                                            <View style={{ flexDirection: getFlexDirection(screenWidth), alignItems: screenWidth <= 1075 ? 'flex-start' : 'center', justifyContent: 'space-between' }}>
                                                <View>
                                                    <Inspection />
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Insurance />
                                                </View>
                                            </View>

                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Calculate />
                                        </View>
                                    </View>
                                    {/* <View style={{ paddingLeft: 10 }}>
                                        <Warranty />
                                    </View> */}
                                    <View>
                                        <ChatWithUs />
                                    </View>
                                </View>
                            </View>
                        </View>

                    </View>

                </View>
                <View style={{
                    paddingHorizontal: 100,
                    maxWidth: 1550,
                    borderBottomWidth: 2,
                    borderBottomColor: '#ccc',
                    alignSelf: 'center',
                    width: '100%'

                }} />
                <View style={{
                    marginRight: screenWidth > 1600 ? 20 : 0,
                    flexDirection: screenWidth <= 992 ? 'column' : 'row',
                    maxWidth: 1500,
                    alignSelf: 'center',
                    width: screenWidth > 1600 ? '100%' : '97%',
                }}>
                    <View style={{ marginTop: 10, width: '100%', flexShrink: 1, marginRight: 5 }}>
                        <GetDataSpecifications />
                    </View>
                    <View style={{ marginTop: 10, width: '100%', flexShrink: 1 }}>
                        <GetDataFeature />
                    </View>
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






            </ScrollView>

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

        paddingHorizontal: 5
    },
    createButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },


});
