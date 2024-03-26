import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image, Button, ActivityIndicator, PanResponder } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo } from 'react-native-vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from "../../firebaseConfig";
import { FlatGrid } from "react-native-super-grid";
import { where, collection, doc, getDocs, getDoc, query, onSnapshot, limit, startAfter, orderBy, startAt } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { Slider, RangeSlider } from '@react-native-assets/slider'
import carSample from '../../assets/2.jpg'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Center } from "native-base";
import Svg, { Polygon } from 'react-native-svg';
import gifLogo from '../../assets/rename.gif'
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
    const animationController = useRef(new Animated.Value(0)).current; // Initial value for height
    useEffect(() => {
        if (isActive === false) {
            handleIsActive()
        }
    }, [])
    const handleIsActive = () => {
        // Start the animation
        Animated.timing(animationController, {
            toValue: isActive ? 0 : 1, // 0 for closing, 1 for opening
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            // This callback is executed after the animation completes
            if (isActive) {
                // If we were active and are now closing, update the state
                setIsActive(false);
            }
        });

        if (!isActive) {
            // If we are not active yet, update the state immediately to start opening
            setIsActive(true);
        }
    };

    const maxHeight = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200], // Starts closed at 0 and opens up to 200
    });
    return (
        <View style={{
            minWidth: 100, zIndex: -99,
        }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    height: 50,
                    padding: 7,

                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <Text selectable={false}>{carMakes ? carMakes : 'Select Make'}</Text>
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
                                transform: [{ rotate: '180deg' }]
                            },
                        ]}
                    />
                </View>
            </Pressable>
            <Animated.View
                style={{
                    backgroundColor: 'white',
                    maxHeight,
                    overflow: 'hidden',
                    zIndex: 99,
                }}
            >
                {isActive && (

                    <FlatList
                        data={makes}
                        keyExtractor={item => item}
                        ListHeaderComponent={
                            <Text selectable={false} style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                                fontWeight: 'bold',
                                color: '#aaa' // Optional, if you want "ALL MAKES" to stand out
                            }}>
                                ALL MAKES
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <Pressable onPress={() => { handleSelectMake(item); handleIsActive(false) }}>
                                <Text selectable={false} style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                        style={{
                            maxHeight: 200,

                            backgroundColor: '#fff',
                            boxShadow: "inset 0px 6px 5px -2px rgba(0,0,0,0.33)",
                        }}
                        contentContainerStyle={{
                            paddingBottom: 10, // Add padding at the bottom if necessary
                        }}
                    />

                )}
            </Animated.View>

        </View>
    )
};
const DropDownModel = ({ model, handleSelectModel, carModels, carMakes }) => {
    const [isActive, setIsActive] = useState(false);
    const animationController = useRef(new Animated.Value(0)).current; // Initial value for height

    const handleIsActive = () => {
        // Start the animation
        Animated.timing(animationController, {
            toValue: isActive ? 0 : 1, // 0 for closing, 1 for opening
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            // This callback is executed after the animation completes
            if (isActive) {
                // If we were active and are now closing, update the state
                setIsActive(false);
            }
        });

        if (!isActive) {
            // If we are not active yet, update the state immediately to start opening
            setIsActive(true);
        }
    };

    const maxHeight = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200], // Starts closed at 0 and opens up to 200
    });
    return (
        <View style={{
            minWidth: 100, zIndex: -99
        }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    height: 50,
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <Text>{carModels ? carModels : 'Select Model'}</Text>
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
            <Animated.View
                style={{
                    backgroundColor: 'white',
                    maxHeight,
                    overflow: 'hidden',
                    zIndex: 99,
                }}
            >
                {isActive && (
                    <FlatList
                        data={model}
                        keyExtractor={item => item}
                        ListHeaderComponent={
                            <Text selectable={false} style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#eee',
                                fontWeight: 'bold',
                                color: '#aaa'
                            }}>
                                {carMakes ? `${carMakes} Models` : 'All Model'}
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <Pressable onPress={() => { handleIsActive(false); handleSelectModel(item); }}>
                                <Text selectable={false} style={{
                                    padding: 10,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                        style={{
                            maxHeight: 200,

                            backgroundColor: '#fff',
                            boxShadow: "inset 0px 6px 5px -2px rgba(0,0,0,0.33)",
                        }}
                        contentContainerStyle={{
                            paddingBottom: 10,
                        }}
                    />

                )}
            </Animated.View>
        </View>
    )
}
const DropDownBodyType = ({ bodyType, carBodyType, handleSelectBodyType }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <View style={{ flex: 1, padding: 5, minWidth: 150, zIndex: -99 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <Text style={{ fontWeight: '700', color: '#707070' }}>{'Body Type'}</Text>
                </View>
                <Pressable
                    onPress={handleIsActive}
                    style={({ pressed, hovered }) => [
                        {
                            padding: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end', // Align items to the end
                            maxWidth: 120,
                            width: '100%',
                            borderWidth: 1, // Consistent border width
                            borderRadius: 5,
                            borderColor: hovered ? '#7b9cff' : 'transparent', // Only color changes on hover
                            backgroundColor: pressed ? '#e6e6e6' : 'white', // Change background when pressed
                            // Additional styles to create a 'glow' effect on hover
                            shadowColor: hovered ? '#7b9cff' : 'transparent',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: hovered ? 1 : 0,
                            shadowRadius: hovered ? 3 : 0,
                            elevation: hovered ? 3 : 0,
                        },
                    ]}
                >
                    <Text style={{}} selectable={false}>{carBodyType ? carBodyType : 'All'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign
                            name="down"
                            size={15}
                            style={[
                                { marginLeft: 5, transitionDuration: '0.3s' },
                                isActive && {
                                    transform: [{ rotate: '180deg' }],
                                },
                            ]}
                        />
                    </View>
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
                        }}>
                            <FlatList
                                data={bodyType} // Assuming countryData is an object with country names as keys
                                keyExtractor={item => item}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => { handleIsActive(false); handleSelectBodyType(item); }}
                                    >
                                        <Text selectable={false} style={{
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
                </Pressable>

            </View>



        </View>
    );
};
const DropDownMinYear = ({ carMinYear, handleSelectMinYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    return (
        <View style={{ padding: 5, maxWidth: 90, width: '100%' }}>
            <Pressable
                onPress={handleIsActive}
                style={({ pressed, hovered }) => [
                    {
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        maxWidth: 90,
                        width: '100%',
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: hovered ? '#7b9cff' : 'transparent',
                        backgroundColor: pressed ? '#e6e6e6' : 'white',
                        shadowColor: hovered ? '#7b9cff' : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: hovered ? 1 : 0,
                        shadowRadius: hovered ? 3 : 0,
                        elevation: hovered ? 3 : 0,
                    },
                ]}
            >
                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <Text selectable={false} style={{ fontWeight: '700' }}>{carMinYear ? carMinYear : 'Min'}</Text>
                </View>
                <View style={{ justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>

                    <AntDesign
                        name="down"
                        size={20}
                        style={[
                            { transitionDuration: '0.3s' },
                            isActive && {
                                transform: [{ rotate: '180deg' }],
                            },

                        ]}
                    />
                </View>
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
                    }}>
                        <FlatList
                            data={years} // Assuming countryData is an object with country names as keys
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => { handleIsActive(false); handleSelectMinYear(item) }}
                                >
                                    <Text selectable={false} style={{
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
            </Pressable>


        </View>
    )


};
const DropDownMaxYear = ({ carMaxYear, handleSelectMaxYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    return (
        <View style={{ padding: 5, maxWidth: 90, width: '100%' }}>
            <Pressable
                onPress={handleIsActive}
                style={({ pressed, hovered }) => [
                    {
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        maxWidth: 90,
                        width: '100%',
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: hovered ? '#7b9cff' : 'transparent',
                        backgroundColor: pressed ? '#e6e6e6' : 'white',
                        shadowColor: hovered ? '#7b9cff' : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: hovered ? 1 : 0,
                        shadowRadius: hovered ? 3 : 0,
                        elevation: hovered ? 3 : 0,
                    },
                ]}
            >
                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <Text selectable={false} style={{ fontWeight: '700' }}>{carMaxYear ? carMaxYear : 'Max'}</Text>
                </View>
                <View style={{ justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                    <AntDesign
                        name="down"
                        size={20}
                        style={[
                            { transitionDuration: '0.3s' },
                            isActive && {
                                transform: [{ rotate: '180deg' }],
                            },
                        ]}
                    />
                </View>
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
            </Pressable>


        </View>
    )
};
const DropDownExteriorColor = ({ colors, handleSelectColor, carColor }) => {

    const styles = StyleSheet.create({
        header: {
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
            fontWeight: 'bold',
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
        },
        colorDot: {
            width: 20,
            height: 20,
            borderRadius: 10,
            marginRight: 8,
            borderWidth: 0.5,
            borderColor: '#aaa'
        },
        colorName: {
            flex: 1,
            fontWeight: '600',
            color: '#5f5f5f'
        },
        colorCount: {
            marginLeft: 8,
        },
        list: {
            backgroundColor: '#fcfcfc',
        },
    });

    const [isActive, setIsActive] = useState(false);
    const animationController = useRef(new Animated.Value(0)).current;
    const handleIsActive = () => {
        // Start the animation
        Animated.timing(animationController, {
            toValue: isActive ? 0 : 1, // 0 for closing, 1 for opening
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            // This callback is executed after the animation completes
            if (isActive) {
                // If we were active and are now closing, update the state
                setIsActive(false);
            }
        });

        if (!isActive) {
            // If we are not active yet, update the state immediately to start opening
            setIsActive(true);
        }
    };
    const maxHeight = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200]
    });
    const colorToHex = (colorName) => {
        const colorMap = {
            Bronze: '#cd7f32',
            Brown: '#a52a2a',
            Burgundy: '#800020',
            Champagne: '#fad6a5',
            Cream: '#fffdd0',
            Charcoal: '#36454f',
            'Dark Blue': '#00008b',
            Gold: '#ffd700',
            Gray: '#808080',
            Green: '#008000',
            Maroon: '#800000',
            'Navy Blue': '#000080',
            'Off White': '#f8f8ff',
            Orange: '#ffa500',
            Pearl: '#eae0c8',
            'Pearl White': '#fcf0ad',
            Pewter: '#96a8a1',
            Pink: '#ffc0cb',
            Purple: '#800080',
            Red: '#ff0000',
            Silver: '#c0c0c0',
            Tan: '#d2b48c',
            Teal: '#008080',
            Titanium: '#878681',
            Turquoise: '#40e0d0',
            'Two Tone': '#000000', // Placeholder, as two-tone isn't a single color.
            White: '#ffffff',
            Yellow: '#ffff00',
            Black: '#000000',
            // ... add more colors as needed
        };

        // Return the hex code, or default to black if the color name is not found
        return colorMap[colorName] || '#000000';
    };
    const colorDot = colors.map((colorName) => ({
        name: colorName,
        hex: colorToHex(colorName),
        count: 0
    }))
    const ColorItem = ({ item }) => {
        return (
            <Pressable
                onPress={() => { handleIsActive(false); handleSelectColor({ name: item.name, hex: item.hex }) }}
            >
                <View style={styles.itemContainer}>

                    <View style={[styles.colorDot, { backgroundColor: item.hex }]} />
                    <Text style={styles.colorName}>{item.name}</Text>

                </View>
            </Pressable>
        );
    };
    return (
        <View style={{
            minWidth: 100, zIndex: -99,
        }}>
            <Pressable
                onPress={handleIsActive}
                style={{
                    height: 50,
                    padding: 7,

                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                }}>

                    <View style={[styles.colorDot, { backgroundColor: carColor.name.hex ? carColor.name.hex : '#fff' }]} />
                    <Text style={styles.colorName}>{carColor && carColor.name.name ? carColor.name.name : 'Exterior Color'}</Text>

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
                                transform: [{ rotate: '180deg' }]
                            },
                        ]}
                    />
                </View>
            </Pressable>
            <Animated.View
                style={{
                    backgroundColor: 'white',
                    maxHeight,
                    overflow: 'hidden',
                    zIndex: 99,
                }}
            >
                {isActive && (
                    <FlatList
                        data={colorDot}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => <ColorItem item={item} />}
                        ListHeaderComponent={
                            <Text style={styles.header}>ALL COLORS</Text>
                        }
                        style={[styles.list, { boxShadow: "inset 0px 6px 5px -2px rgba(0,0,0,0.33)", }]}
                    />

                )}
            </Animated.View>

        </View>
    )
};
const SliderPrice = ({ range, handleGetRange }) => {
    const [minimumValue, setMinimumValue] = useState(0);
    const [maximumValue, setMaximumValue] = useState(100000)

    const formatCurrency = (value) => {
        return `$${value.toLocaleString()}`;
    };
    return (
        <View style={{ padding: 10, zIndex: -99, width: '100%' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', justifyContent: 'space-evenly' }}>
                <TextInput
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#000',
                        borderRadius: 5,
                        maxWidth: '40%',
                    }}

                    value={formatCurrency(range[0])}
                />
                <Text>To</Text>
                <TextInput
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#000',
                        borderRadius: 5,
                        maxWidth: '40%',
                    }}

                    value={formatCurrency(range[1])}
                />

            </View>
            <View style={{ marginTop: 10 }}>
                <RangeSlider
                    step={1000}
                    onValueChange={(value) => handleGetRange(value)}
                    minimumValue={0}
                    maximumValue={100000}
                    range={range}
                    crossingAllowed
                    outboundColor={'grey'}
                    inboundColor={'#7b9cff'}
                    thumbTintColor={'#7b9cff'}
                    thumbSize={20}
                    style={{ height: 20 }}
                />
            </View>
        </View>
    )
};
const SliderMileage = ({ rangeMileAge, handleGetRangeMileAge }) => {

    const formatMileAge = (value) => {
        return `${value.toLocaleString()}`;
    };
    return (
        <View style={{ padding: 10, zIndex: -99, width: '100%' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', justifyContent: 'space-evenly' }}>
                <TextInput
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#000',
                        borderRadius: 5,
                        maxWidth: '40%',
                    }}

                    value={formatMileAge(rangeMileAge[0])}
                />
                <Text>To</Text>
                <TextInput
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#000',
                        borderRadius: 5,
                        maxWidth: '40%',
                    }}

                    value={`${formatMileAge(rangeMileAge[1])}+`}
                />

            </View>
            <View style={{ marginTop: 10 }}>
                <RangeSlider
                    step={1000}
                    onValueChange={(value) => handleGetRangeMileAge(value)}
                    minimumValue={0}
                    maximumValue={200000}
                    range={rangeMileAge}
                    crossingAllowed
                    outboundColor={'grey'}
                    inboundColor={'#7b9cff'}
                    thumbTintColor={'#7b9cff'}
                    thumbSize={20}
                />
            </View>
        </View>
    )
};
const MasterRanking = ({ }) => {
    const [makerRankings, setMakerRankings] = useState([
        { id: '1', name: 'Toyota' },
        { id: '2', name: 'Nissan' },
        { id: '3', name: 'Honda' },
        { id: '4', name: 'Mitsubishi' },
        { id: '5', name: 'Mercedes-Benz' },
        { id: '6', name: 'BMW' },
        { id: '7', name: 'Mazda' },
        { id: '8', name: 'Subaru' },
        { id: '9', name: 'Volkswagen' },
        { id: '10', name: 'Suzuki' },
    ]);
    useEffect(() => {
        const fetchLogoUrls = async () => {
            const updatedRankings = await Promise.all(makerRankings.map(async (maker) => {
                try {
                    // Create a reference to the logo file in Firebase Storage
                    const logoRef = ref(projectExtensionStorage, `logos/${maker.name.toLowerCase()}.png`);

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

            setMakerRankings(updatedRankings);
        };

        fetchLogoUrls();
    }, []);
    return (
        <View style={{
            width: '100%',
            maxWidth: 300,
            borderColor: '#000',
            borderRadius: 5,
            backgroundColor: '#fff',
            padding: 10,
            overflow: 'hidden',
            marginTop: 5
        }}>
            <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 10,
            }}>
                Maker Ranking
            </Text>
            <FlatList
                data={makerRankings}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: '#eaeaea',
                        paddingVertical: 10,
                    }}>

                        <Text style={{
                            fontSize: 16,
                        }}>
                            {index + 1}.  {item.logoUri &&
                                <Image
                                    source={{ uri: item.logoUri }}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        marginRight: 10,
                                        resizeMode: 'cover'
                                    }}
                                />
                            }{item.name}
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}
const FilterChip = ({ label, onPress }) => {
    if (!label) return null; // Don't render anything if there's no label.

    return (
        <View style={{ flexDirection: 'row', backgroundColor: 'lightblue', borderRadius: 20, alignItems: 'center', padding: 5, marginLeft: label === 'carModels' ? 10 : 0 }}>
            <Text style={{ color: 'blue', marginHorizontal: 10 }}>{label}</Text>
            <TouchableOpacity onPress={onPress}>
                <AntDesign name="closecircleo" size={20} color={'blue'} style={{ paddingHorizontal: 4, paddingVertical: 2 }} />
            </TouchableOpacity>
        </View>
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
const DropDownMinYearSimple = ({ carMinYear, handleSelectMinYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
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
const DropDownMaxYearSimple = ({ carMaxYear, handleSelectMaxYear }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
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
                                onPress={() => { handleIsActive(false); handleSelectMaxYear(item); }}
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


const DropDownMakeSimple = ({ makes, handleSelectMake, carMakes }) => {
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
const DropDownModelSimple = ({ model, handleSelectModel, carModel, carMakes }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <View style={{ flex: 1, padding: 5, zIndex: -100 }}>
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
const DropDownBodyTypeSimple = ({ bodyType, carBodyType, handleSelectBodyType }) => {
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
const DropDownMinMileageSimple = ({ minMileageData, handleSelectMinMileage, minMileage }) => {
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
                    <Text style={{ fontWeight: '500' }}>{minMileage ? minMileage : 'Min Mileage'}</Text>
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
                        data={minMileageData} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMinMileage(item); }}
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

const DropDownMaxMileageSimple = ({ maxMileageData, handleSelectMaxMileage, maxMileage }) => {
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
                    <Text style={{ fontWeight: '500' }}>{maxMileage ? maxMileage : 'Max Mileage'}</Text>
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
                    margin: 5,
                    zIndex: 10
                }}>
                    <FlatList
                        data={maxMileageData} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMaxMileage(item); }}
                                style={{ zIndex: 10 }}
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

const DropDownMinPriceSimple = ({ minPrice, handleSelectMinPrice, minPriceData }) => {
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
                    <Text style={{ fontWeight: '500' }}>{minPrice ? minPrice : 'Min Price'}</Text>
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
                        data={minPriceData} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMinPrice(item); }}
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
}
const DropDownMaxPriceSimple = ({ maxPrice, handleSelectMaxPrice, maxPriceData }) => {
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
                    <Text style={{ fontWeight: '500' }}>{maxPrice ? maxPrice : 'Max Price'}</Text>
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
                    margin: 5,
                    zIndex: 10
                }}>
                    <FlatList
                        data={maxPriceData} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleIsActive(false); handleSelectMaxPrice(item); }}
                                style={{ zIndex: 10 }}
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
}


