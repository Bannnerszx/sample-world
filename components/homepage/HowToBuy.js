import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text as TextRN, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image as ImageRN, Button, ActivityIndicator, PanResponder } from "react-native";
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
import gifLogo from '../../assets/rename.gif'
import Svg, { Mask, Path, G, Defs, Pattern, Use, Image, Rect, Text, Circle } from "react-native-svg";

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
};
const Pixelated = () => {
    return (
        <View style={{
            alignSelf: 'flex-start'
        }}>
            <Svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <Path
                    d="M4.8 0H0v4.8h4.8V0zM4.8 9.6H0v4.8h4.8V9.6zM4.8 19.201H0v4.8h4.8v-4.8zM9.6 4.8H4.8v4.8h4.8V4.8zM9.6 14.4H4.8v4.8h4.8v-4.8zM14.399 0H9.6v4.8h4.799V0zM14.4 9.6H9.6v4.8h4.8V9.6zM24 0h-4.8v4.8H24V0zM19.2 4.8h-4.8v4.8h4.8V4.8z"
                    fill="#D5D5D5"
                />
            </Svg>
        </View>
    )
};
const StepCount = () => {
    const dataLength = 4;

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };
        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    const data = [
        { key: '01', title: 'Member Registration' },
        { key: '02', title: 'Search & Contact' },
        { key: '03', title: 'Order & Payment' },
        { key: '04', title: 'After Payment (RCAP System)' }
    ];
    const stepWidth = 150;
    const totalStepsWidth = data.length * stepWidth;
    const totalSpaceAvailable = screenWidth - totalStepsWidth;
    const spaceBetweenItems = totalSpaceAvailable / (data.length - 1);

    const separatorWidth = spaceBetweenItems * 0.95;
    const styles = StyleSheet.create({
        item: {
            width: stepWidth,
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 150
        },
        stepNumber: {
            fontWeight: 'bold',
            fontSize: '4em',
            color: '#007bff',
            textAlign: 'center'
        },
        stepTitle: {
            fontWeight: 'bold',
            fontSize: '0.9em',
            color: '#007bff',
            textAlign: 'center'
        },
        separator: {
            width: separatorWidth,
            height: 2,
            backgroundColor: 'black',
            alignSelf: 'center'
        },
    });


    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Pixelated />
            <Text style={styles.stepNumber}>{item.key}</Text>
            <Text style={styles.stepTitle}>{item.title}</Text>
        </View>
    );

    const Separator = () => <View style={styles.separator} />;

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.key}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
            ItemSeparatorComponent={Separator}
        />
    );
};
const StepsHandler = () => {
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenHeight(window.height);
        };
        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove();
    }, []);

    const data = [

        { key: '1', title: 'Sign in Email Registration' },
        { key: '2', title: 'A confirmation message arrives. ' },
        { key: '3', title: 'It registers with detailed information.' },

    ];

    const stepHeight = 50; // Adjust the height of the step container
    const totalStepsHeight = data.length * stepHeight;
    const totalSpaceAvailable = screenHeight - totalStepsHeight;
    const spaceBetweenItems = totalSpaceAvailable / (data.length - 1);
    const separatorHeight = spaceBetweenItems * 0.95;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',  // Ensure center alignment for separator and item container
        },
        item: {
            backgroundColor: '#E9E4EF',
            height: stepHeight,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: separatorHeight / 50, // Half the separator height will be the margin
            transform: [{ rotate: '45deg' }], // Rotate to create a diamond shape
        },
        stepNumber: {
            fontWeight: 'bold',
            fontSize: 24, // Adjust fontSize according to your needs
            color: 'black',
            transform: [{ rotate: '-45deg' }], // Counter-rotate the text to undo the item rotation
        },
        stepTitle: {
            fontWeight: 'bold',
            fontSize: 14, // Adjust fontSize according to your needs
            color: '#007bff',
            textAlign: 'center',
            transform: [{ rotate: '-45deg' }], // Counter-rotate the text to undo the item rotation
        },
        separator: {
            height: separatorHeight / 2,
            width: 3,
            backgroundColor: '#E9E4EF',
            alignSelf: 'center',
        },
        absoluteText: {
            position: 'absolute',
            left: 70,
            flex: 5,
            fontWeight: 'bold',
            fontSize: 26,
        },
    });

    // Pixelated component (Placeholder for your SVG or Image)


    const renderItem = ({ item, index }) => {

        return (
            <View style={{ flex: 1 }}>

                {index === 0 && <View style={{
                    height: 100,
                    width: 3,
                    backgroundColor: '#E9E4EF',
                    alignSelf: 'center',
                }} />}

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <View style={styles.item}>
                        <TextRN style={styles.stepNumber}>{item.key}</TextRN>
                    </View>

                    <TextRN style={styles.absoluteText}>{item.title}</TextRN>
                </View>

                <View style={{
                    height: 100,
                    width: 3,
                    backgroundColor: '#E9E4EF',
                    alignSelf: 'center',
                }} />
            </View>
        );
    };

    const Separator = () => <View style={styles.separator} />;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <FlatList

                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
                ItemSeparatorComponent={Separator}
            />
            <View style={{ justifyContent: 'space-around', height: '100%', flex: 1, alignItems: 'center', padding: 10, margin: 10 }}>
                {data.map((item, index) => (
                    <Svg
                        width={500}
                        height={300}
                        viewBox="0 0 500 300"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <Path d="M500 0H0v300h500V0z" fill="#D5D5D5" />
                    </Svg>
                ))}
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

const HowToBuy = () => {
    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />
            <View style={{}}>

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
                            fontSize="3em" // Font size
                            dy=".5em"
                            fontWeight="bold"

                        >
                            How to buy
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

            </View>
            <View style={{ alignItems: 'center' }}>
                <StepCount />
            </View>
            <View style={{ alignSelf: 'center' }}>
                <TextRN style={{ fontWeight: 'bold', fontSize: '3em' }}>First of all, it is member registration!</TextRN>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
                <TextRN style={{}}>Member registration is required for use of service. Of course, member registration is Free!
                    When registering instantly, it is here.</TextRN>
                <TouchableOpacity
                    style={{
                        justifyContent: 'center',
                        borderRadius: 5,
                        padding: 10,
                        backgroundColor: 'blue',
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    <Text style={{ color: 'white' }}>Sign Up free</Text>
                </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'center' }}>
                <StepsHandler />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', alignSelf: 'center', maxWidth: 1300 }}>
                <SignUpView />
                <View style={{ marginHorizontal: 10 }} />
                <WhatsAppView />
            </View>
            <StickyFooter />
        </View>
    )
}

export default HowToBuy;