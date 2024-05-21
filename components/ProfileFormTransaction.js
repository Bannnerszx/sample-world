import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, FlatList, Image, TextInput } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
import { Popover, NativeBaseProvider, Button, Box, Icon } from 'native-base';
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigate } from 'react-router-dom';
import {
  firebaseConfig,
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { projectExtensionFirestore, projectExtensionStorage, } from '../firebaseConfig';
import {
  storage,
  listAll,
} from 'firebase/storage';
import { ref, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../context/AuthProvider'
import { isElement } from 'lodash';



const ProfileOptions = () => {
  const styles = StyleSheet.create({
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 16,
    },
    image: {
      width: 50,
      height: 50,
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    quantity: {
      fontSize: 14,
      color: '#555',
    },
    date: {
      fontSize: 12,
      color: '#888',
    },
    processedStatus: {
      color: 'orange',
      fontWeight: 'bold',
    },
    completedStatus: {
      color: 'green',
      fontWeight: 'bold',
    },
    helpButton: {
      backgroundColor: 'lightblue',
      padding: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    helpButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    detailsButton: {
      backgroundColor: 'green',
      padding: 8,
      borderRadius: 4,
    },
    detailsButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
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
          backgroundColor: hovered ? '#aaa' : <></>,
          width: '100%',
          alignSelf: 'center', // Center the Pressable horizontally
          borderRadius: 10,
          height: 50,
          padding: 5,
          opacity: pressed ? 0.5 : 1,
          // Adding some border radius for a rounded appearance
        })}
      >

        <MaterialCommunityIcons name="account" size={30} />
        <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>My Account</Text>

      </Pressable>
      {showProfileOptions && (
        <View style={{ marginLeft: 40 }}>
          <TouchableOpacity onPress={() => navigate('/Profile')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('/ProfilePassword')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ marginLeft: 10, fontSize: 16 }}>Password</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const ProfileFormTransaction = () => {




  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userEmail, logout, profileDataAuth } = useContext(AuthContext);
  const sidebarWidth = 250; // Adjust the sidebar width as needed
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  // Function to open the sidebar
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

  const navigate = useNavigate();
  //BREAKPOINT
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  useEffect(() => {
    const handleDimensionsChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => subscription.remove();
  }, []);


  //BREAKPOINT
  const [transactions, setTransactions] = useState([]);
  const user = userEmail ? userEmail : null;
  console.log('transactions', transactions)
  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        const accountRef = doc(projectExtensionFirestore, 'accounts', user);
        try {
          const docSnap = await getDoc(accountRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (Array.isArray(userData.transactions)) {
              setTransactions(userData.transactions);
            } else {
              console.warn("Transactions is not an array:", userData.transactions);
              setTransactions([]);
            }
          } else {
            console.log("No such document!");
            setTransactions([]);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    fetchTransactions();
  }, [user]);



  //dropdown ends here
  //scrollable
  const [isScrolling, setIsScrolling] = useState(false);
  const flatListRef = useRef(null);

  const menuItems = [
    'All',
    'Negotiation',
    'Received Invoice',
    'Ordered Items',
    'Payment',
    'To Ship',
    'Finished Documents',
    'Completed',
    'Cancelled',
  ];

  const handleScroll = () => {
    setIsScrolling(!isScrolling);
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderItem = ({ item }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 16,
      width: '90%',
      alignSelf: 'center',
      backgroundColor: '#fff',
    }}>
      <Image source={{ uri: item.imageUrl }} style={{
        width: '15%',
        aspectRatio: 1.3,
        resizeMode: 'cover',
        marginRight: 16,
        borderRadius: 4,
      }} />
      <View style={{ flex: 1, justifyContent: 'space-between', height: '100%' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
          }}>{item.carName}</Text>
          <Text style={{
            fontSize: 12,
            color: '#888',
          }}>{item.stockId}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ flex: 1, fontSize: 12, color: '#888' }}>DATE HERE</Text>
          <TouchableOpacity style={{
            backgroundColor: 'transparent',
            padding: 8,
            borderRadius: 4,
            marginRight: 8,
          }}>
            <Text style={{
              color: 'blue',
              fontWeight: 'bold',
            }}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            backgroundColor: 'green',
            padding: 8,
            borderRadius: 4,
          }}>
            <Text style={{
              color: 'white',
              fontWeight: 'bold',
            }}>See Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  //scrollable
  return (

    <View style={{ flex: 3 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 3
      }}>

        {screenWidth < 993 ? (
          sidebarOpen && (
            <Modal
              visible={sidebarOpen}
              transparent={true}
              animationType="slideRight"
              onRequestClose={closeSidebar}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'flex-end',
                }}
                activeOpacity={1}
                onPress={closeSidebar}
              >
                <Animated.View style={{
                  width: sidebarWidth,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  backgroundColor: '#fff',
                  position: 'sticky',
                  top: 0,
                  height: '100%',
                  shadowColor: 'rgba(3, 3, 3, 0.1)',
                  shadowOffset: { width: 2, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 2,
                  elevation: 2,
                  transform: [
                    screenWidth > 719 ? { translateX: null } : {
                      translateX: sidebarAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-sidebarWidth, 0],
                      }),
                    },
                  ],

                  // Position the navigation bar at the top of the screen
                }}>

                  {/*LET THIS BE THE LEFT NAV BAR*/}
                  <ScrollView style={{ flexDirection: 'column' }} contentContainerStyle={{ justifyContent: 'center' }} >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                      <FontAwesome name="user-circle-o" size={40} />
                      <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>Marc Van Cabaguing</Text>
                    </View>

                    <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
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
                          backgroundColor: hovered ? '#aaa' : <></>,
                          width: '100%',
                          alignSelf: 'center', // Center the Pressable horizontally
                          borderRadius: 10,
                          height: 50,
                          padding: 5,
                          opacity: pressed ? 0.5 : 1,
                          // Adding some border radius for a rounded appearance
                        })}
                      >
                        <FontAwesome name="history" size={30} />
                        <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                      </Pressable>
                    </View>
                    <View style={{ padding: 10, marginTop: -10 }}>
                      <Pressable
                        style={({ pressed, hovered }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 10,
                          backgroundColor: hovered ? '#aaa' : <></>,
                          width: '100%',
                          alignSelf: 'center', // Center the Pressable horizontally
                          borderRadius: 10,
                          height: 50,
                          padding: 5,
                          opacity: pressed ? 0.5 : 1,
                          justifyConte: 'center'// Adding some border radius for a rounded appearance
                        })}
                      >
                        <Ionicons name="chatbubble-ellipses" size={30} />
                        <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                      </Pressable>
                    </View>
                    <View style={{ padding: 10, marginTop: -10 }}>
                      <Pressable
                        style={({ pressed, hovered }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 10,
                          backgroundColor: hovered ? '#aaa' : <></>,
                          width: '100%',
                          alignSelf: 'center', // Center the Pressable horizontally
                          borderRadius: 10,
                          height: 50,
                          padding: 5,
                          opacity: pressed ? 0.5 : 1,
                          justifyConte: 'center'// Adding some border radius for a rounded appearance
                        })}
                      >
                        <Fontisto name="favorite" size={30} />
                        <Text style={{ marginLeft: 25, fontSize: 18, fontWeight: '500' }}>Favorites</Text>
                      </Pressable>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'white', width: '100%', marginBottom: 10 }} />
                    <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                      <Text>LOGOUT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                      <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                      <Text style={{ color: 'red' }}>Delete Account</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </Animated.View>
              </TouchableOpacity>
            </Modal>
          )
        )
          : (
            <Animated.View style={{
              width: sidebarWidth,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              backgroundColor: '#fff',
              position: 'sticky',
              top: 0,
              height: '100vh',
              shadowColor: 'rgba(3, 3, 3, 0.1)',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 2,
              elevation: 2,
              transform: [
                screenWidth > 719 ? { translateX: null } : {
                  translateX: sidebarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-sidebarWidth, 0],
                  }),
                },
              ],

              // Position the navigation bar at the top of the screen
            }}>

              {/*LET THIS BE THE LEFT NAV BAR*/}
              <ScrollView style={{ flexDirection: 'column' }} contentContainerStyle={{ justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0, padding: 10 }}>
                  <FontAwesome name="user-circle-o" size={40} />
                  <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold' }}>Marc Van Cabaguing</Text>
                </View>

                <View style={{ alignSelf: 'center', width: '100%', marginBottom: 10 }}>
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
                      backgroundColor: hovered ? '#aaa' : <></>,
                      width: '100%',
                      alignSelf: 'center', // Center the Pressable horizontally
                      borderRadius: 10,
                      height: 50,
                      padding: 5,
                      opacity: pressed ? 0.5 : 1,
                      justifyConte: 'center'// Adding some border radius for a rounded appearance
                    })}
                  >
                    <FontAwesome name="history" size={30} />
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Transactions</Text>
                  </Pressable>
                </View>
                <View style={{ padding: 10, marginTop: -10 }}>
                  <Pressable
                    style={({ pressed, hovered }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                      backgroundColor: hovered ? '#aaa' : <></>,
                      width: '100%',
                      alignSelf: 'center', // Center the Pressable horizontally
                      borderRadius: 10,
                      height: 50,
                      padding: 5,
                      opacity: pressed ? 0.5 : 1,
                      justifyConte: 'center'// Adding some border radius for a rounded appearance
                    })}
                  >
                    <Ionicons name="chatbubble-ellipses" size={30} />
                    <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Inquiries Chat</Text>
                  </Pressable>
                </View>
                <View style={{ padding: 10, marginTop: -10 }}>
                  <Pressable
                    style={({ pressed, hovered }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                      backgroundColor: hovered ? '#aaa' : <></>,
                      width: '100%',
                      alignSelf: 'center', // Center the Pressable horizontally
                      borderRadius: 10,
                      height: 50,
                      padding: 5,
                      opacity: pressed ? 0.5 : 1,
                      justifyConte: 'center'// Adding some border radius for a rounded appearance
                    })}
                  >
                    <Fontisto name="favorite" size={30} />
                    <Text style={{ marginLeft: 25, fontSize: 18, fontWeight: '500' }}>Favorites</Text>
                  </Pressable>
                </View>
                <View style={{ borderBottomWidth: 1, borderBottomColor: 'white', width: '100%', marginBottom: 10 }} />
                <TouchableOpacity onPress={() => navigate('/')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                  <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Go To Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                  <Text>LOGOUT</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigate('/UploadScreen')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                  <Text style={{ marginLeft: 10, fontSize: 18, fontWeight: '500' }}>Upload Screen</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 }}>
                  <Text style={{ color: 'red' }}>Delete Account</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          )}

        <ScrollView style={{ padding: 10, height: '100vh' }}  >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Transactions History</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <TextInput
              style={{
                height: 40,
                borderColor: '#ddd',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 10,
                flex: 1,
                marginRight: 10,
              }}
              placeholder="Search Transactions"
            />
            <TouchableOpacity style={{
              backgroundColor: 'black',
              padding: 10,
              borderRadius: 8,
              justifyContent: 'center',
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Search</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
            <TouchableOpacity style={{
              borderColor: '#ddd',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
            }}>
              <Text>All Products</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
            }}
          />

        </ScrollView>





      </View>

    </View>


  );
};

const styles = StyleSheet.create({
  container: {

    paddingTop: "60px",
  },
  containerBox: {
    alignItems: 'center',
    width: '100%',
    margin: 'auto',
    borderRadius: 5,
    justifyContent: 'center'

  },
  menuContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
    boxShadow: '0 2px 5px rgba(3, 3, 3, 0.3)',

  },
  cardContainer: {
    backgroundColor: '#f5f5f5',

    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  imageContainer: {
    marginBottom: 10,

  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  idText: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  dateText: {
    fontStyle: 'italic',
  },
  imageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  layerContainer: {
    marginBottom: 10,
    padding: 10
  },
  layerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#7b9cff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },


});
export default ProfileFormTransaction;