const MakerRanking = () => {
    const styles = StyleSheet.create({
        bookmarkRibbonDiamond: {
            borderWidth: 8,
            borderColor: 'gray',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        bookmarkRibbons: {
            borderRadius: 5,
            width: 23,
            height: 23,
            backgroundColor: '#ccc',
            transform: [
                { rotate: '45deg' }
            ],
            position: 'absolute',
            bottom: -10.8,
            right: 12,
        },
        bookmarkRibbon: {
            borderWidth: 12,
            borderColor: '#FFD700',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        container: {
            flex: 1,
            paddingTop: 22,
            height: '100%',
            maxHeight: 550,
            padding: 5,
            zIndex: -5
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        rankContainer: {
            marginRight: 10,
            borderRadius: 5,
            paddingVertical: 2,
            paddingHorizontal: 8,
        },
        rankText: {
            fontWeight: 'bold',
            color: 'white',
            fontSize: 16,
            position: 'absolute',
            bottom: -10,
            right: 7,
            transform: [
                { rotate: '-90deg' }, // Counter rotate the text to make it horizontal again
            ],
        },
        nameText: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        rankBadgeContainer: {
            width: 25,
            height: 25,
            backgroundColor: 'gold', // Change color based on your preference
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomRightRadius: 10, // Adjust for desired curvature
            borderTopLeftRadius: 10, // Adjust for desired curvature
            elevation: 3, // this adds a shadow on Android
            shadowColor: '#000', // these shadow properties add a shadow on iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
    const rankings = [
        { key: '1', name: 'TOYOTA' },
        { key: '2', name: 'NISSAN' },
        { key: '3', name: 'HONDA' },
        { key: '4', name: 'MITSUBISHI' },
        { key: '5', name: 'Mercedes-Benz' },
        { key: '6', name: 'BMW' },
        { key: '7', name: 'MAZDA' },
        { key: '8', name: 'SUBARU' },
        { key: '9', name: 'Volkswagen' },
        { key: '10', name: 'SUZUKI' },
        // ... Add other makers here
    ];

    const renderItem = ({ item }) => {
        let ribbonStyle, ribbonComponent;

        if (item.key === '2') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'gray' };
        } else if (item.key === '3') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'brown' };
        } else if (parseInt(item.key) >= 4 && parseInt(item.key) <= 10) {
            // For keys 4 to 10, use a different style or component
            ribbonComponent = <View style={styles.bookmarkRibbonDiamond}><View style={styles.bookmarkRibbons}></View></View>;
        } else {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: '#FFD700' };
        }
        return (
            <View style={styles.itemContainer}>

                {ribbonComponent || (
                    <View style={ribbonStyle}>
                        <Text style={styles.rankText}>{item.key}</Text>
                    </View>
                )}
                <Text style={styles.nameText}> {item.name}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <Text style={styles.header}>Maker Ranking</Text>
            <FlatList
                style={{ backgroundColor: '#f5f5f5' }}
                data={rankings}
                renderItem={renderItem}
            />
        </View>
    );
};
const ModelRanking = () => {
    const styles = StyleSheet.create({
        bookmarkRibbonDiamond: {
            borderWidth: 8,
            borderColor: 'gray',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        bookmarkRibbons: {
            borderRadius: 5,
            width: 23,
            height: 23,
            backgroundColor: '#ccc',
            transform: [
                { rotate: '45deg' }
            ],
            position: 'absolute',
            bottom: -10.8,
            right: 12,
        },
        bookmarkRibbon: {
            borderWidth: 12,
            borderColor: '#FFD700',
            borderLeftWidth: 0,
            borderRightWidth: 5,
            borderRightColor: 'transparent',
            width: 30,
            transform: [
                { rotate: '90deg' }
            ]
        },
        container: {
            flex: 1,
            paddingTop: 22,
            height: '100%',
            maxHeight: 520,
            padding: 5
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        rankContainer: {
            marginRight: 10,

            borderRadius: 5,
            paddingVertical: 2,
            paddingHorizontal: 8,
        },
        rankText: {
            fontWeight: 'bold',
            color: 'white',
            fontSize: 16,
            position: 'absolute',
            bottom: -10,
            right: 7,
            transform: [
                { rotate: '-90deg' }, // Counter rotate the text to make it horizontal again
            ],
        },
        nameText: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        rankBadgeContainer: {
            width: 25,
            height: 25,
            backgroundColor: 'gold', // Change color based on your preference
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomRightRadius: 10, // Adjust for desired curvature
            borderTopLeftRadius: 10, // Adjust for desired curvature
            elevation: 3, // this adds a shadow on Android
            shadowColor: '#000', // these shadow properties add a shadow on iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
    });
    const rankings = [
        { key: '1', name: 'MITSUBISHI CANTER' },
        { key: '2', name: 'TOYOTA VANGUARD' },
        { key: '3', name: 'HINA Ranger' },
        { key: '4', name: 'Isuzu ELF TRUCK' },
        { key: '5', name: 'Mazda DEMIO' },
        { key: '6', name: 'Mercedes-Benz C CLASS' },
        { key: '7', name: 'Toyota RACTIS' },
        { key: '8', name: 'Mazda DEMIO' },
        { key: '9', name: 'Toyota VITZ' },
        { key: '10', name: 'Toyota MARK X' },
        // ... Add other makers here
    ];

    const renderItem = ({ item }) => {
        let ribbonStyle, ribbonComponent;

        if (item.key === '2') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'gray' };
        } else if (item.key === '3') {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: 'brown' };
        } else if (parseInt(item.key) >= 4 && parseInt(item.key) <= 10) {
            // For keys 4 to 10, use a different style or component
            ribbonComponent = <View style={styles.bookmarkRibbonDiamond}><View style={styles.bookmarkRibbons}></View></View>;
        } else {
            ribbonStyle = { ...styles.bookmarkRibbon, borderColor: '#FFD700' };
        }
        return (
            <View style={styles.itemContainer}>

                {ribbonComponent || (
                    <View style={ribbonStyle}>
                        <Text style={styles.rankText}>{item.key}</Text>
                    </View>
                )}
                <Text style={styles.nameText}> {item.name}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <Text style={styles.header}>Maker Ranking</Text>
            <FlatList
                style={{ backgroundColor: '#f5f5f5' }}
                data={rankings}
                renderItem={renderItem}
            />
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

const SortBy = () => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <Pressable
            onPress={handleIsActive}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,

                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',

                },
            ]}
        >
            <Text>Update - New to Old</Text>
            <AntDesign
                name="down"
                size={15}
                color={'blue'}
                style={[
                    { marginLeft: 4 },
                    isActive && {
                        transform: [{ rotate: '180deg' }],
                    },
                ]}
            />
        </Pressable>
    )
};
const ViewPrice = () => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <Pressable
            onPress={handleIsActive}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,

                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',

                },
            ]}
        >
            <Text>USD</Text>
            <AntDesign
                name="down"
                size={15}
                color={'blue'}
                style={[
                    { marginLeft: 4 },
                    isActive && {
                        transform: [{ rotate: '180deg' }],
                    },
                ]}
            />
        </Pressable>
    )
};
const PerPage = () => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    return (
        <Pressable
            onPress={handleIsActive}
            style={({ pressed }) => [
                {
                    opacity: pressed ? 0.5 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 4,

                    borderBottomWidth: 2,
                    borderBottomColor: 'blue',

                },
            ]}
        >
            <Text>25</Text>
            <AntDesign
                name="down"
                size={15}
                color={'blue'}
                style={[
                    { marginLeft: 4 },
                    isActive && {
                        transform: [{ rotate: '180deg' }],
                    },
                ]}
            />
        </Pressable>
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
const SearchCarDesignAlpha = () => {
    const navigate = useNavigate();

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

    //getPort price
    const [profitMap, setProfitMap] = useState('');
    useEffect(() => {
        const fetchInspection = async () => {

            const portDocRef = doc(projectExtensionFirestore, 'CustomerCountryPort', 'PortsDoc');

            try {
                const docSnap = await getDoc(portDocRef);

                if (docSnap.exists()) {
                    const selectedPortData = docSnap.data()[selectedPort];

                    if (selectedPortData) {
                        const profitPrice = selectedPortData.profitPrice;
                        setProfitMap(profitPrice);

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

    //fetch currency
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
    //fetch currency

    //getPort price


    const [searchParams, setSearchParams] = useSearchParams();
    //screenwidth
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenwidth
    const InfoColumn = ({ label, value }) => (
        <View style={{ alignItems: 'center', marginHorizontal: screenWidth <= 768 ? 0 : 10, justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{value}</Text>
            <Text style={{ color: 'gray', fontSize: 16 }}>{label}</Text>
        </View>
    );


    //DROPDOWN MAKE
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
            }
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);
    const [carMakes, setCarMakes] = useState(searchParams.get('carMakes') || '');
    const handleSelectMake = (item) => {
        setCarMakes(item);
    }
    //DROPDOWN MAKE
    //DROPDOWN EXTERIOR COLOR
    const [colors, setColors] = useState([]);
    useEffect(() => {
        const docRef = doc(collection(projectExtensionFirestore, 'ExteriorColor'), 'ExteriorColor');
        try {
            const unsubscribeColor = onSnapshot(docRef, (snapshot) => {
                const colorData = snapshot.data()?.exteriorColor || [];
                setColors(colorData);
            });
            return () => {
                unsubscribeColor();
            }
        } catch (error) {
            console.error('Error fetching data from Firebase: ', error);
        }
    }, []);
    const [carColor, setCarColor] = useState({ name: '', hex: '' });
    const handleSelectColor = (colorName, hexValue) => {
        setCarColor({ name: colorName, hex: hexValue });
    };
    //DROPDOWN EXTERIOR COLOR
    //DROPDOWN MODEL
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
    const [carModels, setCarModels] = useState(searchParams.get('carModel') || '');

    const handleSelectModel = async (option) => {
        setCarModels(option);
    };
    //DROPDOWN MODEL
    //DROPDOWN BODYTYPE
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
    const [carBodyType, setCarBodyType] = useState(searchParams.get('bodyType') || '');

    const handleSelectBodyType = async (option) => {
        setCarBodyType(option);
    };
    //DROPDOWN BODY TYPE
    //DROPDOWN MIN YEAR
    const [carMinYear, setCarMinYear] = useState(searchParams.get('minYear') || '');
    const handleSelectMinYear = async (option) => {
        setCarMinYear(option)
    }
    //DROPDOWN MIN YEAR

    //DROPDOWN MAX YEAR
    const [carMaxYear, setCarMaxYear] = useState(searchParams.get('maxYear') || '');
    const handleSelectMaxYear = async (option) => {
        setCarMaxYear(option)
    }
    //DROPDOWN MAX YEAR
    //DROPDOWN MIN MILEAGE
    const [minMileage, setMinMileage] = useState('');
    const minMileageData = [
        '10000',
        '30000',
        '50000',
        '100000',
        '150000',
        '200000',
    ];
    const handleSelectMinMileage = (option) => {
        setMinMileage(option);
    };
    //DROPDOWN MIN MILEAGE

    //DROPDOWN MAX MILEAGE
    const [maxMileage, setMaxMileage] = useState('');
    const maxMileageData = [
        '10000',
        '30000',
        '50000',
        '100000',
        '150000',
        '200000',
    ];
    const handleSelectMaxMileage = (option) => {
        setMaxMileage(option);
    };
    //DROPDOWN MAX MILEAGE

    //DROPDOWN MIN PRICE
    const [minPrice, setMinPrice] = useState('');
    const minPriceData = [
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];
    const handleSelectMinPrice = (option) => {
        setMaxMileage(option);
    };
    //DROPDOWN MIN PRICE


    //DROPDOWN MAX PRICE
    const [maxPrice, setMaxPrice] = useState('');
    const maxPriceData = [
        '1000',
        '3000',
        '5000',
        '10000',
        '15000',
        '20000',
    ];
    const handleSelectMaxPrice = (option) => {
        setMaxMileage(option);
    };
    //DROPDOWN MAX PRICE

    //LOGIC FOR FILTERS

    const [lastVisible, setLastVisible] = useState(null);
    const [carItems, setCarItems] = useState([]);
    const [hasMoreItems, setHasMoreItems] = useState(false);
    const [pageSnapshots, setPageSnapshots] = useState([null]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [isLoading, setIsLoading] = useState(false)
    const updateSearchParams = () => {
        setSearchParams({ searchTerm });
    };

    const [allItems, setAllItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; // Define items per page as needed
    const fetchItems = async () => {
        setIsLoading(true);

        // Base query without Firestore pagination
        let q = query(collection(projectExtensionFirestore, 'VehicleProducts'), orderBy('dateAdded'), limit(50));

        // Dynamically add where conditions based on filters
        const filters = [
            { condition: searchTerm, field: 'keywords', operation: 'array-contains', value: searchTerm?.toUpperCase() },
            { condition: carMakes, field: 'make', operation: '==', value: carMakes?.toUpperCase() },
            { condition: carModels, field: 'model', operation: '==', value: carModels?.toUpperCase() },
            { condition: carBodyType, field: 'bodyType', operation: '==', value: carBodyType?.toUpperCase() },
            // Add other filters as needed
        ];
        // Apply filters to the query
        filters.forEach(filter => {
            if (filter.condition) {
                q = query(q, where(filter.field, filter.operation, filter.value));
            }
        });

        try {
            const querySnapshot = await getDocs(q);
            let items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Apply year filters client-side
            if (carMinYear) {
                const minYear = parseInt(carMinYear, 10);
                items = items.filter(item => parseInt(item.regYear, 10) >= minYear);
            }

            if (carMaxYear) {
                const maxYear = parseInt(carMaxYear, 10);
                items = items.filter(item => parseInt(item.regYear, 10) <= maxYear);
            }
            if (minMileage) {
                const minMileageValue = parseInt(minMileage, 10); // Convert minMileage to a number
                items = items.filter(item => parseInt(item.mileage, 10) >= minMileageValue);
            }

            if (maxMileage) {
                const maxMileageValue = parseInt(maxMileage, 10); // Convert maxMileage to a number
                items = items.filter(item => parseInt(item.mileage, 10) <= maxMileageValue);
            }

            setAllItems(items); // Store all fetched and filtered items
            setDisplayItems(items.slice(0, itemsPerPage)); // Initialize display items for the first page
            setHasMoreItems(items.length > itemsPerPage); // Determine if there are more items beyond the first page
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const resetPagination = () => {
        setCurrentPage(0); // Reset to first page
        setPageSnapshots([]); // Clear snapshots
    };
    // useEffect(() => {
    //     fetchItems();
    // }, [])
    const fetchNext = () => {
        const nextPage = currentPage + 1;
        const newDisplayItems = allItems.slice(nextPage * itemsPerPage, (nextPage + 1) * itemsPerPage);
        if (newDisplayItems.length > 0) {
            setCurrentPage(nextPage);
            setDisplayItems(newDisplayItems);
            setHasMoreItems((nextPage + 1) * itemsPerPage < allItems.length);
        }
    };

    const fetchPrevious = () => {
        const prevPage = currentPage - 1;
        if (prevPage >= 0) {
            setCurrentPage(prevPage);
            setDisplayItems(allItems.slice(prevPage * itemsPerPage, (prevPage + 1) * itemsPerPage));
            // Always true if currentPage > 0 after decrement
            setHasMoreItems(true);
        }
    };
    const fetchData = () => {
        resetPagination();
        fetchItems();
    };
    useEffect(() => {
        fetchData();
    }, [])
    // useEffect(() => {
    //     resetPagination();

    // }, [searchParams, carMakes, carModels, carBodyType, carMinYear, carMaxYear]);

    const performSearch = () => {
        updateSearchParams();
    };

    //LOGIC FOR FILTERS
    //RENDER ITEMS FROM FLATLIST
    const handleGoToProduct = (id) => {
        navigate(`/ProductScreen/${id}`);
    }
    const renderCarItems = useCallback(({ item }) => {
        const imageAspectRatio = 1.7
        const fobDollar = parseFloat(currentCurrency.jpyToUsd) * parseFloat(item.fobPrice);
        const formattedFobDollar = fobDollar ? parseInt(fobDollar).toLocaleString() : '000'; //FOB PRICE
        const totalPriceCalculation = (parseFloat(item.fobPrice) * currentCurrency.jpyToUsd) + (parseFloat(item.dimensionCubicMeters) * parseFloat(profitMap));
        const formattedTotalPrice = totalPriceCalculation ? parseInt(totalPriceCalculation).toLocaleString() : '000'; //TOTAL PRICE
        return (
            <View style={{ borderRadius: 5, borderWidth: 1, borderColor: '#999', flex: 1, marginVertical: 5, width: '100%', alignSelf: 'center' }}>
                <View style={{ padding: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                            <MaterialCommunityIcons name="steering" size={25} />
                            <Text> Right Hand</Text>
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'blue',
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                maxWidth: 140,
                                borderRadius: 5
                            }}
                        >
                            <AntDesign name="heart" size={15} color={'white'} />
                            <Text style={{ color: 'white' }}>Add to Shortlist</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: screenWidth <= 768 ? 'column' : 'row', padding: 10, backgroundColor: '#fff' }}>
                        <Image
                            source={{ uri: carSample }}
                            style={{
                                width: screenWidth <= 768 ? '100%' : 350,
                                height: screenWidth <= 768 ? (screenWidth / imageAspectRatio) : 250, // Calculate the height based on the screen width and the image's aspect ratio
                                resizeMode: 'cover',

                            }}
                        />
                        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 5 }}>
                                {item.carName}
                            </Text>
                            <Text style={{ color: 'blue', fontSize: 16, marginTop: -5 }}>
                                {item.carDescription}
                            </Text>
                            <Text style={{ fontWeight: '700', fontSize: 16, marginVertical: 20 }}>
                                US$ <Text style={{ fontSize: 30, fontWeight: '700' }}>{formattedFobDollar}</Text>
                            </Text>
                            {screenWidth <= 768 ? (
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    marginVertical: 20,
                                    borderTopWidth: 1,
                                    borderTopColor: '#aaa',
                                    borderBottomColor: '#aaa',
                                    borderBottomWidth: 1,
                                    padding: 15
                                }}>
                                    <InfoColumn label="Year" value={`${item.regYear}/${item.regMonth}`} />
                                    <InfoColumn label="Mileage" value={`${item.mileage} km`} />
                                    <InfoColumn label="Exterior Color" value={item.exteriorColor} />
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%', maxWidth: screenWidth <= 768 ? null : 480, justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Year </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.regYear}/{item.regMonth}</Text>
                                    </Text>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Mileage </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.mileage} km</Text>
                                    </Text>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <Text style={{ fontSize: 16 }}>
                                        <Text style={{ color: 'gray', fontWeight: '500' }}>Exterior Color </Text>
                                        <Text style={{ fontWeight: 'bold' }}> {item.exteriorColor}</Text>
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'blue',
                                    padding: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: screenWidth <= 768 ? null : 'flex-end',
                                    maxWidth: screenWidth <= 768 ? null : 220,
                                    width: '100%',
                                    height: 50,
                                    marginTop: 10,
                                    marginRight: -20,
                                    borderRadius: 5
                                }}
                                onPress={() => handleGoToProduct(item.id)}
                            >
                                <Text style={{ color: 'white', fontSize: 16 }}>Send Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                </View>
            </View>
        );
    }, [currentCurrency, profitMap, screenWidth])
    //RENDER ITEMS FROM FLATLIST

    return (
        <View style={{ flex: 3, }}>
            <StickyHeader />
            <View style={{ flex: 3 }}>
                <View style={{ flexDirection: screenWidth <= 962 ? 'column' : 'row', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                    <View style={{
                        width: '100%',
                        maxWidth: screenWidth <= 1354 ? null : 650,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: '#ccc',
                        padding: 15,
                        marginVertical: 10,
                        height: screenWidth < 456 ? null : 300,
                        flex: 1,
                    }}>
                        <View style={{
                            flexDirection: screenWidth < 456 ? 'column' : 'row',
                            flexWrap: 'wrap',
                            alignItems: screenWidth < 456 ? null : 'center',
                            justifyContent: screenWidth < 456 ? null : 'space-between',
                            marginBottom: 10,
                            zIndex: 10
                        }}>
                            <DropDownMakeSimple makes={makes} handleSelectMake={handleSelectMake} carMakes={carMakes} />
                            <DropDownModelSimple model={models} handleSelectModel={handleSelectModel} carModel={carModels} />
                            <DropDownBodyTypeSimple bodyType={bodyType} carBodyType={carBodyType} handleSelectBodyType={handleSelectBodyType} />
                        </View>
                        <View style={{
                            flexDirection: screenWidth < 456 ? 'column' : 'row',
                            flexWrap: 'wrap',
                            alignItems: screenWidth < 456 ? null : 'center',
                            justifyContent: screenWidth < 456 ? null : 'space-between',
                            marginBottom: 5,
                            zIndex: 8,
                        }}>
                            <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 11 }}>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 8, flex: 1 }}>
                                    <DropDownMinMileageSimple minMileageData={minMileageData} handleSelectMinMileage={handleSelectMinMileage} minMileage={minMileage} />
                                </View>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 6, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                    <DropDownMaxMileageSimple maxMileageData={maxMileageData} handleSelectMaxMileage={handleSelectMaxMileage} maxMileage={maxMileage} />
                                </View>
                            </View>

                            <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 10 }}>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 6, flex: 1 }}>
                                    <DropDownMinYearSimple carMinYear={carMinYear} handleSelectMinYear={handleSelectMinYear} />
                                </View>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 5, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                    <DropDownMaxYearSimple carMaxYear={carMaxYear} handleSelectMaxYear={handleSelectMaxYear} />
                                </View>
                            </View>

                            <View style={{ alignItems: screenWidth < 456 ? 'center' : null, flexDirection: screenWidth < 456 ? 'row' : 'column', flex: 1, zIndex: 9 }}>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 5, flex: 1 }}>
                                    <DropDownMinPriceSimple minPrice={minPrice} handleSelectMinPrice={handleSelectMinPrice} minPriceData={minPriceData} />
                                </View>
                                <View style={{ width: screenWidth < 456 ? null : '100%', zIndex: 4, marginTop: screenWidth < 456 ? null : -10, flex: 1 }}>
                                    <DropDownMaxPriceSimple maxPrice={maxPrice} handleSelectMaxPrice={handleSelectMaxPrice} maxPriceData={maxPriceData} />
                                </View>
                            </View>

                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 5, marginBottom: 9, }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    paddingVertical: 10,
                                    paddingRight: 5,
                                    borderWidth: 1.2,
                                    borderColor: '#eee',
                                    borderRadius: 2,
                                    marginTop: screenWidth < 644 ? 10 : 0,
                                    width: '100%',

                                }}
                                placeholder='Search by make, model, or keyword '
                                placeholderTextColor={'#ccc'}
                            />
                        </View>
                        <View style={{ width: '100%', height: 50, paddingHorizontal: 5, }}>
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    borderRadius: 5,
                                    padding: 10,
                                    backgroundColor: 'blue',
                                    alignItems: 'center',
                                    flex: 1
                                }}
                                onPress={() => fetchData()}
                            >
                                <Text style={{ color: 'white' }}>Search</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={{ marginHorizontal: 25 }} />
                    <View style={{
                        width: '100%',
                        maxWidth: screenWidth <= 1354 ? null : 650,
                        flex: screenWidth > 962 ? 1 : null,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: '#ccc',
                        padding: 15,
                        marginVertical: 10,
                        height: screenWidth < 456 ? null : 300,
                        zIndex: -2

                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10
                        }}>
                            <Text style={{ fontWeight: 'bold' }}>TOTAL PRICE CALCULATOR</Text>
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    borderRadius: 5,
                                    padding: 10,
                                    backgroundColor: 'blue'
                                }}
                            >
                                <Text style={{ color: 'white' }}>Sign-In</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                            zIndex: 5
                        }}>
                            <DropDownSelectCountry selectedCountry={selectedCountry} handleSelectCountry={handleSelectCountry} countryData={countryData} />
                            <DropDownSelectPort selectedPort={selectedPort} handleSelectPort={handleSelectPort} ports={ports} />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                            zIndex: -2
                        }}>
                            <Insurance />
                            <Inspection />
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    borderRadius: 5,
                                    padding: 10,
                                    backgroundColor: 'blue'
                                }}
                            >
                                <Text style={{ color: 'white' }}>Calculate</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 10, padding: 10 }}>
                            <Text style={{
                                flex: 1,
                                marginBottom: 5
                            }}>Total Price calculator will estimate the total price of the cars based on your shipping desstination port and other preferences</Text>
                            <Text style={{
                                flex: 1,
                                fontSize: 12,
                                color: 'grey'
                            }}>Note: In some cases the total price cannot be estimated.</Text>
                        </View>
                    </View>
                </View>
                {/* <ScrollView
                        horizontal
                        contentContainerStyle={{ alignItems: 'center', padding: 5 }}
                        style={{ minWidth: 600, width: '100%', height: 50, zIndex: -1 }}
                    >
                        <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 20, marginRight: 10 }}>
                            <Text style={{ color: 'white', padding: 8 }}>Clear All</Text>
                        </TouchableOpacity>
                        {range ? (
                            <View style={{ flexDirection: 'row', backgroundColor: 'lightblue', borderRadius: 20, alignItems: 'center', padding: 5, marginLeft: 10 }}>
                                <Text style={{ color: 'blue', marginHorizontal: 10 }}>{formatCurrency(range[0])} - {formatCurrency(range[1])}</Text>
                                <TouchableOpacity style={{}}>
                                    <AntDesign name="closecircleo" size={20} color={'blue'} style={{ paddingHorizontal: 4, paddingVertical: 2 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (<></>)}
                        <FilterChip label={carMakes} />
                        <FilterChip label={carModels} />
                        <FilterChip label={carBodyType} />
                        <FilterChip label={carColor.name.name} />
                        {rangeMileAge ? (
                            <View style={{ flexDirection: 'row', backgroundColor: 'lightblue', borderRadius: 20, alignItems: 'center', padding: 5, marginLeft: 10 }}>
                                <Text style={{ color: 'blue', marginHorizontal: 10 }}>{formatMileAge(rangeMileAge[0])} KM - {formatMileAge(rangeMileAge[1])} KM</Text>
                                <TouchableOpacity style={{}}>
                                    <AntDesign name="closecircleo" size={20} color={'blue'} style={{ paddingHorizontal: 4, paddingVertical: 2 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (<></>)}

                        {carMinYear && carMaxYear ? (
                            <View style={{ flexDirection: 'row', backgroundColor: 'lightblue', borderRadius: 20, alignItems: 'center', padding: 5, marginLeft: 10 }}>
                                <Text style={{ color: 'blue', marginHorizontal: 10 }}>{carMinYear} - {carMaxYear}</Text>
                                <TouchableOpacity style={{}}>
                                    <AntDesign name="closecircleo" size={20} color={'blue'} style={{ paddingHorizontal: 4, paddingVertical: 2 }} />
                                </TouchableOpacity>
                            </View>
                        ) : (<></>)}
                    </ScrollView> */}
                <View style={{ flexDirection: screenWidth <= 962 ? 'column' : 'row', width: '100%', justifyContent: 'center', padding: 10, zIndex: -5 }}>
                    {screenWidth > 962 && (
                        <View>
                            <MakerRanking />
                            <ModelRanking />
                        </View>
                    )}
                    <View style={{ flex: 3, maxWidth: 1070, paddingHorizontal: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <Text style={{ fontStyle: 'italic' }}>0000 cars found</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 20 }}>
                                <Button title="Previous" onPress={fetchPrevious} disabled={currentPage === 0} />
                                <Button title="Next" onPress={fetchNext} disabled={!hasMoreItems} />
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5 }}>
                                <Text>Sort by</Text>
                                <SortBy />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5 }}>
                                <Text>View Price in</Text>
                                <ViewPrice />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5 }}>
                                <Text>Per Page</Text>
                                <PerPage />
                            </View>
                        </View>
                        <FlatList
                            data={displayItems}
                            renderItem={renderCarItems}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                    {screenWidth <= 962 && (
                        <View style={{ zIndex: -5, flexDirection: screenWidth <= 715 ? 'column' : 'row', alignItems: screenWidth <= 715 ? null : 'center' }}>
                            <MakerRanking />
                            <ModelRanking />
                        </View>
                    )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'center', maxWidth: 1300 }}>
                    <SignUpView />
                    <View style={{ marginHorizontal: 10 }} />
                    <WhatsAppView />
                </View>

            </View>
            <StickyFooter />
        </View>
    )
};

export default SearchCarDesignAlpha;