import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image, Button, ActivityIndicator, PanResponder } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from "../../firebaseConfig";
import { FlatGrid } from "react-native-super-grid";
import { where, collection, doc, getDocs, query, onSnapshot, limit, startAfter, orderBy } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import Slider from "@react-native-community/slider";

const StickyHeader = ({ handleSelectMaxYear, handleSelectMinYear, minYear, maxYear, carModel, handleSelectModel, setSearchParams, setCarMakesSearch, handleSelectMake, performSearch, setSearchTerm, setVehicleData, setLastVisibleDoc, searchText, fetchData, setSearchText, handleClear, setCarMakes, carMakes, handleClearMake, handleSearchTextChange }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const { searchQueryWorld } = useParams()
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    return (
        <View style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
        }}>
            <Animated.View
                style={{
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
                    <View style={{ flex: 1, justifyContent: 'center', }}>
                        <TouchableOpacity onPress={() => navigate('/')} style={{ flex: 1, justifyContent: 'center', }}>
                            <Image source={{ uri: logo4 }} style={{ flex: 1, resizeMode: 'contain', aspectRatio: 0.5 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f4f4f4',
                        borderWidth: 0.5,
                        padding: 5,
                        borderRadius: 5,
                        margin: 20,
                        flex: 3,
                    }}>
                        <AntDesign name="search1" size={30} style={{ margin: 5, color: 'gray' }} />
                        <TextInput
                            placeholder='Search by make, model, or keyword'
                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, flex: 3, fontSize: 20 }}
                            textAlignVertical='center'
                            placeholderTextColor={'gray'}
                            onChangeText={(text) => setSearchTerm(text)}
                            onSubmitEditing={performSearch}
                            returnKeyType="search"
                        />
                        <Pressable onPress={() => { }}>
                            <AntDesign name="closecircle" size={24} color="gray" />
                        </Pressable>
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
            <Animated.View
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#aaa',
                    position: 'sticky',
                    top: 100,
                    left: 0,
                    right: 0,
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
                <View style={{ borderTopWidth: 1, flex: 1, borderTopColor: '#aaa', }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 10 }}>
                        <GetMakes carMakes={carMakes} handleSelectMake={handleSelectMake} performSearch={performSearch} setSearchParams={setSearchParams} />
                        <GetModel carMakes={carMakes} carModel={carModel} handleSelectModel={handleSelectModel} setSearchParams={setSearchParams} />
                        <GetYear handleSelectMaxYear={handleSelectMaxYear} handleSelectMinYear={handleSelectMinYear} minYear={minYear} maxYear={maxYear} />
                    </View>
                </View>
            </Animated.View>

        </View>
    )
};

