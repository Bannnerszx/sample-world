import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text as TextRN, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image as ImageRN, Button, ActivityIndicator, PanResponder } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo } from 'react-native-vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from "../../firebaseConfig";
import { FlatGrid } from "react-native-super-grid";
import { where, collection, doc, getDocs, getDoc, query, onSnapshot, limit, startAfter, orderBy, startAt } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { redirect, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { Slider, RangeSlider } from '@react-native-assets/slider'
import carSample from '../../assets/2.jpg'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Center } from "native-base";
import gifLogo from '../../assets/rename.gif'
import Svg, { Mask, Path, G, Defs, Pattern, Use, Image, Rect, Text, Circle } from "react-native-svg";

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
                        <TextRN>Sign Up</TextRN>
                    </TouchableOpacity>
                </View>
                <View style={{ margin: 20, borderWidth: 1, borderRadius: 5, marginLeft: -10 }}>
                    <TouchableOpacity onPress={() => navigate(`/LoginForm`)} style={{ justifyContent: 'center', flex: 1, marginHorizontal: 10, paddingHorizontal: 10 }}>
                        <TextRN >Log In CHANGES</TextRN>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
};
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
                        <TextRN style={styles.rankText}>{item.key}</TextRN>
                    </View>
                )}
                <TextRN style={styles.nameText}> {item.name}</TextRN>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <TextRN style={styles.header}>Maker Ranking</TextRN>
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
                        <TextRN style={styles.rankText}>{item.key}</TextRN>
                    </View>
                )}
                <TextRN style={styles.nameText}> {item.name}</TextRN>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <TextRN style={styles.header}>Maker Ranking</TextRN>
            <FlatList
                style={{ backgroundColor: '#f5f5f5' }}
                data={rankings}
                renderItem={renderItem}
            />
        </View>
    );
};
const SortBy = ({ sortOptionsArray, sortSelection, handleSortChange }) => {
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
            <TextRN>{sortSelection}</TextRN>
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
                    zIndex: 99,

                }}>
                    <FlatList
                        data={sortOptionsArray} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item.label}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleSortChange(item); handleIsActive(false); }}
                            >
                                <TextRN style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item.label}
                                </TextRN>
                            </Pressable>
                        )}
                    />
                </View>
            )}
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
            <TextRN>USD</TextRN>
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
const PerPage = ({ handleItemsPerPage, itemsPerPage, fetchData }) => {
    const [isActive, setIsActive] = useState(false);
    const handleIsActive = () => {
        setIsActive(!isActive)
    };
    const data = [
        5, 10, 20, 25
    ]
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
            <TextRN>{itemsPerPage}</TextRN>
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
                    zIndex: 99,
                    width: 100
                }}>
                    <FlatList
                        data={data} // Assuming countryData is an object with country names as keys
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => { handleItemsPerPage(item); handleIsActive(false); }}
                            >
                                <TextRN style={{
                                    padding: 10, // Adjust padding as needed
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#eee',
                                }}>
                                    {item}
                                </TextRN>
                            </Pressable>
                        )}
                    />
                </View>
            )}

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


