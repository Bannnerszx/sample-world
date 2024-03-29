import { ImageBackground, StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, Image, ScrollView, Pressable, Linking, Modal } from 'react-native';
import React, { useEffect, useState, useRef, useMemo, useContext, useCallback, useLayoutEffect } from 'react';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, MaterialCommunityIcons } from 'react-native-vector-icons';
import { FontAwesome5Brands } from '@expo/vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from '../../firebaseConfig';
import { addDoc, collection, doc, getDocs, query, getDoc, onSnapshot, where, orderBy, limit, } from 'firebase/firestore';
import { FlatGrid } from 'react-native-super-grid';
import Carousel from 'react-native-reanimated-carousel';
import { interpolate } from 'react-native-reanimated';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../../context/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import logo1 from '../../assets/RMJ Cover Photo for Facebook.jpg';
import gifLogo from '../../assets/rename.gif'
import carSample from '../../assets/2.jpg'
import axios from 'axios';
import { apiConfig } from '../../apiConfig';
import Svg, {
    G,
    Path,
    Defs,
    Mask,
    LinearGradient,
    Stop
} from "react-native-svg"
import bgSVG from '../../assets/Hexagon.png'
import { max } from 'moment';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import feature from '../../assets/features.json';

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
    const [scrollY] = useState(new Animated.Value(0));

    return (
        <Animated.View style={{
            borderBottomWidth: 1,
            borderBottomColor: '#aaa',
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
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
                        defaultValue={searchQueryWorldRef.current}
                        onChangeText={handleChangeQuery}
                        onSubmitEditing={handleSearch}
                    />
                </View>
                {user ? (
                    <>
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
                                <Text >Log In CHANGES</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    )
};
const DropDownMake = ({ makes, handleSelectMake, carMakes }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };

    return (
        <View style={{ flex: 1, padding: 5, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{carMakes ? carMakes : 'Make'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        color={'blue'}
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
                    margin: 5,
                    zIndex: 99
                }}>
                    <FlatList
                        data={makes} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleSelectMake(item); handleIsActive(false) }}
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
const DropDownModel = ({ model, handleSelectModel, carModel, carMakes }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <View style={{ flex: 1, padding: 5, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10,
                    borderWidth: 1, // Adjust padding as needed
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{carModel ? carModel : 'Model'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={model} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectModel(item); }}
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
    );
};
const DropDownBodyType = ({ bodyType, carBodyType, handleSelectBodyType }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <View style={{ flex: 1, padding: 5, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{carBodyType ? carBodyType : 'Body Type'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={bodyType} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectBodyType(item); }}
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
    );
};
const DropDownMinPrice = ({ }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const minPrice = [
        500, 1000, 1500, 2000, 2500, 3000, 3500, 4000,
        4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000,
        8500, 9000, 9500, 10000, 15000, 20000, 30000
    ];
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{'Min Price'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={minPrice} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false) }}
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
const DropDownMaxPrice = ({ }) => {

    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const maxPrice = [
        500, 1000, 1500, 2000, 2500, 3000, 3500, 4000,
        4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000,
        8500, 9000, 9500, 10000, 15000, 20000, 30000
    ];
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{'Max Price'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={maxPrice} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false) }}
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
const DropDownMinYear = ({ handleSelectMinYear, carMinYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{carMinYear ? carMinYear : 'Min Year'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={years} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMinYear(item); }}
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
const DropDownMaxYear = ({ handleSelectMaxYear, carMaxYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{carMaxYear ? carMaxYear : 'Max Year'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                        data={years} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMaxYear(item) }}
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
const ApiTester = () => {


    useEffect(() => {
        // The fetch call is placed inside useEffect to ensure it's called when the component mounts
        fetch('/vehicle-details')
          .then(response => response.text()) // Use .json() if the response is in JSON format
          .then(data => {
            console.log(data);
            // You can also set the data to the component state to use it in the render, if needed
          })
          .catch(error => console.error('Error:', error));
      }, []); // The empty array means this effect runs once on mount and not on subsequent updates
    
};


const VehicleDataForm = () => {
    // const [vehicleData, setVehicleData] = useState(null);
    // const username = 'rmj-jackall';
    // const password = 'Y7bwoHzY2J';
    // const credentials = btoa(`${username}:${password}`);

    // useEffect(() => {
    //     fetch('http://192.168.24.88:3001/vehicle-details', {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Basic ${credentials}`,
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             "tokenkey": "0iXRkSCDfNwO",
    //             "action_cd": "update",
    //             "stock_id": "179924",
    //             "status": "Sold",
    //             "reference_no": "Y2023080140A-21",
    //             "m_as_maker_id": "59",
    //             "m_as_model_id": "1343",
    //             "grade_name": "116i 右ﾊﾝﾄﾞﾙ",
    //             "model_code": "GH-UF16",
    //             "frame_number": "WBAUF12060PZ31920",
    //             "model_number": "15016",
    //             "devision_number": "0001",
    //             "registration_year": "2006",
    //             "registration_month": "08",
    //             "manufacture_year": "",
    //             "manufacture_month": "",
    //             "m_as_bodytype_id": "5",
    //             "m_bodystyle_sub_id": "",
    //             "length": "4240",
    //             "width": "1750",
    //             "height": "1430",
    //             "displacement": "1600",
    //             "mileage_odometer_cd": "0",
    //             "mileage": "73266",
    //             "m_as_fueltype_id": "1",
    //             "m_as_transmission_id": "1",
    //             "m_as_steering_id": "2",
    //             "m_as_drivetype_id": "2",
    //             "number_of_passengers": "5",
    //             "door_cnt": "5",
    //         })
    //     })
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             console.log(data);
    //         })
    //         .catch(error => console.error('Error:', error));
    // }, []);

    return (
        <div>

            {/* {vehicleData && <pre>{JSON.stringify(vehicleData, null, 2)}</pre>} */}
        </div>
    );
};


const DropDownSelectCountry = ({ countryData, handleSelectCountry, selectedCountry }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99, }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{selectedCountry ? selectedCountry.replace(/_/g, '.') : 'Select Country'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                                onPress={() => { handleIsActive(false); handleSelectCountry(item) }}
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
const DropDownSelectPort = ({ selectedCountry, selectedPort, handleSelectPort, ports }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };


    return (
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99 }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    padding: 10, // Adjust padding as needed
                    borderWidth: 1,
                    borderColor: '#eee',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '500' }}>{selectedPort ? selectedPort : 'Select Port'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    {/* <TouchableOpacity>
                        <AntDesign name="close" size={15} />
                    </TouchableOpacity> */}
                    <AntDesign
                        name="down"
                        size={15}
                        color={'blue'}
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
                                onPress={() => { handleIsActive(false); handleSelectPort(item) }}
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
};
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
};
const SearchByMakes = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const [logos, setLogos,] = useState([
        { id: '1', name: 'Toyota', price: '520' },
        { id: '2', name: 'Nissan', price: '520' },
        { id: '3', name: 'Honda', price: '520' },
        { id: '4', name: 'Mitsubishi', price: '520' },
        { id: '5', name: 'Mercedes-Benz', price: '520' },
        { id: '6', name: 'BMW', price: '520' },
    ])
    useEffect(() => {
        const fetchLogoUrls = async () => {
            const updatedRankings = await Promise.all(logos.map(async (maker) => {
                try {
                    // Create a reference to the logo file in Firebase Storage
                    const logoRef = ref(projectExtensionStorage, `logos/${maker.name.toLowerCase().replace('-benz', '')}Icon.png`);

                    // Fetch the download URL
                    const logoUrl = await getDownloadURL(logoRef);

                    // Return the updated maker object with the logoUrl
                    return { ...maker, logoUri: logoUrl };
                } catch (error) {
                    console.error('Error fetching logo URL for:', maker.name, error);
                    // Return the original maker object if there's an error
                    return { ...maker, logoUri: '' };
                }
            }));

            setLogos(updatedRankings);
        };

        fetchLogoUrls();
    }, []);

    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 5,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginLeft: 20,
            marginRight: 20
        },
        itemContainer: {
            // Reduce the margin or remove it to fit within the grid calculation
            alignItems: 'center',
            justifyContent: 'center',
            margin: 5, // Adjusted from 10 to 5
        },
        logoContainer: {
            // Set a fixed width and height that includes the border and padding
            width: 150, // Adjusted from 180 to 170
            height: 120, // Adjusted from 130 to 120
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            borderWidth: 2,
            padding: 5,
            borderRadius: 3,
            borderColor: '#aaa'
        },
        logoImage: {
            // Keep as is; ensure the image fits within the logoContainer
            width: '100%',
            height: '100%',
            maxWidth: 70, // This should be less than the width of logoContainer minus padding and border
            maxHeight: 70, // This should be less than the height of logoContainer minus padding and border
            resizeMode: 'contain'
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
        indexZero: {
            // These styles are specific to the first item; adjust dimensions as needed
            width: '100%',
            height: '100%',
            maxWidth: 170, // Adjusted to match the width of logoContainer
            maxHeight: 90, // Adjusted to be less than the height of logoContainer to accommodate marginTop
            resizeMode: 'contain',
            marginTop: 25
        },
        indexThree: {
            // These styles are specific to the fourth item; adjust dimensions as needed
            width: '100%',
            height: '100%',
            maxWidth: 110, // Adjusted to be less than the width of logoContainer minus padding and border
            maxHeight: 110, // Adjusted to be less than the height of logoContainer minus padding and border
            resizeMode: 'contain',
        }
    });

    let numberOfItemsPerRow;

    // Determine the number of items per row based on the screen width
    if (screenWidth > 992) {
        numberOfItemsPerRow = 6;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 2;
    }

    const spacing = screenWidth > 440 ? 30 : 10; // Spacing between items
    const totalSpacing = spacing * (numberOfItemsPerRow - 1); // Total spacing between items
    const borderWidth = styles.logoContainer.borderWidth * 2; // Total border width on both sides
    const itemContentWidth = screenWidth > 440 ? (screenWidth - totalSpacing) / numberOfItemsPerRow : 150;
    const horizontalInsets = 2 * styles.itemContainer.margin + 2 * styles.logoContainer.padding + borderWidth; // Added borderWidth here
    const itemDimension = itemContentWidth - horizontalInsets;
    const renderItem = ({ item, index }) => {
        let itemStyle;
        if (index === 0) {
            itemStyle = styles.indexZero;
        } else if (index === 3) {
            itemStyle = styles.indexThree;
        } else {
            itemStyle = styles.logoImage;
        }
        return (
            <View style={styles.itemContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: item.logoUri }}
                        style={itemStyle}
                    />
                </View>
                <View style={[{ flexDirection: 'row' }, []]}>
                    <Text>{item.name} </Text>
                    <Text style={{ textDecorationLine: 'underline', color: 'blue' }}>{item.price}</Text>
                </View>
            </View>
        );
    };

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
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginLeft: -35, }}>
                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'black' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>Search by Makers</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Makers</Text>
                    </TouchableOpacity>
                </View>
            )}
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Search by Makers</Text>
                </View>
            )}
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={logos}
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
    );

};
const SquareBlue = () => {
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
            backgroundColor: 'rgba(0, 0, 255, 0.5)',
            marginLeft: 1,
        },
    });

    const createOddRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 === 0) ? 'rgba(0, 0, 255, 0.4)' : 'transparent';
            return (
                <View key={`odd-${index}`} style={[styles.square, { backgroundColor }]} />
            );
        })
    );

    // Function to create a row of gray squares at even positions
    const createEvenRowOfSquares = () => (
        Array.from({ length: 20 }, (_, index) => {
            const backgroundColor = (index % 2 !== 0) ? 'rgba(0, 0, 255, 0.4)' : 'transparent';
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
const Banner = ({ message, style }) => {
    const styles = StyleSheet.create({
        bannerContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'blue',
            // Set width and height as needed
            width: 110, // or use a percentage of the container width
            height: 25, // or use a percentage of the container height
            alignItems: 'center',
            justifyContent: 'center',
            // Adjust the transform and translate values to position the banner
            transform: [
                { rotate: '-45deg' },
                { translateX: '-28%' }, // Shifts the banner left based on its width
                { translateY: '-20%' }, // Shifts the banner down a little (adjust as needed)
            ],
        },
        bannerText: {
            color: 'white',
            fontWeight: 'bold',
        },
    }); return (
        <View style={styles.bannerContainer}>
            <Text style={styles.bannerText}>{message.toUpperCase()}</Text>
        </View>
    );
};

const NewArrivals = ({ carItems }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };
        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    const styles = StyleSheet.create({

        container: {
            padding: 15,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginVertical: 20,
            color: 'blue',
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
            maxWidth: screenWidth < 700 ? 310 : 360,
            width: '100%',
            borderWidth: 1,
            borderColor: 'gray'
        },
        card: {
            overflow: 'hidden',
            backgroundColor: '#fff',
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
            fontSize: 18
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
                    <Banner message={"NEW"} />
                    <View style={styles.textContainer}>
                        <Text style={styles.carName} >
                            {item.carName}
                        </Text>
                        <Text style={{ fontSize: 14, marginTop: 20 }}>
                            {item.regYear}/{item.regMonth}
                        </Text>
                        <Text style={{ fontSize: 14, color: 'blue' }}>
                            {`FOB. US${formattedPrice}`}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }, []);
    let itemDimension = screenWidth < 700 ? 310 : 360;
    let spacing = 10;

    if (screenWidth < 700) {
        const numberOfItemsPerRow = 2;
        const totalSpacing = (numberOfItemsPerRow - 1) * spacing;
        const availableWidth = screenWidth - totalSpacing;
        itemDimension = availableWidth / numberOfItemsPerRow;
    }
    return (
        <View style={styles.container}>
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'flex-end',
                    marginTop: -15,
                    marginRight: -15
                }}>
                    <SquareBlue />
                </View>
            )}
            {screenWidth >= 644 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginLeft: -35 }}>

                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'blue' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>New Arrivals</Text>
                            <SquareBlue />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View More</Text>
                    </TouchableOpacity>
                </View>
            )}

            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>New Arrivals</Text>
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
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View More</Text>
                </TouchableOpacity>
            )}
        </View>
    )

};
const SearchByTypes = () => {
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
        logoContainer: {
            width: 80, // width of the square
            height: 80, // height equal to width to make it a square
            borderRadius: 5, // rounded corners with a radius of 5
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        button: {
            backgroundColor: 'black',
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 5,
            height: 40,
            maxWidth: 150,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        },
    });
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.logoContainer}>
                {/* Replace with an Image component if you have an image source */}
                <Text style={{ color: 'white' }}>{item.logo}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'white' }}>{item.name} </Text>
                <Text style={{ color: 'white' }}>{item.price}</Text>
            </View>
        </View>
    );
    let numberOfItemsPerRow;
    if (screenWidth > 992) {
        numberOfItemsPerRow = 7;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 2;
    }
    const spacing = screenWidth > 440 ? 20 : 10;
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
                            <Text style={styles.title}>Search by Type</Text>
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
                    data={types}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={screenWidth > 440 ? itemDimension : 150}
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
const SearchByTrucks = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

    const types = [
        { id: '1', logo: 'Logo', name: 'FLAT BODY', price: '520' },
        { id: '2', logo: 'Logo', name: 'DUMP', price: '520' },
        { id: '3', logo: 'Logo', name: 'CRANE', price: '520' },
        { id: '4', logo: 'Logo', name: 'MIXER TRUCK', price: '520' },
        { id: '5', logo: 'Logo', name: 'AERIAL PLATFORM', price: '520' },
        { id: '6', logo: 'Logo', name: 'ALUMINUM WING', price: '520' },
        { id: '7', logo: 'Logo', name: 'ALUMINUM VAN', price: '520' },
        { id: '8', logo: 'Logo', name: 'CONTAINER', price: '520' },
        { id: '9', logo: 'Logo', name: 'PACKER', price: '520' },
        { id: '10', logo: 'Logo', name: 'BUS', price: '520' },
        { id: '11', logo: 'Logo', name: 'REFRIGERATED VAN', price: '520' },
        { id: '12', logo: 'Logo', name: 'OTHER TRUCKS', price: '520' },
    ];
    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 5,

        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginVertical: 20,
            color: 'black',
            marginLeft: 20,
            marginRight: 20
        },
        itemContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        logoContainer: {
            width: 130, // width of the square
            height: 80, // height equal to width to make it a square
            borderRadius: 5, // rounded corners with a radius of 5
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
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
    });
    let numberOfItemsPerRow;

    // Determine the number of items per row based on the screen width
    if (screenWidth > 992) {
        numberOfItemsPerRow = 6;
    } else if (screenWidth > 440) {
        numberOfItemsPerRow = 3;
    } else {
        numberOfItemsPerRow = 3;
    }

    const spacing = screenWidth > 440 ? 15 : 10; // Spacing between items
    const totalSpacing = spacing * (numberOfItemsPerRow - 1); // Total spacing between items
    const itemContentWidth = screenWidth > 440 ? (screenWidth - totalSpacing) / numberOfItemsPerRow : 150;
    const horizontalInsets = 2 * 10 + 2 * 5 + 2 * 2; // Assume 10px margin, 5px padding, 2px border on each side
    const itemDimension = itemContentWidth - horizontalInsets;

    const renderItem = ({ item }) => {
        const truncatedName = item.name.length > 7 ? `${item.name.substring(0, 7)}...` : item.name;
        return (
            <View style={styles.itemContainer}>
                <Image
                    source={{ uri: carSample }}
                />
                <View style={styles.logoContainer}>

                    <Text>{item.logo}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{}}>  {screenWidth < 992 ? truncatedName : item.name} </Text>
                    <Text> {item.price}</Text>
                </View>
            </View>
        );
    }
    return (
        <View style={[styles.container]}>
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
                        <View style={{ width: '100%', maxWidth: 80, borderBottomWidth: 2, borderBottomColor: 'black' }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.title}>Search by Trucks</Text>
                            <SquareGrays />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Trucks</Text>
                    </TouchableOpacity>
                </View>
            )}
            {screenWidth < 644 && (
                <View style={{
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Search by Trucks</Text>
                </View>
            )}
            <View style={{ flex: 3, }}>
                <FlatGrid
                    data={types}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={screenWidth > 440 ? itemDimension : 150}
                    spacing={spacing}
                />
            </View>
            {screenWidth < 644 && (
                <TouchableOpacity style={[{
                    marginTop: screenWidth < 644 ? 10 : 0,
                    alignSelf: 'center',
                }, styles.button]}>
                    <Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>View all Trucks</Text>
                </TouchableOpacity>
            )}
        </View>
    )
};
const HowToBUy = () => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20, // or adjust based on your design
            backgroundColor: 'white', // if you want a specific background color
            // For PC, you might want to center the content or align it differently
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        header: {
            fontSize: 24, // or adjust based on your design
            fontWeight: 'bold',
            marginBottom: 20,
        },
        listItem: {
            alignSelf: 'stretch', // for full width
            borderBottomWidth: 1,
            borderColor: 'grey', // or your preferred color
            paddingVertical: 10, // or adjust based on your design
        },
        listText: {
            fontSize: 18, // or adjust based on your design
            // Additional text styling
        },
    });
    return (
        <View style={styles.container}>
            <Text style={styles.header}>How to Buy</Text>
            <View style={styles.listItem}>
                <Text style={styles.listText}>1. Member Registration</Text>
            </View>
            <View style={styles.listItem}>
                <Text style={styles.listText}>2. Search & Contact</Text>
            </View>
            <View style={styles.listItem}>
                <Text style={styles.listText}>3. Order & Payment</Text>
            </View>
            <View style={styles.listItem}>
                <Text style={styles.listText}>4. After Payment. (RCAP System)</Text>
            </View>
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
const SlantedButton = () => {

    const styles = StyleSheet.create({
        buttonDefault: {
            color: 'white',
            backgroundColor: '#FF9300',
            textAlign: 'center',
            textTransform: 'uppercase',
            padding: 9,
            margin: 10,
            borderRadius: 5,
            maxWidth: 160,
            zIndex: -1,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 10
        },
        buttonSlanted: {
            transform: [{ skewX: '20deg' }],
            zIndex: -2
        },
        buttonContent: {
            transform: [{ skewX: '-20deg' }],
            color: 'white',
            fontWeight: '600',
            fontSize: 12,
            marginLeft: 5
        },
        leftOverlay: {
            transform: [{ skewX: '-20deg' }],
            position: 'absolute',
            left: -10,
            top: 0,
            bottom: 0,
            width: 25,
            backgroundColor: '#FF9300',
            borderTopLeftRadius: 5,
            zIndex: -2

        }
    });

    return (
        <TouchableOpacity style={[styles.buttonDefault, styles.buttonSlanted]}>
            <View style={styles.leftOverlay} />
            <Entypo name="magnifying-glass" size={20} color={'white'} style={{ transform: [{ skewX: '-20deg' }] }} />
            <Text style={styles.buttonContent}>Slanted Button</Text>
        </TouchableOpacity>
    );
};
// const SvgBackground = () => {
//     return (
//         <Svg
//             xmlns="http://www.w3.org/2000/svg"
//             width={'100%'}
//             height={550}
//             style={{ flex: 1 }}
//             preserveAspectRatio="none"
//             viewBox="0 0 1440 550"

//         >
//             <G mask='url("#SvgjsMask3045")' fill="none">
//                 <Path fill='url("#SvgjsLinearGradient3046")' d="M0 0H1440V550H0z" />
//                 <Path
//                     d="M84.45 555.72l64.96 37.5v75l-64.96 37.5-64.95-37.5v-75zm259.82 0l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm129.91-225l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm64.95-112.5l64.95 37.5v75l-64.95 37.5-64.95-37.5v-75zm194.86 112.5l64.96 37.5v75l-64.96 37.5-64.95-37.5v-75zm0 225l64.96 37.5v75l-64.96 37.5-64.95-37.5v-75zm64.95-562.5l64.96 37.5v75l-64.96 37.5-64.95-37.5v-75zm64.96 112.5l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm259.81 0l64.96 37.5v75l-64.96 37.5-64.95-37.5v-75zm-64.95 337.5l64.95 37.5v75l-64.95 37.5-64.95-37.5v-75zm129.91-450l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm64.95 337.5l64.95 37.5v75l-64.95 37.5-64.95-37.5v-75zm-64.95 112.5l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm129.91-225l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75zm194.86 337.5l64.95 37.5v75l-64.95 37.5-64.96-37.5v-75z"
//                     stroke="rgba(3, 38, 73, 1)"
//                     strokeWidth={2}
//                 />
//                 <Path
//                     d="M76.95 555.72a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zM12 668.22a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm324.77-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm194.87-262.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm129.91-150a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-129.9-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm259.81 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 187.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm129.9-600a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm194.86 112.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm324.77-112.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 300a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm194.86-487.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-129.91-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm129.91 300a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 187.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm129.91-375a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96-112.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm259.82 300a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0 75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.95 37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm-64.96-37.5a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0zm0-75a7.5 7.5 0 1015 0 7.5 7.5 0 10-15 0z"
//                     fill="rgba(3, 38, 73, 1)"
//                 />
//                 <Path
//                     d="M50.33 50.9l43.31 25v50l-43.31 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 75l43.31 25v50l-43.31 25-43.3-25v-50zm86.61-450l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.31-25v-50zm0 150l43.3 25v50l-43.3 25-43.31-25v-50zm43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.31-25v-50zm43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm43.3-525l43.3 25v50l-43.3 25-43.3-25V.9zm43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 225l43.3 25v50l-43.3 25-43.3-25v-50zm43.3-525l43.31 25v50l-43.31 25-43.3-25V.9zm0 150l43.31 25v50l-43.31 25-43.3-25v-50zm43.31 75l43.3 25v50l-43.3 25-43.31-25v-50zm-43.31 75l43.31 25v50l-43.31 25-43.3-25v-50zm43.31 225l43.3 25v50l-43.3 25-43.31-25v-50zm86.6-450l43.31 25v50l-43.31 25-43.3-25v-50zm0 150l43.31 25v50l-43.31 25-43.3-25v-50zm0 150l43.31 25v50l-43.31 25-43.3-25v-50zm43.31-375l43.3 25v50l-43.3 25-43.31-25V.9zm43.3 375l43.3 25v50l-43.3 25-43.3-25v-50zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm43.3-525l43.3 25v50l-43.3 25-43.3-25V.9zm43.3 375l43.3 25v50l-43.3 25-43.3-25v-50zm129.91-225l43.3 25v50l-43.3 25-43.3-25v-50zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm86.61-300l43.3 25v50l-43.3 25-43.31-25v-50zm43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.31-25v-50zm86.6-300l43.3 25v50l-43.3 25-43.3-25V.9zm43.3 75l43.31 25v50l-43.31 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 225l43.31 25v50l-43.31 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.3-25v-50zm129.91-225l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 75l43.3 25v50l-43.3 25-43.31-25v-50zm86.6-300l43.3 25v50l-43.3 25-43.3-25V.9zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 225l43.3 25v50l-43.3 25-43.3-25v-50zm43.3-75l43.31 25v50l-43.31 25-43.3-25v-50zm0 150l43.31 25v50l-43.31 25-43.3-25v-50zm43.31 75l43.3 25v50l-43.3 25-43.31-25v-50zm43.3-525l43.3 25v50l-43.3 25-43.3-25V.9zm0 150l43.3 25v50l-43.3 25-43.3-25v-50zm43.3 75l43.31 25v50l-43.31 25-43.3-25v-50zm-43.3 225l43.3 25v50l-43.3 25-43.3-25v-50zm129.91-225l43.3 25v50l-43.3 25-43.3-25v-50zm-43.3 225l43.3 25v50l-43.3 25-43.31-25v-50zm129.9-375l43.31 25v50l-43.31 25-43.3-25v-50zm0 450l43.31 25v50l-43.31 25-43.3-25v-50z"
//                     stroke="rgba(12, 36, 61, 0.93)"
//                     strokeWidth={2}
//                 />
//             </G>
//             <Defs>
//                 <Mask id="SvgjsMask3045">
//                     <Path fill="#fff" d="M0 0H1440V550H0z" />
//                 </Mask>
//                 <LinearGradient
//                     x1="15.45%"
//                     y1="-40.45%"
//                     x2="84.55%"
//                     y2="140.45%"
//                     gradientUnits="userSpaceOnUse"
//                     id="SvgjsLinearGradient3046"
//                 >
//                     <Stop stopColor="rgba(0, 82, 255, 1)" offset={0} />
//                     <Stop stopColor="rgba(7, 26, 255, 1)" offset={1} />
//                 </LinearGradient>
//             </Defs>
//         </Svg>
//     )
// }
const Testimonials = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const styles = StyleSheet.create({
        itemContainer: {
            flexDirection: 'row',
            borderRadius: 4,
            padding: 10,
            alignItems: 'center',
            // Add shadow and other styles as per your design
        },
        carImage: {
            width: 80,
            height: 60,
            resizeMode: 'contain',
            marginRight: 10, // Add space between the image and the text
        },
        textContainer: {
            flex: 1,
        },
        dateText: {
            color: 'white',
            // Add styles for the date text
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        stars: {
            color: 'gold',
            marginRight: 5, // Add space between the stars and the title
            // Add styles for the stars
        },
        titleText: {
            color: 'white',
            fontWeight: 'bold',
            // Add styles for the title
        },
        contentText: {
            color: 'white',
            // Add styles for the main content text
        },
        // ... any other styles you need
    });
    const comments = [
        { id: '1', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '2', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '3', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '4', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '5', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '6', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '7', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { id: '8', title: 'Title', comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque felis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ];

    const itemWidth = 150; // Adjust as needed
    const horizontalSpacing = 20; // Horizontal spacing between items
    const verticalSpacing = 20; // Vertical spacing between rows

    let numberOfItemsPerRow = Math.floor((screenWidth - horizontalSpacing) / (itemWidth + horizontalSpacing));
    if (screenWidth > 992) {
        numberOfItemsPerRow = 3;
    } else if (screenWidth > 660) {
        numberOfItemsPerRow = 2;
    } else {
        numberOfItemsPerRow = 1;
    }

    const totalHorizontalSpacing = horizontalSpacing * (numberOfItemsPerRow - 1);
    const itemDimension = (screenWidth - totalHorizontalSpacing) / numberOfItemsPerRow;



    const renderItem = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
                <Image
                    source={{ uri: carSample }}
                    style={styles.carImage}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.dateText}>{'20 DEC 2023'}</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.stars}>★★★★★</Text>
                        <Text style={styles.titleText}>{item.title}</Text>
                    </View>
                    <Text style={styles.contentText}>{item.comment}</Text>
                </View>
            </View>

        )
    }

    return (

        <FlatGrid
            itemDimension={itemDimension}
            spacing={horizontalSpacing}
            data={comments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            fixed
            style={styles.grid}
            itemContainerStyle={{
                marginBottom: verticalSpacing,
            }}
            ListHeaderComponent={(
                <Text style={{
                    color: 'white',
                    fontSize: 28,
                    fontWeight: 'bold',
                    alignSelf: 'center',
                    marginBottom: 30,
                }}>Testimonials</Text>
            )}
        />

    )
}
const WorldMapValues = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const mapAspectRatio = 0.4; // Adjust this to control the map's aspect ratio
    const mapWidth = screenWidth * 0.9;
    const styles = StyleSheet.create({
        container: {
            backgroundColor: '#E9E4EF',
            width: mapWidth,
            height: mapWidth * mapAspectRatio,
        },
        map: {
            width: '100%',
            marginTop: '9%',
            marginLeft: '9%'
        },
        geography: {
            default: {
                fill: "#DCD5E6",
                outline: "none",
            },
            hover: {
                fill: "#DCD5E6",
                outline: "none"
            },
            pressed: {
                fill: "#DCD5E6",
                outline: "none"
            },
        },
        overlay: {
            position: 'absolute',
            bottom: 10, // Adjust this value to place the text closer to the bottom edge
            left: 0,
            right: 0,
            alignItems: 'center',
            backgroundColor: 'transparent', // Maintain a transparent background
        },
        headerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#4F4F4F',
            textAlign: 'center',
        },
        subHeaderText: {
            fontSize: 18,
            color: '#4F4F4F',
            textAlign: 'center',
        },
    });

    return (
        <View style={{
            width: '100%',
            alignSelf: 'center',
            alignItems: 'center', // Center children horizontally
            justifyContent: 'center', // Center children vertically
            maxWidth: 1300,
            maxHeight: 600,
            overflow: 'hidden',
            borderRadius: 10
        }}>

            <View style={[styles.container, { borderRadius: 10 }]}>
                <View style={{ position: 'absolute', bottom: '52%', left: '16%', zIndex: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: 'black', fontWeight: '600', fontSize: '3vw', marginRight: 10 }}>Local Introduction</Text>
                        <Pressable
                            style={{
                                backgroundColor: '#A286BE',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 30,
                                height: 30,
                                borderRadius: 25
                            }}
                        >
                            <AntDesign name="right" size={15} color={'white'} />
                        </Pressable>
                    </View>
                </View>
                <ComposableMap
                    style={styles.map} projection="geoMercator">
                    <Geographies geography={feature}>
                        {({ geographies }) =>
                            geographies.map(geo => (
                                <Geography key={geo.rsmKey} geography={geo} style={styles.geography} />
                            ))
                        }
                    </Geographies>

                </ComposableMap>


                <View style={{ position: 'absolute', bottom: '10%', left: '16%', zIndex: 5 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: '6vw', fontFamily: 'Chivo', opacity: 0.8 }}>REAL MOTOR JAPAN</Text>
                </View>
            </View>

        </View>
    );
};
const WhatsAppView = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const baseFontSize = 18;
    const scaleFactor = 0.03;
    const minimumFontSize = 16;
    const responsiveFontSize = Math.max(screenWidth * scaleFactor, minimumFontSize);

    const fontSize = screenWidth < 768 ? 21 : responsiveFontSize;
    const styles = StyleSheet.create({
        button: {
            borderRadius: 5,
            backgroundColor: '#25D366',
            flex: 1,
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        contentContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,

        },
        chatContainer: {
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        text: {
            color: 'white',
            marginLeft: screenWidth < 768 ? 0 : 10,
            fontWeight: '650'
        },
        circleButton: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: responsiveFontSize / 2,
            height: responsiveFontSize / 2,
            borderRadius: responsiveFontSize / 4,
            marginLeft: 10,
        },
        circleButtonMobile: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: 30,
            marginLeft: 3,
        }
    });
    return (
        <TouchableOpacity style={styles.button}>
            <View style={styles.contentContainer}>
                <FontAwesome name="whatsapp" size={fontSize} color="white" />
                <Text style={[styles.text, { fontSize: fontSize, marginLeft: 3 }]}>WhatsApp</Text>
            </View>
            {screenWidth < 768 && (
                <Ionicons name="chatbox-ellipses-outline" size={30} color="#1EA252" style={{ marginRight: 8, }} />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <Ionicons name="chatbox-ellipses-outline" size={responsiveFontSize * 0.9} color="#1EA252" style={{ marginRight: 8, }} />
                )}
                <Text style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Start Chat</Text>
                <Pressable style={screenWidth < 768 ? styles.circleButtonMobile : styles.circleButton}>
                    <AntDesign name="right" size={screenWidth < 768 ? 8 : responsiveFontSize / 4} color={'#25D366'} />
                </Pressable>
            </View>
        </TouchableOpacity>

    );
};
const SignUpView = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                Dimensions.removeEventListener('change', handleDimensionsChange);
            }
        };
    }, []);
    const baseFontSize = 18;
    const scaleFactor = 0.03;
    const minimumFontSize = 16;

    const responsiveFontSize = Math.max(screenWidth * scaleFactor, minimumFontSize);

    const fontSize = screenWidth < 768 ? 21 : responsiveFontSize;
    const styles = StyleSheet.create({
        button: {
            borderRadius: 5,
            backgroundColor: '#F4C112',
            flex: 1,
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        contentContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        chatContainer: {
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
        },
        text: {
            color: 'white',
            marginLeft: screenWidth < 768 ? 0 : 10,
            fontWeight: '650'
        },
        circleButton: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: responsiveFontSize / 2,
            height: responsiveFontSize / 2,
            borderRadius: responsiveFontSize / 4,
            marginLeft: 10,
        },
        circleButtonMobile: {
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20, // Increase the width for better touch area
            height: 20, // Same for height to keep it circular
            borderRadius: 30,
            marginLeft: 3,// Half of width/height to make it circular
        }
    });
    return (
        <TouchableOpacity style={styles.button}>
            <View style={styles.contentContainer}>
                <Text style={[styles.text, { fontSize: fontSize }]}>Sign Up Free</Text>
            </View>
            {screenWidth < 768 && (
                <FontAwesome name="user-plus" size={30} color="#EE9A1D" />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <FontAwesome name="user-plus" size={responsiveFontSize * 0.9} color="#EE9A1D" style={{ marginRight: 8 }} />
                )}
                <Text style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Register Now</Text>
                <Pressable style={screenWidth < 768 ? styles.circleButtonMobile : styles.circleButton}>
                    <AntDesign name="right" size={screenWidth < 768 ? 8 : responsiveFontSize / 4} color={'#F4C112'} />
                </Pressable>
            </View>
        </TouchableOpacity>

    );
};


