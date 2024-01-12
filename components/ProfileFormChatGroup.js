import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto, MaterialIcons } from 'react-native-vector-icons';
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc, limit, startAfter } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage } from '../firebaseConfig';
import { AuthContext } from '../context/AuthProvider';
import { useParams } from 'react-router-dom';
import { getStorage, listAll, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';
import ProgressStepper from './ProgressStepper';
import { Country, City } from 'country-state-city';
import { Calendar } from 'react-native-calendars';
import ViewInvoice from './ViewInvoice';
import moment from 'moment/moment';
import axios from 'axios';
import ViewOrderInvoice from './ViewOrderInvoice';
import * as DocumentPicker from 'expo-document-picker';
import Hyperlink from 'react-native-hyperlink';
import SplashScreen from './SplashScreen';
const LoadingComponent = () => {
    const styles = StyleSheet.create({
        searchBarSkeleton: {
            borderBottomWidth: 0.5,
            borderBottomColor: '#ccc',
            marginTop: 9,
            padding: 10,
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            backgroundColor: '#ECEDF0',
            height: 50, // Set an appropriate height for the search bar
        },
        buttonsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
        },
        buttonSkeleton: {
            backgroundColor: '#ECEDF0',
            borderRadius: 5,
            height: 30,
            flex: 1,
            marginHorizontal: 5,
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
        },
        avatarPlaceholder: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#e0e0e0',
        },
        textPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            marginLeft: 10,
        },
        line: {
            height: 10,
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            marginBottom: 6,
            width: '100%',
        },
        shortLine: {
            width: '60%',
        },
    });
    return (
        <View style={styles.container}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.textPlaceholder}>
                <View style={styles.line} />
                <View style={[styles.line, styles.shortLine]} />
            </View>
        </View>

    );
};
const LoadingLeftComponent = () => {
    const styles = StyleSheet.create({
        loadingContainer: {
            flex: 3, // Takes up 3 parts of the flex space
            justifyContent: 'center', // Centers the spinner vertically
            alignItems: 'center', // Centers the spinner horizontally
        },
    });
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" /> {/* You can customize the size and color */}
        </View>
    );
};
const TextInputForChat = ({ scrollViewRef }) => {
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);


    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams(); // Use useParams to access the chatId from the route
    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };
    const handleSend = async () => {

        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
            };

            // Set the message data in the new message document
            await setDoc(newMessageDocExtension, messageData);
            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setMessages('');

            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
        scrollViewRef.current.scrollToEnd({ animated: true });
    };

    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';


    //FETCHING IMAGES
    //DOWNLOAD SHIPPING INSTRUCTIONS
    const [isHovered, setIsHovered] = useState(false);

    //DOWNLOAD SHIPPING INSTRUCTIONS

    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const handleCloseModal = () => {
        setShowFileExceeded(false);
    };
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };

    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const updateCustomerFiles = async () => {
        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

            const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
            const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';

            let fileType = '';
            let messageText = '';

            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                fileType = 'image';
                messageText = 'Sent an image';
            } else if (fileExtension === 'pdf') {
                fileType = 'pdf';
                messageText = 'Sent a link';
            } else if (fileExtension === 'xlsx') {
                fileType = 'xlsx';
                messageText = 'Sent a link';
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                fileType = 'doc';
                messageText = 'Sent a link';
            } else {
                fileType = 'link';
                messageText = 'Sent a link';
            }

            // Log the fileBlob size to help diagnose issues
            console.log('File size:', fileBlob.size);

            await uploadBytes(storageRef, fileBlob);
            const downloadURL = await getDownloadURL(storageRef);

            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
                file: {
                    url: downloadURL,
                    type: fileType,
                    name: selectedFile.name
                },
            };

            await setDoc(newMessageDocExtension, messageData);

            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue ? messageValue : messageText,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setSelectedFile(null);
            console.log('File uploaded successfully!');
        } catch (error) {
            console.error('Error updating remitter:', error);
        }
    };

    const handleDownloadPDF = (chatId, pdfLink) => {
        // Assuming you want to open PDF links in a browser
        if (pdfLink.endsWith('.pdf')) {
            Linking.openURL(pdfLink);
        } else {
        }
    };

    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };


    return (
        <View style={[styles.inputContainer, { zIndex: 999 }]}>
            {showFileExceeded && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showFileExceeded}
                    onRequestClose={() => setShowFileExceeded(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxWidth: 300, width: '80%' }}>
                                <Text>File size exceeds the maximum limit.</Text>
                                <TouchableOpacity onPress={() => setShowFileExceeded(false)}>
                                    <Text style={{ color: 'blue', marginTop: 10 }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {isHovered && (
                <View style={{
                    position: 'absolute',
                    backgroundColor: '#333',
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 10,
                    left: 30,
                    transform: [{ translateX: -25 }],
                    top: -40,
                }}>
                    <Text style={{ color: '#fff' }}>Upload Files</Text>
                    <View
                        style={{
                            position: 'absolute',
                            top: 25,
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderTopWidth: 0,
                            borderRightWidth: 15,
                            borderBottomWidth: 15,
                            borderLeftWidth: 15,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderTopColor: 'transparent',
                            borderBottomColor: '#333',
                            transform: [{ rotate: '180deg' }],
                            transition: 'transform 0.5s ease, opacity 0.5s ease',
                            zIndex: -999
                        }}
                    ></View>
                </View>
            )}
            <Pressable
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => setIsHovered(false)}
                onPress={() => uploadRemitterFiles()}
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: hovered ? '#f1f1f1' : 'transparent',
                        borderRadius: hovered ? 50 : 0,
                        margin: 5,
                        alignItems: 'center',
                    },
                    { zIndex: 999 }
                ]}
            >
                <MaterialIcons name={'attach-file'} size={25} style={{ margin: 5, color: '#7b9cff' }} />
            </Pressable>

            <InvoiceAmendment />
            <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                {selectedFile && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1 }}>{selectedFile.name}</Text>
                        <TouchableOpacity onPress={deleteSelectedFile} style={{ marginLeft: 5 }}>
                            <Text style={{ color: 'red' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TextInput
                    placeholder={`Type your message`}
                    value={messageValue}
                    onChangeText={(text) => handleMessageChange(text)}
                    style={styles.input}
                    onSubmitEditing={() => { if (selectedFile) { updateCustomerFiles(); setMessages('') } else { handleSend(); setMessages('') } }}
                />
            </View>
            <TouchableOpacity onPress={() => { if (selectedFile) { updateCustomerFiles(); setMessages('') } else { handleSend(); setMessages('') } setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100); }}>
                <Text style={styles.sendButton}>Send</Text>
            </TouchableOpacity>
        </View>
    )
}
const ChatD = ({ selectedChatI, openModalRequest, updateReadby, handleScroll, scrollViewRef, modalVisible }) => {
    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);


    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams(); // Use useParams to access the chatId from the route
    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    const [chatMessages, setChatMessages] = useState([]);
    const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const loadLatestMessages = async () => {
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
            );

            const newMessages = querySnapshot.docs.map(doc => doc.data()).reverse();

            if (newMessages.length > 0) {
                setOldestMessageTimestamp(newMessages[0].timestamp);
                setChatMessages(newMessages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
    const [paymentNotification, setPaymentNotification] = useState([]);

    console.log('PAYMENT', paymentNotification)
    useEffect(() => {
        const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');
        const paymentRef = doc(projectExtensionFirestore, 'chats', currentChatId);
        const q = query(chatRef, orderBy('timestamp', 'desc'), limit(15));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp ? data.timestamp.toString() : null;
                messages.push({ id: doc.id, ...data, timestamp });
            });

            if (messages.length > 0) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }

            setChatMessages(messages);
        });

        const unsubscribePayment = onSnapshot(paymentRef, (snapshot) => {
            if (snapshot.exists()) {
                // Assuming paymentNotification is a field in the document
                const paymentNotificationsData = snapshot.data().paymentNotification || [];
                setPaymentNotification(paymentNotificationsData);
            }
        });

        return () => {
            unsubscribe();
            unsubscribePayment();
        };
    }, [currentChatId]);

    const loadMoreMessages = () => {
        if (lastVisible) {
            const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');
            const q = query(chatRef, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));

            onSnapshot(q, (querySnapshot) => {
                let messages = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const timestamp = data.timestamp ? data.timestamp.toString() : null;
                    messages.push({ id: doc.id, ...data, timestamp });
                });

                if (messages.length > 0) {
                    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                }

                setChatMessages((prevMessages) => [...prevMessages, ...messages]);
            });
        }
    };
    console.log('chat messages', chatMessages)
    // Replace 'firestore' with your Firestore instance
    const firestore = getFirestore(); // Make sure to import getFirestore from Firebase

    // useEffect(() => {
    //     // Set up a real-time listener for messages in the specific chat conversation using chatId
    //     const unsubscribe = onSnapshot(
    //         collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
    //         {
    //             query: orderBy('Time', 'asc'), // Order messages by timestamp
    //         },
    //         (snapshot) => {
    //             const messages = [];
    //             snapshot.forEach((doc) => {
    //                 messages.push(doc.data());
    //             });
    //             setChatMessages(messages);
    //         }
    //     );

    //     return () => {
    //         // Unsubscribe from the real-time listener when the component unmounts
    //         unsubscribe();
    //     };
    // }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId
    const [carId, setCarId] = useState('');
    const [proformaIssue, setProformaIssue] = useState(null);
    const [chatField, setChatField] = useState([]);
    console.log('CAR ID FOR THIS SHITZZ: ', carId);


    useEffect(() => {
        // Define the reference to the chat document with the specific chatId
        const chatRef = doc(projectExtensionFirestore, 'chats', chatId);

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
                // Extract the carId, carName, and carRefNumber from the document data
                const vehicleData = chatDocSnapshot.data()?.carData;
                const chatData = chatDocSnapshot.data();
                if (chatData) {
                    setChatField(chatData);
                }
                if (vehicleData) {
                    setCarId(vehicleData.stockID);
                }
                const proformaInvoice = chatDocSnapshot.data()?.proformaInvoice;
                if (proformaInvoice) {
                    setProformaIssue(proformaInvoice.proformaIssue);
                }
            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
        };
    }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId

    //fetch customer email
    //Reserved button
    const [reservationStatus, setReservationStatus] = useState(false);
    useEffect(() => {
        const fetchVehicleDoc = async () => {
            try {
                // Only fetch the vehicle document if carId is available
                if (carId) {
                    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
                    const docSnapshot = await getDoc(vehicleDocRef);

                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        const reserveValue = data.Reserve || false;
                        setReservationStatus(reserveValue);
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle document:', error);
            }
        };

        fetchVehicleDoc();
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    const handleReserve = async () => {
        const carChatId = carId;
        try {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carChatId);
            await updateDoc(vehicleDocRef, {
                Reserve: true // Send a boolean value
            });

            setReservationStatus(true);
        } catch (error) {
            console.error('Error reserving vehicle:', error);
        }
    };
    //Reserved button




    //fetch the cardata
    const [carData, setCarData] = useState('');
    useEffect(() => {
        if (carId) {
            // Create a reference to the document
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            // Listen for real-time updates to the document
            const unsubscribe = onSnapshot(vehicleDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const carDataFromFirestore = docSnapshot.data();
                    setCarData(carDataFromFirestore);
                } else {
                    console.log('Document does not exist.');
                }
            }, (error) => {
                console.error('Error listening to document:', error);
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => unsubscribe();
        }
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };
    const handleSend = async () => {

        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
            };

            // Set the message data in the new message document
            await setDoc(newMessageDocExtension, messageData);
            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setMessages('');

            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';
    const navigate = useNavigate();
    const handlePress = () => {
        if (proformaIssue) {
            const url = `/ProfileFormChatGroup/${chatId}/print`;
            window.open(url, '_blank');
        }
    };

    //FETCHING IMAGES
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true); // Reset loading state when stockID changes

        const folderRef = ref(projectExtensionStorage, carData.stockID);

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
            } finally {
                // Use setTimeout to delay setting loading to false for 1 second (1000 milliseconds)
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };

        // Fetch image URL for the vehicleData's referenceNumber
        fetchImageURL(folderRef);
        handleImageLoad();
    }, [carData.stockID]);

    const handleImageLoad = () => {
        setLoading(false);
    };

    //DOWNLOAD SHIPPING INSTRUCTIONS

    const handleDownloadShippingIns = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };

    const handleDownloadBL = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };
    const [isHovered, setIsHovered] = useState(false);

    //DOWNLOAD SHIPPING INSTRUCTIONS

    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };

    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const updateCustomerFiles = async () => {
        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

            const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
            const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';

            let fileType = '';

            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                fileType = 'image';
            } else if (fileExtension === 'pdf') {
                fileType = 'pdf';
            } else if (fileExtension === 'xlsx') {
                fileType = 'xlsx';
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                fileType = 'doc';
            } else {
                fileType = 'link';
            }

            // Log the fileBlob size to help diagnose issues
            console.log('File size:', fileBlob.size);

            await uploadBytes(storageRef, fileBlob);
            const downloadURL = await getDownloadURL(storageRef);

            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
                file: {
                    url: downloadURL,
                    type: fileType,
                    name: selectedFile.name
                },
            };

            await setDoc(newMessageDocExtension, messageData);

            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: downloadURL,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setSelectedFile(null);
            console.log('File uploaded successfully!');
        } catch (error) {
            console.error('Error updating remitter:', error);
        }
    };

    const handleDownloadPDF = (chatId, pdfLink) => {
        // Assuming you want to open PDF links in a browser
        if (pdfLink.endsWith('.pdf')) {
            Linking.openURL(pdfLink);
        } else {
        }
    };

    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };
    //UPLOAD FILES
    // const [showView, setShowView] = useState(false);
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setShowView(true);
    //     }, 1500);

    //     return () => clearTimeout(timer); // Clear the timeout if the component is unmounted before the delay is over
    // }, []);

    // if (!showView) {
    //     return null; // Or return a loading component if you want
    // }
    return (
        <View

        >
            {showFileExceeded && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showFileExceeded}
                    onRequestClose={() => setShowFileExceeded(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, maxWidth: 300, width: '80%' }}>
                                <Text>File size exceeds the maximum limit.</Text>
                                <TouchableOpacity onPress={() => setShowFileExceeded(false)}>
                                    <Text style={{ color: 'blue', marginTop: 10 }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <View

            >
                {chatMessages && (
                    <ScrollView
                    >
                        <TouchableOpacity onPress={loadMoreMessages} style={{ padding: 10, backgroundColor: 'lightgray', alignItems: 'center' }}>
                            <Text>Load More</Text>
                        </TouchableOpacity>
                        <FlatList
                            nestedScrollEnabled
                            windowSize={200}
                            data={chatMessages
                                .filter((item) => item.timestamp)
                                .sort((a, b) => {
                                    const dateA = new Date(b.timestamp.replace(/-/g, '/').replace(' at ', ' '));
                                    const dateB = new Date(a.timestamp.replace(/-/g, '/').replace(' at ', ' '));
                                    return dateA - dateB;
                                })
                                .reverse()}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View>
                                    {!item.setOrderButton && !item.setPaymentNotification && !item.orderInvoiceIssue && !item.proformaIssue && !item.amendedInvoiceIssue && !item.shippingInstruction
                                        && !item.billOfLading && !item.receiverInfoIssue && (
                                            <View
                                                style={[
                                                    styles.chatContainer,
                                                    {
                                                        alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                        backgroundColor: item.sender === userEmail ? (item.fileType !== 'image' ? 'blue' : 'transparent') : 'green',
                                                    },
                                                ]}
                                            >
                                                <Hyperlink linkDefault={true} linkStyle={{ color: 'white', textDecorationLine: 'underline' }}>
                                                    <Text style={{ color: 'white' }}>{item.text}</Text>
                                                    {item.file && (
                                                        <>
                                                            {item.file.type === 'image' ? (
                                                                <Pressable
                                                                    style={({ pressed, hovered }) => [
                                                                        {
                                                                            backgroundColor: hovered ? '#f5f5f5' : 'transparent',
                                                                            borderRadius: hovered ? 10 : 0,
                                                                        },
                                                                    ]}
                                                                    onPress={() => handleOpenLink(item.file.url)}
                                                                >
                                                                    <Image
                                                                        source={{ uri: item.file.url }}
                                                                        style={{ width: 350, height: 350, resizeMode: 'contain' }}
                                                                    />
                                                                </Pressable>
                                                            ) : (
                                                                <TouchableOpacity onPress={() => handleOpenLink(item.file.url)}>
                                                                    <Text style={{ color: item.file.type === 'pdf' ? 'red' : 'white', textDecorationLine: 'underline' }}>
                                                                        {item.file.name}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </>
                                                    )}
                                                </Hyperlink>
                                            </View>
                                        )}


                                    {item.setOrderButton === true && (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{'PLEASE CLICK THE ORDER BUTTON'}</Text>
                                            <TouchableOpacity
                                                style={{
                                                    height: 50,
                                                    backgroundColor: '#FAA000',
                                                    borderRadius: 10,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: 10
                                                }}
                                                onPress={() => openModalRequest()}
                                            >

                                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                                                    ORDER ITEM BUTTON HERE
                                                </Text>
                                            </TouchableOpacity>
                                            <Modal
                                                animationType="fade"
                                                transparent={true}
                                                visible={modalVisible}
                                                onRequestClose={openModalRequest}
                                            >
                                                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                                                    <View style={{ backgroundColor: 'white', width: 992, height: '90%', padding: 10, borderRadius: 10 }}>
                                                        <ScrollView>
                                                            <OrderItem openModalRequest={openModalRequest} />
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            </Modal>

                                        </View>
                                    )}

                                    {item.setPaymentNotification === true && (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{'PLEASE CLICK THE PAYMENT NOTIFICATIONS'}</Text>
                                            <PaymentNotification />
                                        </View>
                                    )}

                                    {item.orderInvoiceIssue === true && (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <ViewOrderInvoice />
                                        </View>
                                    )}
                                    {item.proformaIssue === true ? (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <ViewInvoice />
                                        </View>
                                    ) : null}


                                    {item.amendedInvoiceIssue === true ? (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <ViewOrderInvoice />
                                        </View>
                                    ) : null}

                                    {item.shippingInstruction === true ? (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <TouchableOpacity onPress={() => handleDownloadShippingIns(chatId, chatField?.ShippingInstructions)}>
                                                <Text style={{ color: 'red', textDecorationLine: 'underline' }}>
                                                    {`${chatField?.ShippingInstructions}.pdf`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : <></>}

                                    {item.billOfLading === true ? (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <TouchableOpacity onPress={() => handleDownloadBL(chatId, chatField?.BillOfLading)}>
                                                <Text style={{ color: 'red', textDecorationLine: 'underline' }}>
                                                    {`${chatField?.BillOfLading}.pdf`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : <></>}

                                    {item.receiverInfoIssue === true ? (
                                        <View
                                            style={[
                                                styles.chatContainer,
                                                {
                                                    alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                                    backgroundColor: item.sender === userEmail ? 'blue' : 'green',
                                                },
                                            ]}
                                        >
                                            <Text style={{ color: 'white' }}>{item.text}</Text>
                                            <ReceiverInformation />
                                        </View>
                                    ) : null}
                                    {/* Add more conditions as needed */}
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontStyle: 'italic',
                                            fontSize: 9,
                                            alignSelf: item.sender === userEmail ? 'flex-end' : 'flex-start',
                                            padding: 10,
                                            paddingTop: -5,
                                            borderRadius: 10,
                                            maxWidth: '80%',
                                        }}
                                    >
                                        {item.timestamp}
                                    </Text>
                                </View>
                            )}
                        />
                    </ScrollView>
                )}
            </View>


        </View>

    );
};
const InformationData = ({ currentStep, totalSteps, requestToggleRight, setHideLeft, setShowInMobile, hideLeft, activeChatId }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);


    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams(); // Use useParams to access the chatId from the route
    const [messages, setMessages] = useState({});
    const currentChatId = chatId;
    const [chatMessages, setChatMessages] = useState([]);
    const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const loadLatestMessages = async () => {
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
            );

            const newMessages = querySnapshot.docs.map(doc => doc.data()).reverse();

            if (newMessages.length > 0) {
                setOldestMessageTimestamp(newMessages[0].timestamp);
                setChatMessages(newMessages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
    const [paymentNotification, setPaymentNotification] = useState([]);

    console.log('PAYMENT', paymentNotification)
    useEffect(() => {
        const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');
        const paymentRef = doc(projectExtensionFirestore, 'chats', currentChatId);
        const q = query(chatRef, orderBy('timestamp', 'desc'), limit(10));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let messages = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp ? data.timestamp.toString() : null;
                messages.push({ id: doc.id, ...data, timestamp });
            });

            if (messages.length > 0) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            }

            setChatMessages(messages);
        });

        const unsubscribePayment = onSnapshot(paymentRef, (snapshot) => {
            if (snapshot.exists()) {
                // Assuming paymentNotification is a field in the document
                const paymentNotificationsData = snapshot.data().paymentNotification || [];
                setPaymentNotification(paymentNotificationsData);
            }
        });

        return () => {
            unsubscribe();
            unsubscribePayment();
        };
    }, [currentChatId]);

    const loadMoreMessages = () => {
        if (lastVisible) {
            const chatRef = collection(projectExtensionFirestore, 'chats', currentChatId, 'messages');
            const q = query(chatRef, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10));

            onSnapshot(q, (querySnapshot) => {
                let messages = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const timestamp = data.timestamp ? data.timestamp.toString() : null;
                    messages.push({ id: doc.id, ...data, timestamp });
                });

                if (messages.length > 0) {
                    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                }

                setChatMessages((prevMessages) => [...prevMessages, ...messages]);
            });
        }
    };
    console.log('chat messages', chatMessages)
    // Replace 'firestore' with your Firestore instance
    const firestore = getFirestore(); // Make sure to import getFirestore from Firebase

    // useEffect(() => {
    //     // Set up a real-time listener for messages in the specific chat conversation using chatId
    //     const unsubscribe = onSnapshot(
    //         collection(projectExtensionFirestore, 'chats', chatId, 'messages'),
    //         {
    //             query: orderBy('Time', 'asc'), // Order messages by timestamp
    //         },
    //         (snapshot) => {
    //             const messages = [];
    //             snapshot.forEach((doc) => {
    //                 messages.push(doc.data());
    //             });
    //             setChatMessages(messages);
    //         }
    //     );

    //     return () => {
    //         // Unsubscribe from the real-time listener when the component unmounts
    //         unsubscribe();
    //     };
    // }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId
    const [carId, setCarId] = useState('');
    const [proformaIssue, setProformaIssue] = useState(null);
    const [chatField, setChatField] = useState([]);
    console.log('CAR ID FOR THIS SHITZZ: ', carId);


    useEffect(() => {
        // Define the reference to the chat document with the specific chatId
        const chatRef = doc(projectExtensionFirestore, 'chats', chatId);

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
                // Extract the carId, carName, and carRefNumber from the document data
                const vehicleData = chatDocSnapshot.data()?.carData;
                const chatData = chatDocSnapshot.data();
                if (chatData) {
                    setChatField(chatData);
                }
                if (vehicleData) {
                    setCarId(vehicleData.stockID);
                }
                const proformaInvoice = chatDocSnapshot.data()?.proformaInvoice;
                if (proformaInvoice) {
                    setProformaIssue(proformaInvoice.proformaIssue);
                }
            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
        };
    }, [chatId]); //STILL USING OLD DATABASE

    //fetch the carId

    //fetch customer email
    //Reserved button
    const [reservationStatus, setReservationStatus] = useState(false);
    useEffect(() => {
        const fetchVehicleDoc = async () => {
            try {
                // Only fetch the vehicle document if carId is available
                if (carId) {
                    const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);
                    const docSnapshot = await getDoc(vehicleDocRef);

                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        const reserveValue = data.Reserve || false;
                        setReservationStatus(reserveValue);
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle document:', error);
            }
        };

        fetchVehicleDoc();
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    const handleReserve = async () => {
        const carChatId = carId;
        try {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carChatId);
            await updateDoc(vehicleDocRef, {
                Reserve: true // Send a boolean value
            });

            setReservationStatus(true);
        } catch (error) {
            console.error('Error reserving vehicle:', error);
        }
    };
    //Reserved button




    //fetch the cardata
    const [carData, setCarData] = useState('');
    useEffect(() => {
        if (carId) {
            // Create a reference to the document
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            // Listen for real-time updates to the document
            const unsubscribe = onSnapshot(vehicleDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const carDataFromFirestore = docSnapshot.data();
                    setCarData(carDataFromFirestore);
                } else {
                    console.log('Document does not exist.');
                }
            }, (error) => {
                console.error('Error listening to document:', error);
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => unsubscribe();
        }
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING

    //fetch the carData

    const handleMessageChange = (text) => {
        setMessages(prevMessages => ({
            ...prevMessages,
            [currentChatId]: text
        }));
    };
    const handleSend = async () => {

        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
            };

            // Set the message data in the new message document
            await setDoc(newMessageDocExtension, messageData);
            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: messageValue,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setMessages('');

            // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    //USES NEW DATABASE BUT STILL NEED CHECKING
    const messageValue = messages[currentChatId] || '';
    const navigate = useNavigate();
    const handlePress = () => {
        if (proformaIssue) {
            const url = `/ProfileFormChatGroup/${chatId}/print`;
            window.open(url, '_blank');
        }
    };

    //FETCHING IMAGES
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true); // Reset loading state when stockID changes

        const folderRef = ref(projectExtensionStorage, carData.stockID);

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
            } finally {
                // Use setTimeout to delay setting loading to false for 1 second (1000 milliseconds)
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        };

        // Fetch image URL for the vehicleData's referenceNumber
        fetchImageURL(folderRef);
        handleImageLoad();
    }, [carData.stockID]);

    const handleImageLoad = () => {
        setLoading(false);
    };

    //DOWNLOAD SHIPPING INSTRUCTIONS

    const handleDownloadShippingIns = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };

    const handleDownloadBL = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };
    const [isHovered, setIsHovered] = useState(false);

    //DOWNLOAD SHIPPING INSTRUCTIONS

    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };

    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const updateCustomerFiles = async () => {
        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

            const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
            const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';

            let fileType = '';

            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                fileType = 'image';
            } else if (fileExtension === 'pdf') {
                fileType = 'pdf';
            } else if (fileExtension === 'xlsx') {
                fileType = 'xlsx';
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                fileType = 'doc';
            } else {
                fileType = 'link';
            }

            // Log the fileBlob size to help diagnose issues
            console.log('File size:', fileBlob.size);

            await uploadBytes(storageRef, fileBlob);
            const downloadURL = await getDownloadURL(storageRef);

            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: messageValue,
                timestamp: formattedTime,
                file: {
                    url: downloadURL,
                    type: fileType,
                    name: selectedFile.name
                },
            };

            await setDoc(newMessageDocExtension, messageData);

            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: downloadURL,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
            setSelectedFile(null);
            console.log('File uploaded successfully!');
        } catch (error) {
            console.error('Error updating remitter:', error);
        }
    };

    const handleDownloadPDF = (chatId, pdfLink) => {
        // Assuming you want to open PDF links in a browser
        if (pdfLink.endsWith('.pdf')) {
            Linking.openURL(pdfLink);
        } else {
        }
    };

    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };
    // const [showView, setShowView] = useState(false);
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setShowView(true);
    //     }, 1500);

    //     return () => clearTimeout(timer); // Clear the timeout if the component is unmounted before the delay is over
    // }, []);

    // if (!showView) {
    //     return null; // Or return a loading component if you want
    // }
    return (
        <View style={{ position: 'sticky', padding: 10, boxShadow: '0 1px 1px rgba(2, 2, 2, 0.3)' }}>
            <ScrollView contentContainerStyle={{ flex: screenWidth <= 1145 ? 0 : 1, width: screenWidth <= 1145 ? 764 : null }} horizontal={screenWidth <= 1145 ? true : false} >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {screenWidth <= 992 && (
                                <View style={{ marginRight: 5 }}>
                                    <TouchableOpacity onPress={() => {
                                        if (hideLeft === false) {
                                            setHideLeft(true);
                                            setShowInMobile(false)
                                        }
                                    }}>
                                        <Text>GO BACK</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View>
                                <Image source={{ uri: imageUrl }} style={{ width: 90, height: 50, flex: 1, aspectRatio: 1, resizeMode: 'stretch', borderRadius: '100%' }} />
                            </View>

                            <View style={{ flex: 3, marginLeft: 5 }}>
                                <Text style={{ fontSize: 16 }}>{carData.carName}</Text>
                                <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#aaa' }}>{carData.referenceNumber}</Text>
                                <Text style={{ fontSize: 14 }}>{carData.modelCode} {carData.chassisNumber}</Text>
                                <Text style={{ fontSize: 14 }}>{carData.mileage} km</Text>
                                {/* <Text style={{ fontSize: 14 }}>{carData.transmission}</Text> */}
                            </View>

                            <View style={{ marginLeft: 10 }}>

                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={{ width: 100, fontWeight: 'bold' }}>FOB:</Text>
                                    <Text>US$<Text style={{ fontSize: 20, color: '#aaa', fontWeight: '700' }}>99,999</Text><Text style={{ fontSize: 11, color: '#aaa' }}>(￥999,999,999)</Text></Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ width: 100, fontWeight: 'bold' }}>TOTAL PRICE:</Text>
                                    <Text style={{ color: '#4CAF50', }}>US$<Text style={{ fontSize: 20, fontWeight: 'bold' }}>99,999</Text><Text style={{ fontSize: 11, color: '#aaa' }}>(￥999,999,999)</Text></Text>
                                </View>


                            </View>

                        </View>
                    </View>

                    <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: screenWidth <= 764 ? 10 : null }}>


                        <TouchableOpacity
                            style={{
                                height: 50,
                                backgroundColor: '#FAA000',
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 10,

                            }}
                            onPress={() => requestToggleRight()}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>SEE FULL DETAILS</Text>
                        </TouchableOpacity>



                    </View>
                </View>

            </ScrollView>

        </View>

    )
};
const InformationDataLeft = ({ setHideLeft, setShowInMobile, setRightVisible, setSidebarOpen, activeChatId, setActiveChatId }) => {
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);
    const { userEmail } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // New state for tracking loading status

    useEffect(() => {// Start loading
        const q = query(
            collection(projectExtensionFirestore, 'chats'),
            where(`participants.customer`, '==', userEmail)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatData = [];
            querySnapshot.forEach((doc) => {
                const chat = doc.data();
                const carData = chat.carData || {}; // Extract carData

                chatData.push({
                    id: doc.id,
                    ...chat,
                    carData // Include carData in each chat object
                });
            });

            setChats(chatData);
            // Data is loaded, stop loading
        });

        return () => {
            unsubscribe();

        };
    }, [userEmail]);

    const { toggleUnread, setToggleUnread } = useState(false);
    const requestToggleUnread = () => {
        setToggleUnread(!toggleUnread)
    }
    const filterUnread = () => {

    }
    const { toggleRead, setToggleRead } = useState(false);
    const requestToggleRead = () => {
        setToggleRead(!toggleRead)
    }
    const filterRead = () => {

    }

    //GET IMAGE
    const [carImages, setCarImages] = useState({});
    console.log('IMAGES CAR IMAGES LEFT', carImages)
    useEffect(() => {
        const loadImage = async (stockID) => {
            if (stockID && !carImages[stockID]) {
                try {
                    const folderRef = ref(projectExtensionStorage, stockID);
                    const result = await listAll(folderRef);

                    if (result.items.length > 0) {
                        const imageUrl = await getDownloadURL(result.items[0]);
                        setCarImages(prevImages => ({ ...prevImages, [stockID]: imageUrl }));
                    }
                } catch (error) {
                    console.error('Error fetching image for stockID', stockID, ':', error);
                }
            }
        };

        // You could optimize here to only load images for items that are in the viewport or soon to be in the viewport.
        chats.forEach(chat => {
            loadImage(chat.carData?.stockID);
        });
    }, [chats]);
    //GET IMAGE

    //sorting
    const getSortableDate = (dateString) => {
        return dateString.replace(/(\d{4})\/(\d{2})\/(\d{2}) at (\d{2}:\d{2}:\d{2})/, '$1-$2-$3T$4');
    };

    // Sort the chats by lastMessageDate in descending order (latest first)
    const sortedChats = [...chats].sort((a, b) => {
        const dateA = getSortableDate(a.lastMessageDate);
        const dateB = getSortableDate(b.lastMessageDate);
        return new Date(dateB) - new Date(dateA);
    });
    //sorting
    const navigate = useNavigate();

    const { chatId } = useParams();



    const makeTrueRead = async (readTrue) => {
        const fieldUpdate = doc(projectExtensionFirestore, 'chats', chatId);
        try {
            await updateDoc(fieldUpdate, {
                customerRead: readTrue
            })
        } catch (error) {
            console.error('Error updating false:', error);
        }
    }
    useEffect(() => {
        if (chatId) {
            makeTrueRead(true);
        }
    }, [chatId]);



    const renderItem = useCallback(({ item }) => {

        const imageUrl = carImages[item.carData?.stockID];
        const isChatActive = item.id === activeChatId || item.id === chatId;

        return imageUrl ? (
            <Pressable
                style={({ pressed, hovered }) => [
                    {
                        opacity: pressed ? 0.5 : 1,
                        backgroundColor: isChatActive ? '#f2f2f2' : (hovered ? '#f2f2f2' : 'white'),
                        borderLeftColor: isChatActive ? '#0A9FDC' : 'transparent',
                        borderRightColor: isChatActive ? '#0A9FDC' : 'transparent',
                        borderLeftWidth: 2,
                        borderRightWidth: 2,
                    },
                ]}
                onPress={() => {
                    setSidebarOpen(false);
                    setActiveChatId(item.id);
                    setRightVisible(true);// Set this item as active when pressed
                    if (screenWidth < 768) {
                        setHideLeft(false);
                        setShowInMobile(true);
                    } else {
                        setShowInMobile(true);
                    }
                    navigate(`/ProfileFormChatGroup/${item.id}`);
                }}
            >
                <View style={styles.container}>
                    <Image source={{ uri: imageUrl }} style={styles.avatar} />
                    <View style={{ flex: 1, justifyContent: 'center', marginRight: 10 }}>

                        <Text
                            style={item.customerRead ? styles.participant : { color: '#000', fontWeight: 'bold' }}
                            numberOfLines={1}
                        >
                            {item.carData?.carName}
                        </Text>
                        <Text
                            style={item.customerRead ? styles.lastMessage : { color: '#0A78BE', fontWeight: 'bold' }}
                            numberOfLines={1}
                        >
                            {item.lastMessage}
                        </Text>

                    </View>
                    <Text style={item.customerRead ? styles.timestamp : { color: '#000', fontWeight: '600' }}>
                        {item.lastMessageDate.includes(" at ")
                            ? item.lastMessageDate.split(" at ")[0]
                            : item.lastMessageDate}
                    </Text>
                    {item.customerRead ? (null) : (<View style={{
                        width: 10,        // Width of the circle
                        height: 10,       // Height of the circle
                        borderRadius: 25, // Half of width/height to make it a circle
                        backgroundColor: '#0D97EE',
                        margin: 'auto',
                        marginLeft: 5
                    }} />
                    )}

                </View>
            </Pressable>
        ) : (
            <LoadingComponent />
        );
    }, [carImages, activeChatId, screenWidth, navigate]);

    const styles = StyleSheet.create({

        avatar: {
            width: 60,
            maxHeight: 60,
            maxWidth: 60,
            height: 60,
            borderRadius: '100%',
            marginRight: 10,
            aspectRatio: 1,
            resizeMode: 'stretch'
        },
        container: {
            flexDirection: 'row',
            padding: 10,
            width: '100%', // Set the container width to 250
            alignItems: 'center',
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
            marginRight: 10, // Added to prevent text overlapping with timestamp
        },
        participant: {
            fontWeight: '400',
            color: 'gray',
        },
        lastMessage: {
            fontWeight: '400',
            color: 'gray',
        },
        timestamp: {
            color: 'gray',
            fontSize: 12,
        },
    });

    return (
        <View style={{ height: '95vh' }}>
            <View style={{ borderBottomWidth: .5, borderBottomColor: '#ccc', marginTop: 9, position: 'sticky ' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {screenWidth <= 768 && (
                        <View style={{ margin: 'auto' }}>
                            <TouchableOpacity onPress={() => { setSidebarOpen(prev => !prev) }}>
                                <Ionicons name="menu" size={32} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <TextInput
                        placeholderTextColor={'#ccc'}
                        placeholder="Search"
                        // value={searchQuery}
                        // onChangeText={handleSearch}
                        style={{
                            padding: 10,
                            margin: 10,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 5,
                            flex: 2
                        }}
                    />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                    <Pressable
                        style={({ pressed, hovered }) => [
                            {
                                backgroundColor: hovered ? '#D1D3D4' : '#ECEDF0', // Darker shade when hovered
                                borderRadius: 5,
                                opacity: pressed ? 0.5 : 1,
                                marginLeft: 5,
                                flex: 1
                            },
                        ]}
                    >
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            height: 30,
                            maxHeight: 30,
                        }}>
                            <MaterialIcons name="mark-email-unread" size={16} />
                            <Text style={{ marginLeft: 5 }}>Unread</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        style={({ pressed, hovered }) => [
                            {
                                backgroundColor: hovered ? '#D1D3D4' : '#ECEDF0', // Darker shade when hovered
                                borderRadius: 5,
                                opacity: pressed ? 0.5 : 1,
                                marginLeft: 5,
                                flex: 1
                            },
                        ]}
                    >
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            height: 30,
                            maxHeight: 30,
                        }}>
                            <MaterialIcons name="mark-email-read" size={16} />
                            <Text style={{ marginLeft: 5 }}>Read</Text>
                        </View>
                    </Pressable>

                    <View style={{ flex: 1 }} />
                </View>
            </View>
            <FlatList
                data={sortedChats}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={21}

            />
        </View>
    )
}
const InformationDataRight = ({ openModalRequest, modalVisible, handleButtonClick }) => {
    const totalSteps = 8;
    const [getStep, setGetStep] = useState(0);
    const [currentStep, setCurrentStep] = useState({ value: 1 });
    const { chatId } = useParams()
    useEffect(() => {
        setCurrentStep({ value: getStep });
        console.log('value per ChatID: ', getStep);
    }, [getStep]);

    useEffect(() => {
        const targetChatId = chatId; // Use selectedChatId if available, otherwise use chatId

        if (targetChatId) {
            const chatDocRef = doc(projectExtensionFirestore, 'chats', targetChatId);
            const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        if (data.stepIndicator) {
                            const value = data.stepIndicator.value;
                            const parsedValue = parseInt(value, 10);

                            if (!isNaN(parsedValue)) {
                                setGetStep(parsedValue);
                                setCurrentStep({ value: parsedValue });
                            } else {
                                console.error('Value is not a valid number:', value);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });

            // Clean up the listener when the component unmounts
            return () => unsubscribe();
        }
    }, [chatId]);

    const [chatField, setChatField] = useState([]);
    const handleOpenLink = (link) => {
        Linking.openURL(link);
    };
    const handleDownloadShippingIns = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };

    const handleDownloadBL = async (chatId, Hnumber) => {
        // Adjust this based on your actual data structure
        const storageRef = ref(projectExtensionStorage, `BookingList/${chatId}`);

        try {
            // List the items (files) in the chatId folder

            const downloadURL = await getDownloadURL(ref(storageRef, `${Hnumber}.pdf`));
            Linking.openURL(downloadURL).catch((err) => console.error('Error opening URL:', err));

        } catch (error) {
            console.error('Error fetching download URL:', error);
        }
    };
    const [carId, setCarId] = useState('');
    const [bookingField, setBookingField] = useState([]);
    useEffect(() => {
        // Define the reference to the chat document with the specific chatId
        const chatRef = doc(projectExtensionFirestore, 'chats', chatId);
        const bookingRef = doc(projectExtensionFirestore, 'BookingList', chatId);
        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
                // Extract the carId, carName, and carRefNumber from the document data
                const vehicleData = chatDocSnapshot.data()?.carData;
                const chatData = chatDocSnapshot.data();
                if (chatData) {
                    setChatField(chatData);
                }
                if (vehicleData) {
                    // setCarId(vehicleData.stockID);
                }
                const proformaInvoice = chatDocSnapshot.data()?.proformaInvoice;
                if (proformaInvoice) {
                    // setProformaIssue(proformaInvoice.proformaIssue);
                }
            }

        }, (error) => {
            console.error('Error listening to chat document:', error);
        });
        const unsubscribeBooking = onSnapshot(bookingRef, (bookingDocSnapshot) => {
            if (bookingDocSnapshot.exists()) {
                const bookingData = bookingDocSnapshot.data();
                if (bookingData) {
                    setBookingField(bookingData);
                }
            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
            unsubscribeBooking();
        };
    }, [chatId]);

    //fetch the cardata
    const [carData, setCarData] = useState('');
    useEffect(() => {
        if (carId) {
            // Create a reference to the document
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            // Listen for real-time updates to the document
            const unsubscribe = onSnapshot(vehicleDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const carDataFromFirestore = docSnapshot.data();
                    setCarData(carDataFromFirestore);
                } else {
                    console.log('Document does not exist.');
                }
            }, (error) => {
                console.error('Error listening to document:', error);
            });

            // Return a cleanup function to unsubscribe when the component unmounts
            return () => unsubscribe();
        }
    }, [carId]); //USES NEW DATABASE BUT STILL NEED CHECKING
    // const [showView, setShowView] = useState(false);
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setShowView(true);
    //     }, 1500);

    //     return () => clearTimeout(timer); // Clear the timeout if the component is unmounted before the delay is over
    // }, []);

    // if (!showView) {
    //     return null; // Or return a loading component if you want
    // }
    const formatTransactionDate = (dateString) => {
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

        const parts = dateString.split(' at '); // Splitting the date and time
        const dateParts = parts[0].split('/'); // Splitting the date into year, month, day
        const timeParts = parts[1].split(':'); // Splitting the time into hour, minute, second

        const year = dateParts[0];
        const month = months[parseInt(dateParts[1], 10) - 1]; // Months are 0-indexed
        const day = dateParts[2];

        let hour = parseInt(timeParts[0], 10);
        const minute = timeParts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour || 12; // Convert 0 to 12 for 12-hour format

        return `${year} ${month.toUpperCase()} ${day} at ${hour}:${minute} ${ampm}`;
    };

    return (
        <View style={{ width: '100%' }}>
            <style>
                {`
                    .scrollable-div::-webkit-scrollbar {
                        height: 10px;
                    }
                    .scrollable-div::-webkit-scrollbar-track {
                        background: #f1f1f1;
                    }
                    .scrollable-div::-webkit-scrollbar-thumb {
                        background: #888;
                    }
                    .scrollable-div::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }
                    /* For Firefox */
                    .scrollable-div {
                        scrollbar-width: thin;
                        scrollbar-color: #888 #f1f1f1;
                    }
                `}
            </style>
            <View>
                <div
                    className="scrollable-div"
                    style={{
                        width: '100%',
                        overflowX: 'auto',
                        overflowY: 'hidden', // This line disables vertical scrolling
                        whiteSpace: 'nowrap',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
                </div>
                {currentStep.value === 1 && (
                    <View style={{ marginTop: 9, justifyContent: 'flex-start', borderTopWidth: .5, borderBottomWidth: .5, borderTopColor: '#ccc', borderBottomColor: '#ccc' }}>
                        <View style={{ padding: 16 }}>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Negotiation: </Text>
                            <Text style={{ color: '#aaa' }}>Negotiate with the seller to receive better prices.</Text>

                        </View>
                    </View>
                )}
                {currentStep.value === 2 && (
                    <View style={{ marginTop: 9, justifyContent: 'flex-start', borderTopWidth: .5, borderBottomWidth: .5, borderTopColor: '#ccc', borderBottomColor: '#ccc' }}>
                        <View style={{ padding: 16 }}>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Proforma Invoice: </Text>
                            <Text style={{ color: '#aaa' }}>Please click order button</Text>
                            <TouchableOpacity
                                style={{
                                    height: 50,
                                    backgroundColor: '#FAA000',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 10
                                }}
                                onPress={() => { openModalRequest(); handleButtonClick() }}
                            >

                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                                    ORDER ITEM BUTTON HERE
                                </Text>

                            </TouchableOpacity>
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={openModalRequest}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: 'white', width: 992, height: '90%', padding: 10, borderRadius: 10 }}>
                                        <ScrollView>
                                            <OrderItem openModalRequest={openModalRequest} handleButtonClick={handleButtonClick} />
                                        </ScrollView>
                                    </View>
                                </View>
                            </Modal>
                        </View>
                    </View>
                )}
                {currentStep.value === 3 && (
                    <View style={{ marginTop: 9, justifyContent: 'flex-start', borderTopWidth: .5, borderBottomWidth: .5, borderTopColor: '#ccc', borderBottomColor: '#ccc' }}>
                        <View style={{ padding: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Order Item: </Text>
                            <Text style={{ color: '#aaa' }}>Please upload payment confirmation.</Text>
                            <PaymentNotification handleButtonClick={handleButtonClick} />
                        </View>
                    </View>
                )}
                {currentStep.value === 4 && (
                    <View style={{ marginTop: 9, justifyContent: 'flex-start', borderTopWidth: .5, borderBottomWidth: .5, borderTopColor: '#ccc', borderBottomColor: '#ccc' }}>
                        <View style={{ padding: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: 'green' }}>Payment Confirmed</Text>
                        </View>
                    </View>
                )}

                {/* {currentStep.value === 6 && (
                    <View style={{ borderWidth: 1, margin: 10 }}>
                        <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                            <TouchableOpacity
                                style={{
                                    marginTop: 16,
                                    height: 50,
                                    backgroundColor: '#FAA000',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                    Proceed to Documentation
                                </Text>
                            </TouchableOpacity>
                            <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                <Text
                                    style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                            </View>
                        </View>
                    </View>
                )}
                {currentStep.value === 7 && (
                    <View style={{ borderWidth: 1, margin: 10 }}>
                        <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                            <TouchableOpacity
                                style={{
                                    marginTop: 16,
                                    height: 50,
                                    backgroundColor: '#FAA000',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                    Proceed to Item Received
                                </Text>
                            </TouchableOpacity>
                            <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                <Text
                                    style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                            </View>
                        </View>
                    </View>

                )}
                {currentStep.value === 8 && (
                    <View style={{ borderWidth: 1, margin: 10 }}>
                        <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                            <TouchableOpacity
                                style={{
                                    marginTop: 16,
                                    height: 50,
                                    backgroundColor: '#FAA000',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                                    Complete Transaction
                                </Text>
                            </TouchableOpacity>
                            <View style={{ borderTopWidth: 1, padding: 10, marginTop: 16 }}>
                                <Text
                                    style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Transaction Details</Text>
                            </View>
                        </View>
                    </View>

                )}
                {currentStep.value === 9 && (
                    <View style={{ borderWidth: 1, margin: 10 }}>
                        <View style={{ padding: 16, backgroundColor: '#f9f9f9' }}>
                            <View
                                style={{
                                    marginTop: 16,
                                    height: 50,
                                    backgroundColor: '#FAA000',
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: 'white' }}>
                                    Completed Transaction
                                </Text>
                            </View>
                        </View>
                    </View>
                )} */}
                <View style={{ padding: 16, justifyContent: 'flex-start', borderBottomWidth: 0.5, borderTopColor: '#ccc', borderBottomColor: '#ccc' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
                        Transaction Details
                    </Text>

                    <View>

                        <Text style={{ fontSize: 16, color: '#0056b3', textDecorationLine: 'underline', fontWeight: 'bold' }}>
                            {[
                                chatField.inspection && chatField.inspection === true ? 'INSPECTION' : null,
                                chatField.insurance && chatField.insurance === true ? 'CIF' : 'C&F',
                                chatField.warranty && chatField.warranty === true ? 'WARRANTY' : null
                            ].filter(Boolean).join(' + ')}
                        </Text>

                        <Text style={{ fontSize: 16, color: '#0056b3', textDecorationLine: 'underline', fontWeight: 'bold' }}>
                            {chatField.country} / {chatField.port}
                        </Text>
                    </View>

                    <View>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                            {carData.referenceNumber}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                            {chatField.dateOfTransaction ? formatTransactionDate(chatField.dateOfTransaction) : null}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', flex: 1 }}>INVOICE:</Text>
                            <Text style={{ flex: 2 }}>
                                <Text style={{ textDecorationLine: "underline", color: 'red' }}>
                                    <ViewOrderInvoice />
                                </Text>
                            </Text>
                        </View>

                        {bookingField.DocumentsUpload && bookingField.DocumentsUpload.ShippingInstructions ? (
                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', flex: 1 }}>
                                    Shipping Instructions:
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDownloadShippingIns(chatId, bookingField.DocumentsUpload.ShippingInstructions)}
                                    style={{ flex: 2 }}
                                >
                                    <Text style={{ color: 'red', textDecorationLine: 'underline' }}>
                                        SI.pdf
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {bookingField.DocumentsUpload && bookingField.DocumentsUpload.BillOfLading ? (
                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000', flex: 1 }}>
                                    Bill of Lading:
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleDownloadShippingIns(chatId, chatField?.ShippingInstructions)}
                                    style={{ flex: 2 }}
                                >
                                    <Text style={{ color: 'red', textDecorationLine: 'underline' }}>
                                        B/L.pdf
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>

                </View>
                {
                    currentStep.value >= 5 && (
                        <View style={{ justifyContent: 'flex-start', borderBottomWidth: 0.5, borderBottomColor: '#ccc' }}>
                            <View style={{ padding: 16 }}>
                                <View>
                                    {bookingField.ShippingInfo ? (
                                        <View style={{ marginTop: 5 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Shipping Information</Text>

                                            <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 5 }}>Departure</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>ETD(JST):</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['ETD(JST)']} JST</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Port of Discharge:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['PortOfLoading']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Vessel Name:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['VesselName']}[{bookingField.ShippingInfo.Departure['VoyNumber']}]</Text>
                                            </View>

                                            <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 10 }}>Arrival</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>ETA(JST):</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['ETA(JST)']} JST</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Port of Arrival:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['PortOfDischarge']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Vessel Name:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['VesselName']}[{bookingField.ShippingInfo.Arrival['VoyNumber']}]</Text>
                                            </View>



                                        </View>

                                    ) : <></>}
                                </View>
                            </View>
                        </View>
                    )
                }
            </View>
            <ScrollView style={{ width: '100%' }}>
                {chatField.orderInvoice ? (
                    <>
                    </>
                ) : (<>
                    {
                        currentStep.value >= 2 && (
                            <View style={{ justifyContent: 'flex-start', borderBottomWidth: 0.5, borderBottomColor: '#ccc' }}>
                                <View style={{ padding: 16 }}>

                                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Proforma Invoice</Text>
                                    <Text style={{}}>Proforma Invoice: <ViewInvoice /></Text>
                                </View>
                            </View>
                        )
                    }
                </>)}

                {
                    currentStep.value >= 3 && (
                        <View style={{ justifyContent: 'flex-start', borderBottomWidth: 0.5, borderBottomColor: '#ccc' }}>
                            <View style={{ padding: 16 }}>
                                {chatField.orderInvoice && (
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>Order Detail</Text>
                                        <Text style={{ fontSize: 12, color: '#333' }}>Order Date:<Text style={{ fontStyle: 'italic', fontWeight: '700', color: '#4CAF50' }}> {chatField.orderInvoice.dateIssued}</Text> </Text>
                                        <Text style={{ fontSize: 12, color: '#333' }}>Payment Due Date:</Text>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>INVOICE: <Text style={{ textDecorationLine: "underline", color: 'red' }}><ViewOrderInvoice /></Text></Text>
                                    </View>
                                )}
                                <View>
                                    {chatField.paymentNotification ? (
                                        <View style={{ marginTop: 8 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>Payment Details</Text>
                                            <View style={{ justifyContent: 'space-between', marginTop: 5 }}>
                                                <Text style={{ fontSize: 14, color: '#333' }}>WIRE DATE: <Text style={{ fontWeight: 'bold' }}>{chatField.paymentNotification.uploadPaymentDate}</Text></Text>
                                                <Text style={{ fontSize: 14, color: '#333' }}>Name of Remitter: <Text style={{ fontWeight: 'bold' }}>{chatField.paymentNotification.nameOfRemitter}</Text></Text>
                                                <TouchableOpacity onPress={() => handleOpenLink(chatField.paymentNotification.url)}>
                                                    <Text style={{ color: 'blue', textDecorationLine: 'underline', fontSize: 14 }}>{chatField.paymentNotification.fileName}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : <></>}
                                </View>
                            </View>
                        </View>

                    )
                }
                {
                    currentStep.value >= 4 && (
                        <View style={{ justifyContent: 'flex-start', borderBottomWidth: 0.5, borderBottomColor: '#ccc' }}>
                            <View style={{ padding: 16 }}>
                                <View>
                                    {chatField.deliveryAddressInformation ? (
                                        <View style={{ marginTop: 5 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Delivery Information</Text>

                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Full Name:</Text>
                                                <Text style={{ flex: 2 }}>{chatField.deliveryAddressInformation.customerInfo.fullName}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Address:</Text>
                                                <Text style={{ flex: 2 }}>{chatField.deliveryAddressInformation.customerInfo.address}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>City:</Text>
                                                <Text style={{ flex: 2 }}>{chatField.deliveryAddressInformation.customerInfo.city}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Tel Number:</Text>
                                                <Text style={{ flex: 2 }}>{chatField.deliveryAddressInformation.customerInfo.telNumber}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Email:</Text>
                                                <Text style={{ flex: 2 }}>{chatField.deliveryAddressInformation.customerInfo.email}</Text>
                                            </View>
                                        </View>

                                    ) : <></>}
                                </View>
                            </View>
                        </View>
                    )
                }
                {/* {
                    currentStep.value >= 5 && (
                        <View style={{ justifyContent: 'flex-start', borderBottomWidth: 0.5, borderBottomColor: '#ccc' }}>
                            <View style={{ padding: 16 }}>
                                <View>
                                    {bookingField.ShippingInfo ? (
                                        <View style={{ marginTop: 5 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Shipping Information</Text>

                                            <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 5 }}>Departure</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>ETD(JST):</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['ETD(JST)']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Port of Discharge:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['PortOfLoading']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Vessel Name:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Departure['VesselName']}[{bookingField.ShippingInfo.Departure['VoyNumber']}]</Text>
                                            </View>

                                            <Text style={{ fontWeight: 'bold', fontSize: 14, marginTop: 10 }}>Arrival</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>ETA(JST):</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['ETA(JST)']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Port of Discharge:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['PortOfDischarge']}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 5, alignItems: 'center' }}>
                                                <Text style={{ fontWeight: 'bold', flex: 1 }}>Vessel Name:</Text>
                                                <Text style={{ flex: 2 }}> {bookingField.ShippingInfo.Arrival['VesselName']}[{bookingField.ShippingInfo.Arrival['VoyNumber']}]</Text>
                                            </View>



                                        </View>

                                    ) : <></>}
                                </View>
                            </View>
                        </View>
                    )
                } */}


            </ScrollView>
        </View>
    )
};

const InvoiceAmendment = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    };
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();
    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('Country');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('Country');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('City');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('City');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(false);
    const [isCheckedNotify, setCheckedNotify] = useState(false);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('Country');
    const [cityDB, setCityDB] = useState('City');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().carData.stockID;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });

    const [inputEmail, setInputEmail] = useState('');
    const [inputEmailNotify, setInputEmailNotify] = useState('');
    const setOrderInvoice = async () => {

        const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
        const { datetime } = response.data;

        const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
        const customerInfo = {
            fullName: isChecked ? fullNameDB : fullName,
            country: isChecked ? countryDB : selectedCountryLabel,
            city: isChecked ? cityDB : selectedCity,
            address: isChecked ? addressDB : address,
            telNumber: isChecked ? telNumberDB : telNumber,
            email: inputEmail,
        };

        const infoCustomerInput = {
            fullName: isCheckedNotify ? (isChecked ? fullNameDB : fullName) : fullNameNotifyInput,
            country: isCheckedNotify ? (isChecked ? countryDB : selectedCountryLabel) : selectedCountryNotifyLabel,
            city: isCheckedNotify ? (isChecked ? cityDB : selectedCity) : selectedCityNotify,
            address: isCheckedNotify ? (isChecked ? addressDB : address) : addressNotify,
            telNumber: isCheckedNotify ? (isChecked ? telNumberDB : telNumber) : telNumberNotify,
            email: inputEmailNotify,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);

            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: `REQUEST AMENDMENT INFORMATION      

Customer Information
            Full Name: ${isChecked ? fullNameDB : fullName}
            Country: ${isChecked ? countryDB : selectedCountryLabel}
            City: ${isChecked ? cityDB : selectedCity}
            Address: ${isChecked ? addressDB : address}
            Tel. Number: ${isChecked ? telNumberDB : telNumber}
            Email: ${inputEmail}
            
Notify Party
            Full Name: ${isCheckedNotify ? (isChecked ? fullNameDB : fullName) : fullNameNotifyInput}
            Country: ${isCheckedNotify ? (isChecked ? countryDB : selectedCountryLabel) : selectedCountryNotifyLabel}
            City: ${isCheckedNotify ? (isChecked ? cityDB : selectedCity) : selectedCityNotify}
            Address: ${isCheckedNotify ? (isChecked ? addressDB : address) : addressNotify}
            Tel. Number: ${isCheckedNotify ? (isChecked ? telNumberDB : telNumber) : telNumberNotify}
            Email: ${inputEmailNotify}
            `,
                timestamp: formattedTime,
                requestAmendInvoice: true,
                infoCustomerInput,
                customerInfo
            };
            await updateDoc(orderRef, {
                orderInvoice: {
                    orderInvoiceIssue: true,
                    customerInfo,
                    notifyParty: isCheckedNotify ? customerInfo : infoCustomerInput,
                    dateIssued: formattedTime, // Add formatted date
                },
            });
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };

    //STEP TRACKER
    const [currentStep, setCurrentStep] = useState(1);
    const addStep = () => {
        setCurrentStep(currentStep + 1);
    };
    return (
        <View>
            <TouchableOpacity onPress={() => openModalRequest()}>
                <MaterialCommunityIcons name={'file-document-edit'} size={25} style={{ margin: 5, color: '#7b9cff' }} />
            </TouchableOpacity>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={openModalRequest}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', width: 992, height: '90%', padding: 10, borderRadius: 10 }}>
                        <ScrollView>
                            <View style={{ marginTop: 5 }}>


                                <View>
                                    {currentStep === 1 && (

                                        <View style={{ flexDirection: 'column', zIndex: -2 }}>
                                            <View style={{}}>
                                                <Text style={{ fontWeight: '700', color: 'red' }}>*Make Necessary Changes</Text>
                                            </View>
                                            <View style={{ flex: 1, marginTop: 5 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                                        Customer Information
                                                    </Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setChecked(prev => {
                                                            if (prev && isChecked) {
                                                                setFullNameDB(fullNameDB);
                                                                setCityDB(cityDB);
                                                                setCountryDB(countryDB);
                                                                setAddressDB(addressDB);
                                                                setTelNumberDB(telNumberDB);
                                                            } else {
                                                                setFullName(' ');
                                                                setSelectedCountryLabel('Country')
                                                                setSelectedCity('City')
                                                                setAddress(' ')
                                                                setTelNumber(' ')
                                                            }
                                                            return !prev;
                                                        });
                                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                        <MaterialIcons
                                                            name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Full Name</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 8, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                                    value={fullNameDB}
                                                                    onChangeText={(text) => setFullNameDB(text)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                                    value={fullName}
                                                                    onChangeText={(text) => setFullName(text)}
                                                                />
                                                            )}

                                                        </View>
                                                    </View>

                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                        <View style={{ flex: 1, zIndex: 2 }}>
                                                            <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    <View style={{ alignSelf: 'center' }}>
                                                                        {isChecked ? (
                                                                            <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                                        ) : (
                                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                                        )}
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                            <AntDesign name="close" size={15} />
                                                                        </TouchableOpacity>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCountries && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            {showCountries && (
                                                                <View style={{
                                                                    marginTop: 5,
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    elevation: 5,
                                                                    width: '100%',
                                                                    maxHeight: 200,
                                                                    backgroundColor: "white",
                                                                    borderWidth: 1,
                                                                    borderColor: '#ccc',
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 4 },
                                                                    shadowOpacity: 0.25,
                                                                    shadowRadius: 4,
                                                                    zIndex: 3
                                                                }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Country'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filter}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCountries}
                                                                            keyExtractor={(item) => item.value} // Use item.label as the key
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCountryLabel(item.label);
                                                                                    setSelectedCountry(item.value);
                                                                                    setShowCountries(false);
                                                                                    setFilteredCountries(countries);
                                                                                    setSelectedCity('City')
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />

                                                                    </ScrollView>
                                                                </View>
                                                            )}

                                                        </View>
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                        <View style={{ flex: 1, zIndex: 2, }}>
                                                            <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    {isChecked ? (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                                    ) : (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                                    )}
                                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCities && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>

                                                            </TouchableOpacity>
                                                            {showCities && (
                                                                <View
                                                                    style={{
                                                                        marginTop: 5,
                                                                        position: 'absolute',
                                                                        top: '100%',
                                                                        left: 0,
                                                                        elevation: 5,
                                                                        width: '100%',
                                                                        maxHeight: 200,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        borderColor: '#ccc',
                                                                        elevation: 5,
                                                                        zIndex: 2
                                                                    }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Cities'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterCities}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCities}
                                                                            keyExtractor={(item, index) => index.toString()}
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCity(item.label)
                                                                                    setShowCities(false);
                                                                                    setFilteredCities(cities);
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Address</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={addressDB}
                                                                    onChangeText={(text) => setAddressDB(text)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={address}
                                                                    onChangeText={(text) => setAddress(text)}
                                                                />
                                                            )}

                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Tel. Number</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isChecked ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumberDB}
                                                                    onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumber}
                                                                    onChangeText={(text) => setTelNumber(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Email</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            <TextInput
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                value={inputEmail}
                                                                onChangeText={(text) => setInputEmail(text)}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>

                                            </View>

                                            <View style={{ flex: 1, marginLeft: 5, marginTop: 5, zIndex: -2 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                                        Notify Party
                                                    </Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setCheckedNotify(prev => {
                                                            if (prev && isCheckedNotify) {
                                                                setFullNameDB(fullNameDB);
                                                                setFullName(fullName);
                                                                setCityDB(cityDB);
                                                                setCountryDB(countryDB);
                                                                setAddressDB(addressDB);
                                                                setTelNumberDB(telNumberDB);
                                                                setSelectedCountryLabel(selectedCountryLabel)
                                                                setSelectedCity(selectedCity)
                                                                setAddress(address)
                                                                setTelNumber(telNumber)
                                                            } else {
                                                                setFullNameNotifyInput(' ');
                                                                setSelectedCountryNotifyLabel('Country');
                                                                setSelectedCountryNotify('');
                                                                setSelectedCityNotify('City');
                                                                setAddressNotify('');
                                                                setTelNumberNotify('');
                                                            }
                                                            return !prev;
                                                        });
                                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                        <MaterialIcons
                                                            name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                            size={20}
                                                            color="black"
                                                        />
                                                        <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Full Name</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? fullNameDB : fullName}
                                                                    onChangeText={(text) => {
                                                                        setFullNameDB(text);
                                                                        setFullName(text);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={fullNameNotifyInput}
                                                                    onChangeText={(text) => setFullNameNotifyInput(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                        <View style={{ flex: 1, zIndex: 2 }}>
                                                            <TouchableOpacity onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                                    <View style={{ alignSelf: 'center' }}>
                                                                        {isCheckedNotify ? (
                                                                            <Text style={{ textAlignVertical: 'center' }}>
                                                                                {isChecked ? countryDB : selectedCountryLabel}
                                                                            </Text>
                                                                        ) : (
                                                                            <Text style={{ textAlignVertical: 'center' }}>
                                                                                {selectedCountryNotifyLabel}
                                                                            </Text>
                                                                        )}
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                            <AntDesign name="close" size={15} />
                                                                        </TouchableOpacity>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCountriesNotify && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                            {showCountriesNotify && (
                                                                <View style={{
                                                                    marginTop: 5,
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    elevation: 5,
                                                                    width: '100%',
                                                                    maxHeight: 200,
                                                                    backgroundColor: "white",
                                                                    borderWidth: 1,
                                                                    borderColor: '#ccc',
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 4 },
                                                                    shadowOpacity: 0.25,
                                                                    shadowRadius: 4,
                                                                    elevation: 5,
                                                                    zIndex: 3
                                                                }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Country'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterNotify}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>

                                                                        <FlatList
                                                                            data={filteredCountriesNotify}
                                                                            keyExtractor={(item) => item.label} // Use item.label as the key
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {
                                                                                    setSelectedCountryNotifyLabel(item.label)
                                                                                    setSelectedCountryNotify(item.value)
                                                                                    setShowCountriesNotify(false);
                                                                                    setFilteredCountriesNotify(countries);
                                                                                    setSelectedCityNotify('City')
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}

                                                        </View>
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                        <View style={{ flex: 1, zIndex: 2, }}>
                                                            <TouchableOpacity onPress={selectedCountryNotify ? toggleCitiesNotify : null} disabled={!selectedCountryNotify || selectedCountryNotifyLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                                    {isCheckedNotify ? (
                                                                        <Text style={{ textAlignVertical: 'center' }}>{
                                                                            isChecked ? cityDB : selectedCity
                                                                        }</Text>
                                                                    ) : (
                                                                        <Text style={{ textAlignVertical: 'center' }}> {selectedCityNotify}</Text>
                                                                    )}
                                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                        <AntDesign
                                                                            name="down"
                                                                            size={15}
                                                                            style={[
                                                                                { transitionDuration: '0.3s' },
                                                                                showCitiesNotify && {
                                                                                    transform: [{ rotate: '180deg' }],
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                </View>

                                                            </TouchableOpacity>
                                                            {showCitiesNotify && (
                                                                <View
                                                                    style={{
                                                                        marginTop: 5,
                                                                        position: 'absolute',
                                                                        top: '100%',
                                                                        left: 0,
                                                                        elevation: 5,
                                                                        width: '100%',
                                                                        maxHeight: 150,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        borderColor: '#ccc',
                                                                        elevation: 5,
                                                                        zIndex: 2
                                                                    }}>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#fff',
                                                                        borderWidth: 0.5,
                                                                        borderColor: '#000',
                                                                        height: 40,
                                                                        borderRadius: 5,
                                                                        margin: 10,
                                                                        zIndex: 3
                                                                    }}>
                                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                        <TextInput
                                                                            placeholder='Search Cities'
                                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                            textAlignVertical='center'
                                                                            placeholderTextColor={'gray'}
                                                                            value={filterCitiesNotify}
                                                                            onChangeText={handleFilterChange}
                                                                        />
                                                                    </View>
                                                                    <ScrollView>
                                                                        <FlatList
                                                                            data={filteredCitiesNotify}
                                                                            keyExtractor={(item, index) => index.toString()}
                                                                            renderItem={({ item }) => (
                                                                                <TouchableOpacity onPress={() => {

                                                                                    setSelectedCityNotify(item.label);
                                                                                    setShowCitiesNotify(false);
                                                                                    setFilteredCitiesNotify(cities);
                                                                                }}>
                                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                        <Text>{item.label}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            )}
                                                                        />
                                                                    </ScrollView>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Address</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? addressDB : address}
                                                                    onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={addressNotify}
                                                                    onChangeText={(text) => setAddressNotify(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Tel. Number</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>

                                                            {isCheckedNotify ? (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={isChecked ? telNumberDB : telNumber}
                                                                    onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                                />
                                                            ) : (
                                                                <TextInput
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                    value={telNumberNotify}
                                                                    onChangeText={(text) => setTelNumberNotify(text)}
                                                                />
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>


                                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text>Email</Text>
                                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                                            <TextInput
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                                value={inputEmailNotify}
                                                                onChangeText={(text) => setInputEmailNotify(text)}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>

                                    )}

                                    {currentStep === 2 && (
                                        <View style={{ zIndex: -2 }}>
                                            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                                                <View style={{
                                                    borderRadius: 90, marginTop: -20
                                                }}>
                                                    <Entypo name="check" size={100} color={'#fff'} style={{ position: 'absolute', top: 20, left: 25, zIndex: 2 }} />
                                                    <View style={{ width: 150, height: 150, borderRadius: 150, backgroundColor: '#00cc00' }} />
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 18, fontWeight: '800' }}>Edit Confirmed</Text>
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 16 }}>Please wait for the sales person to issue another Invoice.</Text>
                                                </View>
                                                <View style={{ marginTop: 5 }}>
                                                    <Text style={{ fontSize: 16 }}>Thank you for your patience</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, height: 35 }} onPress={() => {
                                        if (currentStep === 2) {
                                            openModalRequest();
                                            setOrderInvoice();
                                            setCurrentStep(1);
                                        } else {
                                            addStep();
                                        }
                                    }}>
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>{currentStep === 2 ? 'Close' : 'Confirm Changes'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
};

const AnimatedEntypo = Animated.createAnimatedComponent(Entypo);
const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign);
const ShowCalendarShipping = ({ getValueFromDateETD }) => {

    //calendar

    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef();

    const toggleCalender = () => {
        setShowCalendar(!showCalendar)
    }
    const handleDateSelect = (date) => {
        setSelectedStartDate(date.dateString);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
                setSelectedStartDate(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderArrow = (direction) => {
        return (
            <AntDesign
                name={direction === 'right' ? 'right' : 'left'}
                size={20}
                color="#7b9cff" // You can change the color as needed
            />
        );
    };

    //calendar
    const [trueError, setTrueError] = useState(false)

    const formattedDate = moment(selectedStartDate).format('YYYY/MM/DD');
    const selectedDate = (value) => {

        getValueFromDateETD(value)



    }
    return (
        <View style={{ padding: 5, flexDirection: 'row', alignItems: 'center', zIndex: 999, justifyContent: 'space-between' }}>
            <View>
                <MaterialIcons name="date-range" size={25} color={'#000'} style={[{ marginRight: 5 }]} />
            </View>
            <Text style={{ marginHorizontal: 5, fontSize: 16 }}>{selectedStartDate ? formattedDate : 'Date'}</Text>
            <View style={{ paddingRight: 10 }}>
                <TouchableOpacity onPress={toggleCalender}>
                    <AnimatedAntDesign name="down" size={20} color={'#000'} style={[{ marginLeft: 5 }]} />
                </TouchableOpacity>
            </View>
            {
                showCalendar &&
                <View
                    ref={calendarRef}
                    style={{
                        position: 'absolute',
                        top: '120%',
                        left: -15,
                        elevation: 5,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: '#ccc',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        zIndex: 999,
                        marginHorizontal: 5,
                        flexDirection: 'row',
                        width: 500,
                        borderRadius: 10,

                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        width: '100%',
                    }}>
                        <View style={{ flex: 2 }}>
                            <Calendar
                                onDayPress={handleDateSelect}

                                markedDates={{
                                    [selectedStartDate]: { selected: true }
                                }}
                                theme={{
                                    selectedDayBackgroundColor: '#7b9cff',
                                    selectedDayTextColor: '#fff',
                                }}
                                style={{ padding: 20 }}
                                renderArrow={renderArrow}
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ padding: 10 }}>
                                <View style={{ width: '100%', borderBottomWidth: 2, alignItems: 'center', marginBottom: 5 }}>
                                    <TextInput
                                        textAlign="center"
                                        value={selectedStartDate ? formattedDate : ''}

                                        textAlignVertical='center'
                                        style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingLeft: '22%', fontSize: 16, alignSelf: 'center' }}
                                    />
                                </View>
                            </View>
                            <View style={{ marginTop: 20 }}>
                                <Pressable
                                    onPress={() => {
                                        setShowCalendar(false);
                                        selectedDate(formattedDate);
                                    }}
                                    style={({ pressed, hovered }) => [
                                        {
                                            opacity: pressed ? 0.9 : 1,
                                            // transform: [{ scale: pressed ? 1.2 : 1 }]
                                        },

                                    ]}>
                                    <View style={{ padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7b9cff', borderRadius: 5 }}>
                                        <Text style={{ color: '#fff', fontSize: 16 }}>Set Date</Text>
                                    </View>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            }
        </View>
    )
}
const PaymentNotification = ({ handleButtonClick }) => {
    const { chatId } = useParams();
    const { userEmail } = useContext(AuthContext)
    //UPLOAD FILES
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const [showFileExceeded, setShowFileExceeded] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null);
    const uploadRemitterFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: false,
            });

            if (result.type === 'success') {
                const { uri, name } = result;
                const fileBlob = await fetch(uri).then((response) => response.blob());

                // Check if file size exceeds the maximum limit
                if (fileBlob.size > MAX_FILE_SIZE) {
                    console.log('File size exceeds the maximum limit.');
                    setShowFileExceeded(true);
                    return;
                }

                setSelectedFile({ name, uri });
            } else {
                console.log('Document picking canceled or failed');
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    };

    const deleteSelectedFile = () => {
        setSelectedFile(null);
        setShowFileExceeded(false);
    };
    const updateRemitter = async () => {
        try {
            const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
            const { datetime } = response.data;

            const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

            const storageRef = ref(projectExtensionStorage, `ChatFiles/${chatId}/${selectedFile.name}`);
            const fileBlob = await fetch(selectedFile.uri).then((response) => response.blob());
            const fileNameParts = selectedFile.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';

            let fileType = '';

            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                fileType = 'image';
            } else if (fileExtension === 'pdf') {
                fileType = 'pdf';
            } else if (fileExtension === 'xlsx') {
                fileType = 'xlsx';
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                fileType = 'doc';
            } else {
                fileType = 'link';
            }

            // Log the fileBlob size to help diagnose issues
            console.log('File size:', fileBlob.size);

            await uploadBytes(storageRef, fileBlob);
            const downloadURL = await getDownloadURL(storageRef);

            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: `Wire Date: ${calendarETD}

Name of Remitter: ${nameOfRemitter}

${messageText}

`,
                timestamp: formattedTime,
                file: {
                    url: downloadURL,
                    type: fileType,
                    name: selectedFile.name
                },
            };

            await setDoc(newMessageDocExtension, messageData);

            const fieldUpdate = collection(projectExtensionFirestore, 'chats');

            await updateDoc(doc(fieldUpdate, chatId), {
                lastMessage: downloadURL,
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
                paymentNotification: {
                    uploadPaymentDate: calendarETD,
                    nameOfRemitter: nameOfRemitter,
                    fileName: selectedFile.name,
                    url: downloadURL
                }
            });

            console.log('File uploaded successfully!');
        } catch (error) {
            console.error('Error updating remitter:', error);
        }
    };

    //UPLOAD FILES
    const [calendarETD, setCalendarETD] = useState('');
    const getValueFromDateETD = (etd) => {
        setCalendarETD(etd)
    };
    const [nameOfRemitter, setNameOfRemitter] = useState('');
    const [messageText, setMessageText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => {
                    toggleModal();
                    if (handleButtonClick) {
                        handleButtonClick();
                    } else {
                        return;
                    }
                }}
                style={{
                    height: 50,
                    backgroundColor: '#FAA000',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>OPEN PAYMENT NOTIFICATIONS</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    toggleModal();
                    if (handleButtonClick) {
                        handleButtonClick();
                    } else {
                        return;
                    }
                }}
            >
                <View style={{ flex: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{ backgroundColor: '#f5f5f5', width: '30%', height: '60%', padding: 5 }}>
                        <View style={{ flex: 1 }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 20, fontWeight: '700' }}>PAYMENT NOTIFICATIONS</Text>
                                    </View>
                                    <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={toggleModal}>
                                        <Text style={{ fontSize: 20, fontWeight: '700' }}>X</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                <Text style={{ fontWeight: '700', flex: 1, textAlign: 'left' }}>AMOUNT</Text>
                                <Text style={{ fontWeight: '600', flex: 1, color: 'green', textAlign: 'right' }}>$2,500</Text>
                            </View>
                            <View style={{ padding: 10, marginTop: 5 }}>
                                <Text style={{ fontWeight: '700', marginBottom: 5 }}>WIRE DATE</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ borderWidth: 1, borderRadius: 5, flex: 2 }}>
                                        <ShowCalendarShipping getValueFromDateETD={getValueFromDateETD} />
                                    </View>
                                    <View style={{ flex: 4 }}></View>
                                </View>
                            </View>
                            <View style={{ padding: 10, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ fontWeight: '700', marginBottom: 5 }}>Name of Remitter</Text>
                                <TextInput
                                    defaultValue={nameOfRemitter}
                                    onChangeText={(text) => setNameOfRemitter(text)}
                                    style={{
                                        flex: 1,
                                        borderWidth: 1,
                                        borderColor: 'gray',
                                        padding: 10,
                                        borderRadius: 5,
                                        height: 25
                                    }}
                                />
                            </View>
                            <View style={{ padding: 10, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ fontWeight: '700', marginBottom: 5 }}>Text Message</Text>
                                <TextInput
                                    defaultValue={messageText}
                                    onChangeText={(text) => setMessageText(text)}
                                    multiline
                                    style={{
                                        flex: 1,
                                        borderWidth: 1,
                                        borderColor: 'gray',
                                        padding: 10,
                                        borderRadius: 5,
                                        height: 25
                                    }}
                                />
                            </View>
                            <View style={{ padding: 10, marginTop: 5, zIndex: -1 }}>
                                <Text style={{ fontWeight: '700', marginBottom: 5 }}>ATTACH FILES</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => [
                                            {
                                                backgroundColor: 'black',
                                                borderRadius: 5,
                                                flex: 1,
                                                opacity: pressed ? 0.5 : 1,
                                                opacity: hovered ? 0.5 : 1,
                                            },
                                        ]}
                                        onPress={() => uploadRemitterFiles()}
                                    >
                                        <View style={{
                                            padding: 6, justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row'
                                        }}>
                                            <Ionicons name="cloud-upload-outline" size={25} color="#fff" />
                                            <Text style={{ color: 'white', fontWeight: '700', marginLeft: 5 }}>Upload File</Text>
                                        </View>

                                    </Pressable>
                                    <View style={{ marginLeft: 5, flex: 3 }}>
                                        {selectedFile && (
                                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                <View style={{ marginLeft: 5, flex: 3 }}>
                                                    <Text>{selectedFile.name}</Text>
                                                </View>
                                                <TouchableOpacity onPress={deleteSelectedFile}>
                                                    <Text>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={{ padding: 10, marginTop: 5, zIndex: -1 }}>
                                <TouchableOpacity
                                    onPress={() => { updateRemitter(); toggleModal(); }}
                                    style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#7b9cff', padding: 10, borderRadius: 5 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '700' }}>Update Remitter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const ReceiverInformation = () => {
    //THIS COMPONENT IS THE DETAILS FOR THE DHL DELIVERY
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    };
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();
    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('Country');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('Country');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('City');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('City');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(false);
    const [isCheckedNotify, setCheckedNotify] = useState(false);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('Country');
    const [cityDB, setCityDB] = useState('City');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().carData.stockID;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });

    const [inputEmail, setInputEmail] = useState('');
    const [inputEmailNotify, setInputEmailNotify] = useState('');

    const setDeliveryInfo = async () => {
        const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
        const { datetime } = response.data;
        const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');

        const customerInfo = {
            fullName: isChecked ? fullNameDB : fullName,
            country: isChecked ? countryDB : selectedCountryLabel,
            city: isChecked ? cityDB : selectedCity,
            address: isChecked ? addressDB : address,
            telNumber: isChecked ? telNumberDB : telNumber,
            email: inputEmail,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            // Create a new message document in the chat conversation with the formatted timestamp as the document ID
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: `DELIVERY ADDRESS INFORMATION
Customer Information
            Full Name: ${isChecked ? fullNameDB : fullName}
            Country: ${isChecked ? countryDB : selectedCountryLabel}
            City: ${isChecked ? cityDB : selectedCity}
            Address: ${isChecked ? addressDB : address}
            Tel. Number: ${isChecked ? telNumberDB : telNumber}
            Email: ${inputEmail}
                `,
                timestamp: formattedTime,
                customerInfo,
            };
            await updateDoc(orderRef, {
                deliveryAddressInformation: {
                    customerInfo,
                    dateIssued: formattedTime, // Add formatted date
                },
            });
            await setDoc(newMessageDocExtension, messageData);
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };


    return (
        <View>
            <TouchableOpacity
                onPress={openModalRequest}
                style={{
                    height: 50,
                    backgroundColor: '#FAA000',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>ENTER INFORMATION</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={openModalRequest}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'white', width: 400, height: 450, padding: 10, borderRadius: 10 }}>
                        <ScrollView>
                            <View style={{ flex: 1, marginTop: 5 }}>
                                <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={openModalRequest}>
                                    <Text style={{ fontSize: 20, fontWeight: '700' }}>X</Text>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#4169E1' }}>
                                        Delivery Address & Customer Information
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setChecked(prev => {
                                            if (prev && isChecked) {
                                                setFullNameDB(fullNameDB);
                                                setCityDB(cityDB);
                                                setCountryDB(countryDB);
                                                setAddressDB(addressDB);
                                                setTelNumberDB(telNumberDB);
                                            } else {
                                                setFullName(' ');
                                                setSelectedCountryLabel('Country')
                                                setSelectedCity('City')
                                                setAddress(' ')
                                                setTelNumber(' ')
                                            }
                                            return !prev;
                                        });
                                    }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                        <MaterialIcons
                                            name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                            size={20}
                                            color="black"
                                        />
                                        <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Full Name</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={fullNameDB}
                                                    onChangeText={(text) => setFullNameDB(text)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={fullName}
                                                    onChangeText={(text) => setFullName(text)}
                                                />
                                            )}

                                        </View>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                        <View style={{ flex: 1, zIndex: 2 }}>
                                            <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                    <View style={{ alignSelf: 'center' }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                        )}
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                        <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                            <AntDesign name="close" size={15} />
                                                        </TouchableOpacity>
                                                        <AntDesign
                                                            name="down"
                                                            size={15}
                                                            style={[
                                                                { transitionDuration: '0.3s' },
                                                                showCountries && {
                                                                    transform: [{ rotate: '180deg' }],
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            {showCountries && (
                                                <View style={{
                                                    marginTop: 5,
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    elevation: 5,
                                                    width: '100%',
                                                    maxHeight: 200,
                                                    backgroundColor: "white",
                                                    borderWidth: 1,
                                                    borderColor: '#ccc',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 4,
                                                    zIndex: 3
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: '#fff',
                                                        borderWidth: 0.5,
                                                        borderColor: '#000',
                                                        height: 40,
                                                        borderRadius: 5,
                                                        margin: 10,
                                                        zIndex: 3
                                                    }}>
                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                        <TextInput
                                                            placeholder='Search Country'
                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                            textAlignVertical='center'
                                                            placeholderTextColor={'gray'}
                                                            value={filter}
                                                            onChangeText={handleFilterChange}
                                                        />
                                                    </View>
                                                    <ScrollView>
                                                        <FlatList
                                                            data={filteredCountries}
                                                            keyExtractor={(item) => item.value} // Use item.label as the key
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity onPress={() => {
                                                                    setSelectedCountryLabel(item.label);
                                                                    setSelectedCountry(item.value);
                                                                    setShowCountries(false);
                                                                    setFilteredCountries(countries);
                                                                    setSelectedCity('City')
                                                                }}>
                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                        <Text>{item.label}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        />

                                                    </ScrollView>
                                                </View>
                                            )}

                                        </View>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                        <View style={{ flex: 1, zIndex: 2, }}>
                                            <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                    {isChecked ? (
                                                        <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                    ) : (
                                                        <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                    )}
                                                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                        <AntDesign
                                                            name="down"
                                                            size={15}
                                                            style={[
                                                                { transitionDuration: '0.3s' },
                                                                showCities && {
                                                                    transform: [{ rotate: '180deg' }],
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                </View>

                                            </TouchableOpacity>
                                            {showCities && (
                                                <View
                                                    style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: 'white',
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        elevation: 5,
                                                        zIndex: 2
                                                    }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: '#fff',
                                                        borderWidth: 0.5,
                                                        borderColor: '#000',
                                                        height: 40,
                                                        borderRadius: 5,
                                                        margin: 10,
                                                        zIndex: 3
                                                    }}>
                                                        <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                        <TextInput
                                                            placeholder='Search Cities'
                                                            style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                            textAlignVertical='center'
                                                            placeholderTextColor={'gray'}
                                                            value={filterCities}
                                                            onChangeText={handleFilterChange}
                                                        />
                                                    </View>
                                                    <ScrollView>
                                                        <FlatList
                                                            data={filteredCities}
                                                            keyExtractor={(item, index) => index.toString()}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity onPress={() => {
                                                                    setSelectedCity(item.label)
                                                                    setShowCities(false);
                                                                    setFilteredCities(cities);
                                                                }}>
                                                                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                        <Text>{item.label}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )}
                                                        />
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Address</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={addressDB}
                                                    onChangeText={(text) => setAddressDB(text)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={address}
                                                    onChangeText={(text) => setAddress(text)}
                                                />
                                            )}

                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Tel. Number</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            {isChecked ? (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={telNumberDB}
                                                    onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                />
                                            ) : (
                                                <TextInput
                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                    value={telNumber}
                                                    onChangeText={(text) => setTelNumber(text)}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ marginTop: 5, zIndex: -1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>Email</Text>
                                        <View style={{ borderWidth: 0.5, backgroundColor: '#F5F7F9', borderRadius: 5, padding: 5, height: 35 }}>
                                            <TextInput
                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5, fontSize: 16 }}
                                                value={inputEmail}
                                                onChangeText={(text) => setInputEmail(text)}
                                            />
                                        </View>
                                    </View>
                                </View>

                            </View>

                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', borderRadius: 5, marginTop: 20 }} onPress={() => { openModalRequest(); setDeliveryInfo(); }}>
                                <View style={{ padding: 10, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Details</Text>
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const ProfileOptions = () => {
    const navigate = useNavigate();
    const [showProfileOptions, setShowProfileOptions] = useState(false);



    return (
        <View>
            <Pressable
                onPress={() => setShowProfileOptions(!showProfileOptions)}
                style={({ pressed, hovered }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                    backgroundColor: hovered ? '#aaa' : null,
                    width: '100%',
                    alignSelf: 'center',
                    borderRadius: 10,
                    height: 50,
                    padding: 5,
                    opacity: pressed ? 0.5 : 1,
                    justifyContent: 'center'
                })}
            >
                <MaterialCommunityIcons name="account" size={30} />

            </Pressable>
            {showProfileOptions && (
                <View style={{ justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="person-outline" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <MaterialCommunityIcons name="onepassword" size={20} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const OrderItem = ({ toggleModal, openModalRequest, handleButtonClick }) => {
    const { userEmail } = useContext(AuthContext);
    const { chatId } = useParams();

    //update steps but (ONLY ORDER ITEM)
    const [currentStepDB, setCurrentStepDB] = useState({ value: 2 });
    const statusToValue = {
        'Negotiation': 1,
        'Issue Proforma Invoice': 2,
        'Order Item': 3,
        'Payment Confirmation': 4,
        'Shipping Schedule': 5,
        'Copy of B/L': 6,
        'Documentation': 7,
        'Item Received': 8,
        'Completed': 9
    };
    const valueToStatus = {
        1: 'Negotiation',
        2: 'Issue Proforma Invoice',
        3: 'Order Item',
        4: 'Payment Confirmation',
        5: 'Shipping Schedule',
        6: 'Copy of B/L',
        7: 'Documentation',
        8: 'Item Received',
        9: 'Completed'
    };
    const getNextStatus = (currentStatus) => {
        const statusValues = Object.keys(statusToValue).map(key => statusToValue[key]);
        const currentIndex = statusValues.indexOf(statusToValue[currentStatus]);

        if (currentIndex !== -1 && currentIndex < statusValues.length - 1) {
            const nextValue = statusValues[currentIndex + 1];
            return valueToStatus[nextValue];
        }

        return null; // No next status found
    };
    const updateSteps = async () => {
        try {
            const chatDocRefExtension = doc(projectExtensionFirestore, 'chats', chatId);

            // Get the current status string
            const currentStatus = valueToStatus[currentStepDB.value];

            // Get the next status string
            const nextStatus = getNextStatus(currentStatus);

            if (nextStatus) {
                // Update the document with the next status
                await updateDoc(chatDocRefExtension, {
                    stepIndicator: {
                        value: statusToValue[nextStatus],
                        status: nextStatus
                    }
                });
                setCurrentStepDB({ value: statusToValue[nextStatus] });
                console.log('Steps updated successfully!');
            } else {
                console.log('No next status found.');
            }
        } catch (error) {
            console.error('Error updating steps:', error);
        }
    };
    //update steps but (ONLY ORDER ITEM)


    //COUNTRY AND CITY
    const [countries, setCountries] = useState([]);
    const [showCountries, setShowCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryLabel, setSelectedCountryLabel] = useState('');
    const [filter, setFilter] = useState('');
    const toggleCountries = () => {
        setShowCountries(!showCountries);
        setFilter('');
        setFilteredCountries(countries);
        setShowCities(false);
    };
    const [showCountriesNotify, setShowCountriesNotify] = useState(false);
    const [selectedCountryNotify, setSelectedCountryNotify] = useState('');
    const [selectedCountryNotifyLabel, setSelectedCountryNotifyLabel] = useState('');
    const [filterNotify, setFilterNotify] = useState('');
    const [filteredCountriesNotify, setFilteredCountriesNotify] = useState(countries);
    const handleClearNotify = () => {
        setSelectedCountryNotifyLabel('Country');
        setSelectedCityNotify('City');
        setSelectedCountryNotify('');
    };
    const toggleCountriesNotify = () => {
        setShowCountriesNotify(!showCountriesNotify);
        setFilterNotify('');
        setFilteredCountriesNotify(countries);
        setShowCitiesNotify(false);
    }

    useEffect(() => {
        try {
            const countriesData = Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name
            }));
            setFilteredCountries(countriesData);
            setCountries(countriesData);
            setFilteredCountriesNotify(countriesData);
        } catch (error) {
            console.error('Error Fetching countries:', error)
        }
    }, []);
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const handleFilterChange = (text) => {
        setFilter(text);
        setFilterCities(text);
        setFilterNotify(text);
        const filteredData = countries.filter(item =>
            item.label.toLowerCase().includes(text.toLowerCase()));
        const filteredDataCities = cities.filter(item => item.label.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filteredData);
        setFilteredCities(filteredDataCities);
        setFilteredCountriesNotify(filteredData);
        setFilteredCitiesNotify(filteredDataCities);
    };
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState(cities);
    const [showCities, setShowCities] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [filterCities, setFilterCities] = useState('');
    const toggleCities = () => {
        setShowCities(!showCities);
        setFilterCities('');
        setFilteredCities(cities);
        setShowCountries(false);
    };
    useEffect(() => {
        if (selectedCountry) {
            const countryCities = City.getCitiesOfCountry(selectedCountry);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCity(selectedCountryLabel);
            }
        }
        if (selectedCountryNotify) {
            const countryCities = City.getCitiesOfCountry(selectedCountryNotify);
            const citiesData = countryCities.map((city) => ({
                label: city.name
            }));
            console.log('All cities inside', citiesData);
            setCities(citiesData);

            if (citiesData.length <= 0) {
                setSelectedCityNotify(selectedCountryNotifyLabel);
            }
        }
    }, [selectedCountry, selectedCountryNotify]);
    const [showCitiesNotify, setShowCitiesNotify] = useState(false);
    const [selectedCityNotify, setSelectedCityNotify] = useState('');
    const [filterCitiesNotify, setFilterCitiesNotify] = useState('');
    const [filteredCitiesNotify, setFilteredCitiesNotify] = useState(cities);
    const toggleCitiesNotify = () => {
        setShowCitiesNotify(!showCitiesNotify)
        setFilterCitiesNotify('');
        setFilteredCitiesNotify(cities);
        setShowCountriesNotify(false);
    };
    const handleClear = () => {
        setSelectedCountryLabel('Country');
        setSelectedCountry('');
        setSelectedCity('');
    };
    //COUNTRY AND CITY

    //is CHECKEDNOTIFY
    const [isChecked, setChecked] = useState(true);
    const [isCheckedNotify, setCheckedNotify] = useState(true);

    //if false
    const [fullNameNotifyInput, setFullNameNotifyInput] = useState('');
    const [addressNotify, setAddressNotify] = useState('');
    const [telNumberNotify, setTelNumberNotify] = useState('');
    const [emailNotify, setEmailNotify] = useState('');

    //fetching data from STOCKID

    //if true
    const [fullNameDB, setFullNameDB] = useState('');
    const [countryDB, setCountryDB] = useState('');
    const [cityDB, setCityDB] = useState('');
    const [telNumberDB, setTelNumberDB] = useState('');
    const [addressDB, setAddressDB] = useState('');
    //if false
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [telNumber, setTelNumber] = useState('');


    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'accounts', userEmail);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFullNameDB(userData.textFirst + ' ' + userData.textLast);
                    setTelNumberDB('+' + userData.textPhoneNumber);
                    setAddressDB(userData.textZip + ' ' + userData.textStreet + ',' + ' ' + userData.city);
                    setCountryDB(userData.country);
                    setCityDB(userData.city);
                } else {
                    console.log('No user with that Email')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        };
        if (userEmail) {
            fetchUserData();
        }
    }, [userEmail])
    //fetching the user's information

    //fetching data from STOCKID carId = STOCKID
    const [carId, setCarId] = useState(null);
    useEffect(() => {
        const fetchCarId = async () => {
            try {
                const vehicleIdDocRef = doc(projectExtensionFirestore, 'chats', chatId);
                const docSnapshot = await getDoc(vehicleIdDocRef);

                if (docSnapshot.exists()) {
                    const carIdValue = docSnapshot.data().carData.stockID;
                    setCarId(carIdValue);
                } else {
                    console.log('Document does not exist');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }

        fetchCarId(); // Don't forget to call the function!
    }, [projectExtensionFirestore, chatId]);
    //fetching data from STOCKID carId = STOCKID


    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        step: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
        },
        completed: {
            backgroundColor: 'green',
        },
        circle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#ff4d4d',
            justifyContent: 'center',
            alignItems: 'center',
        },
        innerCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
        },
        innerCircleCompleted: {
            backgroundColor: 'green',
        },
        line: {
            height: 10,
            width: '30%',
            backgroundColor: '#ccc',
            flexShrink: 1,
        },
    });
    //STEP TRACKER
    const [currentStep, setCurrentStep] = useState(1);
    const addStep = () => {
        setCurrentStep(currentStep + 1);
    };
    const setOrderInvoice = async () => {
        const response = await axios.get('https://worldtimeapi.org/api/timezone/Asia/Tokyo');
        const { datetime } = response.data;
        const formattedTime = moment(datetime).format('YYYY/MM/DD [at] HH:mm:ss');
        const randomNumber = Math.floor(10000 + Math.random() * 90000);
        const bookingListCollectionRef = collection(projectExtensionFirestore, 'BookingList');

        const customerInfo = {
            fullName: fullName || fullNameDB,
            country: selectedCountryLabel || countryDB,
            city: selectedCity || cityDB,
            address: address || addressDB,
            telNumber: telNumber || telNumberDB,
            email: userEmail,
        };


        const infoCustomerInput = {
            fullName: fullNameNotifyInput,
            country: selectedCountryNotifyLabel,
            city: selectedCityNotify,
            address: addressNotify,
            telNumber: telNumberNotify,
            email: emailNotify,
        };

        try {
            const orderRef = doc(projectExtensionFirestore, 'chats', chatId);
            const newBookingListDocRef = doc(bookingListCollectionRef, chatId);
            // const fieldUpdate = collection(projectExtensionFirestore, 'chats');
            const newMessageDocExtension = doc(collection(projectExtensionFirestore, 'chats', chatId, 'messages'));
            const messageData = {
                sender: userEmail, // Sender's email
                text: "I agree with all the condition and place the order.",
                timestamp: formattedTime,
                orderInvoiceIssue: true,
                setPaymentNotification: true
            };

            await updateDoc(orderRef, {
                orderInvoice: {
                    proformaIssue: true,
                    customerInfo,
                    notifyParty: isCheckedNotify ? customerInfo : infoCustomerInput,
                    dateIssued: formattedTime, // Add formatted date
                },
                lastMessage: 'I agree with all the condition and place the order.',
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
                InvoiceNumber: randomNumber.toString()
            });
            await setDoc(newMessageDocExtension, messageData);
            // await setDoc(fieldUpdate, chatId, {
            //     DocumentsUpload: {
            //         ExportCertificate: '',
            //         ShippingInstructions: '',
            //         BillOfLading: '',
            //         InspectionSheet: '',
            //         DHLTrackingNumber: '',
            //         InvoiceNumber: randomNumber.toString()
            //     },

            // });
            await setDoc(newBookingListDocRef, {
                DocumentsUpload: {
                    ExportCertificate: '',
                    ShippingInstructions: '',
                    BillOfLading: '',
                    InspectionSheet: '',
                    DHLTrackingNumber: '',
                    InvoiceNumber: randomNumber.toString()
                },
                lastMessage: 'I agree with all the condition and place the order.',
                lastMessageDate: formattedTime,
                lastMessageSender: userEmail,
                read: false,
                readBy: [],
            });
        } catch (error) {
            console.error('Error updating Proforma Invoice:', error);
        }
    };
    //STEP TRACKER


    //CALENDAR
    const [selectedDate, setSelectedDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef();
    const handleDateSelect = (date) => {
        setSelectedDate(date.dateString);
    };
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar)
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])
    //CALENDAR

    return (
        <View>
            <View style={{ justifyContent: 'center' }}>
                <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 5, flexDirection: 'row' }}>
                    <Text style={{ color: 'black', fontSize: 18, fontWeight: '700', alignSelf: 'center' }}>Order Form</Text>
                    <TouchableOpacity onPress={() => { openModalRequest(); handleButtonClick(); }}>
                        <Text style={{ color: 'red', fontSize: 18, fontWeight: '700' }}>X</Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={{ marginTop: 5, width: '90%', alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ justifyContent: `flex-start`, alignItems: 'center', zIndex: 3 }}>
                            <TouchableOpacity style={[styles.circle]} disabled={currentStep < 1}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 150, left: -50 }}><Text>Fill in your information</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ marginTop: -2, width: '100%', height: 7, backgroundColor: '#ccc', position: 'absolute', top: '50%' }} />
                        <View style={{
                            zIndex: 2,
                            marginTop: -2, height: 7, backgroundColor:
                                currentStep === 1 ? '#ccc' : currentStep === 2 ? '#ff4d4d' : '#ff4d4d',
                            position: 'absolute', top: '50%',
                            width: currentStep === 1 ? 0 : currentStep === 2 ? '50%' : '100%'
                        }} />
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 2 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 2}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 50 }}><Text>Confirm</Text></View></TouchableOpacity>

                        </View>
                        <View style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TouchableOpacity style={[styles.circle, { backgroundColor: currentStep < 3 ? '#ccc' : '#ff4d4d' }]} disabled={currentStep < 3}> <View style={{ position: 'absolute', top: 30, alignSelf: 'center', width: 60 }}><Text>Complete</Text></View></TouchableOpacity>

                        </View>
                    </View>

                </View> */}
                {currentStep === 1 && (
                    <View style={{ marginTop: 5 }}>

                        <View>
                            <View style={{ backgroundColor: '#7b9cff', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10, borderRadius: 5, marginTop: -5, zIndex: -1 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Please Fill in you Details</Text>
                            </View>
                            <View style={{}}>
                                <Text style={{ fontWeight: '700', color: 'red' }}>*Require Fields</Text>
                            </View>
                            <View style={{ zIndex: -2 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Customer Information
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setChecked(!isChecked); setAddress(''); setFullName(''); setSelectedCountry(''); setSelectedCountryLabel('Country')
                                            setSelectedCity('City');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 1, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, color: '#333', borderRadius: 8 }}
                                                        value={fullNameDB}
                                                        onChangeText={(text) => setFullNameDB(text)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, borderRadius: 8, fontSize: 16, color: '#333' }}
                                                        value={fullName}
                                                        onChangeText={(text) => setFullName(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>

                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isChecked ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountries && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountries && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filter}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCountries}
                                                                keyExtractor={(item) => item.value} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryLabel(item.label);
                                                                        setSelectedCountry(item.value);
                                                                        setShowCountries(false);
                                                                        setFilteredCountries(countries);
                                                                        setSelectedCity('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />

                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountry ? toggleCities : null} disabled={!selectedCountry || selectedCountryLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        {isChecked ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCities && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCities && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCities}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCities}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCity(item.label)
                                                                        setShowCities(false);
                                                                        setFilteredCities(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={addressDB}
                                                        onChangeText={(text) => setAddressDB(text)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={address}
                                                        onChangeText={(text) => setAddress(text)}
                                                    />
                                                )}

                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                {isChecked ? (
                                                    <TextInput
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                        value={telNumberDB}
                                                        onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                        value={telNumber}
                                                        onChangeText={(text) => setTelNumber(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                <TextInput
                                                    style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                    value={userEmail}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>


                                <View style={{ flex: 1, marginTop: 10 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                            Notify Party
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setCheckedNotify(!isCheckedNotify);
                                            setSelectedCountryNotifyLabel('');
                                            setSelectedCityNotify('');
                                            setFullNameNotifyInput('');
                                            setAddressNotify('');
                                            setTelNumberNotify('');
                                            setEmailNotify('');
                                        }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                            <MaterialIcons
                                                name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                size={20}
                                                color="black"
                                            />
                                            <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Full Name</Text>
                                            <View style={{ borderWidth: 0.5, backgroundColor: '#fff', borderColor: '#E1E4E8', borderRadius: 8, height: 40 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={!isChecked ? fullName : fullNameDB}
                                                        onChangeText={(text) => {
                                                            setFullNameDB(text);
                                                            setFullName(text);
                                                        }}

                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={fullNameNotifyInput}
                                                        onChangeText={(text) => setFullNameNotifyInput(text)}

                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                            <View style={{ flex: 1, zIndex: 2 }}>
                                                <TouchableOpacity onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                        <View style={{ alignSelf: 'center' }}>
                                                            {isCheckedNotify ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isChecked ? selectedCountryLabel : countryDB || selectedCountryLabel}
                                                                </Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>
                                                                    {!isCheckedNotify ? !selectedCountryNotifyLabel ? 'Country' : selectedCountryNotifyLabel : selectedCountryNotifyLabel}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                <AntDesign name="close" size={15} />
                                                            </TouchableOpacity>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCountriesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                                {showCountriesNotify && (
                                                    <View style={{
                                                        marginTop: 5,
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        elevation: 5,
                                                        width: '100%',
                                                        maxHeight: 200,
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: '#ccc',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        elevation: 5,
                                                        zIndex: 3
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Country'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>

                                                            <FlatList
                                                                data={filteredCountriesNotify}
                                                                keyExtractor={(item) => item.label} // Use item.label as the key
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {
                                                                        setSelectedCountryNotifyLabel(item.label)
                                                                        setSelectedCountryNotify(item.value)
                                                                        setShowCountriesNotify(false);
                                                                        setFilteredCountriesNotify(countries);
                                                                        setSelectedCityNotify('City')
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}

                                            </View>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 5 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                            <View style={{ flex: 1, zIndex: 2, }}>
                                                <TouchableOpacity onPress={selectedCountryNotify ? toggleCitiesNotify : null} disabled={!selectedCountryNotify || selectedCountryNotifyLabel === 'Country'} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                        {isCheckedNotify ? (
                                                            <Text style={{ textAlignVertical: 'center' }}>{
                                                                !isChecked ? selectedCity : cityDB
                                                            }</Text>
                                                        ) : (
                                                            <Text style={{ textAlignVertical: 'center' }}>{!isCheckedNotify ? !selectedCityNotify ? 'City' : selectedCityNotify : selectedCityNotify}</Text>
                                                        )}
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <AntDesign
                                                                name="down"
                                                                size={15}
                                                                style={[
                                                                    { transitionDuration: '0.3s' },
                                                                    showCitiesNotify && {
                                                                        transform: [{ rotate: '180deg' }],
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                                {showCitiesNotify && (
                                                    <View
                                                        style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 150,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            elevation: 5,
                                                            zIndex: 2
                                                        }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            backgroundColor: '#fff',
                                                            borderWidth: 0.5,
                                                            borderColor: '#000',
                                                            height: 40,
                                                            borderRadius: 5,
                                                            margin: 10,
                                                            zIndex: 3
                                                        }}>
                                                            <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                            <TextInput
                                                                placeholder='Search Cities'
                                                                style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                textAlignVertical='center'
                                                                placeholderTextColor={'gray'}
                                                                value={filterCitiesNotify}
                                                                onChangeText={handleFilterChange}
                                                            />
                                                        </View>
                                                        <ScrollView>
                                                            <FlatList
                                                                data={filteredCitiesNotify}
                                                                keyExtractor={(item, index) => index.toString()}
                                                                renderItem={({ item }) => (
                                                                    <TouchableOpacity onPress={() => {

                                                                        setSelectedCityNotify(item.label);
                                                                        setShowCitiesNotify(false);
                                                                        setFilteredCitiesNotify(cities);
                                                                    }}>
                                                                        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                            <Text>{item.label}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )}
                                                            />
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Address</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                        value={!isChecked ? address : addressDB}
                                                        onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={addressNotify}
                                                        onChangeText={(text) => setAddressNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>Tel. Number</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>

                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={!isChecked ? telNumber : telNumberDB}
                                                        onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={telNumberNotify}
                                                        onChangeText={(text) => setTelNumberNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 5, zIndex: -1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text>E-mail</Text>
                                            <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                {isCheckedNotify ? (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={userEmail}
                                                    />
                                                ) : (
                                                    <TextInput
                                                        style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                        value={emailNotify}
                                                        onChangeText={(text) => setEmailNotify(text)}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </View>

                        <View style={{ marginTop: 20, flexDirection: 'row' }}>
                            <TouchableOpacity style={{ backgroundColor: 'black', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 3 }} />
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }} onPress={() => addStep()}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Continue</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                )}

                {currentStep === 2 && (
                    <View style={{ marginTop: 5 }}>

                        <View>
                            <View>
                                <View style={{ backgroundColor: '#7b9cff', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 10, borderRadius: 5, marginTop: -5, zIndex: -1 }}>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Please Fill in you Details</Text>
                                </View>
                                <View style={{}}>
                                    <Text style={{ fontWeight: '700', color: 'red' }}>*Require Fields</Text>
                                </View>
                                <View style={{ zIndex: -2 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                                Customer Information
                                            </Text>
                                            <TouchableOpacity
                                                disabled
                                                onPress={() => {
                                                    setChecked(!isChecked); setAddress(''); setFullName(''); setSelectedCountry(''); setSelectedCountryLabel('Country')
                                                    setSelectedCity('City');
                                                }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                <MaterialIcons
                                                    name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                                                    size={20}
                                                    color="black"
                                                />
                                                <Text>Set as customer's information <Text style={{ color: 'red' }}>*</Text></Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Full Name</Text>
                                                <View style={{ borderWidth: 1, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    {isChecked ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, color: '#333', borderRadius: 8 }}
                                                            value={fullNameDB}
                                                            onChangeText={(text) => setFullNameDB(text)}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', width: '100%', paddingRight: 5, fontSize: 16, color: '#333' }}
                                                            value={fullName}
                                                            onChangeText={(text) => setFullName(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>

                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                <View style={{ flex: 1, zIndex: 2 }}>
                                                    <TouchableOpacity disabled onPress={toggleCountries} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                            <View style={{ alignSelf: 'center' }}>
                                                                {isChecked ? (
                                                                    <Text style={{ textAlignVertical: 'center' }}>{countryDB}</Text>
                                                                ) : (
                                                                    <Text style={{ textAlignVertical: 'center' }}>{selectedCountry ? selectedCountryLabel : 'Country'}</Text>
                                                                )}
                                                            </View>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                <TouchableOpacity onPress={handleClear} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                    <AntDesign name="close" size={15} />
                                                                </TouchableOpacity>
                                                                <AntDesign
                                                                    name="down"
                                                                    size={15}
                                                                    style={[
                                                                        { transitionDuration: '0.3s' },
                                                                        showCountries && {
                                                                            transform: [{ rotate: '180deg' }],
                                                                        },
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    {showCountries && (
                                                        <View style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: "white",
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 4 },
                                                            shadowOpacity: 0.25,
                                                            shadowRadius: 4,
                                                            zIndex: 3
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.5,
                                                                borderColor: '#000',
                                                                height: 40,
                                                                borderRadius: 5,
                                                                margin: 10,
                                                                zIndex: 3
                                                            }}>
                                                                <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                <TextInput

                                                                    placeholder='Search Country'
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                    textAlignVertical='center'
                                                                    placeholderTextColor={'gray'}
                                                                    value={filter}
                                                                    onChangeText={handleFilterChange}
                                                                />
                                                            </View>
                                                            <ScrollView>
                                                                <FlatList
                                                                    data={filteredCountries}
                                                                    keyExtractor={(item) => item.value} // Use item.label as the key
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => {
                                                                            setSelectedCountryLabel(item.label);
                                                                            setSelectedCountry(item.value);
                                                                            setShowCountries(false);
                                                                            setFilteredCountries(countries);
                                                                            setSelectedCity('City')
                                                                        }}>
                                                                            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                <Text>{item.label}</Text>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                />

                                                            </ScrollView>
                                                        </View>
                                                    )}

                                                </View>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 5 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                <View style={{ flex: 1, zIndex: 2, }}>
                                                    <TouchableOpacity onPress={selectedCountry ? toggleCities : null} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                            {isChecked ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{cityDB}</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{selectedCity ? selectedCity : 'City'}</Text>
                                                            )}
                                                            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                <AntDesign
                                                                    name="down"
                                                                    size={15}
                                                                    style={[
                                                                        { transitionDuration: '0.3s' },
                                                                        showCities && {
                                                                            transform: [{ rotate: '180deg' }],
                                                                        },
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>

                                                    </TouchableOpacity>
                                                    {showCities && (
                                                        <View
                                                            style={{
                                                                marginTop: 5,
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                elevation: 5,
                                                                width: '100%',
                                                                maxHeight: 200,
                                                                backgroundColor: 'white',
                                                                borderWidth: 1,
                                                                borderColor: '#ccc',
                                                                elevation: 5,
                                                                zIndex: 2
                                                            }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.5,
                                                                borderColor: '#000',
                                                                height: 40,
                                                                borderRadius: 5,
                                                                margin: 10,
                                                                zIndex: 3
                                                            }}>
                                                                <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                <TextInput
                                                                    placeholder='Search Cities'
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                    textAlignVertical='center'
                                                                    placeholderTextColor={'gray'}
                                                                    value={filterCities}
                                                                    onChangeText={handleFilterChange}
                                                                />
                                                            </View>
                                                            <ScrollView>
                                                                <FlatList
                                                                    data={filteredCities}
                                                                    keyExtractor={(item, index) => index.toString()}
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => {
                                                                            setSelectedCity(item.label)
                                                                            setShowCities(false);
                                                                            setFilteredCities(cities);
                                                                        }}>
                                                                            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                <Text>{item.label}</Text>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                />
                                                            </ScrollView>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Address</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    {isChecked ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={addressDB}
                                                            onChangeText={(text) => setAddressDB(text)}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={address}
                                                            onChangeText={(text) => setAddress(text)}
                                                        />
                                                    )}

                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Tel. Number</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    {isChecked ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                            value={telNumberDB}
                                                            onChangeText={(telNumberDB) => setTelNumberDB(telNumberDB)}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                            value={telNumber}
                                                            onChangeText={(text) => setTelNumber(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>E-mail</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    <TextInput
                                                        editable={false}
                                                        style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                        value={userEmail}
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                    </View>


                                    <View style={{ flex: 1, marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>
                                                Notify Party
                                            </Text>
                                            <TouchableOpacity disabled onPress={() => {
                                                setCheckedNotify(!isCheckedNotify);
                                                setSelectedCountryNotifyLabel('');
                                                setSelectedCityNotify('');
                                                setFullNameNotifyInput('');
                                                setAddressNotify('');
                                                setTelNumberNotify('');
                                                setEmailNotify('');
                                            }} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                                <MaterialIcons
                                                    name={isCheckedNotify ? 'check-box' : 'check-box-outline-blank'}
                                                    size={20}
                                                    color="black"
                                                />
                                                <Text>Same as customer <Text style={{ color: 'red' }}>*</Text></Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Full Name</Text>
                                                <View style={{ borderWidth: 0.5, backgroundColor: '#fff', borderColor: '#E1E4E8', borderRadius: 8, height: 40 }}>
                                                    {isCheckedNotify ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={!isChecked ? fullName : fullNameDB}
                                                            onChangeText={(text) => {
                                                                setFullNameDB(text);
                                                                setFullName(text);
                                                            }}

                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={fullNameNotifyInput}
                                                            onChangeText={(text) => setFullNameNotifyInput(text)}

                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500' }}>Country</Text>
                                                <View style={{ flex: 1, zIndex: 2 }}>
                                                    <TouchableOpacity disabled onPress={toggleCountriesNotify} style={{ borderWidth: 1, borderRadius: 5 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>
                                                            <View style={{ alignSelf: 'center' }}>
                                                                {isCheckedNotify ? (
                                                                    <Text style={{ textAlignVertical: 'center' }}>
                                                                        {!isChecked ? selectedCountryLabel : countryDB || selectedCountryLabel}
                                                                    </Text>
                                                                ) : (
                                                                    <Text style={{ textAlignVertical: 'center' }}>
                                                                        {!isCheckedNotify ? !selectedCountryNotifyLabel ? 'Country' : selectedCountryNotifyLabel : selectedCountryNotifyLabel}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                <TouchableOpacity onPress={handleClearNotify} style={{ alignSelf: 'center', marginRight: 5 }}>
                                                                    <AntDesign name="close" size={15} />
                                                                </TouchableOpacity>
                                                                <AntDesign
                                                                    name="down"
                                                                    size={15}
                                                                    style={[
                                                                        { transitionDuration: '0.3s' },
                                                                        showCountriesNotify && {
                                                                            transform: [{ rotate: '180deg' }],
                                                                        },
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    {showCountriesNotify && (
                                                        <View style={{
                                                            marginTop: 5,
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            elevation: 5,
                                                            width: '100%',
                                                            maxHeight: 200,
                                                            backgroundColor: "white",
                                                            borderWidth: 1,
                                                            borderColor: '#ccc',
                                                            shadowColor: '#000',
                                                            shadowOffset: { width: 0, height: 4 },
                                                            shadowOpacity: 0.25,
                                                            shadowRadius: 4,
                                                            elevation: 5,
                                                            zIndex: 3
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.5,
                                                                borderColor: '#000',
                                                                height: 40,
                                                                borderRadius: 5,
                                                                margin: 10,
                                                                zIndex: 3
                                                            }}>
                                                                <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                <TextInput
                                                                    placeholder='Search Country'
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                    textAlignVertical='center'
                                                                    placeholderTextColor={'gray'}
                                                                    value={filterNotify}
                                                                    onChangeText={handleFilterChange}
                                                                />
                                                            </View>
                                                            <ScrollView>

                                                                <FlatList
                                                                    data={filteredCountriesNotify}
                                                                    keyExtractor={(item) => item.label} // Use item.label as the key
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => {
                                                                            setSelectedCountryNotifyLabel(item.label)
                                                                            setSelectedCountryNotify(item.value)
                                                                            setShowCountriesNotify(false);
                                                                            setFilteredCountriesNotify(countries);
                                                                            setSelectedCityNotify('City')
                                                                        }}>
                                                                            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                <Text>{item.label}</Text>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                />
                                                            </ScrollView>
                                                        </View>
                                                    )}

                                                </View>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 5 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500' }}>City</Text>
                                                <View style={{ flex: 1, zIndex: 2, }}>
                                                    <TouchableOpacity disabled onPress={selectedCountryNotify ? toggleCitiesNotify : null} style={{ borderWidth: 1, borderRadius: 5 }}>

                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, zIndex: -1, height: 40 }}>

                                                            {isCheckedNotify ? (
                                                                <Text style={{ textAlignVertical: 'center' }}>{
                                                                    !isChecked ? selectedCity : cityDB
                                                                }</Text>
                                                            ) : (
                                                                <Text style={{ textAlignVertical: 'center' }}>{!isCheckedNotify ? !selectedCityNotify ? 'City' : selectedCityNotify : selectedCityNotify}</Text>
                                                            )}
                                                            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                                <AntDesign
                                                                    name="down"
                                                                    size={15}
                                                                    style={[
                                                                        { transitionDuration: '0.3s' },
                                                                        showCitiesNotify && {
                                                                            transform: [{ rotate: '180deg' }],
                                                                        },
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>

                                                    </TouchableOpacity>
                                                    {showCitiesNotify && (
                                                        <View
                                                            style={{
                                                                marginTop: 5,
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                elevation: 5,
                                                                width: '100%',
                                                                maxHeight: 150,
                                                                backgroundColor: 'white',
                                                                borderWidth: 1,
                                                                borderColor: '#ccc',
                                                                elevation: 5,
                                                                zIndex: 2
                                                            }}>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 0.5,
                                                                borderColor: '#000',
                                                                height: 40,
                                                                borderRadius: 5,
                                                                margin: 10,
                                                                zIndex: 3
                                                            }}>
                                                                <AntDesign name="search1" size={20} style={{ margin: 5 }} />
                                                                <TextInput
                                                                    placeholder='Search Cities'
                                                                    style={{ height: '100%', outlineStyle: 'none', width: '100%', paddingRight: 5 }}
                                                                    textAlignVertical='center'
                                                                    placeholderTextColor={'gray'}
                                                                    value={filterCitiesNotify}
                                                                    onChangeText={handleFilterChange}
                                                                />
                                                            </View>
                                                            <ScrollView>
                                                                <FlatList
                                                                    data={filteredCitiesNotify}
                                                                    keyExtractor={(item, index) => index.toString()}
                                                                    renderItem={({ item }) => (
                                                                        <TouchableOpacity onPress={() => {

                                                                            setSelectedCityNotify(item.label);
                                                                            setShowCitiesNotify(false);
                                                                            setFilteredCitiesNotify(cities);
                                                                        }}>
                                                                            <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                                                <Text>{item.label}</Text>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                />
                                                            </ScrollView>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Address</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    {isCheckedNotify ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', width: '100%', paddingLeft: 5, fontSize: 16, borderRadius: 8 }}
                                                            value={!isChecked ? address : addressDB}
                                                            onChangeText={(text) => { setAddress(text); setAddressDB(text); }}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={addressNotify}
                                                            onChangeText={(text) => setAddressNotify(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>Tel. Number</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>

                                                    {isCheckedNotify ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={!isChecked ? telNumber : telNumberDB}
                                                            onChangeText={(text) => { setTelNumber(text); setTelNumberDB(text); }}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={telNumberNotify}
                                                            onChangeText={(text) => setTelNumberNotify(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 5, zIndex: -1 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>E-mail</Text>
                                                <View style={{ borderWidth: 0.5, borderColor: '#E1E4E8', backgroundColor: '#FFFFFF', borderRadius: 8, height: 40 }}>
                                                    {isCheckedNotify ? (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={userEmail}
                                                        />
                                                    ) : (
                                                        <TextInput
                                                            editable={false}
                                                            style={{ height: '100%', borderRadius: 8, width: '100%', paddingLeft: 5, fontSize: 16 }}
                                                            value={emailNotify}
                                                            onChangeText={(text) => setEmailNotify(text)}
                                                        />
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                            </View>

                        </View>
                        <View style={{ marginTop: 20, flexDirection: 'row' }}>
                            <TouchableOpacity style={{ backgroundColor: 'black', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Back</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 3 }} />
                            <TouchableOpacity style={{ backgroundColor: '#7b9cff', padding: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, flex: 1, height: 40 }}
                                onPress={() => {
                                    setOrderInvoice();
                                    addStep();
                                    openModalRequest();
                                    updateSteps();
                                    handleButtonClick();
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Finish</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                )}



            </View>

        </View>
    )

}

const ProfileFormChatGroup = () => {
    const hideThis = false

    const [getStep, setGetStep] = useState(0);
    const [currentStep, setCurrentStep] = useState({ value: 1 });
    const [selectedChatId, setSelectedChatId] = useState(null);
    console.log('PROFILEFORMCHATGROUP', selectedChatId)
    const statusToValue = {
        'Negotiation': 1,
        'Issue Proforma Invoice': 2,
        'Order Item': 3,
        'Payment Confirmation': 4,
        'Shipping Schedule': 5,
        'Copy of B/L': 6,
        'Documentation': 7,
        'Item Received': 8,
        'Completed': 9
    };
    const valueToStatus = {
        1: 'Negotiation',
        2: 'Issue Proforma Invoice',
        3: 'Order Item',
        4: 'Payment Confirmation',
        5: 'Shipping Schedule',
        6: 'Copy of B/L',
        7: 'Documentation',
        8: 'Item Received',
        9: 'Completed'
    };
    const getNextStatus = (currentStatus) => {
        const statusValues = Object.keys(statusToValue).map(key => statusToValue[key]);
        const currentIndex = statusValues.indexOf(statusToValue[currentStatus]);

        if (currentIndex !== -1 && currentIndex < statusValues.length - 1) {
            const nextValue = statusValues[currentIndex + 1];
            return valueToStatus[nextValue];
        }

        return null; // No next status found
    };
    // const updateSteps = async () => {
    //     try {
    //         const chatDocRef = doc(firestore, 'chats', chatId);

    //         // Get the current status string
    //         const currentStatus = valueToStatus[currentStep.value];

    //         // Get the next status string
    //         const nextStatus = getNextStatus(currentStatus);

    //         if (nextStatus) {
    //             // Update the document with the next status
    //             await updateDoc(chatDocRef, {
    //                 stepIndicator: {
    //                     value: statusToValue[nextStatus],
    //                     status: nextStatus
    //                 }
    //             });

    //             setCurrentStep({ value: statusToValue[nextStatus] });
    //             console.log('Steps updated successfully!');
    //         } else {
    //             console.log('No next status found.');
    //         }
    //     } catch (error) {
    //         console.error('Error updating steps:', error);
    //     }
    // };

    const totalSteps = 8;



    // This effect runs when screenWidth changes


    // Call this function to manually toggle rightVisible
    const toggleRightVisible = () => {
        setHasBeenToggled(true); // Indicate that it has been manually toggled
        setRightVisible(prev => !prev);
    };
    //HIDE RIGHT SIDE

    useEffect(() => {
        setCurrentStep({ value: getStep });
        console.log('value per ChatID: ', getStep);
    }, [getStep]);

    useEffect(() => {
        const targetChatId = selectedChatId || chatId; // Use selectedChatId if available, otherwise use chatId

        if (targetChatId) {
            const chatDocRef = doc(projectExtensionFirestore, 'chats', targetChatId);
            const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        if (data.stepIndicator) {
                            const value = data.stepIndicator.value;
                            const parsedValue = parseInt(value, 10);

                            if (!isNaN(parsedValue)) {
                                setGetStep(parsedValue);
                                setCurrentStep({ value: parsedValue });
                            } else {
                                console.error('Value is not a valid number:', value);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });

            // Clean up the listener when the component unmounts
            return () => unsubscribe();
        }
    }, [selectedChatId, chatId]);
    //status checker

    //chatid getter

    //chatid getter

    //fetch customer email
    //fetch customer email
    const [customerEmail, setCustomerEmail] = useState('');

    // Fetch the customer email
    useEffect(() => {
        const fetchCustomerEmail = async () => {
            try {
                const db = getFirestore();
                const chatsRef = collection(projectExtensionFirestore, 'chats');
                const q = query(
                    chatsRef,
                    where('participants.salesRep', '==', 'marc@realmotor.jp')
                );

                // Listener to get the first chat where the salesRep is 'marc@realmotor.jp'
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    snapshot.forEach((doc) => {
                        const chat = doc.data();
                        setCustomerEmail(chat.participants.customer);
                        // Only get the first chat and set the customer email, then unsubscribe
                        return;
                    });
                });
                return unsubscribe;
            } catch (error) {
                console.error('Error fetching customer email: ', error);
            }
        };
        fetchCustomerEmail();
    }, []);
    //fetch customer email

    //from progress stepper
    const navigate = useNavigate();
    const { chatId } = useParams();
    const { userEmail, logout, profileDataAuth } = useContext(AuthContext);
    const scrollViewRef = useRef(null);
    const [showGoToTop, setShowGoToTop] = useState(false);

    // Function to scroll to the top when the "Go to Top" button is pressed
    const handleGoToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    // Function to handle the ScrollView's scroll event
    const handleScroll = (event) => {
        // Calculate whether the user has scrolled to the bottom
        const isAtBottom = event.nativeEvent.contentOffset.y + event.nativeEvent.layoutMeasurement.height >= event.nativeEvent.contentSize.height;

        // Show/hide the "Go to Top" button based on scroll position
        setShowGoToTop(isAtBottom);
    };

    useEffect(() => {
        // Add a scroll event listener to the ScrollView
        if (scrollViewRef.current) {
            scrollViewRef.current.addEventListener('onScroll', handleScroll);
        }

        // Clean up the event listener when the component unmounts
        return () => {
            if (scrollViewRef.current) {
                scrollViewRef.current.removeEventListener('onScroll', handleScroll);
            }
        };
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const sidebarWidth = 70;
    const sidebarAnimation = useRef(new Animated.Value(0)).current;
    //Function to open the sidebar
    const openSidebar = () => {
        Animated.timing(sidebarAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
        setSidebarOpen(true);
    };
    const closeSidebar = () => {
        Animated.timing(sidebarAnimation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
        }).start(() => setSidebarOpen(false));
    };

    //get data from firebase
    const [profileData, setProfileData] = useState(null);

    //BREAKPOINT
    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    useEffect(() => {
        const handleDimensionsChange = ({ window }) => {
            setScreenWidth(window.width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
        return () => subscription.remove
    }, []);

    const data = [
        1
    ];

    //HIDE RIGHT SIDE
    const [rightVisible, setRightVisible] = useState(true);
    const [middleVisible, setMiddleVisible] = useState(true)
    const [disableOutsideClick, setDisableOutsideClick] = useState(false);
    useEffect(() => {
        if (screenWidth < 1260 && rightVisible) {
            setRightVisible(false);
        }
        if (screenWidth > 768) {
            setHideLeft(true)
        }
    }, [screenWidth]);
    const requestToggleRight = () => {
        setRightVisible(!rightVisible)
    };
    const scrollViewRightRef = useRef();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!disableOutsideClick && scrollViewRightRef.current && !scrollViewRightRef.current.contains(event.target)) {
                setRightVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [scrollViewRightRef, disableOutsideClick]);

    const handleButtonClick = () => {
        // Toggle the behavior of handleClickOutside
        setDisableOutsideClick(current => !current);
        // Other button logic...
    };
    //  const renderTransactionDetails = ({ item }) => {
    //     return (



    //     )
    // };
    const [modalVisible, setModalVisible] = useState(false);
    const openModalRequest = () => {
        setModalVisible(!modalVisible);
    }

    //CHAT DATA
    const [chatDatas, setChatDatas] = useState([]);
    // console.log('LOG CHAT DATA', chatDatas?.proformaInvoice.customerInfo.address);
    useEffect(() => {
        const fetchChatData = async () => {
            // Replace 'chats' and 'yourChatID' with your actual Firestore collection and document ID

            const docRef = doc(projectExtensionFirestore, 'chats', chatId);

            try {
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const chatDataValue = docSnap.data();

                    // Set the state or perform any other actions with the chat data
                    setChatDatas(chatDataValue);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        };

        fetchChatData();
    }, []);
    //CHAT DATA
    const updateReadby = async (idValue) => {
        try {
            const fieldUpdate = collection(projectExtensionFirestore, 'chats');
            await updateDoc(doc(fieldUpdate, idValue), {
                customerRead: true
            });
        } catch (error) {
            console.error('Error updating message:', error);
        }
    }
    const [showInMobile, setShowInMobile] = useState(false);
    useEffect(() => {
        if (screenWidth <= 768) {
            setShowInMobile(true);
            setHideLeft(false);
            setMiddleVisible(true)
        }
    }, [screenWidth])
    const [hideLeft, setHideLeft] = useState(false)
    const [activeChatId, setActiveChatId] = useState(null);
    //

    const [chatField, setChatField] = useState([]);
    console.log('CHAT FIELD ID ON MAIN', chatField.stepIndicator)

    useEffect(() => {
        // Define the reference to the chat document with the specific chatId
        const chatRef = doc(projectExtensionFirestore, 'chats', chatId);

        // Listen for real-time updates to the document
        const unsubscribe = onSnapshot(chatRef, (chatDocSnapshot) => {
            if (chatDocSnapshot.exists()) {
                // Extract the carId, carName, and carRefNumber from the document data
                const chatData = chatDocSnapshot.data();
                if (chatData) {
                    setChatField(chatData);
                }

            }
        }, (error) => {
            console.error('Error listening to chat document:', error);
        });

        return () => {
            // Unsubscribe from the listener when the component unmounts
            unsubscribe();
        };
    }, [chatId]);
    //

    const categories = [
        { id: '10', title: 'ALL CHATS' },
        { id: '1', title: 'NEGOTIATION' },
        { id: '2', title: 'PROFORMA INVOICE' },
        { id: '3', title: 'ORDER ITEM' },
        { id: '4', title: 'PAYMENT CONFIRMATION' },
        { id: '5', title: 'SHIPPING SCHEDULE' },
        { id: '6', title: 'COPY OF B/L' },
        { id: '8', title: 'DOCUMENTATION' },
        { id: '9', title: 'ITEM RECEIVED' },
    ];

    const renderItem = ({ item }) => {
        const isHighlighted = chatField.stepIndicator && chatField.stepIndicator[`value`].toString() === item.id;
        return (
            <Pressable
                style={({ pressed, hovered }) => [

                    {
                        backgroundColor: isHighlighted ? '#E1EDF7' : (hovered ? '#DADDE1' : '#fff'),
                        opacity: pressed ? 0.5 : 1,
                        borderRadius: 5,
                        marginLeft: 5,
                        width: 200,
                        marginTop: 5,
                        padding: 5
                    }
                ]}
                onPress={() => {
                    // handle press
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1
                }}>
                    <Text>{item.title}</Text>
                </View>
            </Pressable>
        );

    }

    return (
        <View style={{ flex: 3 }}>

            <View style={{ flexDirection: 'row' }}>
                {screenWidth < 768 ? (
                    sidebarOpen && (
                        <View
                            style={{
                                width: 100,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                backgroundColor: '#fff',
                                position: 'sticky',
                                top: 0,
                                height: '100vh',
                                borderRightWidth: 1,
                                borderRightColor: '#ccc',
                            }}
                        >

                            <ScrollView style={{ flexDirection: 'column', width: '100%' }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="user-circle-o" size={40} />
                                </View>

                                <View style={{ alignSelf: 'center', width: '80%', marginBottom: 10 }}>
                                    <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                                </View>

                                <View style={{ padding: 10 }}>
                                    <ProfileOptions />
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <FontAwesome name="history" size={30} />

                                    </Pressable>
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={30} />

                                    </Pressable>
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Fontisto name="favorite" size={30} />
                                    </Pressable>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff', width: '100%', marginBottom: 10 }} />
                                <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="home" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <Entypo name="log-out" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="upload" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <AntDesign name="delete" size={30} />
                                </TouchableOpacity>


                            </ScrollView>

                        </View>
                    )
                )
                    :
                    (
                        <Animated.View
                            style={{
                                width: sidebarWidth,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                                backgroundColor: '#fff',
                                position: 'sticky',
                                top: 0,
                                height: '100vh',
                                borderRightWidth: 1,
                                borderRightColor: '#ccc',
                                zIndex: -999,
                                transform: [
                                    screenWidth > 719 ? { translateX: null } : {
                                        translateX: sidebarAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-sidebarWidth, 0],
                                        }),
                                    },
                                ],
                            }}
                        >

                            <ScrollView style={{ flexDirection: 'column', width: sidebarWidth }} contentContainerStyle={{ justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="user-circle-o" size={40} />

                                </View>

                                <View style={{ alignSelf: 'center', width: '80%', marginBottom: 10 }}>
                                    <View style={{ borderBottomWidth: 2, borderBottomColor: '#ccc', marginVertical: 10 }} />
                                </View>

                                <View style={{ padding: 10 }}>
                                    <ProfileOptions />
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <FontAwesome name="history" size={30} />

                                    </Pressable>
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={30} />

                                    </Pressable>
                                </View>
                                <View style={{ padding: 10, marginTop: -10 }}>
                                    <Pressable
                                        style={({ pressed, hovered }) => ({
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            backgroundColor: hovered ? '#aaa' : null,
                                            width: '100%',
                                            alignSelf: 'center',
                                            borderRadius: 10,
                                            height: 50,
                                            padding: 5,
                                            opacity: pressed ? 0.5 : 1,
                                            justifyContent: 'center'
                                        })}
                                    >
                                        <Fontisto name="favorite" size={30} />
                                    </Pressable>
                                </View>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff', width: '100%', marginBottom: 10 }} />
                                <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="home" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <Entypo name="log-out" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, justifyContent: 'center' }}>
                                    <FontAwesome name="upload" size={30} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                                    <AntDesign name="delete" size={30} />
                                </TouchableOpacity>


                            </ScrollView>

                        </Animated.View>
                    )}
                <ScrollView style={{ height: '100vh' }}>
                    <View
                        style={{
                            height: '100%',
                            maxHeight: '5vh',
                            minHeight: 30,
                            borderBottomWidth: .5,
                            borderBottomColor: '#ccc',
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                        }}
                    >

                        <FlatList
                            data={categories}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />

                    </View>


                    <View style={{ flexDirection: 'row', height: '95vh' }}>
                        {hideLeft && (
                            <ScrollView style={{ borderRightWidth: .5, borderRightColor: '#ccc', width: '100%', maxWidth: screenWidth < 768 ? null : 350, }}>
                                <InformationDataLeft setShowInMobile={setShowInMobile} setHideLeft={setHideLeft} hideLeft={hideLeft} setRightVisible={setRightVisible} setSidebarOpen={setSidebarOpen} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                            </ScrollView>
                        )}
                        {middleVisible && (
                            <>
                                {screenWidth <= 768 ? (
                                    <>
                                        {showInMobile && (
                                            <>
                                                <View style={{ flexDirection: 'column', flex: 3, height: '100%', zIndex: -10 }}>

                                                    <View style={{ position: 'sticky' }}>
                                                        <InformationData currentStep={currentStep} totalSteps={totalSteps} requestToggleRight={requestToggleRight} setShowInMobile={setShowInMobile} setHideLeft={setHideLeft} hideLeft={hideLeft} />
                                                    </View>

                                                    <ScrollView
                                                        horizontal={true} // Enable horizontal scrolling
                                                        style={{ flexGrow: screenWidth <= 768 ? 1 : null }}
                                                        contentContainerStyle={{ minWidth: 300, width: '100%' }} // Set the minimum width here
                                                    >
                                                        <View style={{ flexDirection: 'column', width: '100%' }}>
                                                            <ScrollView style={{ height: '100%' }}
                                                                onScroll={handleScroll}
                                                                scrollEventThrottle={16}
                                                                ref={scrollViewRef}
                                                                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                                                            >
                                                                <ChatD selectedChatId={selectedChatId} openModalRequest={openModalRequest} handleScroll={handleScroll} scrollViewRef={scrollViewRef} modalVisible={modalVisible} />
                                                            </ScrollView>
                                                            <View>
                                                                <TextInputForChat scrollViewRef={scrollViewRef} />
                                                            </View>
                                                        </View>
                                                    </ScrollView>

                                                </View>


                                                {rightVisible ? (
                                                    <ScrollView ref={scrollViewRightRef} style={screenWidth < 1260 ? styles.scrollViewSmallScreen : styles.scrollViewDefault}>
                                                        <InformationDataRight
                                                            currentStep={currentStep}
                                                            totalSteps={totalSteps}
                                                            openModalRequest={openModalRequest}
                                                            modalVisible={modalVisible}
                                                            handleButtonClick={handleButtonClick}
                                                        />
                                                    </ScrollView>
                                                ) : null}




                                                {chatDatas === null ? (
                                                    <ScrollView style={{ width: 300, height: '100vh' }}>

                                                        <View style={{
                                                            justifyContent: 'space-around',
                                                            marginTop: 5,
                                                            width: '100%'
                                                        }}>
                                                            <Text style={{ fontWeight: '700', }}>PROFORMA INVOICE</Text>

                                                            <View style={{
                                                                borderWidth: 1,
                                                                borderColor: 'black',
                                                                padding: 10,
                                                            }}>
                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Full Name</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.fullName}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Address</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.address}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>City</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.city}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Country</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.country}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Tel Num</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.telNumber}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Email</Text>
                                                                <Text>{chatDatas?.proformaInvoice.customerInfo.email}</Text>
                                                            </View>


                                                            <View style={{
                                                                borderWidth: 1,
                                                                borderColor: 'black',
                                                                padding: 10,
                                                            }}>
                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Full Name</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.fullName}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Address</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.address}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>City</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.city}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Country</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.country}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Tel Num</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.telNumber}</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Email</Text>
                                                                <Text>{chatDatas?.proformaInvoice.notifyParty.email}</Text>
                                                            </View>
                                                        </View>

                                                        <View style={{
                                                            justifyContent: 'space-around',
                                                            marginTop: 5,
                                                            width: '100%'
                                                        }}>
                                                            <Text style={{ fontWeight: '700', }}>ORDER INVOICE</Text>

                                                            <View style={{
                                                                borderWidth: 1,
                                                                borderColor: 'black',
                                                                padding: 10,
                                                            }}>
                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Full Name</Text>
                                                                <Text>John Doe</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Address</Text>
                                                                <Text>123 Main Street</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>City</Text>
                                                                <Text>New York</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Country</Text>
                                                                <Text>USA</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Tel Num</Text>
                                                                <Text>(123) 456-7890</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Email</Text>
                                                                <Text>john.doe@example.com</Text>
                                                            </View>


                                                            <View style={{
                                                                borderWidth: 1,
                                                                borderColor: 'black',
                                                                padding: 10,
                                                            }}>
                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Full Name</Text>
                                                                <Text>Jane Smith</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Address</Text>
                                                                <Text>456 Oak Street</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>City</Text>
                                                                <Text>Los Angeles</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Country</Text>
                                                                <Text>USA</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Tel Num</Text>
                                                                <Text>(987) 654-3210</Text>

                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginBottom: 5,
                                                                }}>Email</Text>
                                                                <Text>jane.smith@example.com</Text>
                                                            </View>
                                                        </View>
                                                    </ScrollView>
                                                ) : (
                                                    <></>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <View style={{ flexDirection: 'column', flex: 3, height: '100%', zIndex: -10, minWidth: 300 }}>

                                            <View style={{ position: 'sticky' }}>
                                                <InformationData currentStep={currentStep} totalSteps={totalSteps} requestToggleRight={requestToggleRight} setShowInMobile={setShowInMobile} setHideLeft={setHideLeft} hideLeft={hideLeft} activeChatId={activeChatId} />
                                            </View>

                                            <ScrollView style={{ height: '100%' }}
                                                onScroll={handleScroll}
                                                scrollEventThrottle={16}
                                                ref={scrollViewRef}
                                                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                                            >
                                                <ChatD selectedChatId={selectedChatId} openModalRequest={openModalRequest} handleScroll={handleScroll} scrollViewRef={scrollViewRef} modalVisible={modalVisible} />
                                            </ScrollView>
                                            <View>
                                                <TextInputForChat scrollViewRef={scrollViewRef} />
                                            </View>

                                        </View>


                                        {rightVisible ? (
                                            <ScrollView ref={scrollViewRightRef} style={screenWidth < 1260 ? styles.scrollViewSmallScreen : styles.scrollViewDefault}>
                                                <InformationDataRight
                                                    currentStep={currentStep}
                                                    totalSteps={totalSteps}
                                                    openModalRequest={openModalRequest}
                                                    modalVisible={modalVisible}
                                                    handleButtonClick={handleButtonClick}
                                                />
                                            </ScrollView>
                                        ) : null}


                                        {chatDatas === null ? (
                                            <ScrollView style={{ width: 300, height: '100vh' }}>

                                                <View style={{
                                                    justifyContent: 'space-around',
                                                    marginTop: 5,
                                                    width: '100%'
                                                }}>
                                                    <Text style={{ fontWeight: '700', }}>PROFORMA INVOICE</Text>

                                                    <View style={{
                                                        borderWidth: 1,
                                                        borderColor: 'black',
                                                        padding: 10,
                                                    }}>
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Full Name</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.fullName}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Address</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.address}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>City</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.city}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Country</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.country}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Tel Num</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.telNumber}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Email</Text>
                                                        <Text>{chatDatas?.proformaInvoice.customerInfo.email}</Text>
                                                    </View>


                                                    <View style={{
                                                        borderWidth: 1,
                                                        borderColor: 'black',
                                                        padding: 10,
                                                    }}>
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Full Name</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.fullName}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Address</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.address}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>City</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.city}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Country</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.country}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Tel Num</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.telNumber}</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Email</Text>
                                                        <Text>{chatDatas?.proformaInvoice.notifyParty.email}</Text>
                                                    </View>
                                                </View>

                                                <View style={{
                                                    justifyContent: 'space-around',
                                                    marginTop: 5,
                                                    width: '100%'
                                                }}>
                                                    <Text style={{ fontWeight: '700', }}>ORDER INVOICE</Text>

                                                    <View style={{
                                                        borderWidth: 1,
                                                        borderColor: 'black',
                                                        padding: 10,
                                                    }}>
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Full Name</Text>
                                                        <Text>John Doe</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Address</Text>
                                                        <Text>123 Main Street</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>City</Text>
                                                        <Text>New York</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Country</Text>
                                                        <Text>USA</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Tel Num</Text>
                                                        <Text>(123) 456-7890</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Email</Text>
                                                        <Text>john.doe@example.com</Text>
                                                    </View>


                                                    <View style={{
                                                        borderWidth: 1,
                                                        borderColor: 'black',
                                                        padding: 10,
                                                    }}>
                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Full Name</Text>
                                                        <Text>Jane Smith</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Address</Text>
                                                        <Text>456 Oak Street</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>City</Text>
                                                        <Text>Los Angeles</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Country</Text>
                                                        <Text>USA</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Tel Num</Text>
                                                        <Text>(987) 654-3210</Text>

                                                        <Text style={{
                                                            fontWeight: 'bold',
                                                            marginBottom: 5,
                                                        }}>Email</Text>
                                                        <Text>jane.smith@example.com</Text>
                                                    </View>
                                                </View>
                                            </ScrollView>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                )}

                            </>
                        )}




                    </View>
                </ScrollView>



            </View >
        </View >

    )

}

export default ProfileFormChatGroup;

const styles = StyleSheet.create({
    profileHeader: {
        alignItems: 'center',
        padding: 10,
    },
    divider: {
        alignSelf: 'center',
        width: '80%',
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        marginVertical: 10,
    },
    profileOptions: {
        padding: 10,
    },
    pressableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECEDF0',
        borderRadius: 10,
        height: 50,
        padding: 5,
        marginVertical: 5, // Consistent vertical margin
        width: '100%',
        justifyContent: 'center',
    },
    touchableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5, // Consistent vertical margin
        padding: 10,
    },
    scrollViewDefault: {
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: '#ccc',
        zIndex: 10,
        maxWidth: 300,
        width: '100%',
    },
    scrollViewSmallScreen: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: 300,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 20,
        zIndex: 1000,

    },
    container: {
        paddingTop: "60px",
    },
    chatContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '60%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'gray',
        padding: 5,
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fff',

    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        margin: 5,
        borderRadius: 5,
        height: 40
    },
    sendButton: {
        backgroundColor: 'blue',
        color: 'white',
        padding: 10,
        borderRadius: 5,
    },

});





