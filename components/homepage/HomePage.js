import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, Image, ScrollView, Pressable, Linking, Modal } from 'react-native';
import React, { useEffect, useState, useRef, useMemo, useContext, useCallback, useLayoutEffect } from 'react';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, MaterialCommunityIcons } from 'react-native-vector-icons';
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
import { max } from 'moment';
const StickyHeader = () => {
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
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        source={{ uri: logo4 }}
                        style={{
                            flex: 1,
                            aspectRatio: 1
                        }}
                        resizeMode='contain'
                    />
                </View>
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
            </View>
        </Animated.View>
    )
}

const DropDownMake = ({ makes, handleSelectMake, carMakes }) => {
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{carMakes ? carMakes : 'Select Make'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
        <View style={{ flex: 1, padding: 5, minWidth: 100, zIndex: -99 }}>
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
                    <Text>{carModel ? carModel : 'Select Model'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
        <View style={{ flex: 1, padding: 5, minWidth: 150, zIndex: -99 }}>
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
                    <Text>{carBodyType ? carBodyType : 'Body Type'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{'Min Price'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{'Max Price'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
const DropDownMinYear = ({ }) => {
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{'Min Year'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
                        data={years} // Assuming countryData is an object with country names as keys
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
const DropDownMaxYear = ({ }) => {
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{'Max Year'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
                        data={years} // Assuming countryData is an object with country names as keys
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
const DropDownSelectCountry = ({ countryData, handleSelectCountry, selectedCountry }) => {
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{selectedCountry ? selectedCountry.replace(/_/g, '.') : 'Select Country'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
                    backgroundColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{selectedPort ? selectedPort : 'Select Port'}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <TouchableOpacity>
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
    const logos = [
        { id: '1', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '2', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '3', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '4', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '5', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '6', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '7', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '8', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '9', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '10', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '11', logo: 'Logo', name: 'TOYOTA', price: '520' },
        { id: '12', logo: 'Logo', name: 'TOYOTA', price: '520' },        // ... and so on for each item
    ];
    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 5,

        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 20,
        },
        itemContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
        },
        logoContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
        },
        button: {
            backgroundColor: '#f5f5f5',
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 20,
            maxWidth: 300,
            width: '100%'
        },
    });
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.logoContainer}>
                {/* Replace with an Image component if you have an image source */}
                <Text>{item.logo}</Text>
            </View>
            <Text>{item.name}</Text>
            <Text>{item.price}</Text>
        </View>
    );
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search by Makers</Text>
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={logos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={screenWidth < 992 ? 100 : 300}
                    spacing={1}
                />
            </View>
            <TouchableOpacity style={styles.button}>
                <Text>View all Makers</Text>
            </TouchableOpacity>
        </View>
    );

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
        { id: '7', logo: 'Logo', name: 'VAN', price: '520' },
        { id: '8', logo: 'Logo', name: 'COUPE', price: '520' },
    ];
    const styles = StyleSheet.create({
        container: {
            backgroundColor: '#EFEFEF',
            padding: 15,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 20,
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
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 20,
            maxWidth: 300,
            width: '100%'
        },
    });
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.logoContainer}>
                {/* Replace with an Image component if you have an image source */}
                <Text>{item.logo}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text>{item.name} </Text>
                <Text>{item.price}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search by Type</Text>
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={types}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={screenWidth < 992 ? 100 : 300}
                    spacing={1}
                />
            </View>
            <TouchableOpacity style={styles.button}>
                <Text>View all Types</Text>
            </TouchableOpacity>
        </View>
    )

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
    ];
    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 5,

        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 20,
            maxWidth: '100%'
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
            backgroundColor: '#f5f5f5',
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 20,
            maxWidth: 300,
            width: '100%'
        },
    });
    const renderItem = ({ item }) => {
        const truncatedName = item.name.length > 7 ? `${item.name.substring(0, 7)}...` : item.name;
        return (
            <View style={styles.itemContainer}>
                <View style={styles.logoContainer}>
                    {/* Replace with an Image component if you have an image source */}
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
        <View style={styles.container}>
            <Text style={styles.title}>Search by Trucks</Text>
            <View style={{ flex: 3 }}>
                <FlatGrid
                    data={types}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    itemDimension={screenWidth < 992 ? 140 : 300}
                    spacing={1}
                />
            </View>
            <TouchableOpacity style={styles.button}>
                <Text>View all Types</Text>
            </TouchableOpacity>
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

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#88a6ff', padding: 20, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Get connected with us on social networks:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', maxWidth: 250, width: '100%' }}>
                    <AntDesign name="facebook-square" size={30} color={'white'} />
                    <FontAwesome name="whatsapp" size={34} color={'white'} />
                    <AntDesign name="instagram" size={30} color={'white'} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ECEFF1', padding: 20 }}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={{ uri: gifLogo }}
                        style={{ maxWidth: 250, height: 50, width: "100%" }}
                        resizeMode='cover'
                    />
                    <View style={{ width: '100%', maxWidth: 70, borderBottomWidth: 2, borderBottomColor: '#BDBFC1' }}></View>
                    <View style={{ marginTop: 20, flex: 1, width: '100%', maxWidth: 300 }}>
                        <Text>Real Motor Japan, with decades of expertise since 1979, stands as a trusted exporter of quality used vehicles from Japan to customers worldwide.</Text>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', }}>PRODUCTS</Text>
                    <View style={{ width: '100%', maxWidth: 70, borderBottomWidth: 2, borderBottomColor: '#BDBFC1' }}></View>
                    <View style={{ marginTop: 20, flex: 1, width: '100%', maxWidth: 300 }}>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>TOYOTA</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>NISSAN</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>HONDA</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>MITSUBISHI</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>MERCEDES-BENZ</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>HONDA</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>BMW</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>MAZDA</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>VOLKSWAGEN</Text>
                    </View>

                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', }}>USEFUL LINKS</Text>
                    <View style={{ width: '100%', maxWidth: 70, borderBottomWidth: 2, borderBottomColor: '#BDBFC1' }}></View>
                    <View style={{ marginTop: 20, flex: 1, width: '100%', maxWidth: 300 }}>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>Used Car Stock</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>How To Buy</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>About Us</Text>
                        <Text style={{
                            marginBottom: 8, // Adjust the bottom margin as needed for spacing
                            color: 'black',
                        }}>Mail Us</Text>

                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', }}>CONTACT</Text>
                    <View style={{ width: '100%', maxWidth: 70, borderBottomWidth: 2, borderBottomColor: '#BDBFC1' }}></View>
                    <View style={{ marginTop: 20, flex: 1, width: '100%', maxWidth: 300 }}>
                        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                            <Entypo name="home" size={30} /> <Text style={{ marginLeft: 5 }}> 26-2 Takara Tsutsumi-cho, Toyota-city, Aichi 473-0932 Japan</Text>
                        </View>
                        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                            <MaterialCommunityIcons name="email" size={30} /> <Text style={{ marginLeft: 5 }}> info@realmotor.jp</Text>
                        </View>
                        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                            <Foundation name="telephone" size={30} /> <Text style={{ marginLeft: 5 }}>+81-565-85-0602</Text>
                        </View>
                        <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                            <MaterialCommunityIcons name="fax" size={30} /> <Text style={{ marginLeft: 5 }}>+81-565-85-0606</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#BDBFC1', padding: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>© 2024 Copyright: realmotor.jp</Text>
            </View>
        </View>
    );
}

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

    //global text input

    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />
            <ScrollView style={{ flex: 3 }}>
                <View style={{ width: '100%', position: 'relative' }}>
                    <Image
                        source={{ uri: logo1 }}
                        style={{ resizeMode: 'cover', width: '100%', height: 800, aspectRatio: 1.777 }} // aspect ratio of 16:9
                    />
                    <Pressable
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: [{ translateX: -75 }, { translateY: -25 }],
                            backgroundColor: '#f5f5f5',
                            borderRadius: 20,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            maxWidth: 150,
                            width: '100%',
                        }}
                    >
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{ fontWeight: 'bold', color: '#000' }}>SIGN UP FREE</Text>
                        </View>
                    </Pressable>
                </View>
                <View style={{
                    backgroundColor: 'white',
                    flex: 1,
                    top: '-5%',
                    maxWidth: 780,
                    alignSelf: 'center',
                    width: '100%',
                    borderRadius: 5,
                    shadowColor: "#000", // Set the shadow color
                    shadowOffset: {
                        width: 0, // The shadow offset width
                        height: 2, // The shadow offset height
                    },
                    shadowOpacity: 0.1, // The shadow opacity
                    shadowRadius: 4, // The shadow radius
                    elevation: 5,
                    padding: 15
                    // For Android: equivalent to shadow
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <DropDownMake makes={makes} handleSelectMake={handleSelectMake} carMakes={carMakes} />
                        <DropDownModel model={models} handleSelectModel={handleSelectModel} carMakes={carMakes} carModel={carModels} />
                    </View>
                    <View style={{ zIndex: -99 }}>
                        <DropDownBodyType bodyType={bodyType} handleSelectBodyType={handleSelectBodyType} carBodyType={carBodyType} />
                    </View>

                    <View style={{ flexDirection: 'row', zIndex: -100 }}>
                        <DropDownMinPrice />
                        <DropDownMaxPrice />
                    </View>
                    <View style={{ flexDirection: 'row', zIndex: -101 }}>
                        <DropDownMinYear />
                        <DropDownMaxYear />
                    </View>
                    <View style={{ flexDirection: 'row', zIndex: -102 }}>
                        <DropDownSelectCountry selectedCountry={selectedCountry} handleSelectCountry={handleSelectCountry} countryData={countryData} />
                        <DropDownSelectPort selectedPort={selectedPort} handleSelectPort={handleSelectPort} ports={ports} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', zIndex: -103, padding: 5 }}>
                        <View style={{ alignItems: 'flex-start', flex: 1 }}>
                            <Inspection />
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                        </View>
                        <View style={{ alignItems: 'flex-start', flex: 1 }}>
                            <Insurance />
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>By Makers</Text>

                    <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                    <Text style={{ fontWeight: 'bold' }}>By Types</Text>

                    <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                    <Text style={{ fontWeight: 'bold' }}>By Trucks</Text>

                    <View style={{ height: '100%', width: 1, backgroundColor: 'black' }} />

                    <Text style={{ fontWeight: 'bold' }}>Testimonials</Text>
                </View>
                <View>
                    <SearchByMakes />
                </View>
                <View>
                    <SearchByTypes />
                </View>
                <View>
                    <SearchByTrucks />
                </View>
                <View>
                    <HowToBUy />
                </View>
            </ScrollView>
            <StickyFooter />
        </View>
    )
}
export default HomePage;