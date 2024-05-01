import React, { useState, useEffect, useContext, useRef } from "react";
import { StyleSheet, Text, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image, Button, ActivityIndicator } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation } from 'react-native-vector-icons';
import { projectExtensionFirestore, projectExtensionStorage } from "../../firebaseConfig";
import { FlatGrid } from "react-native-super-grid";
import { where, collection, doc, getDocs, query, onSnapshot, limit, startAfter, orderBy } from "firebase/firestore";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import SvgCompilations from "../../assets/SvgCompilations";
const StickyHeader = ({ setVehicleData, setLastVisibleDoc, searchText, fetchData, setSearchText, handleClear, setCarMakes, carMakes, handleClearMake, handleSearchTextChange }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const textInputRef = useRef(null);
    const searchTextInputRef = useRef('');
    const { searchQueryWorld } = useParams()
    const navigate = useNavigate();
    // Initialize state for the search text
    const textToRef = (text) => {
        searchTextInputRef.current = text
    }
    const handleSetTextEnter = () => {
        setLastVisibleDoc(null);
        setSearchText(searchTextInputRef.current);
        navigate(`/SearchCar/${searchTextInputRef.current}`)
    }
    const clearSearch = async () => {
        setLastVisibleDoc((prevLastVisibleDoc) => {
            // Ensure the latest state value is used in the update
            if (prevLastVisibleDoc !== null) {
                // Set lastVisibleDoc to null only if it's not already null
                return null;
            }
            return prevLastVisibleDoc;
        });

        setSearchText('');
        setVehicleData([]);
        textInputRef.current.clear();
        navigate(`/SearchCar/all`);
    };
    useEffect(() => {
        if (searchQueryWorld === 'all') {
            textInputRef.current.clear();
        }

    }, [])
    //SET MAKES
    const [makes, setMakes] = useState([]);

    console.log('CAR MAKE', carMakes)
    const [modalVisible, setModalVisible] = useState(false);
    const showModal = () => {
        setModalVisible(true);
        document.body.style.overflow = 'hidden';
    };
    const handleSelectMake = (option) => {
        navigate(`/SearchCar/all`)
        textInputRef.current.clear();
        setSearchText('');
        setModalVisible(false);
        setCarMakes(option);
        document.body.style.overflow = 'auto';
        setLastVisibleDoc(null);
    };
    useEffect(() => {
        try {
            const docRef = doc(collection(projectExtensionFirestore, 'Make'), 'Make');
            const unsubscribe = onSnapshot(docRef, (snapshot) => {
                const makeData = snapshot.data()?.make || [];
                setMakes(makeData);
            });
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
        }
    }, []);
    
    const hideModal = () => {
        setModalVisible(false);
        document.body.style.overflow = 'auto';
    };
    //SET MAKES
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
                            onSubmitEditing={handleSetTextEnter}
                            onChangeText={textToRef}
                            defaultValue={searchText}
                            ref={textInputRef}
                        />
                        <Pressable onPress={() => { clearSearch(); fetchData(); }}>
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

                        <View style={{ flex: 1, borderWidth: 1, margin: 10, padding: 10 }}>
                            <TouchableOpacity style={{ alignItems: 'center' }} onPress={showModal}>
                                <View style={{ alignItems: 'center', }}>
                                    <Text>{carMakes ? carMakes : 'Make'}</Text>
                                </View>
                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={hideModal}
                            >
                                <TouchableWithoutFeedback onPress={hideModal} style={{ justifyContent: 'center', margin: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'row', }}>
                                        <View style={{ width: 400, height: 600, margin: 10, padding: 10, backgroundColor: 'white', borderRadius: 0, marginTop: '8.6%', marginLeft: 20, zIndex: 5 }}>
                                            <ScrollView>
                                                <FlatList
                                                    data={makes}
                                                    keyExtractor={(item) => item}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => handleSelectMake(item)}>
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



                    </View>
                </View>
            </Animated.View>

            <AllData carMakes={carMakes} />
        </View>
    )
};

