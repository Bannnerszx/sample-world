import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { StyleSheet, Text as TextRN, View, Animated, Easing, TouchableOpacity, TouchableWithoutFeedback, Dimensions, TextInput, FlatList, ScrollView, Pressable, Linking, Modal, Image as ImageRN, Button, ActivityIndicator, PanResponder } from "react-native";
import logo4 from '../../assets/RMJ logo for flag transparent.png';
import { Ionicons, AntDesign, FontAwesome, Foundation, Entypo, Octicons } from 'react-native-vector-icons';
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
        <Animated.View style={{
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
        </Animated.View>
    )
};
const NewBackgroundImage = ({ children }) => {
    return (

        <View style={{ position: 'relative', width: '100%' }}>

            <Svg height="0" width="0">
                <Defs>
                    <Pattern
                        id="backgroundPattern"
                        patternUnits="userSpaceOnUse"
                        width={132} // width of your pattern
                        height={137} // height of your pattern
                        viewBox="0 0 132 137"
                    >

                        <Path
                            d="M118.829 68.387l12.746-22.077a.868.868 0 000-.872l-12.99-22.5a.868.868 0 00-.754-.435H92.338L79.598.436A.871.871 0 0078.844 0H52.861a.87.87 0 00-.754.436l-12.74 22.068H13.861a.871.871 0 00-.754.436L.117 45.44a.87.87 0 000 .872l12.744 22.08L.117 90.465a.874.874 0 000 .872l12.99 22.5a.866.866 0 00.754.436h25.51l12.735 22.06a.877.877 0 00.754.436h25.98a.865.865 0 00.754-.436l12.736-22.06h25.5a.869.869 0 00.754-.436l12.99-22.5a.868.868 0 000-.872l-12.745-22.078zm-62.72 51.1l8.645-4.989-11.5 19.911v-13.272l2.855-1.65zm-38.99-22.5l8.635-4.982-11.5 19.911V98.642l2.865-1.655zM14.252 38.14V24.865l11.5 19.91-.958-.552-10.542-6.083zm39-35.78l11.5 19.911-11.5-6.634V2.36zm-39 80.807V69.891l11.5 19.91-.958-.552-10.542-6.082zM17.11 51.96l8.635-4.982-11.5 19.91V53.615l2.865-1.655zm36.151 40.427l11.5 19.91-11.5-6.634V92.387zm13-67.509l11.5 19.911-11.5-6.636V24.878zm-.41 73.045l-10.663-6.156h21.333l-10.67 6.156zm37.891-50.946l-11.5 19.911V53.615l2.852-1.648 8.648-4.99zm-11.5 22.912l11.5 19.911-11.5-6.634V69.889zm-39-22.514l11.5 19.91-11.5-6.634V47.375zm25.2 0v13.274l-11.494 6.635 11.494-19.909zm-13 35.789l-11.5 6.638 11.5-19.91v13.272zm.81-13.273l11.5 19.911-11.5-6.636V69.891zm12.591-8.544l11.5 6.634H67.354l11.49-6.634zm-26 0l11.5 6.636h-23l11.5-6.636zm11.494 7.441l-8.769 5.066-2.727 1.573-11.5-6.637 22.996-.002zm-8.239 5.689l8.646-4.988-11.5 19.911V76.123l2.854-1.646zm9.742 9.383l10.661 6.152H55.188L65.84 83.86zm1.106-14.37l11.494 6.636v13.273L66.946 69.49zm11.9 5.938l-11.5-6.64h23l-11.5 6.64zm.4-14.778v-12.3L89.9 66.803 79.246 60.65zm-12.994 6.232V53.607l11.5-6.636-11.5 19.911zm-.809-13.272v13.271l-11.5-19.909 11.5 6.638zm-13 7.04l-10.662 6.156L52.443 48.34v12.31zm0 15.474v12.3L41.788 69.968l10.655 6.156zm26.8 0l10.66-6.158-10.654 18.457-.006-12.299zm-13.4-23.212L55.18 46.755h21.332l-10.669 6.157zm25.6.7v12.3L80.787 47.457l10.656 6.155zm-51.186 12.3v-12.3l10.66-6.158-10.66 18.458zm-.808-12.3v13.274l-11.5-19.909 11.5 6.635zm.008 16.277v13.273l-11.496 6.639 11.496-19.912zm.8.97l10.655 18.454-10.659-6.149.004-12.305zm64.18 5.265v13.272l-11.5-19.91 11.5 6.638zm0-28.745v13.272l-11.5 6.637 11.5-19.909zm-9.807 3.924l-2.792 1.611-11.5-6.637h22.992l-8.7 5.026zm-54.783 1.62l-11.5-6.641h23l-11.5 6.641zm-12.592-5.537l11.5 19.911-11.5-6.636V47.386zm0 42.019V76.13l11.5-6.636-11.5 19.911zm12.592-5.535l11.5 6.633h-22.99l11.49-6.633zm25.6 14.758V111.9l-11.5-19.91 11.5 6.638zm.806 0l11.5-6.637-11.5 19.912V98.628zm25.185-27.764v12.312l-10.66 6.147 10.66-18.459zm13.4 4.573l-10.663-6.156h21.332l-10.669 6.156zM94.184 67.51l10.654-6.152 10.661 6.152H94.184zm-2.342-28.665l11.5 6.636h-23l11.5-6.636zm-24.88-14.369l11.491 6.636v13.273L66.961 24.476zm-1.107 14.371l10.661 6.151H55.197l10.658-6.151zm-37.5 6.626l11.492-6.636 11.5 6.633-22.992.003zM26.846 61.35l10.661 6.152H16.193l10.653-6.152zm10.674 7.923l-10.669 6.156-10.663-6.156H37.52zm2.331 28.672l-11.5-6.641h23l-11.5 6.641zm38.6-5.558v13.273l-11.49 6.636 11.49-19.909zm13.39-8.523L103.34 90.5h-23l11.5-6.636zm13.399-7.74l11.5-6.636-11.5 19.911V76.124zm0-15.469V47.38l11.5 19.911-11.5-6.636zM91.44 38.14l-10.66 6.156L91.44 25.83v12.31zm-25.989.009l-11.5 6.638 11.5-19.91v13.272zm-14.543 6.139L40.25 38.139v-12.3l10.658 18.449zM26.446 60.653l-11.5 6.638 11.5-19.909v13.271zm0 15.474v13.272l-11.5-19.91 11.5 6.638zm13.8 22.515l10.66-6.158L40.26 110.94l-.015-12.298zm40.532-6.152l10.655 6.152v12.3L80.778 92.49zm11.056 5.454l-11.5-6.637h22.992l-8.77 5.066-2.722 1.571zm14.1-8.144l11.5-19.909v13.273l-11.5 6.636zm0-42.821l11.492 6.635v13.274l-11.492-19.909zm-13.7-8.84V24.865l11.5 19.91-11.5-6.636zM79.261 43.41v-12.3l10.658-6.158L79.261 43.41zm-14.5-18.933l-11.5 19.91V31.112l2.852-1.648 8.648-4.987zm-12.3 6.636v12.3L41.805 24.958l10.656 6.155zm-13-6.247V38.14l-11.494 6.635 11.494-19.909zm0 73.778v13.273l-11.5-19.909 11.5 6.636zm13-5.29v12.312l-10.67 6.157 10.67-18.469zm26.8.006l10.654 18.454-10.657-6.149.003-12.305zm12.987 18.558V98.642l2.852-1.648 8.645-4.989-11.497 19.913zm25.595-59l-11.5-6.641h23l-11.5 6.641zm-11.894-8.145l11.5-19.909v13.274l-11.5 6.635zm-.7-.4V31.098l11.5-6.636-11.5 19.911zm-.809-13.272v13.272l-11.5-19.91 11.5 6.638zm-25.586-.686l-11.5-6.641h23l-11.5 6.641zm-11.893-8.144l11.5-19.909v13.273l-11.5 6.636zm-.7-.4V8.596l11.5-6.636-11.5 19.911zm-.809-13.273V21.87l-11.5-19.91 11.5 6.638zm-9.806 20.207l-2.792 1.611-11.5-6.637h22.992l-8.7 5.026zm-28.39 15.568V31.098l11.5-6.636-11.5 19.911zm-.81-13.272v13.272l-11.5-19.91 11.5 6.638zm-9.72 20.156l-2.877 1.66-11.5-6.637H25.34l-8.614 4.977zm-2.87 32.608l10.048 5.8 1.451.838h-23l11.5-6.638zm12.6 8.544v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.497 19.914-11.5-6.636.003-13.278zm25.6 13.953l11.5 6.635h-23l11.5-6.635zm12.6 8.544v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.5 19.912-11.5-6.637v-13.275zm.7-.4l11.492 6.636v13.273l-11.492-19.909zm11.894-8.142l11.5 6.633h-22.99l11.49-6.633zm25.587-13.952v13.272l-11.5 6.638 11.5-19.91zm.808 0l11.5 19.912-11.5-6.636V92.412zm.7-.4l11.492 6.636v13.274l-11.492-19.91zm11.9-8.142l11.5 6.633h-22.99l11.49-6.633zm.4-.7V70.865l10.655 18.454-10.655-6.149zm0-17.256v-12.3l10.658-6.158-10.658 18.458zm-11.9-20.439l11.493-6.636 11.5 6.633-22.993.003zm-1.508-15.07L94.19 24.248h21.332l-10.669 6.157zM67.361 22.97l11.492-6.635 11.5 6.633-22.992.002zM65.853 7.9L55.19 1.744h21.332L65.853 7.9zm-13 8.436l11.5 6.636h-23l11.5-6.636zM26.847 30.403l-10.663-6.157h21.332l-10.669 6.157zm-13 8.435l10.05 5.8 1.45.838h-23l11.5-6.638zm-.4 14.777v12.3L2.792 47.46l10.655 6.155zm0 17.241v12.312L2.791 89.323l10.656-18.467zm11.9 20.448l-8.686 5.019-2.812 1.623-11.5-6.637 22.998-.005zm1.5 15.074l10.661 6.151h-21.31l10.65-6.151zm37.5 7.422l-8.77 5.066-2.726 1.574-11.5-6.638 22.996-.002zm1.5 15.074l10.661 6.151h-21.31l10.65-6.151zm13-8.433l-11.5-6.641h23l-11.5 6.641zm25.987-14.063l10.661 6.151h-21.31l10.649-6.151zm13-8.433l-11.5-6.641h23l-11.5 6.641zm11.061-53.656l-10.658-6.149v-12.3l10.658 18.449zm-38.989-22.5L79.25 15.64V3.334l10.657 18.455zM52.453 3.323v12.312l-10.662 6.158 10.662-18.47zm-39.005 22.5v12.311L2.786 44.29l10.662-18.467zM2.798 92.484l10.654 6.152v12.3L2.797 92.484zm39 22.5l10.654 6.151v12.3l-10.655-18.451zm37.46 18.449v-12.3l10.657-6.158-10.658 18.458zm38.987-22.5v-12.3l10.658-6.158-10.658 18.458z"
                            fill="#A286BE"
                            opacity="0.2"
                        />
                    </Pattern>
                </Defs>
            </Svg>
            <Svg
                width={'100%'}
                height={'30%'}
                viewBox="0 0 1439 788"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', top: 0 }}
            >
                <Path
                    d="M1282.01 1.196c-71.67 7.749-74.64 72.617-74.64 72.617s-74.98-26.2-89.58 46.848c0 0-64.45-41.536-134.645-4.343-70.192 37.193-44.732 123.012-44.732 123.012s-136.694 13.512-145.321 142.525c0 0-65.195 17.658-70.375 56.606 0 0-178.4-45.6-276.894 105.616 0 0-35.407-20-89.85 6.6 0 0-47.556-77.09-146.882-51.849 0 0-41.7-116.97-209.091-65.44v166.49a44.52 44.52 0 014.351-.21h378.385c20.218 0 36.608 13.429 36.608 29.99s-16.39 29.989-36.608 29.989H279.724a29.994 29.994 0 00-21.509 8.622 30.016 30.016 0 00-6.622 9.788 30.01 30.01 0 000 23.173 30.016 30.016 0 0016.511 16.26 29.994 29.994 0 0011.62 2.15h58.083a29.994 29.994 0 110 59.987H53.735a29.877 29.877 0 00-20.689 8.278H1439v-99.681H913.046a30 30 0 010-59.993h117.614c7.95 0 15.58-3.159 21.2-8.783a29.968 29.968 0 000-42.408 29.975 29.975 0 00-21.2-8.783H717.696a30 30 0 010-59.992h538.954a29.986 29.986 0 0020.89-8.957 30.006 30.006 0 008.62-21.039c0-7.872-3.1-15.428-8.62-21.039a29.986 29.986 0 00-20.89-8.957h-103.37c-20.23 0-36.62-13.425-36.62-29.99 0-16.565 16.39-29.986 36.62-29.986H1439V17.552a49.215 49.215 0 00-23.93-7.151c-40.37-1.437-42.35 15.473-42.35 15.473S1357.53.001 1303.2 0c-7.08.02-14.15.42-21.19 1.2"
                    fill="url(#backgroundPattern)" // Apply the pattern to the cloud shape
                />
            </Svg>

            {children}

            <Svg
                width={'100%'}
                height={'30%'}
                viewBox="0 0 1439 788"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: 0 }}
            > <Path
                    d="M1282.01 1.196c-71.67 7.749-74.64 72.617-74.64 72.617s-74.98-26.2-89.58 46.848c0 0-64.45-41.536-134.645-4.343-70.192 37.193-44.732 123.012-44.732 123.012s-136.694 13.512-145.321 142.525c0 0-65.195 17.658-70.375 56.606 0 0-178.4-45.6-276.894 105.616 0 0-35.407-20-89.85 6.6 0 0-47.556-77.09-146.882-51.849 0 0-41.7-116.97-209.091-65.44v166.49a44.52 44.52 0 014.351-.21h378.385c20.218 0 36.608 13.429 36.608 29.99s-16.39 29.989-36.608 29.989H279.724a29.994 29.994 0 00-21.509 8.622 30.016 30.016 0 00-6.622 9.788 30.01 30.01 0 000 23.173 30.016 30.016 0 0016.511 16.26 29.994 29.994 0 0011.62 2.15h58.083a29.994 29.994 0 110 59.987H53.735a29.877 29.877 0 00-20.689 8.278H1439v-99.681H913.046a30 30 0 010-59.993h117.614c7.95 0 15.58-3.159 21.2-8.783a29.968 29.968 0 000-42.408 29.975 29.975 0 00-21.2-8.783H717.696a30 30 0 010-59.992h538.954a29.986 29.986 0 0020.89-8.957 30.006 30.006 0 008.62-21.039c0-7.872-3.1-15.428-8.62-21.039a29.986 29.986 0 00-20.89-8.957h-103.37c-20.23 0-36.62-13.425-36.62-29.99 0-16.565 16.39-29.986 36.62-29.986H1439V17.552a49.215 49.215 0 00-23.93-7.151c-40.37-1.437-42.35 15.473-42.35 15.473S1357.53.001 1303.2 0c-7.08.02-14.15.42-21.19 1.2"
                    fill="url(#backgroundPattern)" // Apply the pattern to the cloud shape
                />
            </Svg>

        </View>
    )
}

