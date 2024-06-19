const PreviewInvoice = () => {

    // npm install html2canvas jspdf
    // import jsPDF from 'jspdf';
    // import html2canvas from 'html2canvas';

    const dispatch = useDispatch();

    const selectedChatData = useSelector((state) => state.selectedChatData);
    const previewInvoiceVisible = useSelector((state) => state.previewInvoiceVisible);
    const invoiceData = useSelector((state) => state.invoiceData);

    const [isPreviewHovered, setIsPreviewHovered] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const invoiceRef = useRef(null);
    const qrCodeRef = useRef(null);
    const [invoiceImageUri, setInvoiceImageUri] = useState('');
    const hoverPreviewIn = () => setIsPreviewHovered(true);
    const hoverPreviewOut = () => setIsPreviewHovered(false);
    const [firstCaptureUri, setFirstCaptureUri] = useState('');
    const [capturedImageUri, setCapturedImageUri] = useState('');
    const [vehicleImageUri, setVehicleImageUri] = useState(globalImageUrl);
    const [featuresTrueCount, setFeaturesTrueCount] = useState(0);
    const [rerenderState, setRerenderState] = useState(0);
    const [imagePreviewKey, setImagePreviewKey] = useState(0);
    const handlePreviewInvoiceModalOpen = () => {
        dispatch(setPreviewInvoiceVisible(true));
    };

    const handlePreviewInvoiceModalClose = () => {
        dispatch(setPreviewInvoiceVisible(false));
        setCapturedImageUri('');
    }

    function countTrueValuesInCarData(invoiceData) {
        let count = 0;

        // Check if carData exists in invoiceData
        if (invoiceData.carData) {
            // List of fields to check within carData
            const fields = ['interior', 'exterior', 'safetySystem', 'comfort', 'sellingPoints'];

            fields.forEach(field => {
                if (invoiceData.carData[field]) {
                    // Count true values in each field of carData
                    count += Object.values(invoiceData.carData[field]).filter(value => value === true).length;
                }
            });
        }

        return count;
    }

    useEffect(() => {

        if (previewInvoiceVisible) {
            setRerenderState(rerenderState + 1);
        }
    }, [previewInvoiceVisible])


    useEffect(() => {
        let generatedImageUri = '';
        const captureImageAsync = async () => {
            try {
                if (invoiceRef.current) {
                    // Adjust the scale to control the captured image resolution
                    const scale = 0.85; // Experiment with different scale values
                    const width = 2480 * scale;
                    const height = 3508 * scale;


                    const imageUri = await captureRef(invoiceRef, {
                        format: 'jpg',
                        quality: 1, // Adjust quality if needed
                        result: 'base64',
                        width: width,
                        height: height,
                    });

                    const trueCount = countTrueValuesInCarData(invoiceData);
                    setFeaturesTrueCount(trueCount);
                    generatedImageUri = `data:image/jpeg;base64,${imageUri}`
                    setCapturedImageUri(`data:image/jpeg;base64,${imageUri}`);

                    // console.log(`data:image/jpeg;base64,${imageUri}`);
                }
            } catch (error) {
                console.error("Error capturing view:", error);
            }
        };


        captureImageAsync();


    }, [invoiceRef.current, invoiceData]);

    useEffect(() => {
        setCapturedImageUri(capturedImageUri);
    }, [capturedImageUri]);

    const captureImage = async () => {
        try {
            // Adjust the scale to control the captured image resolution
            const scale = 0.9; // Experiment with different scale values
            const width = 2480 * scale;
            const height = 3508 * scale;

            const imageUri = await captureRef(invoiceRef, {
                format: 'jpg',
                quality: 1, // Adjust quality if needed
                result: 'base64',
                width: width,
                height: height,
            });
            return `data:image/jpeg;base64,${imageUri}`;
        } catch (error) {
            console.error("Error capturing view:", error);
        }
    };

    const createPDF = async () => {
        const element = invoiceRef.current;
        if (element) {
            // Reduce the scale slightly for smaller file size
            const scale = 1; // Fine-tune this value for balance

            const canvas = await html2canvas(element, {
                scale: scale,
            });

            // Experiment with JPEG quality for a balance between quality and file size
            const imageData = canvas.toDataURL('image/jpeg', 0.9);

            // A4 size dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Adjust PDF compression settings
            const options = {
                imageCompression: 'JPEG',
                imageQuality: 1, // Fine-tune this value as well
            };

            const imgProps = pdf.getImageProperties(imageData);
            const pdfWidthFit = pdfWidth;
            const pdfHeightFit = (imgProps.height * pdfWidthFit) / imgProps.width;

            pdf.addImage(imageData, 'JPEG', 0, 0, pdfWidthFit, pdfHeightFit, undefined, 'FAST', 0, options);

            // Filename logic
            selectedChatData.stepIndicator.value < 3 ?
                pdf.save(`Proforma Invoice (${invoiceData.carData.carName} [${invoiceData.carData.referenceNumber}]) (A4 Paper Size).pdf`) :
                pdf.save(`Invoice No. ${invoiceData.id} (A4 Paper Size).pdf`);
        } else {
            console.error("No element to capture");
        }
    };


    const handleCaptureAndCreatePDF = async () => {
        const capturedImageUri = await captureImage();
        if (capturedImageUri) {
            await createPDF(capturedImageUri);
        }
    };


    if (invoiceData && Object.keys(invoiceData).length > 0) {
        const issuingDateString = invoiceData.bankInformations.issuingDate;
        const dueDateString = invoiceData.bankInformations.dueDate;
        const issuingDateObject = new Date(issuingDateString);
        const dueDateObject = new Date(dueDateString);


        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        formattedIssuingDate = issuingDateObject.toLocaleDateString(undefined, options);
        formattedDueDate = dueDateObject.toLocaleDateString(undefined, options);

    }

    const originalWidth = 794;
    const originalHeight = 1123;


    const originalSmallWidth = 794;
    const originalSmallHeight = 1123;

    const newWidth = 2480;
    const newHeight = 3508;

    const smallWidth = 377;
    const smallHeight = 541;

    const smallWidthScaleFactor = smallWidth / originalSmallWidth;
    const smallHeightScaleFactor = smallHeight / originalSmallHeight;

    const widthScaleFactor = newWidth / originalWidth;
    const heightScaleFactor = newHeight / originalHeight;

    const openImage = () => {
        if (Platform.OS === 'web') {
            const imageWindow = window.open();
            imageWindow.document.write(`
                <style>
                    body {
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        overflow: hidden;
                    }
                    img {
                        width: 595px;
                        height: 842px;
                        object-fit: contain;
                        transition: transform 0.25s ease;
                        cursor: zoom-in; /* Set cursor to magnifying glass */
                    }
                    .zoomed {
                        transform: scale(3);
                        transform-origin: center;
                        cursor: zoom-out; /* Change cursor to indicate zooming out */
                    }
                </style>
                <img id="zoomableImage" src="${capturedImageUri}" alt="Base64 Image" draggable="false" />
                <script>
                    const image = document.getElementById('zoomableImage');
    
                    image.addEventListener('mousedown', function(e) {
                        const rect = this.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
    
                        // Set the transform origin to the mouse position
                        this.style.transformOrigin = \`\${x}px \${y}px\`;
                        this.classList.add('zoomed');
                    });
    
                    document.addEventListener('mouseup', function() {
                        image.classList.remove('zoomed');
                    });
                </script>
            `);
        } else {
            console.log('This feature is only available in a web environment');
        }
    };


    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    };

    const modifyAndDownloadExcel = (file, dataToInsert) => {
        // Read the file using SheetJS
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });

            // Assuming the data is for the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Insert your data into the sheet
            // Example: Inserting data starting from the second row, in columns A, B, and C
            dataToInsert.forEach((row, index) => {
                const rowIndex = index + 2; // Adjust based on where you want to start inserting data
                ['A', 'B', 'C'].forEach((col, colIndex) => {
                    const cellRef = `${col}${rowIndex}`;
                    XLSX.utils.sheet_add_aoa(sheet, [[row[colIndex]]], { origin: cellRef });
                });
            });

            // Write the modified workbook to a binary string
            const wbOut = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

            // Convert the binary string to a Blob and trigger a download
            const blob = new Blob([s2ab(wbOut)], { type: 'application/octet-stream' });
            saveAs(blob, `Invoice No.${selectedChatData.invoiceNumber} Excel.xlsx`);
        };
        reader.readAsBinaryString(file);
    };



    const freightCalculation = ((selectedChatData.m3 ? selectedChatData.m3 :
        (selectedChatData.carData && selectedChatData.carData.dimensionCubicMeters ?
            selectedChatData.carData.dimensionCubicMeters : 0)) *
        Number(selectedChatData.freightPrice));

    const totalPriceCalculation = (selectedChatData.fobPrice ? selectedChatData.fobPrice :
        (selectedChatData.carData && selectedChatData.carData.fobPrice ?
            selectedChatData.carData.fobPrice : 0) *
        (selectedChatData.jpyToUsd ? selectedChatData.jpyToUsd :
            (selectedChatData.currency && selectedChatData.currency.jpyToUsd ?
                selectedChatData.currency.jpyToUsd : 0))) + freightCalculation;

    const convertedCurrency = (baseValue) => {
        if (invoiceData.selectedCurrencyExchange == 'None' || !invoiceData.selectedCurrencyExchange || invoiceData.selectedCurrencyExchange == 'USD') {
            return `$${Number(baseValue).toFixed(2).toLocaleString('en-US', { useGrouping: true })}`
        }
        if (invoiceData.selectedCurrencyExchange == 'EURO') {
            const euroValue = Number(baseValue) * Number(selectedChatData.currency.usdToEur);
            return `€${(euroValue).toFixed(2).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'AUD') {
            const audValue = Number(baseValue) * Number(selectedChatData.currency.usdToAud);
            return `A$${(audValue).toFixed(2).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'GBP') {
            const gbpValue = Number(baseValue) * Number(selectedChatData.currency.usdToGbp);
            return `£${(gbpValue).toFixed(2).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'CAD') {
            const cadValue = Number(baseValue) * Number(selectedChatData.currency.usdToCad);
            return `C$${(cadValue).toFixed(2).toLocaleString('en-US', { useGrouping: true })}`;
        }
    }

    const totalPriceCalculated = () => {

        const totalAdditionalPrice = invoiceData.paymentDetails.additionalPrice.reduce((total, price) => {
            const converted = Number(price); // Convert each price using your currency conversion function
            const numericPart = price.replace(/[^0-9.]/g, ''); // Remove non-numeric characters, assuming decimal numbers
            return total + parseFloat(numericPart); // Add the numeric value to the total
        }, 0);

        const totalUsd = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice))
            // * Number(invoiceData.currency.jpyToEur)
            ;


        const totalEur = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToEur));


        // const totalEur = Number(invoiceData.paymentDetails.fobPrice) * Number(invoiceData.currency.usdToEur)
        //     + (valueCurrency * Number(invoiceData.currency.usdToEur))
        //     + Number(invoiceData.paymentDetails.freightPrice) * Number(invoiceData.currency.usdToEur)
        //     + (valueCurrency * Number(invoiceData.currency.usdToEur))
        //     + (invoiceData.paymentDetails.inspectionIsChecked
        //         ? (Number(invoiceData.paymentDetails.inspectionPrice) * Number(invoiceData.currency.usdToEur)
        //             + (valueCurrency * Number(invoiceData.currency.usdToEur)))
        //         : 0)
        //     + totalAdditionalPrice;

        const totalAud = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToAud))

        const totalGbp = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToGbp))

        const totalCad = ((Number(invoiceData.paymentDetails.fobPrice)
            + Number(invoiceData.paymentDetails.freightPrice)
            + (invoiceData.paymentDetails.inspectionIsChecked
                ? (Number(invoiceData.paymentDetails.inspectionPrice))
                : 0)
            + (invoiceData.paymentDetails.incoterms == 'CIF'
                ? Number(invoiceData.paymentDetails.insurancePrice)
                : 0)
            + totalAdditionalPrice)
            * Number(invoiceData.currency.usdToCad))

        if (invoiceData.selectedCurrencyExchange == 'None' || !invoiceData.selectedCurrencyExchange || invoiceData.selectedCurrencyExchange == 'USD') {
            return `$${Math.round(totalUsd).toLocaleString('en-US', { useGrouping: true })}`;
        }

        if (invoiceData.selectedCurrencyExchange == 'EURO') {
            return `€${Math.round(totalEur).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'AUD') {
            return `A$${Math.round(totalAud).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'GBP') {
            return `£${Math.round(totalGbp).toLocaleString('en-US', { useGrouping: true })}`;
        }
        if (invoiceData.selectedCurrencyExchange == 'CAD') {
            return `C$${Math.round(totalCad).toLocaleString('en-US', { useGrouping: true })}`;
        }
    }

    const PreviewInvoiceForMobile = () => {

        return (
            <View
                style={{
                    width: smallWidth,
                    height: smallHeight,
                    backgroundColor: 'white',
                    zIndex: 1
                }}>

                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 999,
                    }}
                />

                <View style={{ position: 'absolute', left: 38 * smallWidthScaleFactor, top: 38 * smallHeightScaleFactor }}>
                    <NativeImage
                        source={require('../../assets/RMJ logo for invoice.png')}
                        style={{
                            width: 95 * smallWidthScaleFactor,
                            height: 85 * smallHeightScaleFactor,
                            resizeMode: 'stretch',
                        }}
                    />
                </View>

                <View style={{ position: 'absolute', alignSelf: 'center', top: 80 * smallHeightScaleFactor }}>
                    {/* Title */}
                    {selectedChatData.stepIndicator.value < 3 ?
                        <Text style={{ fontWeight: 700, fontSize: 25 * smallWidthScaleFactor }}>{`PROFORMA INVOICE`}</Text> :
                        <Text style={{ fontWeight: 700, fontSize: 25 * smallWidthScaleFactor }}>{`INVOICE`}</Text>
                    }
                </View>

                <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 38 * smallHeightScaleFactor }}>
                    {/* QR CODE */}
                    {selectedChatData.stepIndicator.value < 3 ?
                        null :
                        <QRCode
                            value={invoiceData.cryptoNumber}
                            size={80 * smallWidthScaleFactor}
                            color="black"
                            backgroundColor="white"
                        />
                    }
                </View>

                <View style={{ position: 'absolute', right: 121 * smallWidthScaleFactor, top: 34 * smallHeightScaleFactor }}>
                    {/* Invoice Number */}
                    {selectedChatData.stepIndicator.value < 3 ?
                        null :
                        <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Invoice No. RMJ-${invoiceData.id}`}</Text>
                    }
                </View>

                {selectedChatData.stepIndicator.value < 3 ?
                    <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 34 * smallHeightScaleFactor, }}>
                        {/* Issuing Date */}
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                            <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Issuing Date: `}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                            <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, color: '#F00A0A', }}>{`Valid Until: `}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedDueDate}`}</Text>
                        </View>

                    </View>
                    :
                    <View style={{ position: 'absolute', right: 121 * smallWidthScaleFactor, top: 49 * smallHeightScaleFactor, flexDirection: 'row' }}>
                        {/* Issuing Date */}
                        <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor }}>{`Issuing Date: `}</Text>
                        <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                    </View>
                }

                <View style={{
                    position: 'absolute',
                    left: 40 * smallWidthScaleFactor,
                    top: 134 * smallHeightScaleFactor,
                    width: 280 * smallWidthScaleFactor,
                }}>
                    {/* Shipper */}
                    <Text style={{
                        fontWeight: 750,
                        fontSize: 16 * smallWidthScaleFactor,
                        borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                        width: 'fit-content', // Make the underline cover the text width
                        marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                    }}>
                        {`Shipper`}
                    </Text>
                    <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Real Motor Japan (YANAGISAWA HD CO.,LTD)`}</Text>
                    <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`26-2 Takara Tsutsumi-cho Toyota City, Aichi Prefecture, Japan, 473-0932`}</Text>
                    <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: +81565850606`}</Text>

                    <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Shipped From:`}</Text>
                    <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.departurePort}, ${invoiceData.departureCountry}`}</Text>

                    <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Shipped To:`}</Text>
                    <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.discharge.port}, ${invoiceData.discharge.country}`}</Text>
                    {invoiceData.placeOfDelivery && invoiceData.placeOfDelivery !== '' ?
                        <>
                            <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Place of Delivery:`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 12 * smallHeightScaleFactor }}>{`${invoiceData.placeOfDelivery}`}</Text>
                        </>
                        : null}
                    {invoiceData.cfs && invoiceData.cfs !== '' ?
                        <>
                            <Text style={{ fontWeight: 700, fontSize: 14 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`CFS:`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 14 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.cfs}`}</Text>
                        </>
                        : null}

                    <View style={{ flex: 1, flexDirection: 'row', width: 715 * smallWidthScaleFactor, }}>

                        <View style={{
                            flex: 1, width: 280 * smallWidthScaleFactor,
                        }}>
                            {/* Buyer Information */}
                            <Text style={{
                                fontWeight: 750,
                                fontSize: 18 * smallWidthScaleFactor,
                                borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                borderBottomColor: '#0A78BE',
                                width: 'fit-content', // Make the underline cover the text width
                                marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                                color: '#0A78BE',
                                marginTop: 45 * smallHeightScaleFactor,

                            }}>
                                {`Buyer Information`}
                            </Text>
                            <Text style={{ fontWeight: 750, fontSize: 16 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.consignee.name}`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.consignee.address}`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.consignee.email}`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.consignee.contactNumber}`}</Text>
                            <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: ${invoiceData.consignee.fax == '' ? 'N/A' : invoiceData.consignee.fax}`}</Text>

                        </View>

                        <View style={{ flex: 1, paddingLeft: 20 * smallWidthScaleFactor, width: 280 * smallWidthScaleFactor, }}>
                            {/* Notify Party */}
                            <Text style={{
                                fontWeight: 750,
                                fontSize: 18 * smallWidthScaleFactor,
                                borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                borderBottomColor: '#FF0000',
                                width: 'fit-content', // Make the underline cover the text width
                                marginBottom: 5 * smallHeightScaleFactor, // Add some space between text and underline
                                color: '#FF0000',
                                marginTop: 45 * smallHeightScaleFactor,
                            }}>
                                {`Notify Party`}
                            </Text>
                            {invoiceData.notifyParty.sameAsConsignee == true ? (
                                <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, }}>{`Same as consignee / buyer`}</Text>) :
                                (<>
                                    <Text style={{ fontWeight: 750, fontSize: 16 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.notifyParty.name}`}</Text>
                                    <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.notifyParty.address}`}</Text>
                                    <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.notifyParty.email}`}</Text>
                                    <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.notifyParty.contactNumber}`}</Text>
                                    <Text style={{ fontWeight: 400, fontSize: 16 * smallWidthScaleFactor, marginTop: 6 * smallHeightScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`FAX: ${invoiceData.notifyParty.fax == '' ? 'N/A' : invoiceData.notifyParty.fax}`}</Text>
                                </>)}
                        </View>

                    </View>


                </View>
                {selectedChatData.stepIndicator.value < 3 ?

                    <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 130 * smallHeightScaleFactor, borderWidth: 3 * smallWidthScaleFactor, width: 430 * smallWidthScaleFactor, borderColor: '#FF5C00', height: 194 * smallHeightScaleFactor, }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                            <Entypo size={50 * smallWidthScaleFactor} name='warning' color={'#FF0000'} style={{ marginLeft: 15 * smallWidthScaleFactor, }} />
                            <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, color: '#FF0000', marginLeft: 20 * smallWidthScaleFactor, }}>{`Bank Information will be provided after placing an order.`}</Text>
                        </View>
                    </View>
                    :
                    <View style={{ position: 'absolute', right: 38 * smallWidthScaleFactor, top: 130 * smallHeightScaleFactor, borderWidth: 3 * smallWidthScaleFactor, width: 430 * smallWidthScaleFactor, borderColor: '#1ABA3D', }}>

                        <View style={{ flex: 1, alignItems: 'center', }}>
                            <Text style={{ fontWeight: 750, fontSize: 14 * smallWidthScaleFactor, color: '#114B33', }}>{`Bank Information`}</Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 5 * smallWidthScaleFactor, marginBottom: 5 * smallHeightScaleFactor, }}>
                            <View style={{ flex: 1, marginRight: 50 * smallWidthScaleFactor, }}>
                                <Text style={{
                                    fontWeight: 750,
                                    fontSize: 14 * smallWidthScaleFactor,
                                    borderBottomWidth: 3 * smallHeightScaleFactor, // Adjust the thickness of the underline
                                    width: 'fit-content', // Make the underline cover the text width
                                    marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                }}>
                                    {`Bank Account`}
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Bank Name: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.bankName}`}</Text>
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Branch Name: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.branchName}`}</Text>
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`SWIFTCODE: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.swiftCode}`}</Text>
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Address: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.address}`}</Text>
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Name of Account Holder: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.accountHolder}`}</Text>
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor, marginTop: 3 * smallHeightScaleFactor, }}>{`Account Number: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.accountNumberValue}`}</Text>
                                </Text>
                            </View>

                            <View style={{ flex: 1 }}>

                                <Text style={{
                                    fontWeight: 750,
                                    fontSize: 14 * smallWidthScaleFactor,
                                    borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                                    width: 'fit-content', // Make the underline cover the text width
                                    marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                }}>
                                    {`Payment Terms`}
                                </Text>

                                <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`Terms: `}
                                    <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, lineHeight: 14 * smallHeightScaleFactor }}>{`${invoiceData.bankInformations.paymentTerms}`}</Text>
                                </Text>

                                <View style={{ paddingTop: 30 * smallHeightScaleFactor, }}>

                                    <Text style={{
                                        fontWeight: 750,
                                        fontSize: 14 * smallWidthScaleFactor,
                                        borderBottomWidth: 3 * smallWidthScaleFactor, // Adjust the thickness of the underline
                                        width: 'fit-content', // Make the underline cover the text width
                                        marginBottom: 2 * smallHeightScaleFactor, // Add some space between text and underline
                                        color: '#F00A0A',
                                        borderBottomColor: '#F00A0A',
                                    }}>
                                        {`Payment Due`}
                                    </Text>

                                    <Text style={{ fontWeight: 750, fontSize: 12 * smallWidthScaleFactor, color: '#F00A0A', lineHeight: 14 * smallWidthScaleFactor }}>{`Due Date: `}
                                        <Text style={{ fontWeight: 400, fontSize: 12 * smallWidthScaleFactor, color: 'black', lineHeight: 14 * smallWidthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                    </Text>

                                </View>

                            </View>

                        </View>

                    </View>}



                <View style={{
                    position: 'absolute',
                    left: 38 * smallWidthScaleFactor,
                    top: (invoiceData.placeOfDelivery && invoiceData.cfs) || (invoiceData.placeOfDelivery !== '' && invoiceData.cfs !== '') ? 577 * smallHeightScaleFactor : 537 * smallHeightScaleFactor,
                    width: 718 * smallWidthScaleFactor,
                    borderWidth: 1 * smallWidthScaleFactor,
                    borderColor: '#C2E2F4',
                    alignSelf: 'center',
                }}>
                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{ flex: 2, justifyContent: 'center', }}>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                    color: '#008AC6',
                                }}>
                                {`Description`}
                            </Text>

                        </View>

                        <View style={{ flex: 2, justifyContent: 'center', }}>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                    color: '#008AC6',
                                }}>
                                {`Notes`}
                            </Text>
                        </View>

                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                    color: '#008AC6',
                                }}>
                                {`Quantity`}
                            </Text>
                        </View>

                        <View style={{ flex: 2, justifyContent: 'center', }}>
                            <Text
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                    color: '#008AC6',
                                }}>
                                {`Amount`}
                            </Text>
                        </View>

                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 5,
                        }}>
                            <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    marginLeft: 2 * smallWidthScaleFactor,
                                }}>
                                {`FOB`}
                            </Text>
                        </View>


                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                        }}>
                            <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                {`${convertedCurrency(Number(invoiceData.paymentDetails.fobPrice))}`}
                            </Text>
                        </View>

                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 5,
                        }}>
                            <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    marginLeft: 2 * smallWidthScaleFactor,
                                }}>
                                {`Freight`}
                            </Text>
                        </View>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                        }}>
                            <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                {`${convertedCurrency(Number(invoiceData.paymentDetails.freightPrice))}`}
                            </Text>
                        </View>

                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 5,
                            flexDirection: 'row',
                        }}>
                            {invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") && <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    marginLeft: 2 * smallWidthScaleFactor,
                                }}>
                                {invoiceData.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData.paymentDetails.inspectionName}]` : ' '}
                            </Text>}

                            {invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                <>
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            marginLeft: 2 * smallWidthScaleFactor,
                                        }}>
                                        {invoiceData.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData.paymentDetails.inspectionName}]` : ' '}
                                    </Text>
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            marginLeft: 2 * smallWidthScaleFactor,
                                        }}>
                                        {invoiceData.paymentDetails.incoterms == "CIF" ? ` + Insurance` : ' '}
                                    </Text>
                                </>
                            }

                            {!invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        marginLeft: 2 * smallWidthScaleFactor,
                                    }}>
                                    {invoiceData.paymentDetails.incoterms == "CIF" ? `Insurance` : ' '}
                                </Text>
                            }

                            {!invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") &&
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                    }}>
                                    {' '}
                                </Text>
                            }


                        </View>


                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                        }}>

                            {invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") && <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                {invoiceData.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData.paymentDetails.inspectionPrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                            </Text>}

                            {invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                    {invoiceData.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData.paymentDetails.inspectionPrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                    <Text
                                        style={{
                                            fontWeight: 400,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                        }}>
                                        {invoiceData.paymentDetails.incoterms === "CIF" ? ` + ${convertedCurrency(Number(invoiceData.paymentDetails.insurancePrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                    </Text>
                                </Text>

                            }

                            {!invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                <Text
                                    style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',

                                    }}>
                                    {invoiceData.paymentDetails.incoterms == "CIF" ? `${convertedCurrency(Number(invoiceData.paymentDetails.insurancePrice).toLocaleString('en-US', { useGrouping: true })).split('.')[0]}` : ' '}
                                </Text>
                            }

                        </View>


                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 5,
                            flexDirection: 'row',
                        }}>
                            {invoiceData.paymentDetails.additionalName && (invoiceData.paymentDetails.additionalName).length > 0 && <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    marginLeft: 2 * smallWidthScaleFactor,
                                }}>
                                {invoiceData.paymentDetails.additionalName && (invoiceData.paymentDetails.additionalName).length > 0 ? `${invoiceData.paymentDetails.additionalName.join(' + ')}` : ' '}
                            </Text>}


                        </View>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                        }}>
                            <Text
                                style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                {invoiceData.paymentDetails.additionalPrice && invoiceData.paymentDetails.additionalPrice.length > 0
                                    ? invoiceData.paymentDetails.additionalPrice.map(price => {
                                        const converted = convertedCurrency(Number(price));
                                        return converted;
                                    }).join(' + ')
                                    : ' '}
                            </Text>
                        </View>

                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', }}>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                            flexDirection: 'row',
                            paddingVertical: 2 * smallHeightScaleFactor,

                        }}>
                            {invoiceData.carData && invoiceData.carData.carName ? (
                                <Text style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                    marginLeft: 2 * smallWidthScaleFactor,
                                }}>
                                    {"Used Vehicle\n"}
                                    <Text style={{
                                        fontWeight: 700,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData.carData.carName}\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData.carData.chassisNumber}\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData.carData.exteriorColor}\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${Number(invoiceData.carData.engineDisplacement).toLocaleString('en-US')} cc\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${Number(invoiceData.carData.mileage).toLocaleString('en-US')} km\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData.carData.fuel}\n`}
                                    </Text>
                                    <Text style={{
                                        fontWeight: 400,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        alignSelf: 'center',
                                    }}>
                                        {`${invoiceData.carData.transmission}\n`}
                                    </Text>
                                </Text>

                            ) : (
                                <Text>{' '}</Text>
                            )}


                        </View>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                            {invoiceData.paymentDetails && invoiceData.paymentDetails.incoterms && invoiceData.discharge.port && invoiceData.discharge ? (
                                <Text style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                    {`${invoiceData.paymentDetails.incoterms} ${invoiceData.discharge.port}`}
                                </Text>
                            ) : (
                                <Text>{' '}</Text>
                            )}
                        </View>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                            {invoiceData.carData && invoiceData.carData.carName ? (
                                <Text style={{
                                    fontWeight: 400,
                                    fontSize: 12 * smallWidthScaleFactor,
                                    lineHeight: 14 * smallWidthScaleFactor,
                                    marginBottom: 3 * smallHeightScaleFactor,
                                    alignSelf: 'center',
                                }}>
                                    {'1'}
                                </Text>
                            ) : (
                                <Text>{' '}</Text>
                            )}


                        </View>

                        <View style={{
                            borderTopWidth: 1 * smallWidthScaleFactor,
                            borderColor: '#C2E2F4',
                            flex: 2,
                            justifyContent: 'center',
                            flexDirection: 'row',
                        }}>
                            {invoiceData.paymentDetails && invoiceData.paymentDetails.totalAmount ? (
                                <>
                                    <Text style={{
                                        fontWeight: 700,
                                        fontSize: 12 * smallWidthScaleFactor,
                                        lineHeight: 14 * smallWidthScaleFactor,
                                        marginBottom: 3 * smallHeightScaleFactor,
                                        color: '#008AC6',
                                        marginRight: 10 * smallWidthScaleFactor,
                                        top: 51 * smallHeightScaleFactor,
                                        left: 50 * smallWidthScaleFactor,
                                        position: 'absolute',
                                    }}>
                                        {"Total"}
                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * smallWidthScaleFactor,
                                            lineHeight: 14 * smallWidthScaleFactor,
                                            marginBottom: 3 * smallHeightScaleFactor,
                                            alignSelf: 'center',
                                            color: '#00720B',
                                            marginLeft: 5 * smallWidthScaleFactor,
                                        }}>
                                            {`${totalPriceCalculated()}`}
                                        </Text>
                                    </Text>

                                </>
                            ) : (
                                <Text>{' '}</Text>
                            )}
                        </View>

                    </View>

                </View>

                <View style={{ position: 'absolute', left: 38 * smallWidthScaleFactor, top: 825 * smallHeightScaleFactor, width: 350 * smallWidthScaleFactor, }}>
                    <Text style={{
                        fontWeight: 700,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'Payment Information:'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'The customer is responsible for the bank charges incurred when the T/T (Telegraphic Transfer) is paid.'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                        marginBottom: 5 * smallHeightScaleFactor,
                    }}>
                        {'No warranty service is provided on used vehicles.'}
                    </Text>

                    <Text style={{
                        fontWeight: 700,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'Conditions for order cancellation:'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'(1) Order Cancellation Penalty: If the order is cancelled after payment, a penalty of USD 220 will apply.'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                        marginBottom: 5 * smallHeightScaleFactor,

                    }}>
                        {'(2) Non-refund: Payment for vehicles purchased through pre-delivery inspection is non-refundable.'}
                    </Text>

                    <Text style={{
                        fontWeight: 700,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'Intermediary Banking Information:'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'Bank Name: SUMITOMO MITSUI BANKING CORPORATION (NEW YORK BRANCH).'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,

                    }}>
                        {'Swift code: SMBCUS33'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                    }}>
                        {'Address: 277 Park Avenue'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,

                    }}>
                        {'City: New York, NY'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,

                    }}>
                        {'Postal Code: 10172'}
                    </Text>
                    <Text style={{
                        fontWeight: 400,
                        fontSize: 12 * smallWidthScaleFactor,
                        lineHeight: 14 * smallHeightScaleFactor,
                        marginBottom: 5 * smallHeightScaleFactor,

                    }}>
                        {'Country: United States'}
                    </Text>
                </View>

                {selectedChatData.stepIndicator.value < 3 ? null :
                    <View style={{ position: 'absolute', right: 39 * smallWidthScaleFactor, top: 835 * smallHeightScaleFactor, width: 300 * smallWidthScaleFactor, }}>
                        <View style={{
                            width: 300 * smallWidthScaleFactor,
                            alignItems: 'center',
                            paddingBottom: 80 * smallHeightScaleFactor, // Adjust this value to control space between image and line
                        }}>
                            <NativeImage
                                source={require('../../assets/RMJ Invoice Signature with Hanko.png')}
                                style={{
                                    width: 276 * smallWidthScaleFactor,
                                    height: 81 * smallHeightScaleFactor,
                                    resizeMode: 'contain',
                                    alignSelf: 'center',
                                    marginBottom: 0, // Minimize margin to keep the line close
                                }}
                            />
                            <View style={{
                                borderBottomWidth: 1 * smallHeightScaleFactor,
                                borderColor: 'black', // Change the color as needed
                                width: '100%', // Line width as per your requirement
                            }} />
                            <Text italic style={{
                                fontWeight: 700,
                                fontSize: 16 * smallWidthScaleFactor,
                            }}>
                                {'Real Motor Japan'}
                            </Text>
                        </View>

                        <View style={{
                            width: 300 * smallWidthScaleFactor,
                            alignItems: 'center',
                            paddingBottom: 5 * smallHeightScaleFactor, // Adjust this value to control space between image and line
                        }}>

                            <View style={{
                                borderBottomWidth: 1 * smallHeightScaleFactor,
                                borderColor: 'black', // Change the color as needed
                                width: '100%', // Line width as per your requirement
                            }} />
                            <Text italic style={{
                                fontWeight: 700,
                                fontSize: 16 * smallWidthScaleFactor,
                            }}>
                                {'Your Signature'}
                            </Text>
                        </View>
                    </View>}


            </View>
        )
    }



    return (
        <> {invoiceData && Object.keys(invoiceData).length > 0 &&

            <>{!selectedChatData.isCancelled && <Pressable
                onPress={handlePreviewInvoiceModalOpen}
                focusable={false}
                variant='ghost'
                onHoverIn={hoverPreviewIn}
                onHoverOut={hoverPreviewOut}
                style={{
                    marginTop: 3,
                    paddingVertical: 3,
                    paddingHorizontal: 5,
                    flexDirection: 'row', // Align items in a row
                    alignItems: 'center', // Center items vertically
                    justifyContent: 'center',
                    borderRadius: 5,
                    backgroundColor: isPreviewHovered ? '#0772ad' : '#0A8DD5',
                }}>

                {selectedChatData.invoiceNumber && selectedChatData.stepIndicator.value > 2 ?
                    <Text style={{ fontWeight: 700, color: 'white', }}>
                        {`Preview Invoice No. ${selectedChatData.invoiceNumber}`}
                    </Text>
                    :
                    <Text style={{ fontWeight: 700, color: 'white', }}>
                        {`Preview Invoice`}
                    </Text>}
            </Pressable>}

                <Modal
                    isOpen={previewInvoiceVisible}
                    onClose={() => {
                        handlePreviewInvoiceModalClose();
                    }}
                    size={'full'}
                    useRNModal
                >
                    <View style={{ flexDirection: 'row', margin: 2, }}>
                        <Pressable onPress={() => {
                            capturedImageUri ? handleCaptureAndCreatePDF() : null;
                        }}
                            style={{ justifyContent: 'center', flexDirection: 'row', padding: 5, borderRadius: 5, marginRight: 5, backgroundColor: '#16A34A', }}>
                            <MaterialCommunityIcons size={20} name='download' color='white' />
                            <Text style={{ color: 'white', }}>Download as PDF</Text>
                        </Pressable>

                        {selectedChatData.isCancelled && selectedChatData.stepIndicator.value < 3 ?
                            null :
                            <Pressable
                                onPress={() => {
                                    dispatch(setCustomInvoiceVisible(true))
                                    dispatch(setPreviewInvoiceVisible(false))
                                }}
                                focusable={false}
                                variant='ghost'
                                style={{
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    padding: 5,
                                    borderRadius: 5,
                                    backgroundColor: '#0A8DD5',
                                }}>
                                <MaterialCommunityIcons size={20} name='file-document-edit' color='white' />
                                <Text style={{ fontWeight: 400, color: 'white', }}>
                                    {`Generate Custom Invoice`}
                                </Text>
                            </Pressable>

                        }

                        <Pressable
                            onPress={() => {
                                capturedImageUri ? openImage() : null;
                            }}
                            style={{ position: 'absolute', top: -2, right: -285, flexDirection: 'row', padding: 5, borderRadius: 5, backgroundColor: '#0A8DD5', }}>
                            <Entypo size={20} name='images' color='white' />
                            <Text style={{ color: 'white', }}>View Image</Text>
                        </Pressable>

                    </View>
                    <Modal.CloseButton />
                    {previewInvoiceVisible &&
                        <ScrollView
                            style={{ maxHeight: screenWidth < 960 ? 520 : 720, maxWidth: screenWidth < 960 ? '90%' : 900 }}
                        >
                            <View style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 0,
                                left: 0,
                                backgroundColor: 'white',
                                zIndex: 999,
                                flex: 1,
                                alignItems: 'center', // Center horizontally
                            }}>
                                {capturedImageUri ? (
                                    (screenWidth < mobileViewBreakpoint ? <PreviewInvoiceForMobile /> :
                                        <RNImage
                                            key={imagePreviewKey}
                                            source={{ uri: capturedImageUri.toString() }}
                                            style={{
                                                marginTop: 5,
                                                width: screenWidth < mobileViewBreakpoint ? 377 : 595,
                                                height: screenWidth < mobileViewBreakpoint ? 541 : 842,
                                                resizeMode: 'stretch',
                                                borderWidth: 1,
                                                borderColor: '#DADDE1',
                                            }}
                                        />
                                    )
                                ) : (
                                    <Spinner size={'lg'} color={'#0A9FDC'} style={{ alignSelf: 'center', paddingTop: 80 * heightScaleFactor, }} />
                                )}
                            </View>

                            {/* Main content with invoice details */}
                            {

                                <View ref={invoiceRef}
                                    style={{
                                        width: newWidth,
                                        height: newHeight,
                                        backgroundColor: 'white',
                                        zIndex: 1
                                    }}>

                                    <View style={{ position: 'absolute', left: 38 * widthScaleFactor, top: 38 * heightScaleFactor }}>
                                        <NativeImage
                                            source={require('../../assets/RMJ logo for invoice.png')}
                                            style={{
                                                width: 95 * widthScaleFactor,
                                                height: 85 * heightScaleFactor,
                                                resizeMode: 'stretch',
                                            }}
                                        />
                                    </View>

                                    <View style={{ position: 'absolute', alignSelf: 'center', top: 80 * heightScaleFactor }}>
                                        {/* Title */}
                                        {selectedChatData.stepIndicator.value < 3 ?
                                            <Text style={{ fontWeight: 700, fontSize: 25 * widthScaleFactor }}>{`PROFORMA INVOICE`}</Text> :
                                            <Text style={{ fontWeight: 700, fontSize: 25 * widthScaleFactor }}>{`INVOICE`}</Text>
                                        }
                                    </View>

                                    <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 38 * heightScaleFactor }}>
                                        {/* QR CODE */}
                                        {selectedChatData.stepIndicator.value < 3 ?
                                            null :
                                            <View
                                                ref={qrCodeRef}
                                            >
                                                <QRCode
                                                    value={invoiceData.cryptoNumber}
                                                    size={80 * widthScaleFactor}
                                                    color="black"
                                                    backgroundColor="white"
                                                />
                                            </View>

                                        }
                                    </View>

                                    <View style={{ position: 'absolute', right: 121 * widthScaleFactor, top: 34 * heightScaleFactor }}>
                                        {/* Invoice Number */}
                                        {selectedChatData.stepIndicator.value < 3 ?
                                            null :
                                            <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Invoice No. RMJ-${invoiceData.id}`}</Text>
                                        }
                                    </View>

                                    {selectedChatData.stepIndicator.value < 3 ?
                                        <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 34 * heightScaleFactor, }}>
                                            {/* Issuing Date */}
                                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                                <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Issuing Date: `}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', }}>
                                                <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, color: '#F00A0A', }}>{`Valid Until: `}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                            </View>

                                        </View>
                                        :
                                        <View style={{ position: 'absolute', right: 121 * widthScaleFactor, top: 49 * heightScaleFactor, flexDirection: 'row' }}>
                                            {/* Issuing Date */}
                                            <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor }}>{`Issuing Date: `}</Text>
                                            <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor }}>{`${formattedIssuingDate}`}</Text>
                                        </View>
                                    }

                                    <View style={{
                                        position: 'absolute',
                                        left: 40 * widthScaleFactor,
                                        top: 134 * heightScaleFactor,
                                        width: 280 * widthScaleFactor,
                                    }}>
                                        {/* Shipper */}
                                        <Text style={{
                                            fontWeight: 750,
                                            fontSize: 16 * widthScaleFactor,
                                            borderBottomWidth: 3, // Adjust the thickness of the underline
                                            width: 'fit-content', // Make the underline cover the text width
                                            marginBottom: 5, // Add some space between text and underline
                                        }}>
                                            {`Shipper`}
                                        </Text>
                                        <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`Real Motor Japan (YANAGISAWA HD CO.,LTD)`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`26-2 Takara Tsutsumi-cho Toyota City, Aichi Prefecture, Japan, 473-0932`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: +81565850606`}</Text>

                                        <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Shipped From:`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.departurePort}, ${invoiceData.departureCountry}`}</Text>

                                        <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Shipped To:`}</Text>
                                        <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.discharge.port}, ${invoiceData.discharge.country}`}</Text>
                                        {invoiceData.placeOfDelivery && invoiceData.placeOfDelivery !== '' ?
                                            <>
                                                <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`Place of Delivery:`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.placeOfDelivery}`}</Text>
                                            </>
                                            : null}
                                        {invoiceData.cfs && invoiceData.cfs !== '' ?
                                            <>
                                                <Text style={{ fontWeight: 700, fontSize: 14 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`CFS:`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 14 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.cfs}`}</Text>
                                            </>
                                            : null}

                                        <View style={{ flex: 1, flexDirection: 'row', width: 715 * widthScaleFactor, }}>

                                            <View style={{
                                                flex: 1, width: 280 * widthScaleFactor,
                                            }}>
                                                {/* Buyer Information */}
                                                <Text style={{
                                                    fontWeight: 750,
                                                    fontSize: 18 * widthScaleFactor,
                                                    borderBottomWidth: 3, // Adjust the thickness of the underline
                                                    borderBottomColor: '#0A78BE',
                                                    width: 'fit-content', // Make the underline cover the text width
                                                    marginBottom: 5, // Add some space between text and underline
                                                    color: '#0A78BE',
                                                    marginTop: 25 * heightScaleFactor,

                                                }}>
                                                    {`Buyer Information`}
                                                </Text>
                                                <Text style={{ fontWeight: 750, fontSize: 16 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.consignee.name}`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.consignee.address}`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.consignee.email}`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.consignee.contactNumber}`}</Text>
                                                <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: ${invoiceData.consignee.fax == '' ? 'N/A' : invoiceData.consignee.fax}`}</Text>

                                            </View>

                                            <View style={{ flex: 1, paddingLeft: 20 * widthScaleFactor, width: 280 * widthScaleFactor, }}>
                                                {/* Notify Party */}
                                                <Text style={{
                                                    fontWeight: 750,
                                                    fontSize: 18 * widthScaleFactor,
                                                    borderBottomWidth: 3, // Adjust the thickness of the underline
                                                    borderBottomColor: '#FF0000',
                                                    width: 'fit-content', // Make the underline cover the text width
                                                    marginBottom: 5, // Add some space between text and underline
                                                    color: '#FF0000',
                                                    marginTop: 25 * heightScaleFactor,
                                                }}>
                                                    {`Notify Party`}
                                                </Text>
                                                {invoiceData.notifyParty.sameAsConsignee == true ? (
                                                    <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, }}>{`Same as consignee / buyer`}</Text>) :
                                                    (<>
                                                        <Text style={{ fontWeight: 750, fontSize: 16 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.notifyParty.name}`}</Text>
                                                        <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.notifyParty.address}`}</Text>
                                                        <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.notifyParty.email}`}</Text>
                                                        <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.notifyParty.contactNumber}`}</Text>
                                                        <Text style={{ fontWeight: 400, fontSize: 16 * widthScaleFactor, marginTop: 20, lineHeight: 14 * widthScaleFactor }}>{`FAX: ${invoiceData.notifyParty.fax == '' ? 'N/A' : invoiceData.notifyParty.fax}`}</Text>
                                                    </>)}
                                            </View>

                                        </View>


                                    </View>
                                    {selectedChatData.stepIndicator.value < 3 ?

                                        <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 130 * heightScaleFactor, borderWidth: 3, width: 430 * widthScaleFactor, borderColor: '#FF5C00', height: 194 * heightScaleFactor, }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                                                <Entypo size={50 * widthScaleFactor} name='warning' color={'#FF0000'} />
                                                <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, color: '#FF0000', marginLeft: 20 * widthScaleFactor, }}>{`Bank Information will be provided after placing an order.`}</Text>
                                            </View>
                                        </View>
                                        :
                                        <View style={{ position: 'absolute', right: 38 * widthScaleFactor, top: 130 * heightScaleFactor, borderWidth: 3, width: 430 * widthScaleFactor, borderColor: '#1ABA3D', }}>

                                            <View style={{ flex: 1, alignItems: 'center', }}>
                                                <Text style={{ fontWeight: 750, fontSize: 14 * widthScaleFactor, color: '#114B33', }}>{`Bank Information`}</Text>
                                            </View>

                                            <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: 5 * widthScaleFactor, marginBottom: 5 * heightScaleFactor, }}>
                                                <View style={{ flex: 1, marginRight: 50 * widthScaleFactor, }}>
                                                    <Text style={{
                                                        fontWeight: 750,
                                                        fontSize: 14 * widthScaleFactor,
                                                        borderBottomWidth: 3, // Adjust the thickness of the underline
                                                        width: 'fit-content', // Make the underline cover the text width
                                                        marginBottom: 2, // Add some space between text and underline
                                                    }}>
                                                        {`Bank Account`}
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Bank Name: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.bankName}`}</Text>
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Branch Name: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.branchName}`}</Text>
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`SWIFTCODE: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.swiftCode}`}</Text>
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Address: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.address}`}</Text>
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Name of Account Holder: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.accountHolder}`}</Text>
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor, marginTop: 3 * heightScaleFactor, }}>{`Account Number: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.bankAccount.accountNumberValue}`}</Text>
                                                    </Text>
                                                </View>

                                                <View style={{ flex: 1 }}>

                                                    <Text style={{
                                                        fontWeight: 750,
                                                        fontSize: 14 * widthScaleFactor,
                                                        borderBottomWidth: 3, // Adjust the thickness of the underline
                                                        width: 'fit-content', // Make the underline cover the text width
                                                        marginBottom: 2, // Add some space between text and underline
                                                    }}>
                                                        {`Payment Terms`}
                                                    </Text>

                                                    <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`Terms: `}
                                                        <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, lineHeight: 14 * widthScaleFactor }}>{`${invoiceData.bankInformations.paymentTerms}`}</Text>
                                                    </Text>

                                                    <View style={{ paddingTop: 30 * heightScaleFactor, }}>

                                                        <Text style={{
                                                            fontWeight: 750,
                                                            fontSize: 14 * widthScaleFactor,
                                                            borderBottomWidth: 3, // Adjust the thickness of the underline
                                                            width: 'fit-content', // Make the underline cover the text width
                                                            marginBottom: 2, // Add some space between text and underline
                                                            color: '#F00A0A',
                                                            borderBottomColor: '#F00A0A',
                                                        }}>
                                                            {`Payment Due`}
                                                        </Text>

                                                        <Text style={{ fontWeight: 750, fontSize: 12 * widthScaleFactor, color: '#F00A0A', lineHeight: 14 * widthScaleFactor }}>{`Due Date: `}
                                                            <Text style={{ fontWeight: 400, fontSize: 12 * widthScaleFactor, color: 'black', lineHeight: 14 * widthScaleFactor }}>{`${formattedDueDate}`}</Text>
                                                        </Text>

                                                    </View>

                                                </View>

                                            </View>

                                        </View>}


                                    <View style={{
                                        position: 'absolute',
                                        left: 38 * widthScaleFactor,
                                        top: (invoiceData.placeOfDelivery && invoiceData.cfs) || (invoiceData.placeOfDelivery !== '' && invoiceData.cfs !== '') ? 577 * heightScaleFactor : 537 * heightScaleFactor,
                                        width: 718 * widthScaleFactor,
                                        borderWidth: 1 * widthScaleFactor,
                                        borderColor: '#C2E2F4',
                                        alignSelf: 'center',
                                    }}>
                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                        color: '#008AC6',
                                                    }}>
                                                    {`Description`}
                                                </Text>

                                            </View>

                                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                        color: '#008AC6',
                                                    }}>
                                                    {`Notes`}
                                                </Text>
                                            </View>

                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                        color: '#008AC6',
                                                    }}>
                                                    {`Quantity`}
                                                </Text>
                                            </View>

                                            <View style={{ flex: 2, justifyContent: 'center', }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                        color: '#008AC6',
                                                    }}>
                                                    {`Amount`}
                                                </Text>
                                            </View>

                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 5,
                                            }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        marginLeft: 2 * widthScaleFactor,
                                                    }}>
                                                    {`FOB`}
                                                </Text>
                                            </View>


                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                            }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                    {`${convertedCurrency(Number(invoiceData.paymentDetails.fobPrice))}`}
                                                </Text>
                                            </View>

                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 5,
                                            }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        marginLeft: 2 * widthScaleFactor,
                                                    }}>
                                                    {`Freight`}
                                                </Text>
                                            </View>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                            }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                    {`${convertedCurrency(Number(invoiceData.paymentDetails.freightPrice))}`}
                                                </Text>
                                            </View>

                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 5,
                                                flexDirection: 'row',
                                            }}>
                                                {invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") && <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        marginLeft: 2 * widthScaleFactor,
                                                    }}>
                                                    {invoiceData.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData.paymentDetails.inspectionName}]` : ' '}
                                                </Text>}

                                                {invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                                    <>
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                marginLeft: 2 * widthScaleFactor,
                                                            }}>
                                                            {invoiceData.paymentDetails.inspectionIsChecked ? `Inspection [${invoiceData.paymentDetails.inspectionName}]` : ' '}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                marginLeft: 2 * widthScaleFactor,
                                                            }}>
                                                            {invoiceData.paymentDetails.incoterms == "CIF" ? ` + Insurance` : ' '}
                                                        </Text>
                                                    </>
                                                }

                                                {!invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            marginLeft: 2 * widthScaleFactor,
                                                        }}>
                                                        {invoiceData.paymentDetails.incoterms == "CIF" ? `Insurance` : ' '}
                                                    </Text>
                                                }

                                                {!invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") &&
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                        }}>
                                                        {' '}
                                                    </Text>
                                                }


                                            </View>


                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                            }}>

                                                {invoiceData.paymentDetails.inspectionIsChecked && (invoiceData.paymentDetails.incoterms == "C&F" || invoiceData.paymentDetails.incoterms == "FOB") && <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                    {invoiceData.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData.paymentDetails.inspectionPrice))}` : ' '}
                                                </Text>}

                                                {invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                        {invoiceData.paymentDetails.inspectionIsChecked ? `${convertedCurrency(Number(invoiceData.paymentDetails.inspectionPrice))}` : ' '}
                                                        <Text
                                                            style={{
                                                                fontWeight: 400,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                            }}>
                                                            {invoiceData.paymentDetails.incoterms === "CIF" ? ` + ${convertedCurrency(Number(invoiceData.paymentDetails.insurancePrice))}` : ' '}
                                                        </Text>
                                                    </Text>

                                                }

                                                {!invoiceData.paymentDetails.inspectionIsChecked && invoiceData.paymentDetails.incoterms == "CIF" &&
                                                    <Text
                                                        style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',

                                                        }}>
                                                        {invoiceData.paymentDetails.incoterms == "CIF" ? `${convertedCurrency(Number(invoiceData.paymentDetails.insurancePrice))}` : ' '}
                                                    </Text>
                                                }

                                            </View>


                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 5,
                                                flexDirection: 'row',
                                            }}>
                                                {invoiceData.paymentDetails.additionalName && (invoiceData.paymentDetails.additionalName).length > 0 && <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        marginLeft: 2 * widthScaleFactor,
                                                    }}>
                                                    {invoiceData.paymentDetails.additionalName && (invoiceData.paymentDetails.additionalName).length > 0 ? `${invoiceData.paymentDetails.additionalName.join(' + ')}` : ' '}
                                                </Text>}


                                            </View>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                            }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                    {invoiceData.paymentDetails.additionalPrice && invoiceData.paymentDetails.additionalPrice.length > 0
                                                        ? invoiceData.paymentDetails.additionalPrice.map(price => {
                                                            const converted = convertedCurrency(Number(price));
                                                            return converted;
                                                        }).join(' + ')
                                                        : ' '}
                                                </Text>
                                            </View>

                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row', }}>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                                flexDirection: 'row',
                                                paddingVertical: 2 * heightScaleFactor,

                                            }}>
                                                {invoiceData.carData && invoiceData.carData.carName ? (
                                                    <Text style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                        marginLeft: 2 * widthScaleFactor,
                                                    }}>
                                                        {"Used Vehicle\n"}
                                                        <Text style={{
                                                            fontWeight: 700,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData.carData.carName}\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData.carData.chassisNumber}\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData.carData.exteriorColor}\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${Number(invoiceData.carData.engineDisplacement).toLocaleString('en-US')} cc\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${Number(invoiceData.carData.mileage).toLocaleString('en-US')} km\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData.carData.fuel}\n`}
                                                        </Text>
                                                        <Text style={{
                                                            fontWeight: 400,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            alignSelf: 'center',
                                                        }}>
                                                            {`${invoiceData.carData.transmission}\n`}
                                                        </Text>
                                                    </Text>

                                                ) : (
                                                    <Text>{' '}</Text>
                                                )}


                                            </View>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            }}>
                                                {invoiceData.paymentDetails && invoiceData.paymentDetails.incoterms && invoiceData.discharge.port && invoiceData.discharge ? (
                                                    <Text style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                        {`${invoiceData.paymentDetails.incoterms} ${invoiceData.discharge.port}`}
                                                    </Text>
                                                ) : (
                                                    <Text>{' '}</Text>
                                                )}
                                            </View>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            }}>
                                                {invoiceData.carData && invoiceData.carData.carName ? (
                                                    <Text style={{
                                                        fontWeight: 400,
                                                        fontSize: 12 * widthScaleFactor,
                                                        lineHeight: 14 * widthScaleFactor,
                                                        marginBottom: 3 * heightScaleFactor,
                                                        alignSelf: 'center',
                                                    }}>
                                                        {'1'}
                                                    </Text>
                                                ) : (
                                                    <Text>{' '}</Text>
                                                )}


                                            </View>

                                            <View style={{
                                                borderTopWidth: 1 * widthScaleFactor,
                                                borderColor: '#C2E2F4',
                                                flex: 2,
                                                justifyContent: 'center',
                                                flexDirection: 'row',
                                            }}>
                                                {invoiceData.paymentDetails && invoiceData.paymentDetails.totalAmount ? (
                                                    <>
                                                        <Text style={{
                                                            fontWeight: 700,
                                                            fontSize: 12 * widthScaleFactor,
                                                            lineHeight: 14 * widthScaleFactor,
                                                            marginBottom: 3 * heightScaleFactor,
                                                            color: '#008AC6',
                                                            marginRight: 10 * widthScaleFactor,
                                                            top: 51 * heightScaleFactor,
                                                            left: 50 * widthScaleFactor,
                                                            position: 'absolute',
                                                        }}>
                                                            {"Total"}
                                                            <Text style={{
                                                                fontWeight: 700,
                                                                fontSize: 12 * widthScaleFactor,
                                                                lineHeight: 14 * widthScaleFactor,
                                                                marginBottom: 3 * heightScaleFactor,
                                                                alignSelf: 'center',
                                                                color: '#00720B',
                                                                marginLeft: 5 * widthScaleFactor,
                                                            }}>
                                                                {`${totalPriceCalculated()}`}
                                                            </Text>
                                                        </Text>

                                                    </>
                                                ) : (
                                                    <Text>{' '}</Text>
                                                )}
                                            </View>

                                        </View>

                                    </View>

                                    <View style={{ position: 'absolute', left: 38 * widthScaleFactor, top: 825 * heightScaleFactor, width: 350 * widthScaleFactor, }}>
                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'Payment Information:'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'The customer is responsible for the bank charges incurred when the T/T (Telegraphic Transfer) is paid.'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                            marginBottom: 5 * heightScaleFactor,
                                        }}>
                                            {'No warranty service is provided on used vehicles.'}
                                        </Text>

                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'Conditions for order cancellation:'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'(1) Order Cancellation Penalty: If the order is cancelled after payment, a penalty of USD 220 will apply.'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                            marginBottom: 5 * heightScaleFactor,

                                        }}>
                                            {'(2) Non-refund: Payment for vehicles purchased through pre-delivery inspection is non-refundable.'}
                                        </Text>

                                        <Text style={{
                                            fontWeight: 700,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'Intermediary Banking Information:'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'Bank Name: SUMITOMO MITSUI BANKING CORPORATION (NEW YORK BRANCH).'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,

                                        }}>
                                            {'Swift code: SMBCUS33'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                        }}>
                                            {'Address: 277 Park Avenue'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,

                                        }}>
                                            {'City: New York, NY'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,

                                        }}>
                                            {'Postal Code: 10172'}
                                        </Text>
                                        <Text style={{
                                            fontWeight: 400,
                                            fontSize: 12 * widthScaleFactor,
                                            lineHeight: 14 * heightScaleFactor,
                                            marginBottom: 5 * heightScaleFactor,

                                        }}>
                                            {'Country: United States'}
                                        </Text>
                                    </View>

                                    {selectedChatData.stepIndicator.value < 3 ? null :
                                        <View style={{ position: 'absolute', right: 39 * widthScaleFactor, top: 835 * heightScaleFactor, width: 300 * widthScaleFactor, }}>
                                            <View style={{
                                                width: 300 * widthScaleFactor,
                                                alignItems: 'center',
                                                paddingBottom: 80 * heightScaleFactor, // Adjust this value to control space between image and line
                                            }}>
                                                <NativeImage
                                                    source={require('../../assets/RMJ Invoice Signature with Hanko.png')}
                                                    style={{
                                                        width: 276 * widthScaleFactor,
                                                        height: 81 * heightScaleFactor,
                                                        resizeMode: 'contain',
                                                        alignSelf: 'center',
                                                        marginBottom: 0, // Minimize margin to keep the line close
                                                    }}
                                                />
                                                <View style={{
                                                    borderBottomWidth: 1 * heightScaleFactor,
                                                    borderColor: 'black', // Change the color as needed
                                                    width: '100%', // Line width as per your requirement
                                                }} />
                                                <Text italic style={{
                                                    fontWeight: 700,
                                                    fontSize: 16 * widthScaleFactor,
                                                }}>
                                                    {'Real Motor Japan'}
                                                </Text>
                                            </View>

                                            <View style={{
                                                width: 300 * widthScaleFactor,
                                                alignItems: 'center',
                                                paddingBottom: 5 * heightScaleFactor, // Adjust this value to control space between image and line
                                            }}>

                                                <View style={{
                                                    borderBottomWidth: 1 * heightScaleFactor,
                                                    borderColor: 'black', // Change the color as needed
                                                    width: '100%', // Line width as per your requirement
                                                }} />
                                                <Text italic style={{
                                                    fontWeight: 700,
                                                    fontSize: 16 * widthScaleFactor,
                                                }}>
                                                    {'Your Signature'}
                                                </Text>
                                            </View>
                                        </View>}


                                </View>
                            }


                        </ScrollView>

                    }

                </Modal>
            </>
        }
        </>
    );

}