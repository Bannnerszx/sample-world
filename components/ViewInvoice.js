import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Linking, ScrollView, Animated, Modal, Pressable, TextInput, FlatList, Image, ActivityIndicator, Platform, Button } from 'react-native';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesome, FontAwesome5, Entypo, MaterialCommunityIcons, Ionicons, AntDesign, Fontisto } from 'react-native-vector-icons';
import { getFirestore, collection, where, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, addDoc, fetchSignInMethodsForEmail, app, firebaseConfig, projectExtensionFirestore, projectExtensionStorage, projectExtensionFirebase } from '../firebaseConfig';
import { AuthContext } from '../context/AuthProvider';
import { useParams } from 'react-router-dom';
import { getStorage, listAll, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { BrowserRouter, Route, useNavigate, Link, useHistory } from 'react-router-dom';
import ProgressStepper from './ProgressStepper';
import jsPDF from 'jspdf';
import blankPDF from '../assets/BLANK PDF.png'

const ViewInvoice = () => {
    const { chatId } = useParams();
    const { userEmail } = useContext(AuthContext);
    console.log('chatId', chatId)
    //database fetching
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

    //fetching the logo
    const [logoURL, setLogoURL] = useState('');

    useEffect(() => {
        const carFolderRef = ref(projectExtensionStorage, 'Logo');

        const fetchFirstImage = async () => {
            try {
                const items = await listAll(carFolderRef);

                if (items.items.length > 0) {
                    const imageUrl = await getDownloadURL(items.items[0]);
                    setLogoURL(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching first image:', error);
            }
        };

        fetchFirstImage();
    }, []);

    //fetching account email


    //fetching account email
    const [carData, setCarData] = useState({});
    console.log('ALL CARDATA:', carData)
    useEffect(() => {
        const fetchCarData = async () => {
            const vehicleDocRef = doc(projectExtensionFirestore, 'VehicleProducts', carId);

            try {
                const vehicleDoc = await getDoc(vehicleDocRef);
                if (vehicleDoc.exists()) {
                    const vehicleData = vehicleDoc.data();
                    setCarData(vehicleData);
                } else {
                    // Vehicle data not found, set a specific message or data
                    navigate('/vehicle-not-found');// You can set a custom message or data here
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                // Handle the error, e.g., display an error message.
            }
        };

        if (carId) {
            fetchCarData();
        }
    }, [carId]);

    const [strings, setStrings] = useState([]);
    console.log('strings after setStrings:', carData.regYear);
    //fetching the user's information
    const carFeatures = {
        SafetySystemAnBrSy: carData.SafetySystemAnBrSy ? 'Anti-Lock Braking System (ABS)' : '',
        SafetySystemDrAi: carData.SafetySystemDrAi ? 'Driver Airbag' : '',
        SafetySystemPaAi: carData.SafetySystemPaAi ? 'Passenger Airbag' : '',
        SafetySystemSiAi: carData.SafetySystemSiAi ? 'Side Airbag' : '',
        ComfortAiCoFr: carData.ComfortAiCoFr ? 'Air Conditioning (Front)' : '',
        ComfortAiCoRe: carData.ComfortAiCoRe ? 'Air Conditioning (Rear)' : '',
        ComfortAMFMRa: carData.ComfortAMFMRa ? 'AM/FM Radio' : '',
        ComfortAMFMSt: carData.ComfortAMFMSt ? 'AM/FM Stereo' : '',
        ComfortCDPl: carData.ComfortCDPl ? 'CD Player' : '',
        ComfortCDCh: carData.ComfortCDCh ? 'CD Changer' : '',
        ComfortCrSpCo: carData.ComfortCrSpCo ? 'Cruise Speed Control' : '',
        ComfortDiSp: carData.ComfortDiSp ? 'Digital Speedometer' : '',
        ComfortDVDPl: carData.ComfortDVDPl ? 'DVD Player' : '',
        ComfortHDD: carData.ComfortHDD ? 'Hard Disk Drive' : '',
        ComfortNaSyGPS: carData.ComfortNaSyGPS ? 'Navigation System (GPS)' : '',
        ComfortPoSt: carData.ComfortPoSt ? 'Power Steering' : '',
        ComfortPrAuSy: carData.ComfortPrAuSy ? 'Premium Audio System' : '',
        ComfortReKeSy: carData.ComfortReKeSy ? 'Remote Keyless System' : '',
        ComfortTiStWh: carData.ComfortTiStWh ? 'Tilt Steering Wheel' : '',
        InteriorLeSe: carData.InteriorLeSe ? 'Leather Seats' : '',
        InteriorPoDoLo: carData.InteriorPoDoLo ? 'Power Door Locks' : '',
        InteriorPoMi: carData.InteriorPoMi ? 'Power Mirrors' : '',
        InteriorPoSe: carData.InteriorPoSe ? 'Power Seats' : '',
        InteriorPoWi: carData.InteriorPoWi ? 'Power Windows' : '',
        InteriorReWiDe: carData.InteriorReWiDe ? 'Rear Window Defroster' : '',
        InteriorReWiWi: carData.InteriorReWiWi ? 'Rear Window Wiper' : '',
        InteriorThRoSe: carData.InteriorThRoSe ? 'Third Row Seats' : '',
        InteriorTiGl: carData.InteriorTiGl ? 'Tinted Glasses' : '',
        ExteriorAlWh: carData.ExteriorAlWh ? 'Alloy Wheels' : '',
        ExteriorPoSlDo: carData.ExteriorPoSlDo ? 'Power Sliding Door' : '',
        ExteriorSuRo: carData.ExteriorSuRo ? 'Sunroof' : '',
        SellingPointsCuWh: carData.SellingPointsCuWh ? 'Customized Wheels' : '',
        SellingPointsFuLo: carData.SellingPointsFuLo ? 'Fully Loaded' : '',
        SellingPointsMaHiAv: carData.SellingPointsMaHiAv ? 'Maintenance History Available' : '',
        SellingPointsBrNeTi: carData.SellingPointsBrNeTi ? 'Brand New Tires' : '',
        SellingPointsNoAcHi: carData.SellingPointsNoAcHi ? 'No Accident History' : '',
        SellingPointsNoSmPrOw: carData.SellingPointsNoSmPrOw ? 'Non-Smoking Previous Owner' : '',
        SellingPointsOnOwHi: carData.SellingPointsOnOwHi ? 'One Owner History' : '',
        SellingPointsPeRaTi: carData.SellingPointsPeRaTi ? 'Performance-rated Tires' : '',
        SellingPointsReBo: carData.SellingPointsReBo ? 'Repainted Body' : '',
        SellingPointsTuEn: carData.SellingPointsTuEn ? "Turbo Engine" : '',
        SellingPointsUpAuSy: carData.SellingPointsUpAuSy ? "Upgraded Audio System" : ''
    };
    function displayFeature(feature) {
        return feature ? feature : null;
    }
    let layout = [
        displayFeature(carFeatures.SafetySystemAnBrSy),
        displayFeature(carFeatures.SafetySystemDrAi),
        displayFeature(carFeatures.SafetySystemPaAi),
        displayFeature(carFeatures.SafetySystemSiAi),
        displayFeature(carFeatures.ComfortAiCoFr),
        displayFeature(carFeatures.ComfortAiCoRe),
        displayFeature(carFeatures.ComfortAMFMRa),
        displayFeature(carFeatures.ComfortAMFMSt),
        displayFeature(carFeatures.ComfortCDPl),
        displayFeature(carFeatures.ComfortCDCh),
        displayFeature(carFeatures.ComfortCrSpCo),
        displayFeature(carFeatures.ComfortDiSp),
        displayFeature(carFeatures.ComfortDVDPl),
        displayFeature(carFeatures.ComfortHDD),
        displayFeature(carFeatures.ComfortNaSyGPS),
        displayFeature(carFeatures.ComfortPoSt),
        displayFeature(carFeatures.ComfortPrAuSy),
        displayFeature(carFeatures.ComfortReKeSy),
        displayFeature(carFeatures.ComfortTiStWh),
        displayFeature(carFeatures.InteriorLeSe),
        displayFeature(carFeatures.InteriorPoDoLo),
        displayFeature(carFeatures.InteriorPoMi),
        displayFeature(carFeatures.InteriorPoSe),
        displayFeature(carFeatures.InteriorPoWi),
        displayFeature(carFeatures.InteriorReWiDe),
        displayFeature(carFeatures.InteriorReWiWi),
        displayFeature(carFeatures.InteriorThRoSe),
        displayFeature(carFeatures.InteriorTiGl),
        displayFeature(carFeatures.ExteriorAlWh),
        displayFeature(carFeatures.ExteriorPoSlDo),
        displayFeature(carFeatures.ExteriorSuRo),
        displayFeature(carFeatures.SellingPointsCuWh),
        displayFeature(carFeatures.SellingPointsFuLo),
        displayFeature(carFeatures.SellingPointsMaHiAv),
        displayFeature(carFeatures.SellingPointsBrNeTi),
        displayFeature(carFeatures.SellingPointsNoAcHi),
        displayFeature(carFeatures.SellingPointsNoSmPrOw),
        displayFeature(carFeatures.SellingPointsOnOwHi),
        displayFeature(carFeatures.SellingPointsPeRaTi),
        displayFeature(carData.SellingPointsReBo),
        displayFeature(carData.SellingPointsTuEn),
        displayFeature(carData.SellingPointsUpAuSy)
    ].filter(Boolean).join('/');
    useEffect(() => {
        const fetchUserData = async () => {
            const userDocRef = doc(projectExtensionFirestore, 'chats', chatId);
            try {
                const docSnapshot = await getDoc(userDocRef);
                const proformaInvoiceCustomerInfo = docSnapshot.data()?.proformaInvoice;
                if (proformaInvoiceCustomerInfo) {
                    setStrings([
                        proformaInvoiceCustomerInfo.customerInfo.fullName,
                        proformaInvoiceCustomerInfo.customerInfo.address + ' ' + proformaInvoiceCustomerInfo.customerInfo.country,
                        proformaInvoiceCustomerInfo.customerInfo.telNumber,
                        carData.regYear + `/` + carData.regMonth, // Add conditional check for carData
                        carData?.mileage + ' km',
                        carData?.engineDisplacement + 'cc',
                        carData?.steering,
                        carData?.fuel,
                        carData?.transmission,
                        carData?.referenceNumber,
                        carData?.chassisNumber,
                        carData?.bodyType,
                        carData?.doors,
                        carData?.numberOfSeats,
                        carData?.exteriorColor,
                        carData?.driveType,
                        carData?.engineDisplacement + 'cc',
                        carData?.modelCode,
                        carData?.carName + ' ' + carData?.modelCode,
                        carData?.exteriorColor + ' ' + carData?.engineDisplacement + 'cc' + ' ' + carData?.transmission + ' ' + carData?.mileage + ' km' + ' ' + carData?.fuel,
                    ]);
                } else {
                    console.log('No proformaInvoice found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (userEmail && chatId) {
            fetchUserData();
        }
    }, [userEmail, chatId, carData]);

    // const [slicedUserEmail, setSlicedUserEmail] = useState('');
    // useEffect(() => {
    //     const email = chatId.split('_')[2];
    //     setSlicedUserEmail(email);
    // }, [chatId]);
    // if (userEmail !== slicedUserEmail) {
    //     return <Text>You are not authorized to view this invoice.</Text>;
    // }
    const [imageURLs, setImageURLs] = useState([]);
    const [imagesGenerated, setImagesGenerated] = useState(false);

    useEffect(() => {
        const generateImages = () => {
            const newImageURLs = [];
            strings.forEach((string, index) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                switch (index) {
                    case 6:
                        canvas.width = 150;
                        break;
                    case 18:
                        canvas.width = 400;
                        break;
                    case 19:
                        canvas.width = 450;
                        break;
                    case 20:
                        canvas.width = 350;
                        break;
                    case 9:
                        canvas.width = 120;
                        break;
                    case 2:
                        canvas.width = 250;
                        break;
                    default:
                        canvas.width = 300;
                }
                canvas.height = 18;

                switch (index) {
                    case 18:
                        ctx.font = 'bold 14px Arial';
                        break;
                    default:
                        ctx.font = '14px Arial';
                }

                ctx.fillStyle = 'black';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(string, 0, 15);
                newImageURLs[index] = canvas.toDataURL();
            });

            setImageURLs(newImageURLs);
            setImagesGenerated(true);
        };
        generateImages();
    }, [strings]);
    //fetching the user's information

    //fetching the image
    const [firstImageUrl, setFirstImageUrl] = useState(''); // Replace with the actual carId

    useEffect(() => {
        const carFolderRef = ref(projectExtensionStorage, carId);

        const fetchFirstImage = async () => {
            try {
                const items = await listAll(carFolderRef);

                if (items.items.length > 0) {
                    const imageUrl = await getDownloadURL(items.items[0]);
                    setFirstImageUrl(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching first image:', error);
            }
        };

        fetchFirstImage();
    }, [carId]);
    //fetching the image

    //fetch carData



    let description = carData.carDescription;
    if (description) {
        description = description.replace(/★/g, '').replace(/\s+/g, ' ').trim();
    } else {
        console.log("carData.carDescription is undefined");
    }
    const carInfoString = carData.carName + ' ' + description;


    const generatePDFs = () => {
        const doc = new jsPDF();

        doc.addImage(blankPDF, 'JPEG', 0, 10, 210, 280, undefined, 'FAST');
        // var img = document.createElement('img');
        // img.src = firstImageUrl;
        // doc.addImage(img, 'JPEG', 20, 113, 45, 35);
        doc.setFont(undefined, 'bold');
        doc.setFont('helvetica');
        doc.setFontSize(12);
        doc.text(20, 101.1, carInfoString, { maxWidth: 170, charSpace: 0.2 });
        // doc.text(, 20, 110.9, 'left');

        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        //BOX ON THE RIGHT
        doc.text(`${carData.regYear}`, 107, 114, 'right');
        doc.text(`${carData.mileage} km`, 113, 119, 'right');
        doc.text(`${carData.engineDisplacement}cc`, 109.7, 124, 'right');
        doc.text(`${carData.steering}`, 107.8, 129, 'right');
        doc.text(`${carData.fuel}`, 120.2, 133.7, 'right');
        doc.text(`${carData.transmission}`, 113.8, 138, 'right');
        doc.text(`${carData.modelCode}`, 117.6, 143, 'right');
        //BOX ON THE RIGHT

        //REFERENCE NUMBER
        doc.text(`${carData.referenceNumber}`, 197.4, 152.4, 'right');

        //SPECIFIC INFORMATION BOX
        //left side
        doc.text(`${carData.chassisNumber}`, 49.1, 164.9, 'left');
        doc.text(`${carData.bodyType}`, 49.1, 169.4, 'left');
        doc.text(`${carData.chassisNumber}`, 49.1, 164.9, 'left');
        doc.text(`${carData.bodyType}`, 49.1, 169.4, 'left');
        doc.text(`${carData.numberOfSeats}`, 49.1, 174.1, 'left');
        doc.text(`${carData.exteriorColor}`, 49.1, 179.2, 'left');
        //OPTION LAYOUT
        doc.text(layout, 37.4, 183, { maxWidth: 170, align: 'left' });
        //OPTION LAYOUT
        //right side
        doc.text(`${carData.doors}`, 139.9, 164.9, 'left');
        doc.text(`${carData.driveType}`, 139.9, 169.4, 'left');

        //buyer information
        doc.text(strings[0], 15, 55, 'left')
        let lineHeight = doc.internal.getLineHeight() / doc.internal.scaleFactor;
        let lines = doc.splitTextToSize(strings[1], 60).length;
        let blockHeight = lines * lineHeight;
        doc.text(strings[1], 15, 58, { maxWidth: 60, align: 'left' });
        doc.text('Tel Number: ' + strings[2], 15, 58 + blockHeight, 'left');

        //buyer information

        //USED VEHICLE
        doc.setFont(undefined, 'bold');
        doc.setFontSize(7);
        const carName = carData.carName + ' ' + carData.modelCode;
        const carFeatures = carData.exteriorColor + ' ' + carData.engineDisplacement + 'cc' + ' ' + carData.transmission + ' ' + carData.mileage + 'km' + ' ' + carData.fuel;
        doc.text(carName, 16.9, 203, { maxWidth: 170, align: 'left' });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(carFeatures, 16.9, 206, { maxWidth: 170, align: 'left' });
        doc.text(carData.chassisNumber, 36.9, 208.8, { maxWidth: 170, align: 'left' });

        //SPECIFIC INFORMATION BOX

        // Convert the PDF to a data URI
        doc.save('Proforma Invoice.pdf');
        // const pdfDataUri = doc.output('datauristring');

        // // Create a new window to display the PDF
        // const newWindow = window.open();
        // newWindow.document.write('<iframe width="100%" height="100%" src="' + pdfDataUri + '"></iframe>');
    };


    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => generatePDFs()} style={{ padding: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'red', fontWeight: '700', textDecorationLine: 'underline' }}>Proforma Invoice</Text>
            </TouchableOpacity>
            {/* <View style={{ width: '100%', flex: 1, aspectRatio: 0.8 }} ref={targetRef}>
                <Image
                    source={blankPDF}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
                <View style={{ position: 'relative', bottom: '62%', left: '5%' }}>
                    <Image source={{ uri: firstImageUrl }} style={{ width: 400, height: 300, resizeMode: 'cover' }} />
                </View>
            </View> */}
            {/* <button onClick={generateImages}>Generate Image</button> */}
            {/* {showThis && (
                <>
                    <TouchableOpacity onPress={printImage}>
                        <Text>Print Invoice</Text>
                    </TouchableOpacity>
                    <View>
                        <img
                            src={imageURL}
                            style={{ width: '597px', height: '900px' }}
                        />
                    </View>
                </>
            )} */}


        </View>
    );
};

export default ViewInvoice;



// const [hideThis, setHideThis] = useState(false);
// const generatePDF = async (html) => {
//     const pdf = new jsPDF();

//     // Set the scale to fit the content on a single page
//     pdf.internal.scaleFactor = 2.25; // Adjust this value as needed

//     // Convert the HTML content to PDF
//     pdf.fromHTML(html, 15, 15);

//     // Save the PDF
//     pdf.save('output.pdf');
// };
// const printImages = async () => {
//     let printWindow = window.open('', '_blank');
//     printWindow.document.write(html);
//     printWindow.document.close();
//     printWindow.onload = function () {
//         element.style.border = 'none';
//         printWindow.print();
//     };
// };


// const printHTML = async () => {
//     const htmlContent = '<html><body><h1>Hello World</h1></body></html>'; // Your HTML content here

//     try {
//         const { uri } = await Print.printAsync({
//             html: htmlContent,
//         });
//         console.log('Printed document at:', uri);
//     } catch (error) {
//         console.error('Error printing:', error);
//     }
// };

// const downloadPdf = (element) => {
//     html2canvas(element).then((canvas) => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF();
//         pdf.addImage(imgData, 'PNG', 0, 0);
//         pdf.save('downloaded.pdf');
//     });
// };

// const handleDownload = () => {
//     const element = document.getElementById('your-html-container-id'); // Change this to the specific element you want to convert
//     downloadPdf(element);
// };
// const createAndDownloadPDF = () => {
//     // Create a new jsPDF instance
//     const pdf = new jsPDF();

//     // Use the html() method of jsPDF instance to add the HTML content to the PDF
//     pdf.html(html, {
//         callback: function (pdf) {
//             // Save the PDF with a name
//             pdf.save('download.pdf');

//             // Convert the PDF to a data URL
//             const pdfDataUrl = pdf.output('datauristring');

//             // Create an iframe and append it to the body
//             const iframe = document.createElement('iframe');
//             iframe.style.width = '100%';
//             iframe.style.height = '100%';
//             document.body.appendChild(iframe);

//             // Set the src of the iframe to the data URL of the PDF
//             iframe.src = pdfDataUrl;
//         }
//     });
// };
// const handlePrint = () => {
//     const printWindow = window.open('', '_blank');
//     const htmlToPrint = `
//       <style type="text/css">
//         @media print {
//           @page {
//             margin: 0;
//           }
//           body {
//             border: none !important;
//           }
//         }
//       </style>
//     ` + html;
//     printWindow.document.write(htmlToPrint);
//     printWindow.document.close();
//     printWindow.print();
// };