const TermsOfUse = () => {
    //styles
    const styles = StyleSheet.create({
        bulletItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        bulletPoint: {
            width: 10,
            fontSize: 16,
        },
        bulletText: {
            flex: 1,
            fontSize: 16,
            lineHeight: 24,
            marginLeft: 10,
        },

    });



    return (
        <View style={{ flex: 3 }}>
            <StickyHeader />
            <ScrollView>
                <View>
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
                                    fontSize="40" // Font size
                                    dy=".3em"
                                    fontWeight="italic"

                                >
                                    Terms of Use | Real Motor Japan
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
                        <NewBackgroundImage>
                            <View style={{ flex: 1, padding: '2%' }}>
                                <TextRN style={{
                                    fontWeight: 'bold',
                                    fontSize: 32,
                                    textAlign: 'center', // Center the text
                                    marginBottom: 20,
                                }}>Terms of use</TextRN>
                                <TextRN style={{
                                    textAlign: 'justify', // Justify the text if that's what you're looking for
                                    fontSize: 16, // Adjust the font size as needed
                                    lineHeight: 24, // Adjust the line height as needed for readability
                                    marginBottom: 10, // Space after each paragraph

                                }}>
                                    RealMotorJapan Corporation ("RealMotorJapan") provides the following regulations (these "Regulations")regarding usage of all services provided by RealMotorJapan (the "Service") through the website operated by RealMotorJapan, RealMotorJapan.co.jp, tradeRealMotorJapan.com (the "Site"). Those who use the Service(the "Users") shall understand, agree to, and comply with each of the provisions of the Regulations.

                                </TextRN>

                                <TextRN style={{
                                    textAlign: 'justify', // Justify the text if that's what you're looking for
                                    fontSize: 16, // Adjust the font size as needed
                                    lineHeight: 24, // Adjust the line height as needed for readability
                                    marginBottom: 10, // Space after each paragraph

                                }}>
                                    If you do not agree to accept the Regulations, please refrain from perusing the Site and using the Service. If a User accepts the Regulations by clicking on the accept button on the Site, or by some other method without such clicking requirement, and if the User uses the Service, the User will as a matter of course be deemed to have accepted the Regulations.
                                </TextRN>


                                <TextRN
                                    style={{
                                        textAlign: 'justify', // Justify the text if that's what you're looking for
                                        fontSize: 16, // Adjust the font size as needed
                                        lineHeight: 34, // Adjust the line height as needed for readability
                                        marginBottom: 10,
                                        fontWeight: 'bold' // Space after each paragraph

                                    }}
                                >
                                    Article 1 (Scope of these Regulations)
                                </TextRN>
                                <View style={{ marginLeft: 20 }}>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            All of other terms of use, special agreements, rules etc. provided by RealMotorJapan regarding the Service are deemed to be applied as one unit with these Regulations (the "Rules and Regulations"). In such case, if the contents of these Regulations differ from the contents of other terms of use, special agreements, or rules etc., the provisions of such other terms of use, special agreements, or rules etc. will take precedence. Unless particularly stated otherwise, terms defined in these Regulations have the same meaning in the terms of use, special agreements, and rules etc.
                                        </TextRN>
                                    </View>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            RealMotorJapan may change the contents of the Rules and Regulations. In this case, RealMotorJapan shall display the changed contents on the Site and subsequently the User will be bound by the changed Rules and Regulations at the earlier of the point when a User uses the Service for the first time or the point when the notification period provided by RealMotorJapan has passed.
                                        </TextRN>
                                    </View>
                                </View>



                                <TextRN
                                    style={{
                                        textAlign: 'justify', // Justify the text if that's what you're looking for
                                        fontSize: 16, // Adjust the font size as needed
                                        lineHeight: 34, // Adjust the line height as needed for readability
                                        marginBottom: 10,
                                        fontWeight: 'bold' // Space after each paragraph

                                    }}
                                >
                                    Article 2 (Provision of the Service)
                                </TextRN>
                                <View style={{ marginLeft: 20 }}>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            RealMotorJapan provides the Service to Users through the Site, the Affiliate Sites, or through other methods in order to support the realization of an enriched car life and the sale and purchase of Users' cars.
                                        </TextRN>
                                    </View>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            RealMotorJapan provides the Service to Users through the Site, the Affiliate Sites, or through other methods in order to support the realization of an enriched car life and the sale and purchase of Users' cars.
                                        </TextRN>
                                    </View>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            RealMotorJapan shall post the environment necessary or recommended in order to use the Service on the Site. Users shall maintain this usage environment at their own expense and responsibility.
                                        </TextRN>
                                    </View>
                                </View>

                                <TextRN
                                    style={{
                                        textAlign: 'justify', // Justify the text if that's what you're looking for
                                        fontSize: 16, // Adjust the font size as needed
                                        lineHeight: 34, // Adjust the line height as needed for readability
                                        marginBottom: 10,
                                        fontWeight: 'bold' // Space after each paragraph

                                    }}
                                >
                                    Article 3 (Consideration for the Service)
                                </TextRN>
                                <View style={{ marginLeft: 20 }}>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            Consideration for the Service is free of charge except if otherwise provided.
                                        </TextRN>
                                    </View>
                                    <View style={styles.bulletItem}>
                                        <TextRN style={styles.bulletPoint}>•</TextRN>
                                        <TextRN style={styles.bulletText}>
                                            If RealMotorJapan provides a service for a fee it shall provide that information in the Rules and Regulations and shall post the amount of the fee, the method of payment, and other necessary information on the Site.
                                        </TextRN>
                                    </View>If RealMotorJapan provides a service for a fee it shall provide that information in the Rules and Regulations and shall post the amount of the fee, the method of payment, and other necessary information on the Site.
                                </View>


                            </View>

                        </NewBackgroundImage>
                    </View>

                </View>
            </ScrollView>
            <StickyFooter />
        </View>
    )
};

export default TermsOfUse;