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
                // Filter and map to get the matching names
                const matchedNames = options_cds.map(cd =>
                    dataOptions.find(item => item.value === cd)?.name
                ).filter(name => name); // Filter out undefined values
                processedVehicles.push({ id: doc.id, matchedNames });
            });
            setProcessedVehicles(processedVehicles);
        };

        fetchAndProcessData();
    }, []);
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
    useEffect(() => {
        const fetchAndProcessData = async () => {
            const q = query(collection(projectTestFirestore, "vehicleData"));
            const querySnapshot = await getDocs(q);
            const processedVehicles = [];
            querySnapshot.forEach((doc) => {
                const makerId = doc.data().m_as_maker_id; // 'makerId' is a string
                const matchedItem = dataMaker.find(item => item.value.toString() === makerId);
                if (matchedItem) {
                    processedVehicles.push({ id: doc.id, matchedName: matchedItem.name });
                }
            });
            setProcessedVehiclesMaker(processedVehicles);
        };

        fetchAndProcessData();
    }, []);
    //processed maker


    const dataModel = [
        {
            value: 644,
            name: "ALLION(9)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 648,
            name: "ALPHARD(19)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 646,
            name: "ALTEZZA(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1427,
            name: "AQUA(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 665,
            name: "AURIS(10)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 642,
            name: "AVENSIS(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 785,
            name: "BELTA(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 778,
            name: "BLADE(7)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 779,
            name: "BREVIS(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1618,
            name: "C-HR(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 671,
            name: "CARINA(3)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 711,
            name: "COASTER(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 677,
            name: "COROLLA(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 680,
            name: "COROLLA AXIO(12)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 684,
            name: "COROLLA FIELDER(10)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 681,
            name: "COROLLA SPACIO(8)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 694,
            name: "CROWN ATHLETE(6)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 748,
            name: "DYNA(27)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 768,
            name: "HARRIER(8)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 760,
            name: "HIACE(5)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 762,
            name: "HIACE VAN(13)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 764,
            name: "HILUX(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 630,
            name: "ist(13)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 708,
            name: "KLUGER(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 811,
            name: "LAND CRUISER PRADO(4)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 797,
            name: "LITEACE(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 793,
            name: "MARK X(14)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 759,
            name: "NOAH(5)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1496,
            name: "NOAH HYBRID(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 766,
            name: "PASSO(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 767,
            name: "PASSO SETTE(3)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 773,
            name: "PLATZ(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 786,
            name: "PORTE(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 780,
            name: "PREMIO(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 774,
            name: "PRIUS(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 783,
            name: "PROBOX(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 781,
            name: "PROGRES(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 693,
            name: "QUICK DELIVERY(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 803,
            name: "RACTIS(13)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 802,
            name: "RAUM(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 634,
            name: "RAV4(12)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 813,
            name: "REGIUS ACE(6)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 804,
            name: "RUSH(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 724,
            name: "SIENTA(14)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1441,
            name: "SPADE(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 728,
            name: "SPRINTER(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1616,
            name: "Tank(1)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 753,
            name: "TOWNACE VAN(3)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 757,
            name: "TOYOACE(19)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 652,
            name: "VANGUARD(27)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 656,
            name: "VELLFIRE(2)",
            fieldTitle: "TOYOTA"
        },
        {
            value: 654,
            name: "VITZ",
            fieldTitle: "TOYOTA"
        },
        {
            value: 658,
            name: "VOXY",
            fieldTitle: "TOYOTA"
        },
        {
            value: 653,
            name: "WISH",
            fieldTitle: "TOYOTA"
        },
        {
            value: 1588,
            name: "Atlas(3)",
            fieldTitle: "NISSAN"
        },
        {
            value: 588,
            name: "BLUEBIRD SYLPHY(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 511,
            name: "CARAVAN(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 1590,
            name: "CONDOR(10)",
            fieldTitle: "NISSAN"
        },
        {
            value: 556,
            name: "DUALIS(31)",
            fieldTitle: "NISSAN"
        },
        {
            value: 575,
            name: "FUGA(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 530,
            name: "JUKE(4)",
            fieldTitle: "NISSAN"
        },
        {
            value: 1445,
            name: "LATIO(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 601,
            name: "MARCH(5)",
            fieldTitle: "NISSAN"
        },
        {
            value: 607,
            name: "MURANO(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 559,
            name: "NOTE(8)",
            fieldTitle: "NISSAN"
        },
        {
            value: 497,
            name: "NV200 VANETTE VAN(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 1628,
            name: "NV350 Caravan(3)",
            fieldTitle: "NISSAN"
        },
        {
            value: 1603,
            name: "Quon(5)",
            fieldTitle: "NISSAN"
        },
        {
            value: 1455,
            name: "SYLPHY(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 553,
            name: "TIIDA(4)",
            fieldTitle: "NISSAN"
        },
        {
            value: 554,
            name: "TIIDA LATIO(4)",
            fieldTitle: "NISSAN"
        },
        {
            value: 566,
            name: "VANETTE TRUCK(1)",
            fieldTitle: "NISSAN"
        },
        {
            value: 504,
            name: "X-TRAIL(9)",
            fieldTitle: "NISSAN"
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
            value: 442,
            name: "XC60(42)",
            fieldTitle: "Volvo"
        }

    ]
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
    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(projectExtensionFirestore, "VehicleProducts", "2023020693");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Document data will be in docSnap.data()
                    const vehicle = {
                        id: docSnap.id,
                        ...docSnap.data()
                    };
                    setVehicleDataExtension(vehicle);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching vehicle data:", error);
            }
        };

        fetchData();
    }, []);
    console.log(vehicleDataExtension)

    return (
        <View style={styles.container}>

            {processedVehicles.map(item => (
                <div key={item.id}>
                    <h2>Vehicle ID: {item.id}</h2>
                    <ul>
                        {item.matchedNames.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                </div>
            ))}
            {processedVehiclesMaker.map(item => (
                <div key={item.id}>
                    <h2>Vehicle ID: {item.id}</h2>
                    <p>Maker: {item.matchedName}</p>
                </div>
            ))}
            {processedVehiclesModel.map(item => (
                <div key={item.id}>
                    <h2>Model ID: {item.id}</h2>
                    <p>Model: {item.matchedName}</p>
                </div>
            ))}

            {/* <FlatList
                data={vehicleData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.id}</Text>

                    </View>
                )}
            /> */}
            {vehicleData && (
                <View style={{ padding: 20 }}>
                    <Text>Data:</Text>
                    <Text>{vehicleData.id}</Text>
                </View>
            )}
            {vehicleDataExtension && (
                <View style={{ padding: 20 }}>
                    <Text>Data:</Text>
                    <Text>{JSON.stringify(vehicleDataExtension, null, 2)}</Text>
                </View>
            )}
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
});
export default TestServer
