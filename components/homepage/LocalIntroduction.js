import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text as TextRN, View, Animated as AnimatedRN, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image as ImageRN, Button, ActivityIndicator, PanResponder } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, MaterialIcons, Octicons } from 'react-native-vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from "../../firebaseConfig";
import { FlatGrid } from "react-native-super-grid";
import { where, collection, doc, getDocs, getDoc, query, onSnapshot, limit, startAfter, orderBy, startAt } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { redirect, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { Slider, RangeSlider } from '@react-native-assets/slider'
import zambia from '../../assets/zambia.jpg'
import { EvilIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Center } from "native-base";
import gifLogo from '../../assets/rename.gif'
import { ComposableMap, Geographies, Geography, Marker, Annotation, ZoomableGroup, Line } from 'react-simple-maps';
import features from '../../assets/features.json'
import Svg, { Mask, Path, G, Defs, Pattern, Use, Image, Rect, Text, Circle } from "react-native-svg"
import { icon } from "leaflet";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    interpolate,
    runOnJS,
    FadeIn,
    FadeOut,
    Layout
} from 'react-native-reanimated';

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

                    <ImageRN
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
                    <TextRN style={{ flex: 1, fontWeight: 'bold' }}>Used Car Stock</TextRN>
                    <TextRN style={{ flex: 1, fontWeight: 'bold' }}>How to Buy</TextRN>
                    <TextRN style={{ flex: 1, fontWeight: 'bold' }}>About Us</TextRN>
                    <TextRN style={{ flex: 1, fontWeight: 'bold' }}>Local Introduction</TextRN>
                    <TextRN style={{ flex: 1, fontWeight: 'bold' }}>Contact Us</TextRN>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1 }} />
                </View>
                {user ? (


                    < View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto', flex: 1, padding: 5 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => navigate(`/Favorite`)} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <AntDesign name="heart" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Favorite</TextRN>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/ProfileFormTransaction`)} style={{ backgroundColor: '#E5EBFD', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <FontAwesome name="user" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Profile</TextRN>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={logout} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <Entypo name="log-out" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Log Out</TextRN>
                        </TouchableOpacity>
                    </View>
                ) : (

                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 'auto', flex: 1, padding: 5 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <AntDesign name="heart" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Favorite</TextRN>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/SignUp`)} style={{ backgroundColor: '#E5EBFD', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <MaterialCommunityIcons name="account-plus" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Sign Up</TextRN>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigate(`/LoginForm`)} style={{ backgroundColor: '#F2F5FE', height: '100%', justifyContent: 'center', alignItems: 'center', flex: 1, borderRadius: 5 }}>
                            <Octicons name="sign-in" size={25} color={'blue'} />
                            <TextRN style={{ color: 'blue' }}>Log In</TextRN>
                        </TouchableOpacity>
                    </View>


                )}
            </View>
        </AnimatedRN.View>
    )
};
const CountryRow = ({ countries }) => {
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap', // Ensures wrapping if the row exceeds the screen width
        },
        countryContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            margin: 5, // Adds some spacing between items
        },
        countryText: {
            marginLeft: 5, // Space between the icon and text
        },
    });
    return (
        <View style={styles.container}>
            {countries.map((country, index) => (
                <View key={index} style={styles.countryContainer}>
                    <Entypo name="location-pin" size={24} color="#F00" />
                    <Text style={styles.countryText}>{country}</Text>
                </View>
            ))}
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
                    backgroundColor: 'white',
                    borderRadius: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ flex: 3, justifyContent: 'flex-start', width: '100%' }}>
                    <TextRN style={{ fontWeight: '500' }}>{selectedCountry ? selectedCountry.replace(/_/g, '.') : 'Select Country'}</TextRN>
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
                                <TextRN style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item.replace(/_/g, '.')}
                                </TextRN>
                            </Pressable>
                        )}
                    />
                </View>
            )}

        </View>
    )
};


const FadeInView = ({ children, shouldFadeIn }) => {
    const scale = useSharedValue(0); // Start with scale 0 for a zoom-in effect

    useEffect(() => {
        if (shouldFadeIn) {
            scale.value = withTiming(1, { duration: 500, easing: Easing.linear }); // Zoom in to scale 1
        } else {
            scale.value = 0; // Reset to initial scale if needed
        }
    }, [shouldFadeIn, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return <Animated.View style={[{ flex: 3 }, animatedStyle]}>{children}</Animated.View>;
};



const WorldMapValues = ({ children }) => {


    const [shouldFadeIn, setShouldFadeIn] = useState(false); //make this false after
    const [isZoomClicked, setIsZoomClicked] = useState(false);
    const [targetRegion, setIsTargetRegion] = useState(''); //make this empty after

    const [targetPos, setTargetPos] = useState({ x: null, y: null })
    const zoomAnim = useSharedValue(1);

    const animatedStyles = useAnimatedStyle(() => {
        const xPos = interpolate(zoomAnim.value, [1, 2], [0, targetPos.x]);
        const yPos = interpolate(zoomAnim.value, [1, 2], [0, targetPos.y]);

        return {
            transform: [{ scale: zoomAnim.value }, { translateX: xPos }, { translateY: yPos }],
        };
    });

    //map chart
    //screenwidth
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenWidth

    //screenHeight
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenHeight(window.height);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    //screenHeight
    const regions = {
        Asia: {
            center: [105, 30],
            zoom: 3,
            countries: ['Russia', 'Iran', 'Philippines', 'Thailand', 'Japan'],
        },
        Africa: {
            center: [20, 0],
            zoom: 3,
            countries: ['Zambia', 'Uganda', 'Tanzania', 'Kenya', 'DRCongo', 'Congo'],
        },
        Caribbean: {
            center: [-61.5, 15],
            zoom: 4,
            countries: [
                'AntiguaAndBarbuda',
                'StLucia',
                'Barbados',
                'StVincent',
                'TrinidadAndTobago',
                'StKitts',
                'Cayman',
            ],
        },
    };

    const dataCountries = {
        Russia: { longitude: 105.3188, latitude: 61.5240, name: 'Russia', code: 'ru' },
        Iran: { longitude: 53.6880, latitude: 32.4279, name: 'Iran', code: 'ir' },
        Philippines: { longitude: 121.7740, latitude: 12.8797, name: 'Philippines', code: 'ph' },
        Thailand: { longitude: 100.9925, latitude: 15.8700, name: 'Thailand', code: 'th' },
        Japan: { longitude: 138.2529, latitude: 36.2048, name: 'Japan', code: 'jp' },
        Zambia: { longitude: 27.8493, latitude: -13.1339, name: 'Zambia', code: 'zm' },
        Uganda: { longitude: 32.2903, latitude: 1.3733, name: 'Uganda', code: 'ug' },
        Tanzania: { longitude: 34.8888, latitude: -6.3690, name: 'Tanzania', code: 'tz' },
        Kenya: { longitude: 37.9062, latitude: -0.0236, name: 'Kenya', code: 'ke' },
        DRCongo: { longitude: 21.7587, latitude: -4.0383, name: 'Democratic Republic of Congo', code: 'cd' },
        Congo: { longitude: 15.8277, latitude: -0.2280, name: 'Congo', code: 'cg' },
        AntiguaAndBarbuda: { longitude: -61.7964, latitude: 17.0608, name: 'Antigua and Barbuda', code: 'ag' },
        StLucia: { longitude: -60.9789, latitude: 13.9094, name: 'Saint Lucia', code: 'lc' },
        Barbados: { longitude: -59.5432, latitude: 13.1939, name: 'Barbados', code: 'bb' },
        StVincent: { longitude: -61.1963, latitude: 13.2533, name: 'Saint Vincent and the Grenadines', code: 'vc' },
        TrinidadAndTobago: { longitude: -61.2225, latitude: 10.6918, name: 'Trinidad and Tobago', code: 'tt' },
        StKitts: { longitude: -62.7830, latitude: 17.3578, name: 'Saint Kitts and Nevis', code: 'kn' },
        Cayman: { longitude: -81.2546, latitude: 19.3133, name: 'Cayman Islands', code: 'ky' },
    };
    const regionAnnotations = [
        { region: 'Asia', coordinates: [105, 30], name: 'Asia' },
        { region: 'Africa', coordinates: [20, 0], name: 'Africa' },
        { region: 'Caribbean', coordinates: [-61.5, 15], name: 'Caribbean' },
        // Add other regions as necessary
    ];
    const [position, setPosition] = useState({ center: [0, 0], zoom: 1 });
    const [displayedCountries, setDisplayedCountries] = useState([]);

    const handleRegionClick = (region) => {
        const regionInfo = regions[region];
        setPosition({
            center: regionInfo.center,
            zoom: regionInfo.zoom,
        });
        if (selectedRegion === region) {
            setSelectedRegion(null); // Show all annotations if the same region is clicked again
        } else {
            setSelectedRegion(region); // Otherwise, remember the clicked region
        }
        setDisplayedCountries(regionInfo.countries);
    };
    const regionZoomIn = [
        { region: 'Asia', targetX: -500, targetY: 150 },
        { region: 'Caribbean', targetX: 400, targetY: 50 },
        { region: 'Africa', targetX: -100, targetY: -150 },
    ]
    const [showCountries, setShowCountries] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const baseScreenWidth = 1600;
    const baseScreenHeight = (screenHeight / screenWidth) * baseScreenWidth;

    const scaleX = screenWidth / baseScreenWidth;
    const scaleY = screenHeight / baseScreenHeight;
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));
    const [boxStyle, setBoxStyle] = useState({});
    const [countryList, setCountryList] = useState([]);
    console.log('country list', countryList)
    const handleZoomIn = (regionName) => {

        const region = regionZoomIn.find(r => r.region === regionName);
        const regionInfo = regions[regionName];
        if (regionInfo) {
            const countryDetails = regionInfo.countries.map(countryKey => dataCountries[countryKey]);

            setCountryList(countryDetails);
        }
        if (region) {

            const targetScale = 1.5;

            const horizontalPosition = Math.max(0, (screenWidth / 2) + (region.targetX * scaleX) + 200);
            const verticalPosition = Math.max(0, (screenHeight / 2) + (region.targetY * scaleY) + 50);





            const targetX = region.targetX * scaleX;
            const targetY = region.targetY * scaleY;

            scale.value = withTiming(targetScale, { duration: 1000 });
            translateX.value = withTiming(targetX, { duration: 1000 });
            translateY.value = withTiming(targetY, { duration: 1000 });
            setShowCountries(true);
            setBoxStyle({
                maxWidth: 300 * scaleX,
                maxHeight: 500 * scaleY,
                width: '100%',
                height: '25%', // You can also scale this if needed
                borderRadius: 5,
                padding: 10,
                position: 'absolute',
                right: horizontalPosition,
                top: screenHeight - verticalPosition, // Adjust this calculation as needed
                backgroundColor: '#fff', // Make sure the background color is set for shadow to appear


                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,


                elevation: 5,
            });
        }
    };
    const handleZoomOut = () => {

        scale.value = withTiming(1, { duration: 1000 }); // Reset to original scale
        translateX.value = withTiming(0, { duration: 1000 }); // Reset to original X position
        translateY.value = withTiming(0, { duration: 1000 }); // Reset to original Y position
        setShowCountries(false); // Hide the country list
        setSelectedRegion(null); // Reset the selected region to show all annotations
        setDisplayedCountries([])
    };

    //map chart
    const [hoverRegion, setHoverRegion] = useState(null);

    const onGeographyEnter = (regionName) => {
        setHoverRegion(regionName);
    };

    const onGeographyLeave = () => {
        setHoverRegion(null);
    };

    const geographyStyle = (regionName) => ({
        default: {
            fill: hoverRegion === regionName ? "#F00" : "#DCD5E6",
            outline: "none",
        },
        hover: {
            fill: "#F00",
            outline: "none",
        },
        pressed: {
            fill: "#F00",
            outline: "none",
        },
    });
    return (
        <View style={{ flex: 1 }}>




            <View style={{
                zIndex: -10,
            }}
            >

                <Animated.View
                    style={animatedStyles}
                >
                    {!isZoomClicked && (
                        <View style={{ overflow: 'hidden' }}>
                            <Animated.View style={[{ backgroundColor: 'transparent' }, animatedStyle]}>

                                {showCountries && (
                                    <View style={{ ...boxStyle, maxHeight: '100%' }}>
                                        <View style={{
                                            padding: 20,
                                            backgroundColor: '#f5f5f5',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <TextRN style={{
                                                fontWeight: 'bold',
                                                fontSize: 18,
                                            }}>
                                                {selectedRegion}
                                            </TextRN>
                                        </View>
                                        <FlatList
                                            data={countryList}
                                            keyExtractor={(item, index) => item + index}
                                            renderItem={({ item, index }) => (
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingVertical: 15,
                                                    backgroundColor: 'white',
                                                    marginLeft: '5%',
                                                    marginRight: '5%',
                                                    justifyContent: 'flex-end'

                                                }}>
                                                    <span className={`fi fi-${item.code}`} style={{ marginRight: 10, }}></span>
                                                    <TextRN style={{
                                                        fontSize: 16,
                                                        fontWeight: 'normal',
                                                        color: '#000',
                                                        flex: 1,
                                                        marginLeft: 10,
                                                    }}>{item.name}</TextRN>
                                                    <AntDesign name="right" size={20} />

                                                </View>
                                            )}
                                            ItemSeparatorComponent={() => (
                                                <View style={{
                                                    height: 1,
                                                    backgroundColor: '#CED0CE',
                                                    marginLeft: '5%',
                                                    marginRight: '5%',
                                                }} />
                                            )}
                                            style={{ flex: 1, width: '100%' }}

                                        />
                                    </View>
                                )}
                                <ComposableMap>

                                    <Geographies geography={features}

                                    >
                                        {({ geographies }) =>
                                            geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo}
                                                style={{
                                                    default: {
                                                        fill: "#DCD5E6",
                                                        outline: "none",
                                                    },
                                                    hover: {
                                                        fill: "#DCD5E6",
                                                        outline: "none",
                                                    },
                                                    pressed: {
                                                        fill: "#DCD5E6", // Color when a geography is pressed or clicked
                                                        outline: "none",
                                                    },
                                                }}
                                            />)
                                        }

                                    </Geographies>
                                    {
                                        displayedCountries.map((countryKey) => {
                                            const country = dataCountries[countryKey];
                                            return (

                                                <Marker key={country.name} coordinates={[country.longitude, country.latitude]}>
                                                    <g
                                                        fill="none"
                                                        stroke="#a286be"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        transform="translate(-12, -24)"
                                                    >
                                                        <circle cx="12" cy="10" r="3" />
                                                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                                                    </g>

                                                </Marker>
                                            );
                                        })
                                    }

                                    {regionAnnotations.map(({ region, coordinates, name }) => {
                                        if (selectedRegion !== region) {
                                            return (
                                                <Marker key={name} coordinates={coordinates}>

                                                    <g
                                                        fill="none"
                                                        stroke="#E7535F"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        transform="translate(-12, -24)"
                                                    >
                                                        <circle cx="12" cy="10" r="3" />
                                                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                                                    </g>

                                                    <line
                                                        x1="0"
                                                        y1="-22.5"
                                                        x2="20"
                                                        y2="-40"
                                                        style={{ stroke: '#E7535F', strokeWidth: '0.5' }}
                                                    />

                                                    <line
                                                        x1="20"
                                                        y1="-40"
                                                        x2="50"
                                                        y2="-40"
                                                        style={{ stroke: '#E7535F', strokeWidth: '0.5' }}
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="-40"
                                                        r="1"
                                                        fill="#E7535F"
                                                        stroke="#E7535F"
                                                        strokeWidth="0.5"
                                                    />

                                                    <text
                                                        x="25"
                                                        y="-45"
                                                        onClick={() => { handleRegionClick(region); handleZoomIn(region); }}
                                                        style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '10px', userSelect: 'none' }}
                                                        textAnchor="start"
                                                        alignmentBaseline="middle"
                                                        fill="#E7535F"
                                                    >
                                                        {name}
                                                    </text>
                                                </Marker>
                                            );
                                        }

                                        return null;
                                    })}




                                </ComposableMap>
                            </Animated.View>

                        </View>
                    )}
                </Animated.View>


            </View>
            <View style={{
                position: 'absolute',
                width: '100%',
                height: '10%',
                justifyContent: 'center', // Center children vertically
                alignItems: 'center', // Center children horizontally
                zIndex: 10, // Higher zIndex to ensure it overlays the SVG
            }}>
                {children}
                {showCountries && (
                    <View style={{ alignSelf: 'flex-end' }}>
                        <TouchableOpacity onPress={handleZoomOut}>
                            <TextRN>CLOSE HERE</TextRN>
                        </TouchableOpacity>
                    </View>
                )}
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
                <TextRN style={[styles.text, { fontSize: fontSize, marginLeft: 3 }]}>WhatsApp</TextRN>
            </View>
            {screenWidth < 768 && (
                <Ionicons name="chatbox-ellipses-outline" size={30} color="#1EA252" style={{ marginRight: 8, }} />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <Ionicons name="chatbox-ellipses-outline" size={responsiveFontSize * 0.9} color="#1EA252" style={{ marginRight: 8, }} />
                )}
                <TextRN style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Start Chat</TextRN>
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
                <TextRN style={[styles.text, { fontSize: fontSize }]}>Sign Up Free</TextRN>
            </View>
            {screenWidth < 768 && (
                <FontAwesome name="user-plus" size={30} color="#EE9A1D" />
            )}
            <View style={styles.chatContainer}>
                {screenWidth > 768 && (
                    <FontAwesome name="user-plus" size={responsiveFontSize * 0.9} color="#EE9A1D" style={{ marginRight: 8 }} />
                )}
                <TextRN style={[styles.text, { fontSize: screenWidth < 768 ? 16 : responsiveFontSize * 0.5, fontWeight: '600' }]}>Register Now</TextRN>
                <Pressable style={screenWidth < 768 ? styles.circleButtonMobile : styles.circleButton}>
                    <AntDesign name="right" size={screenWidth < 768 ? 8 : responsiveFontSize / 4} color={'#F4C112'} />
                </Pressable>
            </View>
        </TouchableOpacity>

    );
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
                <TextRN style={styles.title}>{item.key}</TextRN>
            </View>
        );
    };
    const numColumns = screenWidth < 992 ? 1 : 2;

    const renderItemBodyType = ({ item, index }) => {
        return (
            <View style={[styles.item, styles.firstColumn]}>
                <TextRN style={styles.title}>{item.key}</TextRN>
            </View>
        );
    };
    return (
        <View style={styles.footerContainer}>
            <View style={styles.sectionContainer}>

                <View style={styles.infoSection}>
                    <ImageRN
                        source={{ uri: gifLogo }}
                        resizeMode='contain'
                        style={styles.logo}
                    />
                    <TextRN style={styles.companyAddress}>26-2 Takara Tsutsumi-cho, Toyota-city, Aichi 473-90932 Japan</TextRN>
                    <TextRN style={styles.companyContact}>Tel +81-565-85-0602</TextRN>
                    <TextRN>Fax +81-565-85-0606</TextRN>
                    <TouchableOpacity style={styles.contactButton}>
                        <TextRN style={styles.contactButtonText}>Contact Us</TextRN>
                    </TouchableOpacity>
                    <View style={styles.policyLinks}>
                        <TextRN style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Terms of Use</TextRN>
                        <TextRN style={[styles.policyText, { borderBottomWidth: 2, borderBottomColor: '#DDD' }]}>Privacy Policy</TextRN>
                        <TextRN style={[styles.policyText, { marginBottom: -2 }]}>Cookie Policy</TextRN>
                    </View>
                </View>
                {screenWidth < 768 ? null : (
                    <>
                        <View style={styles.linkSection}>
                            <TextRN style={styles.sectionTitle}>Contents</TextRN>
                            <TextRN style={styles.linkText}>Used Car Stock</TextRN>
                            <TextRN style={styles.linkText}>How to Buy</TextRN>
                            <TextRN style={styles.linkText}>About Us</TextRN>
                            <TextRN style={styles.linkText}>Local Introduction</TextRN>
                            <TextRN style={styles.linkText}>Contact Us</TextRN>
                        </View>

                        <View style={styles.linkSection}>
                            <TextRN style={styles.sectionTitle}>Makers</TextRN>
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
                            <TextRN style={styles.sectionTitle}>Body Types</TextRN>
                            <FlatList
                                data={bodyType}
                                renderItem={renderItemBodyType}
                                keyExtractor={item => item.key}
                                scrollEnabled={false}
                            />

                        </View>

                        <View style={styles.linkSection}>
                            <TextRN style={styles.sectionTitle}>Find Car</TextRN>
                            <TextRN style={styles.linkText}>Browse All Stock</TextRN>
                            <TextRN style={styles.linkText}>Sale Cars</TextRN>
                            <TextRN style={styles.linkText}>Recommended Cars</TextRN>
                            <TextRN style={styles.linkText}>Luxury Cars</TextRN>
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
                    <TextRN style={styles.copyRightText}>
                        Copyright © Real Motor Japan All Rights Reserved.
                    </TextRN>
                </View>
            </View>

        </View>
    );
};
const LocalIntroduction = () => {
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
    return (
        <View style={{ flex: 3, flexDirection: 'column' }}>
            <StickyHeader />

            <WorldMapValues>
                <View
                    style={{
                        padding: 20,
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        flex: 1
                    }}
                >
                    <TextRN style={{ fontSize: '3vw', fontWeight: 'bold' }}>Local Introduction</TextRN>
                    <TextRN style={{ fontSize: '1vw', fontWeight: 'bold' }}>You can check the local information by selecting from the country on the map.</TextRN>
                </View>

            </WorldMapValues>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'center', maxWidth: 1300 }}>
                <SignUpView />
                <View style={{ marginHorizontal: 10 }} />
                <WhatsAppView />
            </View>


            <StickyFooter />
        </View>
    )
}

export default LocalIntroduction;