const HomePage = () => {


    //dropdown make
    const [makes, setMakes] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'Make'), 'Make');
        try {
            const unsubscribeMake = onSnapshot(docRef, (snapshot) => {
                const makeData = snapshot.data()?.make || [];
                setMakes(makeData);
            });
            return () => {
                unsubscribeMake();
            };
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, []);
    const [carMakes, setCarMakes] = useState('');
    const handleSelectMake = async (option) => {
        setCarMakes(option);
    };
    //dropdown make

    //dropdown model
    const [models, setModels] = useState([]);
    useEffect(() => {
        let unsubscribeModel;
        try {
            if (carMakes) {
                const modelRef = doc(collection(projectExtensionFirestore, 'Model'), carMakes);
                unsubscribeModel = onSnapshot(modelRef, (docSnapshot) => {
                    const modelData = docSnapshot.data() || [];
                    setModels(modelData.model);
                    console.log('Model data:', modelData);
                });
            }

            return () => {
                if (unsubscribeModel) {
                    unsubscribeModel();
                }
            };
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, [carMakes]);

    const [carModels, setCarModels] = useState('');
    const handleSelectModel = async (option) => {
        setCarModels(option);
    };
    //dropdown model

    //dropdown bodytype
    const [bodyType, setBodyType] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'BodyType'), 'BodyType');
        try {
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const bodyTypeData = snapshot.data()?.bodyType || [];
                setBodyType(bodyTypeData);
            });
            return () => {
                unsubscribe();
            };
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, []);
    const [carBodyType, setCarBodyType] = useState('');
    const handleSelectBodyType = async (option) => {
        setCarBodyType(option);
    };
    //dropdown bodytype

    //dropdown Country
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
    const [selectedCountry, setSelectCountry] = useState(null);
    const handleSelectCountry = (option) => {
        setSelectCountry(option)
    }
    //dropdown Country
    //dropdown Min Year
    const [carMinYear, setCarMinYear] = useState('');
    const handleSelectMinYear = (option) => {
        setCarMinYear(option);
    };
    //dropdown Min Year

    //dropdown Max Year
    const [carMaxYear, setCarMaxYear] = useState('');
    const handleSelectMaxYear = async (option) => {
        setCarMaxYear(option);
    };
    //dropdown Max Year

    //dropdown Port
    const [ports, setPorts] = useState([]);
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
    const [selectedPort, setSelectPort] = useState('');
    const handleSelectPort = (option) => {
        setSelectPort(option)
    };
    //dropdown Port

    //global text input
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //global text input
    const mapAspectRatio = 0.4; // Adjust this to control the map's aspect ratio
    const mapWidth = screenWidth * 0.9;


    //FETCH NEW ARRIVALS
    const [carItems, setCarItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
                const q = query(vehicleCollectionRef, orderBy('dateAdded'), limit(10));

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

    const navigate = useNavigate();

    const handleSearch = () => {
        navigate(`/SearchCarDesign?carMakes=${carMakes}&carModel=${carModels}&bodyType=${carBodyType}&minYear=${carMinYear}&maxYear=${carMaxYear}`)
    }
    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />
            <ImageBackground
                source={{ uri: logo1 }}
                style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: 750,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                resizeMode='contain'
            >
            </ImageBackground>


            <View style={{
                alignSelf: 'center',
                backgroundColor: 'white',
                maxWidth: 1280,
                width: '100%',
                minHeight: screenWidth < 664 ? 500 : 260,
                padding: 10,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
                zIndex: 1,
                position: 'relative',
            }}>
                <View style={{
                    position: 'absolute',
                    top: screenWidth < 644 ? '-10%' : '-19%', // Adjust the top value for mobile
                    left: 0,
                    right: 0,
                    zIndex: 2,
                }}>
                    <SlantedButton />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', zIndex: 10 }}>
                    <DropDownMake makes={makes} handleSelectMake={handleSelectMake} carMakes={carMakes} />
                    <DropDownModel model={models} handleSelectModel={handleSelectModel} carMakes={carMakes} carModel={carModels} />
                    {screenWidth >= 644 ? (
                        <DropDownBodyType bodyType={bodyType} handleSelectBodyType={handleSelectBodyType} carBodyType={carBodyType} />
                    ) : null}
                </View>
                {screenWidth < 644 && (
                    <View style={{
                        flexDirection: 'column',
                    }}>
                        <DropDownBodyType bodyType={bodyType} handleSelectBodyType={handleSelectBodyType} carBodyType={carBodyType} />
                        <View style={{ flexDirection: 'row', zIndex: 9 }}>
                            <DropDownMinPrice />
                            <DropDownMaxPrice />
                        </View>
                        <View style={{ flexDirection: 'row', zIndex: 8 }}>
                            <DropDownMinYear carMinYear={carMinYear} handleSelectMinYear={handleSelectMinYear} />
                            <DropDownMaxYear carMaxYear={carMaxYear} handleSelectMaxYear={handleSelectMaxYear} />
                        </View>
                        <View style={{ flexDirection: 'row', zIndex: 7 }}>
                            <DropDownSelectCountry selectedCountry={selectedCountry} handleSelectCountry={handleSelectCountry} countryData={countryData} />
                            <DropDownSelectPort selectedPort={selectedPort} handleSelectPort={handleSelectPort} ports={ports} />
                        </View>
                    </View>
                )}
                {screenWidth >= 644 ? (
                    <View style={{ flexDirection: 'row', zIndex: 9 }}>
                        <DropDownMinPrice />
                        <DropDownMinYear carMinYear={carMinYear} handleSelectMinYear={handleSelectMinYear} />
                        <DropDownSelectCountry selectedCountry={selectedCountry} handleSelectCountry={handleSelectCountry} countryData={countryData} />
                    </View>
                ) : null}

                {screenWidth >= 644 ? (
                    <View style={{ flexDirection: 'row', zIndex: 8, marginTop: 8 }}>
                        <DropDownMaxPrice />
                        <DropDownMaxYear carMaxYear={carMaxYear} handleSelectMaxYear={handleSelectMaxYear} />
                        <DropDownSelectPort selectedPort={selectedPort} handleSelectPort={handleSelectPort} ports={ports} />
                    </View>
                ) : null}


                <View style={{ flexDirection: screenWidth < 644 ? 'column' : 'row', alignItems: 'center', zIndex: -6, padding: 10 }}>

                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-evenly',
                        marginBottom: screenWidth < 644 ? 10 : null, // Add some margin below the toggle container
                        width: '100%',
                        zIndex: -6,
                    }}>
                        <Inspection />
                        <Insurance />
                    </View>
                    <View style={{
                        flex: 1,
                        marginHorizontal: 6,
                        flexDirection: screenWidth < 644 ? 'column' : 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        width: '100%',

                    }}>
                        <TextInput
                            style={{
                                flex: 1,
                                padding: 15,
                                borderWidth: 1.2,
                                borderColor: '#eee',
                                borderRadius: 2,
                                marginRight: 5,
                                marginTop: screenWidth < 644 ? 10 : 0,
                                width: '100%',
                            }}
                            placeholder='Search by make, model, or keyword '
                            placeholderTextColor={'#ccc'}
                        />
                        <TouchableOpacity
                            onPress={() => handleSearch()}
                            style={{
                                backgroundColor: 'blue',
                                paddingVertical: 10,
                                paddingHorizontal: 30,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: screenWidth < 644 ? 10 : 0,
                                width: screenWidth < 644 ? '100%' : undefined,
                            }}>
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 22 }}>Search</Text>
                        </TouchableOpacity>
                    </View>

                </View>



            </View>



            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 10, zIndex: -19, marginVertical: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>By Makers</Text>

                <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                <Text style={{ fontWeight: 'bold' }}>By Types</Text>

                <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                <Text style={{ fontWeight: 'bold' }}>By Trucks</Text>

                <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                <Text style={{ fontWeight: 'bold' }}>Testimonials</Text>
            </View>
            <View style={{}}>
                <SearchByMakes />
            </View>
            <View style={{}}>
                <NewArrivals carItems={carItems} />
            </View>
            <View style={{ backgroundColor: 'black' }}>
                <SearchByTypes />
            </View>
            <View>
                <SearchByTrucks />
            </View>
            <ImageBackground
                source={{ uri: bgSVG }}
            >
                <Testimonials />
            </ImageBackground>
            <View>
                <HowToBUy />
            </View>
            <View>
                <WorldMapValues />
            </View>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: mapWidth,
                maxWidth: 1300,
                height: 160,
                alignSelf: 'center',
                marginTop: 20
            }}>
                <WhatsAppView />
                <View style={{ maxWidth: 15, width: "100%" }} />
                <SignUpView />
            </View>
            <VehicleDataForm />
            <View>
                <StickyFooter />
            </View>
            <ApiTester />
        </View>
    )
};

export default HomePage;