const AllData = ({ setCarMakes, screenWidth, vehicleData, imageUrls, fetchData, searchText, searchQueryWorld }) => {
    const filteredCars = [1, 2, 3, 4, 5]
    const navigate = useNavigate();
    const renderIndividualImage = ({ item }) => {
        //HOVERED EFFECT
        // const conversion = parseFloat(getConversion);
        // const fobPrice = parseFloat(item.fobPrice);
        // const dollarRate = Math.floor(fobPrice * conversion).toLocaleString();

        const handlePress = () => {
            navigate(`/ProductScreen/${item.id}`);
        };
        const imageUrl = imageUrls[item.id];


       
    };
    const [searchParams, setSearchParams] = useSearchParams();
    // useEffect(() => {
    //     if (carMakes) {
    //         handleChoose();
    //     }
    // }, [carMakes])
    // const handleChoose = async () => {
    //     try {
    //         const vehicleCollectionRef = query(collection(projectExtensionFirestore, 'VehicleProducts'), limit(5));
    //         let q = query(vehicleCollectionRef);
    //         if (carMakes) {
    //             q = query(q, where('make', '==', carMakes.toUpperCase()), limit(5));
    //         }
    //         const querySnapshot = await getDocs(q);
    //         const filteredData = querySnapshot.docs.map((doc) => doc.data());

    //         // Set the filtered data to state
    //         setSomethingSomething(filteredData);
    //         setSearchParams({
    //             make: carMakes,
    //         });

    //         // Optionally, you can update the URL with the search parameters
    //         const queryParams = new URLSearchParams(searchParams);
    //         queryParams.set('make', carMakes);
    //     } catch (error) {
    //         console.error('Error filtering cars:', error);
    //     }
    // };


    return (
        <View>

            <FlatGrid
                keyboardShouldPersistTaps='handled'
                data={vehicleData}
                renderItem={renderIndividualImage}
                itemDimension={350}
                spacing={10}
            />
        </View>
    )
}