const GetMakes = ({ carMakes, handleSelectMake, performSearch, setSearchParams }) => {
    const [makes, setMakes] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(!modalVisible);
    };

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
    }, [carMakes]); // Add carMakes as a dependency

    return (
        <View style={{ flex: 1 }}>
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        borderRadius: 10,
                        opacity: pressed ? 0.5 : 1,
                    },
                ]}
                onPress={showModal}
            >
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{carMakes ? carMakes : 'MAKE/BRAND'}</Text>
                </View>
            </Pressable>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={showModal}
            >
                <TouchableWithoutFeedback onPress={showModal} style={{ justifyContent: 'center', margin: 10 }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                            <ScrollView>
                                <FlatList
                                    data={makes}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => { handleSelectMake(item); showModal(); setSearchParams({ searchTerm: '', carMakesSearch: item }) }}>
                                            <Text>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </ScrollView>
                            {/* <TouchableOpacity onPress={hideModal}>
                                        <Text>Close</Text>
                                    </TouchableOpacity> */}
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )

};
const GetModel = ({ carMakes, carModel, handleSelectModel, setSearchParams }) => {
    const [models, setModels] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);

    const showModal = () => {
        setModalVisible(!modalVisible);
    };
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
    return (
        <View style={{ flex: 1 }}>

            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        borderRadius: 10,
                        opacity: pressed ? 0.5 : 1,
                    },
                ]}
                onPress={showModal}
            >
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{carModel ? carModel : 'MODEL'}</Text>
                </View>
            </Pressable>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={showModal}
            >
                <TouchableWithoutFeedback onPress={showModal} style={{ justifyContent: 'center', margin: 10 }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>

                        <View style={{ flex: 1 }} />
                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                            <ScrollView>
                                <FlatList
                                    data={models}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => { { handleSelectModel(item); showModal(); setSearchParams({ searchTerm: '', carMakesSearch: carMakes, carModelSearch: item }) } }}>
                                            <Text style={{ color: 'black' }}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </ScrollView>
                            {/* <TouchableOpacity onPress={hideModal}>
                                        <Text>Close</Text>
                                    </TouchableOpacity> */}
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }} />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    )
};
const GetYear = ({ handleSelectMinYear, handleSelectMaxYear, minYear, maxYear }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const openMinYear = () => {
        setIsActive(!isActive);
    }
    const [maxYearActive, setMaxYearActive] = useState(false);
    const openMaxYear = () => {
        setMaxYearActive(!maxYearActive);
    };
    const showModal = () => {
        setModalVisible(!modalVisible);
    };
    const [modalVisibleMax, setModalVisibleMax] = useState(false);
    const showModalMax = () => {
        setModalVisibleMax(!modalVisibleMax);
    };




    const currentYear = new Date().getFullYear(); // This gets the current year
    const minYearStart = 1970;
    const years = Array.from({ length: currentYear - minYearStart + 1 }, (_, index) => currentYear - index);
    const renderMinItem = ({ item }) => (
        <TouchableOpacity>
            <Text style={{ color: 'black', padding: 10 }}>{item}</Text>
        </TouchableOpacity>
    ); const renderMaxItem = ({ item }) => (
        <TouchableOpacity>
            <Text style={{ color: 'black', padding: 10 }}>{item}</Text>
        </TouchableOpacity>
    );
    return (
        <View style={{ flex: 1 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                <Pressable
                    style={({ pressed, hovered }) => [
                        {
                            borderRadius: 10,
                            opacity: pressed ? 0.5 : 1,
                        },
                    ]}
                    onPress={showModal}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text>{'YEAR'}</Text>
                    </View>
                </Pressable>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={showModal}
                >
                    <TouchableWithoutFeedback onPress={showModal} style={{ justifyContent: 'center', margin: 10 }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>

                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 1 }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                                <View style={{ flex: 1, padding: 5 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => [
                                            {
                                                borderRadius: 10,
                                                opacity: pressed ? 0.5 : 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                height: 'auto',
                                                fontSize: 22,
                                                borderRadius: 7,
                                                width: '100%',
                                                padding: 10,
                                                zIndex: isActive ? 20 : 1,
                                            },
                                        ]}
                                        onPress={openMinYear}
                                    >
                                        <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                                            <Text>{'Select Min Year'}</Text>
                                        </View>
                                        <View style={{ justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                            <AntDesign
                                                name="down"
                                                size={15}
                                                style={[
                                                    {
                                                        transitionDuration: '0.3s'
                                                    },
                                                    isActive && {
                                                        transform: [{ rotate: '180deg' }],
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </Pressable>
                                    {isActive && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: '7%',
                                                left: 0,
                                                zIndex: 10,
                                                elevation: 5,
                                                width: '100%',
                                                height: 200,
                                                backgroundColor: 'white',
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                                            }}
                                        >
                                            <FlatList
                                                data={years}
                                                renderItem={renderMinItem}
                                                keyExtractor={(item) => item}
                                                showsVerticalScrollIndicator={false}
                                            />
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, padding: 5 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => [
                                            {
                                                borderRadius: 10,
                                                opacity: pressed ? 0.5 : 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                height: 'auto',
                                                fontSize: 22,
                                                borderRadius: 7,
                                                width: '100%',
                                                padding: 10,
                                                zIndex: maxYearActive ? 20 : 1,
                                            },
                                        ]}
                                        onPress={openMaxYear}
                                    >
                                        <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                                            <Text>{'Select Max Year'}</Text>
                                        </View>
                                        <View style={{ justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row' }}>
                                            <AntDesign
                                                name="down"
                                                size={15}
                                                style={[
                                                    {
                                                        transitionDuration: '0.3s'
                                                    },
                                                    maxYearActive && {
                                                        transform: [{ rotate: '180deg' }],
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </Pressable>
                                    {maxYearActive && (
                                        <View style={{

                                            position: 'absolute',
                                            top: '7%',
                                            left: 0,
                                            zIndex: 10,
                                            elevation: 5,
                                            width: '100%',
                                            height: 200,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            borderColor: '#ccc',
                                            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',

                                        }}>
                                            <FlatList
                                                data={years} // make sure this is set up correctly
                                                renderItem={renderMaxItem}
                                                keyExtractor={(item) => item.toString()}
                                                showsVerticalScrollIndicator={false}
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 1 }} />
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>




            </View>
        </View>

    );
};

const SearchCar = () => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);
    const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
    const [carMakesSearch, setCarMakesSearch] = useState(searchParams.get('carMakes') || '');
    const [carModelSearch, setCarModelSearch] = useState(searchParams.get('carModel') || '');
    const [lastVisible, setLastVisible] = useState(null);
    const [carItems, setCarItems] = useState([]);
    const [hasMoreItems, setHasMoreItems] = useState(true);
    //MAKES PICKER
    const [carMakes, setCarMakes] = useState('');
    const handleSelectMake = async (option) => {
        setCarMakes(option);
        setCarMakesSearch(option);
    };
    //MAKES PICKER

    //MODEL PICKER
    const [carModel, setCarModel] = useState('');
    const handleSelectModel = async (option) => {
        setCarModel(option);
        setCarModelSearch(option);
    };
    //MODEL PICKER

    //MINIMUM YEAR PICKER
    const [minYear, setMinYear] = useState('');
    const handleSelectMinYear = async (option) => {
        setMinYear(option)
    }
    //MINIMUM YEAR PICKER

    //MAXIMUM YEAR PICKER
    const [maxYear, setMaxYear] = useState('');
    const handleSelectMaxYear = async (option) => {
        setMaxYear(option)
    }
    //MAXIMUM YEAR PICKER


    const updateSearchParams = () => {
        setSearchParams({ searchTerm, carMakesSearch, carModelSearch });
    };

    const fetchItems = async (isLoadMore = false) => {
        // Prevent fetching if no more items are available
        if (isLoadMore && !hasMoreItems) {
            return;
        }
        let q = query(vehicleCollectionRef, orderBy('dateAdded'));

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toUpperCase();
            q = query(q, where('keywords', 'array-contains', lowerCaseSearchTerm));
        }
        if (carMakes) {
            const lowerCaseSearchTerm = carMakes.toUpperCase();
            q = query(q, where('make', '==', lowerCaseSearchTerm));
        }
        if (carModel) {
            const lowerCaseSearchTerm = carModel.toUpperCase();
            q = query(q, where('model', '==', lowerCaseSearchTerm));
        }
        if (isLoadMore && lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        q = query(q, limit(10)); // limit per page

        const querySnapshot = await getDocs(q);
        const newItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(newLastVisible);

        if (isLoadMore) {
            setCarItems(prevItems => [...prevItems, ...newItems]);
        } else {
            setCarItems(newItems);
        }

        // Update hasMoreItems based on the number of items fetched
        setHasMoreItems(querySnapshot.docs.length === 10);
    };
    useEffect(() => {
        fetchItems();
    }, [searchParams, carMakes, carModel]);

    const performSearch = () => {
        updateSearchParams();
    };
    const renderItem = useCallback(({ item }) => (
        <View>
            <Text>{item.carName}</Text> {/* Customize this based on your data structure */}
            {/* Additional item details */}
        </View>
    ), []);
    const renderCarItems = useCallback(({ item }) => {

        return (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        boxShadow: hovered ? '0 2px 10px rgba(3, 3, 3, 0.3)' : '0 2px 10px rgba(2, 2, 2, 0.1)',
                    },

                ]}
            // onPress={handlePress}
            >
                <View style={[{ width: '100%', borderRadius: 5, overflow: 'hidden', zIndex: -2, aspectRatio: screenWidth > 729 ? 600 / 900 : 0.7 }]}>
                    {/* <Image
                        source={{
                            uri: imageUrl,
                        }}
                        style={{ resizeMode: 'cover', flex: 1 }}
                    /> */}
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ alignSelf: 'flex-start', fontWeight: '600', fontSize: 18, marginRight: 5 }} numberOfLines={2} ellipsizeMode="tail">
                                    {item.carName}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <FontAwesome name="star-o" size={20} />
                                <FontAwesome name="star-o" size={20} />
                                <FontAwesome name="star-o" size={20} />
                                <FontAwesome name="star-o" size={20} />
                                <FontAwesome name="star-o" size={20} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                            <Text style={{ alignSelf: 'flex-start', fontWeight: '500', fontSize: 16 }}>FOB:$ <Text style={{ color: 'green' }}>Dollar Rate here</Text></Text>
                            <Text style={{ alignSelf: 'flex-end' }}>{item.referenceNumber}</Text>
                        </View>
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#aaa' }}>{item.location}</Text>
                        <View style={{ height: 150, backgroundColor: '#e6e6e6', borderRadius: 15, marginTop: 10, boxShadow: '0 2px 10px rgba(3, 3, 3, 0.1)', justifyContent: 'space-between' }}>
                            <Text style={{ padding: 10, textAlign: 'left', fontSize: 14, overflow: item.carDescription && item.carDescription.length > 80 ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>
                                {item.carDescription}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="speedometer-outline" size={20} />
                                    <Text> {item.mileage}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="calendar-outline" size={20} />
                                    <Text>{item.regYear}/{item.regMonth}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    }, [])
    console.log('car items', carItems)
    return (
        <View style={{ flex: 3 }}>
            <StickyHeader handleSelectMaxYear={handleSelectMaxYear} handleSelectMinYear={handleSelectMinYear} minYear={minYear} maxYear={maxYear} carModel={carModel} handleSelectModel={handleSelectModel} setSearchParams={setSearchParams} setCarMakesSearch={setCarMakesSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} performSearch={performSearch} carMakes={carMakes} handleSelectMake={handleSelectMake} />
            <View style={{ height: '85vh' }}>
                <FlatGrid
                    data={carItems}
                    renderItem={renderCarItems}
                    keyExtractor={(item) => item.id}
                    onEndReached={() => fetchItems(true)}
                    onEndReachedThreshold={0.5}
                    spacing={10}
                    itemDimension={350}
                />
            </View>
        </View>
    )
}
export default SearchCar;