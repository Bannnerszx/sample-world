import { projectTestFirebase, projectTestFirestore, projectExtensionFirestore, projectExtensionFirebase } from "../firebaseConfig";
import React, { useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, FlatList, Text, ScrollView } from 'react-native';
import { where, collection, doc, getDocs, query, onSnapshot, limit, startAfter, orderBy, getDoc } from "firebase/firestore";
const TestServer = () => {









    const dataOptions = [
        { value: 47, name: "Power Windows", fieldTitle: "InteriorPoWi" },
        { value: 48, name: "Power Seats", fieldTitle: "InteriorPoSe" },
        { value: 15, name: "Leather Seats", fieldTitle: "InteriorLeSe" },
        { value: 34, name: "Third Row Seats", fieldTitle: "InteriorThRoSe" },
        { value: 32, name: "Power Mirrors", fieldTitle: "InteriorPoMi" },
        { value: 20, name: "Rear Window Wiper", fieldTitle: "InteriorReWiWi" },
        { value: 49, name: "Tinted Glasses", fieldTitle: "InteriorTiGl" },
        { value: 31, name: "Power Door Locks", fieldTitle: "InteriorPoDoLo" },
        { value: 19, name: "Rear Window Defroster", fieldTitle: "InteriorReWiDe" },
        { value: 30, name: "Alloy Wheels", fieldTitle: "ExteriorAlWh" },
        { value: 33, name: "Sunroof", fieldTitle: "ExteriorSuRo" },
        { value: 5, name: "Power Sliding Door", fieldTitle: "ExteriorPoSlDo" },
        { value: 4, name: "Side Airbag", fieldTitle: "SafetySystemSiAi" },
        { value: 2, name: "Driver Airbag", fieldTitle: "SafetySystemDrAi" },
        { value: 3, name: "Passenger Airbag", fieldTitle: "SafetySystemPaAi" },
        { value: 1, name: "Anti-lock Braking System", fieldTitle: "SafetySystemAnBrSy" },
        { value: 24, name: "CD Changer", fieldTitle: "ComfortCDCh" },
        { value: 12, name: "Tilt Steering Wheel", fieldTitle: "ComfortTiStWh" },
        { value: 26, name: "Premium Audio System", fieldTitle: "ComfortPrAuSy" },
        { value: 29, name: "Hard Disk Drive", fieldTitle: "ComfortHDD" },
        { value: 11, name: "Remote Keyless System", fieldTitle: "ComfortReKeSy" },
        { value: 7, name: "Air Conditioner Rear", fieldTitle: "ComfortAiCoRe" },
        { value: 6, name: "Air Conditioner Front", fieldTitle: "ComfortAiCoFr" },
        { value: 8, name: "Cruise Speed Control", fieldTitle: "ComfortCrSpCo" },
        { value: 23, name: "AM/FM Stereo", fieldTitle: "ComfortAMFMSt" },
        { value: 9, name: "Navigational System GPS", fieldTitle: "ComfortNaSyGPS" },
        { value: 13, name: "Digital Speedometer", fieldTitle: "ComfortDiSp" },
        { value: 28, name: "DVD Player", fieldTitle: "ComfortDVDPl" },
        { value: 10, name: "Power Steering", fieldTitle: "ComfortPoSt" },
        { value: 25, name: "CD Player", fieldTitle: "ComfortCDPl" },
        { value: 43, name: "Performance-Rated Tires", fieldTitle: "SellingPointsPeRaTi" },
        { value: 44, name: "Upgraded Audio System", fieldTitle: "SellingPointsUpAuSy" },
        { value: 36, name: "Customized Wheels", fieldTitle: "SellingPointsCuWh" },
        { value: 38, name: "Maintenance History Available", fieldTitle: "SellingPointsMaHiAv" },
        { value: 37, name: "Fully Loaded", fieldTitle: "SellingPointsFuLo" },
        { value: 42, name: "One Owner History", fieldTitle: "SellingPointsOnOwHi" },
        { value: 40, name: "Brand New Tires", fieldTitle: "SellingPointsBrNeTi" },
        { value: 39, name: "Repainted Body", fieldTitle: "SellingPointsReBo" },
        { value: 45, name: "Non-Smoking Previous Owner", fieldTitle: "SellingPointsNoSmPr" },
        { value: 46, name: "Turbo Engine", fieldTitle: "SellingPointsTuEn" },
        { value: 41, name: "No Accident History", fieldTitle: "SellingPointsNoAcHi" }
    ];
    // processed options
    const [processedVehicles, setProcessedVehicles] = useState([]);


    useEffect(() => {
        const fetchAndProcessData = async () => {
            const q = query(collection(projectTestFirestore, "vehicleData"));
            const querySnapshot = await getDocs(q);
            const processedVehicles = [];
            querySnapshot.forEach((doc) => {
                // Parse the option_cds string into an array of numbers
                const options_cds = JSON.parse(doc.data().option_cds);
                const matchedOptionNames = options_cds.map(cd =>
                    dataOptions.find(item => item.value === cd)?.name
                ).filter(name => name);
                // Maker
                const makerId = doc.data().m_as_maker_id;
                const matchedMaker = dataMaker.find(item => item.value.toString() === makerId);
                const makerName = matchedMaker ? matchedMaker.name : 'Others';
                // Model
                const modelId = doc.data().m_as_model_id;
                const matchedModel = dataModel.find(item => item.value.toString() === modelId);
                const modelName = matchedModel ? matchedModel.name : 'Others';
                //Model

                //Body type
                const bodyTypeId = doc.data().m_as_bodytype_id;
                const matchedBodyType = dataBodyType.find(item => item.value.toString() === bodyTypeId);
                const bodyTypeName = matchedBodyType ? matchedBodyType.name : 'Others';
                //Body type

                //Reference number
                const referenceNumberId = doc.data().reference_no;
                const referenceNUmber = referenceNumberId ? referenceNumberId : 'Others';
                //Reference number

                //buyer/buyer id
                const lastNumber = referenceNUmber.split("-").pop();
                // Match lastNumber with dataBuyer to get buyer's name
                const matchedBuyer = dataBuyer.find(item => item.value === parseInt(lastNumber));
                const buyerName = matchedBuyer ? matchedBuyer.name : 'Unknown';
                //buyer/buyer id

                //chassis number
                const chassisId = doc.data().frame_number;
                const chassisNumber = chassisId
                //chassis number

                //car length width height
                const lengthId = doc.data().length;
                const widthId = doc.data().width;
                const heightId = doc.data().height;

                const dimensionHeight = heightId
                const dimensionWidth = widthId
                const dimensionLength = lengthId
                //car length width height

                //door
                const doorId = doc.data().door_cnt;
                const doors = doorId;
                //door

                //driveType
                const driveTypeId = doc.data().m_as_drivetype_id;
                const matchedDriveType = dataDriveType.find(item => item.value.toString() === driveTypeId);
                const driveType = matchedDriveType.name
                //driveType


                //displacement
                const displacementId = doc.data().displacement;
                const displacement = displacementId;
                //displacement

                //exterior color
                const exteriorColorId = doc.data().exterior_color_cd;
                const matchedExteriorColor = dataColor.find(item => item.value.toString() === exteriorColorId);
                const exteriorColor = matchedExteriorColor.colorValue
                //exterior color

                //fob price
                const fobPriceId = doc.data().fob_price;
                const fobPrice = fobPriceId;
                //fobr price

                //fuel type
                const fuelId = doc.data().m_as_fueltype_id;
                const matchedFuel = dataFuelType.find(item => item.value.toString() === fuelId);
                const fuel = matchedFuel.name
                //fuel type

                //mileage
                const mileageId = doc.data().mileage;
                const mileage = mileageId;
                //mileage

                //model code
                const modelCodeId = doc.data().model_code;
                const modelCode = modelCodeId;
                //model code

                //number of seats
                const numberOfSeatsId = doc.data().number_of_passengers;
                const numberOfSeats = numberOfSeatsId
                //number of seats

                //port
                const portIdTop = doc.data().storage_yard_cd;
                const matchedPort = dataPorts.find(item => item.value.toString() === portIdTop);
                const port = matchedPort.port;
                //port

                //portID
                const portID = matchedPort.portID
                //portID

                //purchase price
                const purchasePriceId = doc.data().stock_price;
                const purchasedPrice = purchasePriceId;
                //purcase price

                //reg year
                const regYearId = doc.data().registration_year;
                const regYear = regYearId;
                //reg year

                //reg year
                const regMonthId = doc.data().registration_month;
                const regMonth = regMonthId;
                //reg year

                //sales
                const salesId = doc.data().sales_person_charge_id;
                const matchedSales = dataSales.find(item => item.value.toString() === salesId);
                const sales = matchedSales.name
                //sales


                //steering
                const steeringId = doc.data().m_as_steering_id;
                const matchedSteering = dataSteering.find(item => item.value.toString() === steeringId);
                const steering = matchedSteering ? matchedSteering.name : ''; // Access 'name' property

                //steering

                //stock id
                const stockIdTop = doc.data().stock_no;
                const stockID = stockIdTop
                //stock id


                //transmission
                const transmissionId = doc.data().m_as_transmission_id;
                const matchedTransmission = dataTransmission.find(item => item.value.toString() === transmissionId);
                const transmission = matchedTransmission.name
                //transmission

                processedVehicles.push({
                    id: doc.id,
                    matchedOptionNames,
                    matchedMaker: makerName,
                    matchedModel: modelName,
                    matchedBodyType: bodyTypeName,
                    referenceNUmber,
                    buyerID: lastNumber,
                    buyerName: buyerName,
                    chassisNumber,
                    dimensionWidth,
                    dimensionHeight,
                    dimensionLength,
                    doors,
                    driveType,
                    displacement,
                    exteriorColor,
                    fobPrice,
                    fuel,
                    mileage,
                    modelCode,
                    numberOfSeats,
                    port,
                    portID,
                    purchasedPrice,
                    regYear,
                    regMonth,
                    sales,
                    steering,
                    stockID,
                    transmission
                });
            });
            setProcessedVehicles(processedVehicles);
        };

        fetchAndProcessData();
    }, []);




    // useEffect(() => {
    //     const fetchAndProcessData = async () => {
    //         const q = query(collection(projectTestFirestore, "vehicleData"));
    //         const querySnapshot = await getDocs(q);
    //         const processedVehicles = [];
    //         querySnapshot.forEach((doc) => {
    //             // Parse the option_cds string into an array of numbers
    //             const options_cds = JSON.parse(doc.data().option_cds);
    //             // Filter and map to get the matching names
    //             const matchedNames = options_cds.map(cd =>
    //                 dataOptions.find(item => item.value === cd)?.name
    //             ).filter(name => name); // Filter out undefined values
    //             processedVehicles.push({ id: doc.id, matchedNames });
    //         });
    //         setProcessedVehicles(processedVehicles);
    //     };

    //     fetchAndProcessData();
    // }, []);
    //processed options

    const dataMaker = [
        {
            value: 43,
            name: "Toyota(334)",
            fieldTitle: "maker"
        },
        {
            value: 42,
            name: "Nissan(97)",
            fieldTitle: "maker"
        },
        {
            value: 50,
            name: "Honda(34)",
            fieldTitle: "maker"
        },
        {
            value: 51,
            name: "Mitsubishi(82)",
            fieldTitle: "maker"
        },
        {
            value: 60,
            name: "Mercedes-Benz(39)",
            fieldTitle: "maker"
        },
        {
            value: 59,
            name: "BMW(48)",
            fieldTitle: "maker"
        },
        {
            value: 48,
            name: "Mazda(61)",
            fieldTitle: "maker"
        },
        {
            value: 46,
            name: "Subaru(17)",
            fieldTitle: "maker"
        },
        {
            value: 58,
            name: "Volkswagen(8)",
            fieldTitle: "maker"
        },
        {
            value: 47,
            name: "Suzuki(8)",
            fieldTitle: "maker"
        },
        {
            value: 49,
            name: "Isuzu(79)",
            fieldTitle: "maker"
        },
        {
            value: 33,
            name: "Ford(11)",
            fieldTitle: "maker"
        },
        {
            value: 44,
            name: "Daihatsu(8)",
            fieldTitle: "maker"
        },
        {
            value: 41,
            name: "Lexus(9)",
            fieldTitle: "maker"
        },
        {
            value: 62,
            name: "Hino(79)",
            fieldTitle: "maker"
        },
        {
            value: 64,
            name: "Mitsubishi Fuso(7)",
            fieldTitle: "maker"
        },
        {
            value: 36,
            name: "Volvo(1)",
            fieldTitle: "maker"
        }
    ];

    //processed maker
    const [processedVehiclesMaker, setProcessedVehiclesMaker] = useState([]);
    // useEffect(() => {
    //     const fetchAndProcessData = async () => {
    //         const q = query(collection(projectTestFirestore, "vehicleData"));
    //         const querySnapshot = await getDocs(q);
    //         const processedVehicles = [];
    //         querySnapshot.forEach((doc) => {
    //             const makerId = doc.data().m_as_maker_id; // 'makerId' is a string
    //             const matchedItem = dataMaker.find(item => item.value.toString() === makerId);
    //             if (matchedItem) {
    //                 processedVehicles.push({ id: doc.id, matchedName: matchedItem.name });
    //             }
    //         });
    //         setProcessedVehiclesMaker(processedVehicles);
    //     };

    //     fetchAndProcessData();
    // }, []);
    //processed maker


    const dataModel = [

        {
            value: "1432",
            name: "86"
        },
        {
            value: "650",
            name: "ALLEX"
        },
        {
            value: "644",
            name: "ALLION"
        },
        {
            value: "648",
            name: "ALPHARD"
        },
        {
            value: "649",
            name: "ALPHARD HYBRID"
        },
        {
            value: "646",
            name: "ALTEZZA"
        },
        {
            value: "647",
            name: "ALTEZZA GITA"
        },
        {
            value: "1427",
            name: "AQUA"
        },
        {
            value: "645",
            name: "ARISTO"
        },
        {
            value: "665",
            name: "AURIS"
        },
        {
            value: "641",
            name: "AVALON"
        },
        {
            value: "642",
            name: "AVENSIS"
        },
        {
            value: "643",
            name: "AVENSIS WAGON"
        },
        {
            value: "626",
            name: "bB"
        },
        {
            value: "627",
            name: "bB OPEN DECK"
        },
        {
            value: "785",
            name: "BELTA"
        },
        {
            value: "778",
            name: "BLADE"
        },
        {
            value: "779",
            name: "BREVIS"
        },
        {
            value: "777",
            name: "BRIZZARD"
        },
        {
            value: "1618",
            name: "C-HR"
        },
        {
            value: "674",
            name: "CALDINA"
        },
        {
            value: "675",
            name: "CALDINA VAN"
        },
        {
            value: "692",
            name: "CAMI"
        },
        {
            value: "668",
            name: "CAMRY"
        },
        {
            value: "669",
            name: "CAMRY GRACIA"
        },
        {
            value: "670",
            name: "CAMRY GRACIA WAGON"
        },
        {
            value: "1417",
            name: "CAMRY HYBRID"
        },
        {
            value: "671",
            name: "CARINA"
        },
        {
            value: "672",
            name: "CARINA ED"
        },
        {
            value: "673",
            name: "CARINA SURF"
        },
        {
            value: "690",
            name: "CAVALIER"
        },
        {
            value: "691",
            name: "CAVALIER COUPE"
        },
        {
            value: "740",
            name: "CELICA"
        },
        {
            value: "741",
            name: "CELICA CONVERTIBLE"
        },
        {
            value: "742",
            name: "CELSIOR"
        },
        {
            value: "743",
            name: "CENTURY"
        },
        {
            value: "754",
            name: "CHASER"
        },
        {
            value: "705",
            name: "CLASSIC"
        },
        {
            value: "711",
            name: "COASTER"
        },
        {
            value: "719",
            name: "COMFORT"
        },
        {
            value: "677",
            name: "COROLLA"
        },
        {
            value: "680",
            name: "COROLLA AXIO"
        },
        {
            value: "682",
            name: "COROLLA CERES"
        },
        {
            value: "684",
            name: "COROLLA FIELDER"
        },
        {
            value: "678",
            name: "COROLLA FX"
        },
        {
            value: "679",
            name: "COROLLA II"
        },
        {
            value: "687",
            name: "COROLLA LEVIN"
        },
        {
            value: "688",
            name: "COROLLA LEVIN HATCHBACK"
        },
        {
            value: "686",
            name: "COROLLA RUMION"
        },
        {
            value: "685",
            name: "COROLLA RUNX"
        },
        {
            value: "681",
            name: "COROLLA SPACIO"
        },
        {
            value: "683",
            name: "COROLLA VAN"
        },
        {
            value: "689",
            name: "COROLLA WAGON"
        },
        {
            value: "714",
            name: "CORONA"
        },
        {
            value: "717",
            name: "CORONA COUPE"
        },
        {
            value: "716",
            name: "CORONA EXIV"
        },
        {
            value: "718",
            name: "CORONA PREMIO"
        },
        {
            value: "715",
            name: "CORONA SF"
        },
        {
            value: "712",
            name: "CORSA"
        },
        {
            value: "713",
            name: "CORSA SEDAN"
        },
        {
            value: "710",
            name: "CRESTA"
        },
        {
            value: "694",
            name: "CROWN ATHLETE"
        },
        {
            value: "696",
            name: "CROWN CONFORT"
        },
        {
            value: "695",
            name: "CROWN ESTATE"
        },
        {
            value: "698",
            name: "CROWN HARDTOP"
        },
        {
            value: "699",
            name: "CROWN HYBRID"
        },
        {
            value: "701",
            name: "CROWN MAJESTA"
        },
        {
            value: "702",
            name: "CROWN ROYAL"
        },
        {
            value: "697",
            name: "CROWN SEDAN"
        },
        {
            value: "700",
            name: "CROWN VAN"
        },
        {
            value: "703",
            name: "CROWN WAGON"
        },
        {
            value: "676",
            name: "CURREN"
        },
        {
            value: "720",
            name: "CYNOS"
        },
        {
            value: "721",
            name: "CYNOS CONVERTIBLE"
        },
        {
            value: "756",
            name: "DUET"
        },
        {
            value: "748",
            name: "DYNA"
        },
        {
            value: "1545",
            name: "Esquire"
        },
        {
            value: "1546",
            name: "EsquireHybrid"
        },
        {
            value: "660",
            name: "ESTIMA"
        },
        {
            value: "661",
            name: "ESTIMA EMINA"
        },
        {
            value: "662",
            name: "ESTIMA HYBRID"
        },
        {
            value: "663",
            name: "ESTIMA LUCIDA"
        },
        {
            value: "628",
            name: "FJ CRUISER"
        },
        {
            value: "772",
            name: "FUNCARGO"
        },
        {
            value: "667",
            name: "GAIA"
        },
        {
            value: "704",
            name: "GRACIA"
        },
        {
            value: "1601",
            name: "GRANACE"
        },
        {
            value: "706",
            name: "GRAND HIACE"
        },
        {
            value: "707",
            name: "GRANVIA"
        },
        {
            value: "768",
            name: "HARRIER"
        },
        {
            value: "769",
            name: "HARRIER HYBRID"
        },
        {
            value: "760",
            name: "HIACE"
        },
        {
            value: "1672",
            name: "Hiace Commuter"
        },
        {
            value: "763",
            name: "HIACE REGIUS"
        },
        {
            value: "761",
            name: "HIACE TRUCK"
        },
        {
            value: "762",
            name: "HIACE VAN"
        },
        {
            value: "764",
            name: "HILUX"
        },
        {
            value: "765",
            name: "HILUX SURF"
        },
        {
            value: "651",
            name: "IPSUM"
        },
        {
            value: "629",
            name: "iQ"
        },
        {
            value: "640",
            name: "ISIS"
        },
        {
            value: "630",
            name: "ist"
        },
        {
            value: "1686",
            name: "JapanTaxi"
        },
        {
            value: "708",
            name: "KLUGER"
        },
        {
            value: "709",
            name: "KLUGER HYBRID"
        },
        {
            value: "805",
            name: "LAND CRUISER 100"
        },
        {
            value: "806",
            name: "LAND CRUISER 200"
        },
        {
            value: "807",
            name: "LAND CRUISER 60"
        },
        {
            value: "808",
            name: "LAND CRUISER 70"
        },
        {
            value: "809",
            name: "LAND CRUISER 80"
        },
        {
            value: "810",
            name: "LAND CRUISER CYGNUS"
        },
        {
            value: "811",
            name: "LAND CRUISER PRADO"
        },
        {
            value: "797",
            name: "LITEACE"
        },
        {
            value: "799",
            name: "LITEACE NOAH"
        },
        {
            value: "800",
            name: "LITEACE NOAH VAN"
        },
        {
            value: "798",
            name: "LITEACE TRUCK"
        },
        {
            value: "801",
            name: "LITEACE VAN"
        },
        {
            value: "791",
            name: "MARK II BLIT"
        },
        {
            value: "789",
            name: "MARK II HARDTOP"
        },
        {
            value: "787",
            name: "MARK II QUALIS"
        },
        {
            value: "788",
            name: "MARK II SEDAN"
        },
        {
            value: "790",
            name: "MARK II VAN"
        },
        {
            value: "792",
            name: "MARK II WAGON"
        },
        {
            value: "793",
            name: "MARK X"
        },
        {
            value: "794",
            name: "MARK X ZIO"
        },
        {
            value: "795",
            name: "MASTER ACE SURF"
        },
        {
            value: "796",
            name: "MEGA CRUISER"
        },
        {
            value: "1554",
            name: "Mirai"
        },
        {
            value: "633",
            name: "MR SPIDER"
        },
        {
            value: "632",
            name: "MR-S"
        },
        {
            value: "631",
            name: "MR2"
        },
        {
            value: "758",
            name: "NADIA"
        },
        {
            value: "759",
            name: "NOAH"
        },
        {
            value: "1496",
            name: "NOAH HYBRID"
        },
        {
            value: "664",
            name: "OPA"
        },
        {
            value: "666",
            name: "ORIGIN"
        },
        {
            value: "766",
            name: "PASSO"
        },
        {
            value: "767",
            name: "PASSO SETTE"
        },
        {
            value: "1440",
            name: "PIXIS EPOCH"
        },
        {
            value: "1612",
            name: "Pixis Joy"
        },
        {
            value: "1585",
            name: "Pixis Mega"
        },
        {
            value: "1418",
            name: "PIXIS SPACE"
        },
        {
            value: "1438",
            name: "PIXIS TRUCK"
        },
        {
            value: "1437",
            name: "PIXIS VAN"
        },
        {
            value: "773",
            name: "PLATZ"
        },
        {
            value: "786",
            name: "PORTE"
        },
        {
            value: "780",
            name: "PREMIO"
        },
        {
            value: "774",
            name: "PRIUS"
        },
        {
            value: "776",
            name: "PRIUS ALPHA"
        },
        {
            value: "775",
            name: "PRIUS EX"
        },
        {
            value: "783",
            name: "PROBOX"
        },
        {
            value: "784",
            name: "PROBOX VAN"
        },
        {
            value: "781",
            name: "PROGRES"
        },
        {
            value: "782",
            name: "PRONARD"
        },
        {
            value: "693",
            name: "QUICK DELIVERY"
        },
        {
            value: "803",
            name: "RACTIS"
        },
        {
            value: "802",
            name: "RAUM"
        },
        {
            value: "634",
            name: "RAV4"
        },
        {
            value: "635",
            name: "RAV4 EV"
        },
        {
            value: "812",
            name: "REGIUS"
        },
        {
            value: "813",
            name: "REGIUS ACE"
        },
        {
            value: "1617",
            name: "Roomy"
        },
        {
            value: "804",
            name: "RUSH"
        },
        {
            value: "636",
            name: "SAI"
        },
        {
            value: "736",
            name: "SCEPTER"
        },
        {
            value: "737",
            name: "SCEPTER COUPE"
        },
        {
            value: "738",
            name: "SCEPTER WAGON"
        },
        {
            value: "739",
            name: "SERA"
        },
        {
            value: "724",
            name: "SIENTA"
        },
        {
            value: "1584",
            name: "sienta hybrid"
        },
        {
            value: "744",
            name: "SOARER"
        },
        {
            value: "745",
            name: "SOARER AEROCABIN"
        },
        {
            value: "1441",
            name: "SPADE"
        },
        {
            value: "727",
            name: "SPARKY"
        },
        {
            value: "728",
            name: "SPRINTER"
        },
        {
            value: "729",
            name: "SPRINTER CARIB"
        },
        {
            value: "730",
            name: "SPRINTER CIELO"
        },
        {
            value: "734",
            name: "SPRINTER MARINO"
        },
        {
            value: "731",
            name: "SPRINTER TRUENO"
        },
        {
            value: "732",
            name: "SPRINTER TRUENO HATCHBACK"
        },
        {
            value: "733",
            name: "SPRINTER VAN"
        },
        {
            value: "735",
            name: "SPRINTER WAGON"
        },
        {
            value: "726",
            name: "STARLET"
        },
        {
            value: "722",
            name: "SUCCEED"
        },
        {
            value: "723",
            name: "SUCCEED VAN"
        },
        {
            value: "725",
            name: "SUPRA"
        },
        {
            value: "1616",
            name: "Tank"
        },
        {
            value: "746",
            name: "TERCEL"
        },
        {
            value: "747",
            name: "TERCEL SEDAN"
        },
        {
            value: "755",
            name: "TOURING HIACE"
        },
        {
            value: "749",
            name: "TOWNACE"
        },
        {
            value: "751",
            name: "TOWNACE NOAH"
        },
        {
            value: "752",
            name: "TOWNACE NOAH VAN"
        },
        {
            value: "750",
            name: "TOWNACE TRUCK"
        },
        {
            value: "753",
            name: "TOWNACE VAN"
        },
        {
            value: "757",
            name: "TOYOACE"
        },
        {
            value: "652",
            name: "VANGUARD"
        },
        {
            value: "656",
            name: "VELLFIRE"
        },
        {
            value: "1416",
            name: "VELLFIRE HYBRID"
        },
        {
            value: "657",
            name: "VEROSSA"
        },
        {
            value: "770",
            name: "VISTA"
        },
        {
            value: "771",
            name: "VISTA ARDEO"
        },
        {
            value: "654",
            name: "VITZ"
        },
        {
            value: "659",
            name: "VOLTZ"
        },
        {
            value: "658",
            name: "VOXY"
        },
        {
            value: "1497",
            name: "VOXY HYBRID"
        },
        {
            value: "639",
            name: "WILL CYPHA"
        },
        {
            value: "637",
            name: "WiLL Vi"
        },
        {
            value: "638",
            name: "WiLL VS"
        },
        {
            value: "655",
            name: "WINDOM"
        },
        {
            value: "653",
            name: "WISH"
        }

        ,
        {
            value: 487,
            name: "180SX(87)",
            fieldTitle: "Nissan"
        },
        {
            value: 488,
            name: "AD(88)",
            fieldTitle: "Nissan"
        },
        {
            value: 491,
            name: "AD EXPERT(91)",
            fieldTitle: "Nissan"
        },
        {
            value: 489,
            name: "AD MAX(89)",
            fieldTitle: "Nissan"
        },
        {
            value: 490,
            name: "AD MAX WAGON(90)",
            fieldTitle: "Nissan"
        },
        {
            value: 492,
            name: "AD VAN(92)",
            fieldTitle: "Nissan"
        },
        {
            value: 493,
            name: "AD WAGON(93)",
            fieldTitle: "Nissan"
        },
        {
            value: 1588,
            name: "Atlas(588)",
            fieldTitle: "Nissan"
        },
        {
            value: 507,
            name: "AUSTER(107)",
            fieldTitle: "Nissan"
        },
        {
            value: 499,
            name: "AVENIR(99)",
            fieldTitle: "Nissan"
        },
        {
            value: 500,
            name: "AVENIR CARGO(100)",
            fieldTitle: "Nissan"
        },
        {
            value: 563,
            name: "BASSARA(163)",
            fieldTitle: "Nissan"
        },
        {
            value: 494,
            name: "Be-1(94)",
            fieldTitle: "Nissan"
        },
        {
            value: 585,
            name: "BLUEBIRD(185)",
            fieldTitle: "Nissan"
        },
        {
            value: 586,
            name: "BLUEBIRD ARX(186)",
            fieldTitle: "Nissan"
        },
        {
            value: 589,
            name: "BLUEBIRD HARDTOP(189)",
            fieldTitle: "Nissan"
        },
        {
            value: 591,
            name: "BLUEBIRD MAXIMA(191)",
            fieldTitle: "Nissan"
        },
        {
            value: 587,
            name: "BLUEBIRD OZ(187)",
            fieldTitle: "Nissan"
        },
        {
            value: 588,
            name: "BLUEBIRD SYLPHY(188)",
            fieldTitle: "Nissan"
        },
        {
            value: 590,
            name: "BLUEBIRD VAN(190)",
            fieldTitle: "Nissan"
        },
        {
            value: 592,
            name: "BLUEBIRD WAGON(192)",
            fieldTitle: "Nissan"
        },
        {
            value: 512,
            name: "CARAVAN(112)",
            fieldTitle: "Nissan"
        },
        {
            value: 511,
            name: "CARAVAN(111)",
            fieldTitle: "Nissan"
        },
        {
            value: 542,
            name: "CEDRIC(142)",
            fieldTitle: "Nissan"
        },
        {
            value: 543,
            name: "CEDRIC SEDAN(143)",
            fieldTitle: "Nissan"
        },
        {
            value: 544,
            name: "CEDRIC VAN(144)",
            fieldTitle: "Nissan"
        },
        {
            value: 545,
            name: "CEDRIC WAGON(145)",
            fieldTitle: "Nissan"
        },
        {
            value: 546,
            name: "CEFIRO(146)",
            fieldTitle: "Nissan"
        },
        {
            value: 547,
            name: "CEFIRO WAGON(147)",
            fieldTitle: "Nissan"
        },
        {
            value: 551,
            name: "CHERRY(151)",
            fieldTitle: "Nissan"
        },
        {
            value: 529,
            name: "CIMA(129)",
            fieldTitle: "Nissan"
        },
        {
            value: 1627,
            name: "CIMA HYBRID(627)",
            fieldTitle: "Nissan"
        },
        {
            value: 1589,
            name: "CIVILIAN(589)",
            fieldTitle: "Nissan"
        },
        {
            value: 1525,
            name: "CIVILIAN BUS(525)",
            fieldTitle: "Nissan"
        },
        {
            value: 516,
            name: "CLIPPER(116)",
            fieldTitle: "Nissan"
        },
        {
            value: 518,
            name: "CLIPPER RIO(118)",
            fieldTitle: "Nissan"
        },
        {
            value: 517,
            name: "CLIPPER TRUCK(117)",
            fieldTitle: "Nissan"
        },
        {
            value: 1590,
            name: "CONDOR(590)",
            fieldTitle: "Nissan"
        },
        {
            value: 519,
            name: "CREW(119)",
            fieldTitle: "Nissan"
        },
        {
            value: 513,
            name: "CUBE(113)",
            fieldTitle: "Nissan"
        },
        {
            value: 514,
            name: "CUBE CUBIC(114)",
            fieldTitle: "Nissan"
        },
        {
            value: 1477,
            name: "DAYZ(477)",
            fieldTitle: "Nissan"
        },
        {
            value: 1501,
            name: "DAYZ ROOX(501)",
            fieldTitle: "Nissan"
        },
        {
            value: 556,
            name: "DUALIS(156)",
            fieldTitle: "Nissan"
        },
        {
            value: 550,
            name: "DUTSUN(150)",
            fieldTitle: "Nissan"
        },
        {
            value: 506,
            name: "ELGRAND(6)",
            fieldTitle: "Nissan"
        },
        {
            value: 503,
            name: "EXPERT(3)",
            fieldTitle: "Nissan"
        },
        {
            value: 577,
            name: "FAIRLADY Z(77)",
            fieldTitle: "Nissan"
        },
        {
            value: 578,
            name: "FAIRLADY Z CONVERTIBLE(78)",
            fieldTitle: "Nissan"
        },
        {
            value: 579,
            name: "FAIRLADY Z ROADSTER(79)",
            fieldTitle: "Nissan"
        },
        {
            value: 574,
            name: "FIGARO(74)",
            fieldTitle: "Nissan"
        },
        {
            value: 575,
            name: "FUGA(75)",
            fieldTitle: "Nissan"
        },
        {
            value: 576,
            name: "FUGA HYBRID(76)",
            fieldTitle: "Nissan"
        },
        {
            value: 509,
            name: "GAZELLE(9)",
            fieldTitle: "Nissan"
        },
        {
            value: 520,
            name: "GLORIA(20)",
            fieldTitle: "Nissan"
        },
        {
            value: 521,
            name: "GLORIA SEDAN(21)",
            fieldTitle: "Nissan"
        },
        {
            value: 522,
            name: "GLORIA VAN(22)",
            fieldTitle: "Nissan"
        },
        {
            value: 523,
            name: "GLORIA WAGON(23)",
            fieldTitle: "Nissan"
        },
        {
            value: 495,
            name: "GT-R(95)",
            fieldTitle: "Nissan"
        },
        {
            value: 599,
            name: "HOMY(99)",
            fieldTitle: "Nissan"
        },
        {
            value: 600,
            name: "HOMY COACH(100)",
            fieldTitle: "Nissan"
        },
        {
            value: 561,
            name: "HYPERMINI(61)",
            fieldTitle: "Nissan"
        },
        {
            value: 501,
            name: "INFINITY Q45(1)",
            fieldTitle: "Nissan"
        },
        {
            value: 530,
            name: "JUKE(30)",
            fieldTitle: "Nissan"
        },
        {
            value: 510,
            name: "KIX(10)",
            fieldTitle: "Nissan"
        },
        {
            value: 610,
            name: "LAFESTA(10)",
            fieldTitle: "Nissan"
        },
        {
            value: 611,
            name: "LAFESTA HIGHWAYSTAR(11)",
            fieldTitle: "Nissan"
        },
        {
            value: 613,
            name: "LANGLEY(13)",
            fieldTitle: "Nissan"
        },
        {
            value: 1539,
            name: "LANGLEY-(139)",
            fieldTitle: "Nissan"
        },
        {
            value: 612,
            name: "LARGO(12)",
            fieldTitle: "Nissan"
        },
        {
            value: 1445,
            name: "LATIO(445)",
            fieldTitle: "Nissan"
        },
        {
            value: 624,
            name: "LAUREL(24)",
            fieldTitle: "Nissan"
        },
        {
            value: 625,
            name: "LAUREL SPIRIT(25)",
            fieldTitle: "Nissan"
        },
        {
            value: 614,
            name: "LEAF(14)",
            fieldTitle: "Nissan"
        },
        {
            value: 622,
            name: "LEOPARD(22)",
            fieldTitle: "Nissan"
        },
        {
            value: 623,
            name: "LEOPARD J.FERRIE(23)",
            fieldTitle: "Nissan"
        },
        {
            value: 616,
            name: "LIBERTA VILLA(16)",
            fieldTitle: "Nissan"
        },
        {
            value: 615,
            name: "LIBERTY(15)",
            fieldTitle: "Nissan"
        },
        {
            value: 618,
            name: "LUCINO(18)",
            fieldTitle: "Nissan"
        },
        {
            value: 620,
            name: "LUCINO COUPE(20)",
            fieldTitle: "Nissan"
        },
        {
            value: 619,
            name: "LUCINO S-RV(19)",
            fieldTitle: "Nissan"
        },
        {
            value: 604,
            name: "MACRA C PLUS C(4)",
            fieldTitle: "Nissan"
        },
        {
            value: 601,
            name: "MARCH(1)",
            fieldTitle: "Nissan"
        },
        {
            value: 602,
            name: "MARCH BOX(2)",
            fieldTitle: "Nissan"
        },
        {
            value: 603,
            name: "MARCH CABRIOLET(3)",
            fieldTitle: "Nissan"
        },
        {
            value: 605,
            name: "MAXIMA(5)",
            fieldTitle: "Nissan"
        },
        {
            value: 606,
            name: "MISTRAL(6)",
            fieldTitle: "Nissan"
        },
        {
            value: 608,
            name: "MOCO(8)",
            fieldTitle: "Nissan"
        },
        {
            value: 607,
            name: "MURANO(7)",
            fieldTitle: "Nissan"
        },
        {
            value: 559,
            name: "NOTE(59)",
            fieldTitle: "Nissan"
        },
        {
            value: 1626,
            name: "NT100Clipper(126)",
            fieldTitle: "Nissan"
        },
        {
            value: 1625,
            name: "NV100Clipper(625)",
            fieldTitle: "Nissan"
        },
        {
            value: 1544,
            name: "NV100Clipper Rio(544)",
            fieldTitle: "Nissan"
        },
        {
            value: 1619,
            name: "NV150 ADVAN(619)",
            fieldTitle: "Nissan"
        },
        {
            value: 496,
            name: "NV200 VANETTE(496)",
            fieldTitle: "Nissan"
        },
        {
            value: 497,
            name: "NV200 VANETTE VAN(497)",
            fieldTitle: "Nissan"
        },
        {
            value: 1628,
            name: "NV350 Caravan(628)",
            fieldTitle: "Nissan"
        },
        {
            value: 498,
            name: "NX COUPE(498)",
            fieldTitle: "Nissan"
        },
        {
            value: 508,
            name: "OTTI(508)",
            fieldTitle: "Nissan"
        },
        {
            value: 562,
            name: "PAO(562)",
            fieldTitle: "Nissan"
        },
        {
            value: 573,
            name: "PINO(573)",
            fieldTitle: "Nissan"
        },
        {
            value: 593,
            name: "PRAIRIE(593)",
            fieldTitle: "Nissan"
        },
        {
            value: 594,
            name: "PRAIRIE JOY(594)",
            fieldTitle: "Nissan"
        },
        {
            value: 595,
            name: "PRAIRIE LIBERTY(595)",
            fieldTitle: "Nissan"
        },
        {
            value: 596,
            name: "PRESAGE(596)",
            fieldTitle: "Nissan"
        },
        {
            value: 598,
            name: "PRESEA(598)",
            fieldTitle: "Nissan"
        },
        {
            value: 597,
            name: "PRESIDENT(597)",
            fieldTitle: "Nissan"
        },
        {
            value: 581,
            name: "PRIMERA(581)",
            fieldTitle: "Nissan"
        },
        {
            value: 580,
            name: "PRIMERA(580)",
            fieldTitle: "Nissan"
        },
        {
            value: 582,
            name: "PRIMERA CAMINOWAGON(582)",
            fieldTitle: "Nissan"
        },
        {
            value: 583,
            name: "PRIMERA HATCHBACK(583)",
            fieldTitle: "Nissan"
        },
        {
            value: 584,
            name: "PRIMERA WAGON(584)",
            fieldTitle: "Nissan"
        },
        {
            value: 568,
            name: "PULSAR(568)",
            fieldTitle: "Nissan"
        },
        {
            value: 569,
            name: "PULSAR EXA(569)",
            fieldTitle: "Nissan"
        },
        {
            value: 570,
            name: "PULSAR SEDAN(570)",
            fieldTitle: "Nissan"
        },
        {
            value: 571,
            name: "PULSAR SERIE(571)",
            fieldTitle: "Nissan"
        },
        {
            value: 572,
            name: "PULSAR SERIE S-RV(572)",
            fieldTitle: "Nissan"
        },
        {
            value: 515,
            name: "QUEST(515)",
            fieldTitle: "Nissan"
        },
        {
            value: 1603,
            name: "Quon(603)",
            fieldTitle: "Nissan"
        },
        {
            value: 609,
            name: "RASHEEN(609)",
            fieldTitle: "Nissan"
        },
        {
            value: 621,
            name: "RNESSA(621)",
            fieldTitle: "Nissan"
        },
        {
            value: 617,
            name: "ROOX(617)",
            fieldTitle: "Nissan"
        },
        {
            value: 505,
            name: "S-CARGO(505)",
            fieldTitle: "Nissan"
        },
        {
            value: 528,
            name: "SAFARI(528)",
            fieldTitle: "Nissan"
        },
        {
            value: 548,
            name: "SERENA(548)",
            fieldTitle: "Nissan"
        },
        {
            value: 549,
            name: "SERENA CARGO(549)",
            fieldTitle: "Nissan"
        },
        {
            value: 531,
            name: "SILVIA(531)",
            fieldTitle: "Nissan"
        },
        {
            value: 533,
            name: "SILVIA CONVERTIBLE(533)",
            fieldTitle: "Nissan"
        },
        {
            value: 532,
            name: "SILVIA VARIETTA(532)",
            fieldTitle: "Nissan"
        },
        {
            value: 534,
            name: "SKYLINE(534)",
            fieldTitle: "Nissan"
        },
        {
            value: 1515,
            name: "SKYLINE  HYBRID(515)",
            fieldTitle: "Nissan"
        },
        {
            value: 535,
            name: "SKYLINE 3DOOR HT(535)",
            fieldTitle: "Nissan"
        },
        {
            value: 538,
            name: "SKYLINE COUPE(538)",
            fieldTitle: "Nissan"
        },
        {
            value: 539,
            name: "SKYLINE CROSSOVER(539)",
            fieldTitle: "Nissan"
        },
        {
            value: 536,
            name: "SKYLINE GT-R(536)",
            fieldTitle: "Nissan"
        },
        {
            value: 537,
            name: "SKYLINE GT-R SEDAN(537)",
            fieldTitle: "Nissan"
        },
        {
            value: 1538,
            name: "SKYLINE HYBRID(538)",
            fieldTitle: "Nissan"
        },
        {
            value: "541",
            name: "STAGEA",
            fieldTitle: "Nissan"
        },
        {
            value: "540",
            name: "STANZA",
            fieldTitle: "Nissan"
        },
        {
            value: "524",
            name: "SUNNY",
            fieldTitle: "Nissan"
        },
        {
            value: "526",
            name: "SUNNY CALIFORNIA",
            fieldTitle: "Nissan"
        },
        {
            value: "525",
            name: "SUNNY RZ-1",
            fieldTitle: "Nissan"
        },
        {
            value: "527",
            name: "SUNNY TRUCK",
            fieldTitle: "Nissan"
        },
        {
            value: "1541",
            name: "SUNNY-TRUCK",
            fieldTitle: "Nissan"
        },
        {
            value: "1455",
            name: "SYLPHY",
            fieldTitle: "Nissan"
        },
        {
            value: "552",
            name: "TEANA",
            fieldTitle: "Nissan"
        },
        {
            value: "557",
            name: "TERRANO",
            fieldTitle: "Nissan"
        },
        {
            value: "558",
            name: "TERRANO REGULUS",
            fieldTitle: "Nissan"
        },
        {
            value: "553",
            name: "TIIDA",
            fieldTitle: "Nissan"
        },
        {
            value: "554",
            name: "TIIDA LATIO",
            fieldTitle: "Nissan"
        },
        {
            value: "555",
            name: "TINO",
            fieldTitle: "Nissan"
        },
        {
            value: "564",
            name: "VANETTE",
            fieldTitle: "Nissan"
        },
        {
            value: "567",
            name: "VANETTE LARGO",
            fieldTitle: "Nissan"
        },
        {
            value: "565",
            name: "VANETTE SERENA",
            fieldTitle: "Nissan"
        },
        {
            value: "566",
            name: "VANETTE TRUCK",
            fieldTitle: "Nissan"
        },
        {
            value: "560",
            name: "VIOLET",
            fieldTitle: "Nissan"
        },
        {
            value: "502",
            name: "WINGROAD",
            fieldTitle: "Nissan"
        },
        {
            value: "504",
            name: "X-TRAIL",
            fieldTitle: "Nissan"
        },
        {
            value: "1580",
            name: "X-TRAIL HYBRID",
            fieldTitle: "Nissan"
        },
        {
            value: "1540",
            name: "リベルタビラ",
            fieldTitle: "Nissan"
        },
        {
            value: 1699,
            name: "N-VAN(1)",
            fieldTitle: "Honda"
        },
        {
            value: 1102,
            name: "AIRWAVE(3)",
            fieldTitle: "Honda"
        },
        {
            value: 1073,
            name: "CR-V(12)",
            fieldTitle: "Honda"
        },
        {
            value: 1140,
            name: "FIT(15)",
            fieldTitle: "Honda"
        },
        {
            value: 1144,
            name: "FIT HYBRID(4)",
            fieldTitle: "Honda"
        },
        {
            value: 1474,
            name: "CANTER(59)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1183,
            name: "COLT(1)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1200,
            name: "DELICA D5(1)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1523,
            name: "FIGHTER(13)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1524,
            name: "FIGHTER MIGNON(1)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1169,
            name: "OUTLANDER(3)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1210,
            name: "PAJERO(1)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1213,
            name: "PAJERO MINI(1)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1166,
            name: "RVR(2)",
            fieldTitle: "Mitsubishi"
        },
        {
            value: 1380,
            name: "B CLASS(2)",
            fieldTitle: "Mercedes-Benz"
        },
        {
            value: 1387,
            name: "C CLASS WAGON(1)",
            fieldTitle: "Mercedes-Benz"
        },
        {
            value: 1385,
            name: "C-CLASS(34)",
            fieldTitle: "Mercedes-Benz"
        },
        {
            value: 1388,
            name: "E CLASS(1)",
            fieldTitle: "Mercedes-Benz"
        },
        {
            value: 1395,
            name: "M CLASS(1)",
            fieldTitle: "Mercedes-Benz"
        },
        {
            value: 1343,
            name: "1 SERIES(14)",
            fieldTitle: "BMW"
        },
        {
            value: 1560,
            name: "2 SERIES ACTIVE TOURER(1)",
            fieldTitle: "BMW"
        },
        {
            value: 1346,
            name: "3 SERIES(13)",
            fieldTitle: "BMW"
        },
        {
            value: 1363,
            name: "X1(9)",
            fieldTitle: "BMW"
        },
        {
            value: 1364,
            name: "X3(9)",
            fieldTitle: "BMW"
        },
        {
            value: 1365,
            name: "X5(2)",
            fieldTitle: "BMW"
        },
        {
            value: 985,
            name: "ATENZA(1)",
            fieldTitle: "Mazda"
        },
        {
            value: 1576,
            name: "Atenza wagon(2)",
            fieldTitle: "Mazda"
        },
        {
            value: 1028,
            name: "BONGO TRUCK(2)",
            fieldTitle: "Mazda"
        },
        {
            value: 1029,
            name: "BONGO VAN(2)",
            fieldTitle: "Mazda"
        },
        {
            value: 1431,
            name: "CX-5(9)",
            fieldTitle: "Mazda"
        },
        {
            value: 1010,
            name: "DEMIO(30)",
            fieldTitle: "Mazda"
        },
        {
            value: 1009,
            name: "TITAN(7)",
            fieldTitle: "Mazda"
        },
        {
            value: 1011,
            name: "TRIBUTE(1)",
            fieldTitle: "Mazda"
        },
        {
            value: 1026,
            name: "VERISA(6)",
            fieldTitle: "Mazda"
        },
        {
            value: 913,
            name: "FORESTER(10)",
            fieldTitle: "Subaru"
        },
        {
            value: 889,
            name: "IMPREZA(1)",
            fieldTitle: "Subaru"
        },
        {
            value: 892,
            name: "IMPREZA ANESIS(1)",
            fieldTitle: "Subaru"
        },
        {
            value: 896,
            name: "IMPREZA HATCHBACK(1)",
            fieldTitle: "Subaru"
        },
        {
            value: 891,
            name: "IMPREZA XV(2)",
            fieldTitle: "Subaru"
        },
        {
            value: 924,
            name: "LEGACY TOURING WAGON(1)",
            fieldTitle: "Subaru"
        },
        {
            value: 1698,
            name: "levorg(1)",
            fieldTitle: "Subaru"
        },
        {
            value: 1322,
            name: "GOLF(6)",
            fieldTitle: "Volkswagen"
        },
        {
            value: 1332,
            name: "TIGUAN(1)",
            fieldTitle: "Volkswagen"
        },
        {
            value: 1446,
            name: "UP!(1)",
            fieldTitle: "Volkswagen"
        },
        {
            value: 953,
            name: "CARRY(3)",
            fieldTitle: "Suzuki"
        },
        {
            value: 935,
            name: "ESCUDO(1)",
            fieldTitle: "Suzuki"
        },
        {
            value: 936,
            name: "EVERY(2)",
            fieldTitle: "Suzuki"
        },
        {
            value: 959,
            name: "SWIFT(2)",
            fieldTitle: "Suzuki"
        },
        {
            value: 1518,
            name: "ELF TRUCK(46)",
            fieldTitle: "Isuzu"
        },
        {
            value: 1521,
            name: "FORWARD(30)",
            fieldTitle: "Isuzu"
        },
        {
            value: 1594,
            name: "giga(4)",
            fieldTitle: "Isuzu"
        },
        {
            value: 361,
            name: "Escape",
            fieldTitle: "Ford"
        },
        {
            value: 848,
            name: "BEGO(2)",
            fieldTitle: "Daihatsu"
        },
        {
            value: 839,
            name: "DELTA WAGON(1)",
            fieldTitle: "Daihatsu"
        },
        {
            value: 832,
            name: "TERIOS KID(5)",
            fieldTitle: "Daihatsu"
        },
        {
            value: 478,
            name: "IS(6)",
            fieldTitle: "Lexus"
        },
        {
            value: 482,
            name: "LS(1)",
            fieldTitle: "Lexus"
        },
        {
            value: 1605,
            name: "LX(1)",
            fieldTitle: "Lexus"
        },
        {
            value: 484,
            name: "RX(1)",
            fieldTitle: "Lexus"
        },
        {
            value: 1587,
            name: "dutro(35)",
            fieldTitle: "Hino"
        },
        {
            value: 1592,
            name: "liesse2(1)",
            fieldTitle: "Hino"
        },
        {
            value: 1593,
            name: "profia(2)",
            fieldTitle: "Hino"
        },
        {
            value: 1516,
            name: "Ranger(42)",
            fieldTitle: "Hino"
        },
        {
            value: 1515,
            name: "Rosa(2)",
            fieldTitle: "Mitsubishi Fuso"
        },
        {
            value: 1595,
            name: "Super Great(42)",
            fieldTitle: "Mitsubishi Fuso"
        },
        {
            value: 414,
            name: "240(14)",
            fieldTitle: "Volvo"
        },
        {
            value: 422,
            name: "240 ESTATE(22)",
            fieldTitle: "Volvo"
        },
        {
            value: 415,
            name: "480(15)",
            fieldTitle: "Volvo"
        },
        {
            value: 416,
            name: "740(16)",
            fieldTitle: "Volvo"
        },
        {
            value: 423,
            name: "740 ESTATE(23)",
            fieldTitle: "Volvo"
        },
        {
            value: 417,
            name: "760(17)",
            fieldTitle: "Volvo"
        },
        {
            value: 424,
            name: "760 ESTATE(24)",
            fieldTitle: "Volvo"
        },
        {
            value: 418,
            name: "780(18)",
            fieldTitle: "Volvo"
        },
        {
            value: 419,
            name: "850(19)",
            fieldTitle: "Volvo"
        },
        {
            value: 425,
            name: "850 ESTATE(25)",
            fieldTitle: "Volvo"
        },
        {
            value: 420,
            name: "940(20)",
            fieldTitle: "Volvo"
        },
        {
            value: 426,
            name: "940 ESTATE(26)",
            fieldTitle: "Volvo"
        },
        {
            value: 421,
            name: "960(21)",
            fieldTitle: "Volvo"
        },
        {
            value: 427,
            name: "960 ESTATE(27)",
            fieldTitle: "Volvo"
        },
        {
            value: 428,
            name: "C30(28)",
            fieldTitle: "Volvo"
        },
        {
            value: 429,
            name: "C70(29)",
            fieldTitle: "Volvo"
        },
        {
            value: 430,
            name: "C70 CABRIOLET(30)",
            fieldTitle: "Volvo"
        },
        {
            value: 431,
            name: "S40(31)",
            fieldTitle: "Volvo"
        },
        {
            value: 432,
            name: "S60(32)",
            fieldTitle: "Volvo"
        },
        {
            value: 433,
            name: "S70(33)",
            fieldTitle: "Volvo"
        },
        {
            value: 434,
            name: "S80(34)",
            fieldTitle: "Volvo"
        },
        {
            value: 435,
            name: "S90(35)",
            fieldTitle: "Volvo"
        },
        {
            value: 436,
            name: "V40(36)",
            fieldTitle: "Volvo"
        },
        {
            value: 1536,
            name: "V40クロスカントリー(536)",
            fieldTitle: "Volvo"
        },
        {
            value: 437,
            name: "V50(37)",
            fieldTitle: "Volvo"
        },
        {
            value: 438,
            name: "V60(38)",
            fieldTitle: "Volvo"
        },
        {
            value: 1656,
            name: "V60クロスカントリー(656)",
            fieldTitle: "Volvo"
        },
        {
            value: 439,
            name: "V70(39)",
            fieldTitle: "Volvo"
        },
        {
            value: 440,
            name: "V70XC(40)",
            fieldTitle: "Volvo"
        },
        {
            value: 441,
            name: "V90(41)",
            fieldTitle: "Volvo"
        },
        {
            value: 1657,
            name: "V90クロスカントリー(657)",
            fieldTitle: "Volvo"
        },
        {
            value: 1696,
            name: "XC40(96)",
            fieldTitle: "Volvo"
        },
        {
            value: 442,
            name: "XC60(42)",
            fieldTitle: "Volvo"
        },
        {
            value: 443,
            name: "XC70(43)",
            fieldTitle: "Volvo"
        },
        {
            value: 444,
            name: "XC90(44)",
            fieldTitle: "Volvo"
        },
        {
            value: 474,
            name: "CT(74)",
            fieldTitle: "Lexus"
        },
        {
            value: 475,
            name: "GS(75)",
            fieldTitle: "Lexus"
        },
        {
            value: 1606,
            name: "GS F(606)",
            fieldTitle: "Lexus"
        },
        {
            value: 476,
            name: "GS HYBRID(76)",
            fieldTitle: "Lexus"
        },
        {
            value: 477,
            name: "HS(77)",
            fieldTitle: "Lexus"
        },
        {
            value: 478,
            name: "IS(78)",
            fieldTitle: "Lexus"
        },
        {
            value: 480,
            name: "IS CONVERTIBLE(80)",
            fieldTitle: "Lexus"
        },
        {
            value: 479,
            name: "IS F(79)",
            fieldTitle: "Lexus"
        },
        {
            value: 1629,
            name: "LC(629)",
            fieldTitle: "Lexus"
        },
        {
            value: 1630,
            name: "LCハイブリッド(630)",
            fieldTitle: "Lexus"
        },
        {
            value: 481,
            name: "LFA(81)",
            fieldTitle: "Lexus"
        },
        {
            value: 482,
            name: "LS(82)",
            fieldTitle: "Lexus"
        },
        {
            value: 483,
            name: "LS HYBRID(83)",
            fieldTitle: "Lexus"
        },
        {
            value: 1605,
            name: "LX(605)",
            fieldTitle: "Lexus"
        },
        {
            value: 1624,
            name: "NX(624)",
            fieldTitle: "Lexus"
        },
        {
            value: 1542,
            name: "NXハイブリッド(542)",
            fieldTitle: "Lexus"
        },
        {
            value: 1535,
            name: "NXハイブリッド(535)",
            fieldTitle: "Lexus"
        },
        {
            value: 1551,
            name: "RC(551)",
            fieldTitle: "Lexus"
        },
        {
            value: 1553,
            name: "RC F(553)",
            fieldTitle: "Lexus"
        },
        {
            value: 1552,
            name: "RCハイブリッド(552)",
            fieldTitle: "Lexus"
        },
        {
            value: 484,
            name: "RX(84)",
            fieldTitle: "Lexus"
        },
        {
            value: 485,
            name: "RX HYBRID(85)",
            fieldTitle: "Lexus"
        },
        {
            value: 486,
            name: "SC(86)",
            fieldTitle: "Lexus"
        },
        {
            value: 1527,
            name: "ＩＳハイブリッド(527)",
            fieldTitle: "Lexus"
        }

    ]

    const dataPorts = [
        { port: "Nagoya", portID: "N", value: 0 },
        { port: "Nagoya", portID: "N", value: 1 },
        { port: "Kobe", portID: "K", value: 2 },
        { port: "Nagoya", portID: "N", value: 3 },
        { port: "Yokohama", portID: "Y", value: 4 },
        { port: "Kyushu", portID: "F", value: 5 },
        { port: "Nagoya", portID: "N", value: 6 },
        { port: "Nagoya", portID: "N", value: 7 },
        { port: "Nagoya", portID: "N", value: 8 },
        { port: "Nagoya", portID: "N", value: 9 },
        { port: "Nagoya", portID: "N", value: 10 },
        { port: "Nagoya", portID: "N", value: 11 },
        { port: "Nagoya", portID: "N", value: 12 },
        { port: "Nagoya", portID: "N", value: 13 },
        { port: "Nagoya", portID: "N", value: 14 },
        { port: "Nagoya", portID: "N", value: 15 },
        { port: "Nagoya", portID: "N", value: 16 },
        { port: "Nagoya", portID: "N", value: 17 },
        { port: "Nagoya", portID: "N", value: 18 },
        { port: "Nagoya", portID: "N", value: 19 },
        { port: "Nagoya", portID: "N", value: 20 },
        { port: "Nagoya", portID: "N", value: 21 },
        { port: "Nagoya", portID: "N", value: 22 },
        { port: "Nagoya", portID: "N", value: 23 },
        { port: "Nagoya", portID: "N", value: 24 },
        { port: "Nagoya", portID: "N", value: 25 },
        { port: "Nagoya", portID: "N", value: 26 },
        { port: "Nagoya", portID: "N", value: 27 },
        { port: "Nagoya", portID: "N", value: 28 },
        { port: "Nagoya", portID: "N", value: 29 },
        { port: "Nagoya", portID: "N", value: 30 },
        { port: "Nagoya", portID: "N", value: 31 },
        { port: "Nagoya", portID: "N", value: 32 },
        { port: "Nagoya", portID: "N", value: 33 },
        { port: "Nagoya", portID: "N", value: 34 },
        { port: "Nagoya", portID: "N", value: 35 },
        { port: "Nagoya", portID: "N", value: 36 },
        { port: "Nagoya", portID: "N", value: 37 },
        { port: "Nagoya", portID: "N", value: 38 },
        { port: "Nagoya", portID: "N", value: 39 },
        { port: "Nagoya", portID: "N", value: 40 },
        { port: "Nagoya", portID: "N", value: 41 },
        { port: "Nagoya", portID: "N", value: 42 },
        { port: "Nagoya", portID: "N", value: 43 }
    ];

    const dataBuyer = [
        { value: 10, name: 'Yusuke' },
        { value: 7, name: 'Yamazaki' },
        { value: 12, name: 'Piyapan' },
        { value: 21, name: 'Masa' },
        { value: 24, name: 'Arai' },
        { value: 25, name: 'Sato' },
        { value: 90, name: 'Domestic' },
    ]
    const dataSteering = [
        { value: 1, name: 'Left' },
        { value: 2, name: 'Right' }
    ]
    const dataTransmission = [
        { value: 1, name: 'Automatic' },
        { value: 2, name: 'Manual' }
    ];
    const dataSales = [
        { name: "Select", value: 0 },
        { name: "Abdi", value: 42 },
        { name: "ARITA", value: 44 },
        { name: "Booking担当", value: 17 },
        { name: "genio nishiki", value: 1 },
        { name: "Justin", value: 43 },
        { name: "matsubara", value: 37 },
        { name: "matsuoka＆HD", value: 35 },
        { name: "matsuoka＆自販", value: 34 },
        { name: "Miha Matsuoka", value: 4 },
        { name: "Miha Matsuoka(三利)", value: 38 },
        { name: "s.uchida", value: 3 },
        { name: "sakai", value: 18 },
        { name: "sugiura", value: 22 },
        { name: "tanaka", value: 41 },
        { name: "y.kitamura", value: 14 },
        { name: "yamazaki", value: 36 },
        { name: "Yanagisawa", value: 24 },
        { name: "松岡＆直販＆ＡＳ", value: 28 },
        { name: "直販＆ＡＳ", value: 29 }
    ];


    const dataBodyType = [
        { value: 1, name: 'Coupe' },
        { value: 2, name: 'Open' },
        { value: 3, name: 'Sedan' },
        { value: 4, name: 'Wagon' },
        { value: 5, name: 'Hatchback' },
        { value: 6, name: 'Van' },
        { value: 7, name: 'Truck' },
        { value: 8, name: 'SUV' },
        { value: 9, name: 'Bus' }
    ];
    const dataColor = [
        { label: "Beige", colorValue: "Beige", value: 1 },
        { label: "Black", colorValue: "Black", value: 2 },
        { label: "Blue", colorValue: "Blue", value: 3 },
        { label: "Bronze", colorValue: "Bronze", value: 4 },
        { label: "Brown", colorValue: "Brown", value: 5 },
        { label: "Burgundy", colorValue: "Burgundy", value: 6 },
        { label: "Champagne", colorValue: "Champagne", value: 7 },
        { label: "Charcoal", colorValue: "Charcoal", value: 8 },
        { label: "Cream", colorValue: "Cream", value: 9 },
        { label: "Dark Blue", colorValue: "Dark Blue", value: 10 },
        { label: "Gold", colorValue: "Gold", value: 11 },
        { label: "Gray", colorValue: "Gray", value: 12 },
        { label: "Green", colorValue: "Green", value: 13 },
        { label: "Maroon", colorValue: "Maroon", value: 14 },
        { label: "Off White", colorValue: "Off White", value: 15 },
        { label: "Orange", colorValue: "Orange", value: 16 },
        { label: "Pearl", colorValue: "Pearl", value: 17 },
        { label: "Pewter", colorValue: "Pewter", value: 18 },
        { label: "Pink", colorValue: "Pink", value: 19 },
        { label: "Purple", colorValue: "Purple", value: 20 },
        { label: "Red", colorValue: "Red", value: 21 },
        { label: "Silver", colorValue: "Silver", value: 22 },
        { label: "Tan", colorValue: "Tan", value: 23 },
        { label: "Teal", colorValue: "Teal", value: 24 },
        { label: "Titanium", colorValue: "Titanium", value: 25 },
        { label: "Turquoise", colorValue: "Turquoise", value: 26 },
        { label: "White", colorValue: "White", value: 27 },
        { label: "Yellow", colorValue: "Yellow", value: 28 },
        { label: "Other", colorValue: "Other", value: 29 }
    ];
    const dataDriveType = [
        { value: 1, name: "2-wheel drive" },
        { value: 2, name: "4-wheel drive" }
    ];
    const dataFuelType = [
        { value: 1, name: 'Gasoline' },
        { value: 2, name: 'Diesel' },
        { value: 3, name: 'Rotary' },
        { value: 4, name: 'Hybrid' },
        { value: 5, name: 'Electricity' }
    ];



    //processed model
    const [processedVehiclesModel, setProcessedVehiclesModel] = useState([]);
    useEffect(() => {
        const fetchAndProcessData = async () => {
            const q = query(collection(projectTestFirestore, "vehicleData"));
            const querySnapshot = await getDocs(q);
            const processedVehicles = [];
            querySnapshot.forEach((doc) => {
                const modelId = doc.data().m_as_model_id; // 'makerId' is a string
                const matchedItem = dataModel.find(item => item.value.toString() === modelId);
                if (matchedItem) {
                    processedVehicles.push({ id: doc.id, matchedName: matchedItem.name });
                } else {

                }
            });
            setProcessedVehiclesModel(processedVehicles);
        };

        fetchAndProcessData();
    }, []);
    //processed model




    const [vehicleData, setVehicleData] = useState(null);
    const [vehicleDataExtension, setVehicleDataExtension] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(projectTestFirestore, "vehicleData", "2024030206");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Document data will be in docSnap.data()
                    const vehicle = {
                        id: docSnap.id,
                        ...docSnap.data()
                    };
                    setVehicleData(vehicle);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };

        fetchData();
    }, []);
    const renderRow = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.id}</Text>
            <Text style={styles.cell}>{item.matchedOptionNames.join(', ')}</Text>
            <Text style={styles.cell}>{item.matchedMaker}</Text>
            <Text style={styles.cell}>{item.matchedModel}</Text>
            <Text style={styles.cell}>{item.matchedBodyType}</Text>
            <Text style={styles.cell}>{item.numberOfSeats}</Text>
            <Text style={styles.cell}>{item.fuel}</Text>
      
        </View>
    );

    return (
        <View style={styles.container}>

            <FlatList
       
                data={processedVehicles}
                renderItem={renderRow}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                    <View style={styles.tableRow}>
                        <Text style={styles.columnHeader}>ID</Text>
                        <Text style={styles.columnHeader}>Matched Option Names</Text>
                        <Text style={styles.columnHeader}>Matched Maker</Text>
                        <Text style={styles.columnHeader}>Matched Model</Text>
                        <Text style={styles.columnHeader}>Matched Body Type</Text>
                       
                        <Text style={styles.columnHeader}>Fuel</Text>
                  
                    </View>
                )}
            />

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
    },
    itemContainer: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    itemText: {
        fontSize: 16,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 5,
    },
    columnHeader: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
    cell: {
        flex: 1,
        fontSize: 16,
        textAlign: 'center'
    },
});
export default TestServer