const SearchCar = () => {
    const [carMakes, setCarMakes] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { searchQueryWorld } = useParams();
    const [searchText, setSearchText] = useState(searchQueryWorld);
    const [hasMore, setHasMore] = useState(true);
    const [vehicleData, setVehicleData] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
    useEffect(() => {

        fetchData();

    }, [searchText, searchQueryWorld]);

    // useEffect(() => {
    //     if (carMakes.length > 0) {
    //         fetchData();
    //     }

    // }, [carMakes]);

    // useEffect(() => {
    //     if (searchText.length > 0) {
    //         handleSearchEnter();
    //         if (searchQueryWorld === 'all') {
    //             setSearchText('');
    //         }
    //     } else if (searchText.length === 0) {
    //         setSearchText('all')
    //     }
    //     else {
    //         if (carMakes) {
    //             handlePick();
    //         } else {
    //             const queryParams = new URLSearchParams(searchParams);
    //             queryParams.delete('make');
    //             fetchData();
    //         }
    //     }
    // }, [carMakes]);


    // const handleClearMake = () => {
    //     setSearchParams({});
    //     setCarMakes('');
    //     setLastVisibleDoc(null);
    //     setVehicleData([]);
    // };


    const handleScroll = async () => {
        // Check if the user has scrolled (you might want to adjust the threshold)
        console.log('Scroll position:', document.documentElement.scrollTop);
        console.log('Document height:', document.documentElement.scrollHeight);
        console.log('Window height:', window.innerHeight);
        if (document.documentElement.scrollHeight - window.innerHeight - document.documentElement.scrollTop < 5) {
            fetchMoreData();
        }
    };


    const handleClear = async () => {
        // setSearchText('');
        // setCarMakes('');
        // fetchData();
        // setLastVisibleDoc(null);
        // navigate(`/SearchCar/all`);

    };
    useEffect(() => {// Fetch initial data and set lastVisibleDoc
        const scrollListener = () => {
            handleScroll();
            setHasMore(true);
        };

        // Attach an event listener to the scroll event
        window.addEventListener('scroll', scrollListener);

        return () => {
            window.removeEventListener('scroll', scrollListener);
            setLastVisibleDoc(null)
            setHasMore(false);
        };
    }, [vehicleData]);

    const fetchData = async () => {
        try {
            const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

            let q;

            if (searchText.length > 0) {
                q = query(
                    vehicleCollectionRef,
                    where('imageCount', '>=', 1),
                    where('keywords', 'array-contains', searchText.length > 0 ? searchText.toUpperCase() : searchQueryWorld.toUpperCase()),
                    limit(15),
                );

            } else {
                q = query(
                    vehicleCollectionRef,
                    orderBy('dateAdded'),
                    where('imageCount', '>', 0),
                    limit(15),
                );
            }
            if (searchQueryWorld === 'all' || searchText.length === 0) {

                if (carMakes) {
                    q = query(
                        vehicleCollectionRef,
                        where('imageCount', '>=', 1),
                        where('keywords', 'array-contains', carMakes.toUpperCase()),
                        limit(15),
                    );
                } else {
                    q = query(
                        vehicleCollectionRef,
                        where('imageCount', '>', 0),
                        limit(15),
                    );
                }

            }


            const querySnapshot = await getDocs(q);

            const dataWithImages = await Promise.all(querySnapshot.docs.map(async doc => {
                const vehicle = doc.data();
                const folderRef = ref(projectExtensionStorage, doc.id);

                try {
                    const result = await listAll(folderRef);

                    if (result.items.length > 0) {
                        const imageUrl = await getDownloadURL(result.items[0]);
                        return { ...vehicle, imageUrl, id: doc.id };
                    } else {
                        return null;
                    }
                } catch (error) {
                    return null; // Folder does not exist for this ID
                }
            }));

            const validData = dataWithImages.filter(vehicle => vehicle !== null);
            setImageUrls(prevImageUrls => {
                const newImageUrls = {};
                validData.forEach(vehicle => {
                    newImageUrls[vehicle.id] = vehicle.imageUrl;
                });
                return { ...prevImageUrls, ...newImageUrls };
            });

            if (validData.length > 0) {
                if (carMakes) {
                    setVehicleData(validData);
                    const queryParams = new URLSearchParams(searchParams);
                    queryParams.set('make', carMakes);
                    setSearchParams({
                        make: carMakes,
                    });
                } else {

                    setVehicleData(validData);
                }

            } else {
                console.log('No data with images available.');
                setVehicleData([]);
                // Set vehicleData to an empty array
            }

        } catch (error) {
            console.error('Error fetching vehicle data:', error);

        }
    };
    const fetchMoreData = async () => {
        try {
            const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');
            let q;
            // Assuming lastVisibleDoc is set correctly elsewhere
            if (searchText.length > 0 || searchQueryWorld === searchText) {
                q = query(
                    vehicleCollectionRef,
                    where('keywords', 'array-contains', searchText.toUpperCase()),
                    orderBy('dateAdded'),
                    startAfter(lastVisibleDoc),
                    limit(5),
                );
            } else {
                q = query(
                    vehicleCollectionRef,
                    orderBy('dateAdded'),
                    startAfter(lastVisibleDoc),
                    limit(5),
                );
            }
            if (searchQueryWorld === 'all' || searchText.length === 0) {

                if (carMakes) {
                    q = query(
                        vehicleCollectionRef,
                        where('imageCount', '>=', 1),
                        where('keywords', 'array-contains', carMakes.toUpperCase()),
                        startAfter(lastVisibleDoc),
                        limit(15),
                    );
                } else {
                    q = query(
                        vehicleCollectionRef,
                        orderBy('dateAdded'),
                        startAfter(lastVisibleDoc),
                        limit(5),
                    );
                }

            }


            // if (carMakes.length > 0) {
            //     // Modify the existing query conditions instead of creating a new query
            //     q = query(
            //         vehicleCollectionRef,
            //         where('make', '==', carMakes.toUpperCase()),
            //         orderBy('dateAdded'),
            //         startAfter(lastVisibleDoc),
            //         limit(5),
            //     );
            // }

            const querySnapshot = await getDocs(q);

            if (querySnapshot.docs.length > 0) {
                const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                setLastVisibleDoc(lastDoc);

                const newDocs = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                })).filter((vehicle) => vehicle && vehicle.id);

                if (newDocs.length > 0) {
                    setVehicleData((prevData) => {
                        if (!Array.isArray(prevData)) {
                            return prevData;
                        }

                        const uniqueData = newDocs.filter(vehicle =>
                            !prevData.some(existingVehicle =>
                                existingVehicle && existingVehicle.id === vehicle.id
                            )
                        );

                        return [...prevData, ...uniqueData];
                    });
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching more vehicle data:', error);
        }
    };


    // const fetchMoreData = async () => {
    //     try {
    //         const vehicleCollectionRef = collection(projectExtensionFirestore, 'VehicleProducts');

    //         const q = query(
    //             vehicleCollectionRef,
    //             orderBy('stockID'),
    //             startAfter(lastVisibleDoc),
    //             limit(5),
    //             // Assuming lastVisibleDoc is set correctly elsewhere
    //         );

    //         const querySnapshot = await getDocs(q);

    //         if (querySnapshot.docs.length > 0) {
    //             // Update lastVisibleDoc for the next call
    //             const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    //             console.log('Last Document:', lastDoc.data());
    //             setLastVisibleDoc(lastDoc);

    //             const newDocs = querySnapshot.docs.map((doc) => {
    //                 const vehicle = doc.data();
    //                 const folderRef = ref(projectExtensionStorage, doc.id);

    //                 return new Promise(async (resolve) => {
    //                     try {
    //                         const result = await listAll(folderRef);

    //                         if (result.items.length > 0) {
    //                             const imageUrl = await getDownloadURL(result.items[0]);
    //                             resolve({ ...vehicle, imageUrl, id: doc.id });
    //                         } else {
    //                             resolve(null);
    //                         }
    //                     } catch (error) {
    //                         resolve(null); // Folder does not exist for this ID
    //                     }
    //                 });
    //             });

    //             const validData = (await Promise.all(newDocs)).filter((vehicle) => vehicle !== null);

    //             setImageUrls((prevImageUrls) => {
    //                 const newImageUrls = {};
    //                 validData.forEach((vehicle) => {
    //                     newImageUrls[vehicle.id] = vehicle.imageUrl;
    //                 });
    //                 return { ...prevImageUrls, ...newImageUrls };
    //             });

    //             if (validData.length > 0) {
    //                 setVehicleData((prevData) => [...prevData, ...validData]);
    //             } else {
    //                 setHasMore(false);
    //             }
    //         } else {
    //             setHasMore(false);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching more vehicle data:', error);
    //     }
    // };
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => subscription.remove();
    }, []);

    //FETCH DATA





    return (
        <View style={{ flex: 3 }}>
            <StickyHeader fetchData={fetchData} setSearchText={setSearchText} handleClear={handleClear} searchText={searchText} setCarMakes={setCarMakes} carMakes={carMakes} setLastVisibleDoc={setLastVisibleDoc} setVehicleData={setVehicleData} />
            {/* {carMakes ? <TouchableOpacity onPress={handleClearMake}>
                <View><Text>CLEAR MAKE</Text></View>
            </TouchableOpacity> : <></>} */}
            <AllData screenWidth={screenWidth} vehicleData={vehicleData} imageUrls={imageUrls} searchText={searchText} fetchData={fetchData} fetchMoreData={fetchMoreData} carMakes={carMakes} hasMore={hasMore} handleClear={handleClear} setSearchText={setSearchText} searchQueryWorld={searchQueryWorld} />
        </View>
    )
}
export default SearchCar;