const FavoriteList = () => {
    const { userEmail } = useContext(AuthContext);
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
            <TextRN style={{ fontWeight: 'bold', fontSize: 16 }}>{value}</TextRN>
            <TextRN style={{ color: 'gray', fontSize: 16 }}>{label}</TextRN>
        </View>
    );

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

    // const renderCarItems = useCallback(({ item }) => {

    //     const imageAspectRatio = 1.7
    //     const fobDollar = parseFloat(currentCurrency.jpyToUsd) * parseFloat(item.fobPrice);
    //     const formattedFobDollar = fobDollar ? parseInt(fobDollar).toLocaleString() : '000'; //FOB PRICE
    //     const totalPriceCalculation = (parseFloat(item.fobPrice) * currentCurrency.jpyToUsd) + (parseFloat(item.dimensionCubicMeters) * parseFloat(profitMap));
    //     const formattedTotalPrice = totalPriceCalculation ? parseInt(totalPriceCalculation).toLocaleString() : '000'; //TOTAL PRICE
    //     const carImages = allImageUrl[item.id] || [];
    //     const firstImageUri = carImages[0] || carSample; // Replace 'defaultImagePlaceholderUri' with an actual URI for a placeholder image

    //     return (
    //         <View style={{ borderRadius: 5, borderWidth: 1, borderColor: '#999', flex: 1, marginVertical: 5, width: '100%', alignSelf: 'center' }}>
    //             <View style={{ padding: 5 }}>
    //                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    //                     <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
    //                         <MaterialCommunityIcons name="steering" size={25} />
    //                         <TextRN> Right Hand</TextRN>
    //                     </View>
    //                     <TouchableOpacity
    //                         style={{
    //                             backgroundColor: 'blue',
    //                             padding: 10,
    //                             alignItems: 'center',
    //                             flexDirection: 'row',
    //                             justifyContent: 'space-between',
    //                             width: '100%',
    //                             maxWidth: 140,
    //                             borderRadius: 5
    //                         }}
    //                     >
    //                         <AntDesign name="heart" size={15} color={'white'} />
    //                         <TextRN style={{ color: 'white' }}>Add to Shortlist</TextRN>
    //                     </TouchableOpacity>
    //                 </View>
    //                 <View style={{ flexDirection: screenWidth <= 768 ? 'column' : 'row', padding: 10, backgroundColor: '#fff' }}>
    //                     <Image
    //                         source={{ uri: firstImageUri }}
    //                         style={{
    //                             width: screenWidth <= 768 ? '100%' : 350,
    //                             height: screenWidth <= 768 ? (screenWidth / imageAspectRatio) : 250, // Calculate the height based on the screen width and the image's aspect ratio
    //                             resizeMode: 'cover',

    //                         }}
    //                     />
    //                     <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
    //                         <TextRN style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 5 }}>
    //                             {item.carName}
    //                         </TextRN>
    //                         <TextRN style={{ color: 'blue', fontSize: 16, marginTop: -5 }}>
    //                             {item.carDescription}
    //                         </TextRN>
    //                         <TextRN style={{ fontWeight: '700', fontSize: 16, marginVertical: 20 }}>
    //                             US$ <TextRN style={{ fontSize: 30, fontWeight: '700' }}>{formattedFobDollar}</TextRN>
    //                         </TextRN>
    //                         {screenWidth <= 768 ? (
    //                             <View style={{
    //                                 flexDirection: 'row',
    //                                 justifyContent: 'space-evenly',
    //                                 alignItems: 'center',
    //                                 marginVertical: 20,
    //                                 borderTopWidth: 1,
    //                                 borderTopColor: '#aaa',
    //                                 borderBottomColor: '#aaa',
    //                                 borderBottomWidth: 1,
    //                                 padding: 15
    //                             }}>
    //                                 <InfoColumn label="Year" value={`${item.regYear}/${item.regMonth}`} />
    //                                 <InfoColumn label="Mileage" value={`${item.mileage} km`} />
    //                                 <InfoColumn label="Exterior Color" value={item.exteriorColor} />
    //                             </View>
    //                         ) : (
    //                             <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%', maxWidth: screenWidth <= 768 ? null : 480, justifyContent: 'space-between' }}>
    //                                 <TextRN style={{ fontSize: 16 }}>
    //                                     <TextRN style={{ color: 'gray', fontWeight: '500' }}>Year </TextRN>
    //                                     <TextRN style={{ fontWeight: 'bold' }}> {item.regYear}/{item.regMonth}</TextRN>
    //                                 </TextRN>
    //                                 <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
    //                                 <TextRN style={{ fontSize: 16 }}>
    //                                     <TextRN style={{ color: 'gray', fontWeight: '500' }}>Mileage </TextRN>
    //                                     <TextRN style={{ fontWeight: 'bold' }}> {item.mileage} km</TextRN>
    //                                 </TextRN>
    //                                 <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
    //                                 <TextRN style={{ fontSize: 16 }}>
    //                                     <TextRN style={{ color: 'gray', fontWeight: '500' }}>Exterior Color </TextRN>
    //                                     <TextRN style={{ fontWeight: 'bold' }}> {item.exteriorColor}</TextRN>
    //                                 </TextRN>
    //                             </View>
    //                         )}

    //                         <TouchableOpacity
    //                             style={{
    //                                 backgroundColor: 'blue',
    //                                 padding: 10,
    //                                 justifyContent: 'center',
    //                                 alignItems: 'center',
    //                                 alignSelf: screenWidth <= 768 ? null : 'flex-end',
    //                                 maxWidth: screenWidth <= 768 ? null : 220,
    //                                 width: '100%',
    //                                 height: 50,
    //                                 marginTop: 10,
    //                                 marginRight: -20,
    //                                 borderRadius: 5
    //                             }}
    //                             onPress={() => handleGoToProduct(item.id)}
    //                         >
    //                             <TextRN style={{ color: 'white', fontSize: 16 }}>Send Message</TextRN>
    //                         </TouchableOpacity>
    //                     </View>
    //                 </View>


    //             </View>
    //         </View>
    //     );
    // }, [currentCurrency, profitMap, screenWidth, allImageUrl])
    //RENDER ITEMS FROM FLATLIST
    const [favorites, setFavorites] = useState([]);
    const [reservationStatuses, setReservationStatuses] = useState({});

    useEffect(() => {
        const fetchFavorites = async () => {
            const accountRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const docSnap = await getDoc(accountRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (Array.isArray(userData.favorites)) {
                        setFavorites(userData.favorites);
                    } else {
                        console.warn("Favorites is not an array:", userData.favorites);
                        setFavorites([]);
                    }
                } else {
                    console.log("No such document!");
                    setFavorites([]);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavorites();
    }, [userEmail]);

    useEffect(() => {
        const fetchStockStatuses = async () => {
            const statusFetchPromises = favorites.map(favorite =>
                getDoc(doc(projectExtensionFirestore, 'VehicleProducts', favorite.stockId))
                    .then(docSnap => {
                        if (docSnap.exists()) {
                            return { stockId: favorite.stockId, stockStatus: docSnap.data().stockStatus };
                        } else {
                            console.log(`No vehicle product found for stock ID: ${favorite.stockId}`);
                            return { stockId: favorite.stockId, stockStatus: 'Unknown' };
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching vehicle data for", favorite.stockId, error);
                        return { stockId: favorite.stockId, stockStatus: 'Error' };
                    })
            );

            Promise.all(statusFetchPromises)
                .then(results => {
                    const newStatuses = results.reduce((acc, curr) => {
                        acc[curr.stockId] = curr.stockStatus;
                        return acc;
                    }, {});
                    setReservationStatuses(newStatuses);
                });
        };

        if (favorites.length > 0) {
            fetchStockStatuses();
        }
    }, [favorites]);




    const renderCarItems = useCallback(({ item, index }) => {
        const imageAspectRatio = 1.7

        return (
            <View style={{ borderRadius: 5, borderWidth: 1, borderColor: '#999', flex: 1, marginVertical: 5, width: '100%', alignSelf: 'center' }}>
                <View style={{ padding: 5 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                            <MaterialCommunityIcons name="steering" size={25} />
                            <TextRN> Right Hand</TextRN>
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: reservationStatuses[item.stockId] === 'Reserved' ? 'red' : 'blue', // Conditional background color
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between', // This spreads the children across the entire width
                                width: '100%',
                                maxWidth: 140,
                                borderRadius: 5
                            }}>
                            <AntDesign name="heart" size={15} color={'white'} style={{  flex: 1 }} />
                            <TextRN style={{ color: 'white', flex: 2, textAlign: 'left' }}>{reservationStatuses[item.stockId] === 'Reserved' ? 'Reserved' : 'On-Sale'}</TextRN>
                        </TouchableOpacity>

                    </View>
                    <View style={{ flexDirection: screenWidth <= 768 ? 'column' : 'row', padding: 10, backgroundColor: '#fff' }}>
                        <ImageRN
                            source={{ uri: item.imageUrl }}
                            style={{
                                width: screenWidth <= 768 ? '100%' : 350,
                                height: screenWidth <= 768 ? (screenWidth / imageAspectRatio) : 250, // Calculate the height based on the screen width and the image's aspect ratio
                                resizeMode: 'cover',

                            }}
                        />

                        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
                            <TextRN style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 5 }}>
                                {item.carName}
                            </TextRN>
                            <TextRN style={{ color: 'blue', fontSize: 16, marginTop: -5 }}>
                                {item.carDescription}
                            </TextRN>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TextRN style={{ fontWeight: '700', fontSize: 16, marginVertical: 20, flex: 1 }}>
                                    US$ <TextRN style={{ fontSize: 30, fontWeight: '700' }}>{'formatted dollar'}</TextRN>
                                </TextRN>
                            </View>

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
                                    <InfoColumn label="Exterior Color" value={item.color} />
                                </View>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%', maxWidth: screenWidth <= 768 ? null : 480, justifyContent: 'space-between' }}>
                                    <TextRN style={{ fontSize: 16 }}>
                                        <TextRN style={{ color: 'gray', fontWeight: '500' }}>Year </TextRN>
                                        <TextRN style={{ fontWeight: 'bold' }}> {item.regYear}/{item.regMonth}</TextRN>
                                    </TextRN>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <TextRN style={{ fontSize: 16 }}>
                                        <TextRN style={{ color: 'gray', fontWeight: '500' }}>Mileage </TextRN>
                                        <TextRN style={{ fontWeight: 'bold' }}> {item.mileage} km</TextRN>
                                    </TextRN>
                                    <View style={{ height: '100%', width: 1, backgroundColor: 'grey', marginHorizontal: 10 }} />
                                    <TextRN style={{ fontSize: 16 }}>
                                        <TextRN style={{ color: 'gray', fontWeight: '500' }}>Exterior Color </TextRN>
                                        <TextRN style={{ fontWeight: 'bold' }}> {item.color}</TextRN>
                                    </TextRN>
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
                            // onPress={() => handleGoToProduct(item.id)}
                            >
                                <TextRN style={{ color: 'white', fontSize: 16 }}>Send Message</TextRN>
                            </TouchableOpacity>
                        </View>
                    </View>


                </View>
            </View>
        )
    }, [screenWidth, reservationStatuses])



    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />
            <Svg
                width={'100%'}
                height={'100%'}
                viewBox="0 0 1381 230"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                style={{ justifyContent: 'center' }}
            >
                <Mask
                    id="a"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x={0}
                    y={0}
                    width={1440}
                    height={230}
                >
                    <Path d="M1440 0H0v230h1440V0z" fill="#fff" />
                </Mask>
                <G mask="url(#a)">
                    <Path fill="url(#pattern0)" d="M-38 -130H1440V396H-38z" />
                    <Rect
                        x={0}
                        y={0}
                        width={1381}
                        height={230}
                        fill="rgba(0, 0, 0, 0.3)" // Here, the alpha value of 0.5 provides the opacity
                    />
                    <Text
                        x="50%" // Position text in the middle of the SVG
                        y="50%" // Vertically center the text in the SVG
                        textAnchor="middle" // Ensure the text is centered on the x coordinate
                        fill="white" // Text color
                        fontSize="40" // Font size
                        dy=".3em"
                        fontWeight="italic"

                    >
                        Favorite List
                    </Text>

                </G>
                <Defs>
                    <Pattern
                        id="pattern0"
                        patternContentUnits="objectBoundingBox"
                        width={1}
                        height={1}
                    >
                        <Use xlinkHref="#image0_1_1623" transform="scale(.00068 .0019)" />
                    </Pattern>
                    <Image
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }}
                        id="image0_1_1623"
                        width={1478}
                        height={526}
                    />

                </Defs>

            </Svg>
            <View style={{ flexDirection: screenWidth <= 962 ? 'column' : 'row', width: '100%', justifyContent: 'center', padding: 10, zIndex: -5 }}>
                {screenWidth > 962 && (
                    <View>
                        <MakerRanking />
                        <ModelRanking />
                    </View>
                )}
                <View style={{ flex: 3, maxWidth: 1070, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <TextRN style={{ fontStyle: 'italic' }}>000 cars found</TextRN>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 20 }}>
                            <Button title="Previous" />
                            <Button title="Next" />
                        </View>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray', padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10, zIndex: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5 }}>
                            <TextRN>Sort by</TextRN>
                            <SortBy />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5 }}>
                            <TextRN>View Price in</TextRN>
                            <ViewPrice />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5, zIndex: 5 }}>
                            <TextRN>Per Page</TextRN>
                            <PerPage />
                        </View>
                    </View>
                    <FlatList
                        data={favorites}
                        renderItem={renderCarItems}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        extraData={favorites}
                    />

                </View>
                {screenWidth <= 962 && (
                    <View style={{ zIndex: -5, flexDirection: screenWidth <= 715 ? 'column' : 'row', alignItems: screenWidth <= 715 ? null : 'center' }}>
                        <MakerRanking />
                        <ModelRanking />
                    </View>
                )}
            </View>
        </View>
    )
}

export default FavoriteList