import * as yup from "yup";

export const logo = (color, title = "Information Management System") => <div className="navbar-brand text-center d-flex align-items-center justify-content-center" style={{ fontFamily: 'auto', fontSize: 'medium' }} >
    {/* <img src={logoicon} alt="Logo" width="30" height="30" className="align-text-center me-1" /> */}
    <h6 className="fw-bold mb-0   ms-2 title" style={{ color: color }}>{title}</h6>
</div>

export const profileName = (name) => {
    let splits = name?.toUpperCase()?.split(' ');
    if (splits?.length > 1) {
        return splits[0][0] + splits[1][0];
    } else if (name?.length > 1) {
        return splits[0][0] + splits[0][1];
    }
}

export const tableStyle = {
    headRow: {
        style: {
            backgroundColor: ' #483c99',
            color: 'white',
            minHeight: '45px',
        },
    },
    headCells: {
        style: {
            fontSize: '15px',
            fontWeight: 'bold',
            color: 'white',
        },
    },
    rows: {
        style: {
            borderBottom: '1px solid lightgray',
            padding: '3px',
            '&:hover': {
                boxShadow: "0px 1px 6px 2px #cfcfcf",
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
            },
            fontSize: '13px',
        },
    },
    cells: {
        style: {
            // fontSize: '12px',
        },
    },
    pagination: {
        style: {
            minHeight: '30px',
        },
    },
};


export const dashBoardTableStyle = {
    tableWrapper: {
        style: {
            maxWidth: '100%',
            maxHeight: '75vh',   // 75% of viewport height
            overflowY: 'auto',   // enables vertical scroll
        },
    },
    headRow: {
        style: {
            backgroundColor: '#483c99',
            color: 'white',
            minHeight: '45px',
        },
    },
    headCells: {
        style: {
            fontSize: '13px',
            fontWeight: 'bold',
            color: 'white',
        },
    },
    rows: {
        style: {
            borderBottom: '1px solid lightgray',
            padding: '3px',
            '&:hover': {
                boxShadow: '0px 1px 6px 2px #cfcfcf',
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
            },
            fontSize: '12px',
        },
    },
    cells: {
        style: {
            // fontSize: '12px',
        },
    },
    pagination: {
        style: {
            minHeight: '30px',
        },
    },
};



// export const isMobile = window.innerWidth < 769;
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 769;

export const checkRights = (rights, method) => {
    let check = false
    // eslint-disable-next-line
    rights?.map(it => {
        if (it?.feature_name === method && it?.status === true) {
            check = true
        }
    })
    return check
}

export const formatDate = (data) => {
    const date = new Date(data);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date?.toLocaleDateString('en-US', options);
}

export const Loader = () => {
    return (
        <div className="loader-container" role="status">
            <div className="custom-loader"></div>
        </div>
        //     <div className="loader-container">
        //     <div className="flower-loader">
        //         <div className="petal"></div>
        //         <div className="petal"></div>
        //         <div className="petal"></div>
        //         <div className="petal"></div>
        //         <div className="petal"></div>
        //         <div className="petal"></div>
        //     </div>
        // </div>
    )
}

export const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`; // Bytes
    } else if (sizeInBytes < 1024 * 1024) {
        const kb = sizeInBytes / 1024;
        return `${kb % 1 === 0 ? kb.toFixed(0) : kb.toFixed(2)} KB`; // Remove decimals if whole number
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
        const mb = sizeInBytes / (1024 * 1024);
        return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(2)} MB`; // Remove decimals if whole number
    } else {
        const gb = sizeInBytes / (1024 * 1024 * 1024);
        return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(2)} GB`; // Remove decimals if whole number
    }
};

export const changePwdSchema = yup.object().shape({
    oldPassword: yup.string().required("Password is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirm_password: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
});

export const RoleIds = {
    DDMRoleId: 3,
    ViewerRoleId: 4,
};

export const handlePerRowsChange = (newPerPage, page, setSkip, setLimit) => {
    setSkip((page - 1) * newPerPage)
    setLimit(newPerPage)
}
export const handlePageChange = (page, setSkip, limit) => {
    setSkip((page - 1) * limit)
}


// manage Work navigation

export const manageFiles = (portfolio, enity, portfolioIds, navigate, module_name) => {
    // console.log("enity",enity);

    // console.log("manage files", portfolio);
    // { sessionStorage.setItem('navState',JSON.stringify({ ...row, module: 'Community', portfolio_id: portfolioIds ,enitity_id:portfolio?.community_id,finacialPortfolio_id: portfolio.id, financialPortfolio_name: portfolio?.portfolio?.name})),navigate('/nonfinancial/community') ,contextProp.setNavState({ ...row.data, module: 'Community' })}

    // console.log("community?.name",community?.data?.name);
    // console.log("module_name", module_name);

    const enitity_id = enity?.data?.id;
    const financialPortfolio_id = portfolio?.portfolio_id;
    const financialPortfolio_name = portfolio?.portfolio?.name;
    const portfolio_id = portfolioIds;
    const enitity_name = enity?.data?.name;

    const financial_portfolio_id_apicall = portfolio?.id;

    // console.log("financial_portfolio_id", financial_portfolio_id_apicall);

    // console.log("enitity_id", enitity_id);
    // console.log("financialPortfolio_id", financialPortfolio_id);
    // console.log("financialPortfolio_name", financialPortfolio_name);
    // console.log("portfolio_id", portfolio_id);
    // console.log("enitity_name", enitity_name);

    sessionStorage.setItem('navState', JSON.stringify({ enitity_id, financialPortfolio_id, financialPortfolio_name, portfolio_id, enitity_name, financial_portfolio_id_apicall, module_name }));
    navigate('/nonfinancial/community');


}

export const mainManageFiles = (row, navigate, portfolioIds, module_name) => {
    // console.log("row",row);

    const enitity_id = row?.id;
    const enitity_name = row?.name;
    const portfolio_id = portfolioIds;
    // console.log("enitity_id", enitity_id);
    // console.log("enitity_name", enitity_name);
    // console.log("portfolio_id", portfolio_id);
    sessionStorage.setItem('navState', JSON.stringify({ portfolio_id: portfolio_id, enitity_id: enitity_id, enitity_name: enitity_name, module_name }));
    navigate('/nonfinancial/community');
}

// export const getExampleForName = (name) => {
//     switch (name.toUpperCase()) {
//         case "EPF": return "e.g. TNMAS1646980000";
//         case "ESI": return "e.g. 12345678901234567";
//         case "GST": return "e.g. 33ABCDE1234F1Z5";
//         case "TDS": return "e.g. AAAA99999A";
//         case "PAN": return "e.g. ABCDE1234A";
//         default: return "";
//     }
// };

// export const getPatternForName = (name) => {


//     switch (name.toUpperCase()) {
//         case "EPF":
//             return /^[A-Z]{2}[A-Z]{3}[0-9]{6}[0-9]{4}$/; //
//         case "ESI":
//             return /^\d{17}$/; // 12345678901234567
//         case "GST":
//             return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/; // 33ABCDE1234F1Z5
//         case "TDS":
//             return /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/; // ABCD12345A
//         case "PAN":
//             return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // ABCDE1234A
//     }
// };

export const getExampleForName = (name) => {
    switch (name.toUpperCase()) {
        case "EPF": return "e.g. TNMAS1646980000";
        case "ESI": return "e.g. 12345678901234567";
        case "GST": return "e.g. 33ABCDE1234F1Z5";
        case "TDS": return "e.g. AAAA99999A";
        case "PAN": return "e.g. ABCDE1234A";
        case "FCRA": return "e.g. 123456789";
        case "CRS": return "e.g. CRS123456";
        case "12A": return "e.g. AA/12A/12345";
        case "8G": return "e.g. AA/8G/12345";
        default: return "";
    }
};

export const getPatternForName = (name) => {
    switch (name.toUpperCase()) {
        case "EPF":
            return /^[A-Z]{2}[A-Z]{3}[0-9]{6}[0-9]{4}$/;
        case "ESI":
            return /^\d{17}$/;
        case "GST":
            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/;
        case "TDS":
            return /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
        case "PAN":
            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        case "FCRA":
            return /^\d{9}$/; // 9 digits
        case "CRS":
            return /^CRS\d{6}$/i; // CRS followed by 6 digits
        case "12A":
            return /^[A-Z]{2}\/12A\/\d{5}$/i; // e.g. AA/12A/12345
        case "8G":
            return /^[A-Z]{2}\/8G\/\d{5}$/i; // e.g. AA/8G/12345
        default:
            return undefined;
    }
};




// Dial code → typical local number length (excluding the dial code)
export const countryLengths = {
    '1': 10,     // USA, Canada
    '7': 10,     // Russia, Kazakhstan
    '20': 9,     // Egypt
    '27': 9,     // South Africa
    '30': 10,    // Greece
    '31': 9,     // Netherlands
    '32': 9,     // Belgium
    '33': 9,     // France
    '34': 9,     // Spain
    '36': 9,     // Hungary
    '39': 10,    // Italy (includes leading zero)
    '40': 9,     // Romania
    '44': 10,    // UK
    '45': 8,     // Denmark
    '46': 9,     // Sweden
    '47': 8,     // Norway
    '48': 9,     // Poland
    '49': 10,    // Germany
    '52': 10,    // Mexico
    '54': 10,    // Argentina
    '55': 10,    // Brazil
    '56': 9,     // Chile
    '57': 10,    // Colombia
    '58': 10,    // Venezuela
    '61': 9,     // Australia
    '62': 10,    // Indonesia
    '63': 10,    // Philippines
    '64': 9,     // New Zealand
    '65': 8,     // Singapore
    '66': 9,     // Thailand
    '81': 10,    // Japan
    '82': 9,     // South Korea
    '84': 9,     // Vietnam
    '86': 11,    // China (mobile)
    '90': 10,    // Turkey
    '91': 10,    // India
    '92': 10,    // Pakistan
    '93': 9,     // Afghanistan
    '94': 9,     // Sri Lanka
    '95': 9,     // Myanmar
    '98': 10,    // Iran
    '200': 9,  // Algeria
    '201': 9,  // Morocco
    '202': 9,  // Egypt
    '203': 9,  // Libya
    '204': 9,  // Tunisia
    '205': 9,  // Kenya
    '206': 9,  // Nigeria
    '207': 9,  // South Africa
    '208': 9,  // Zambia
    '209': 9,  // Ghana
    '210': 9,  // Rwanda
    '211': 9,  // Uganda
    '212': 9,  // Ethiopia
    '300': 9,  // Greece
    '301': 9,  // Cyprus
    '302': 9,  // Spain
    '303': 9,  // Italy
    '304': 9,  // Portugal
    '305': 9,  // Belgium
    '306': 9,  // Netherlands
    '307': 9,  // Luxembourg
    '308': 9,  // France
    '309': 9,  // Austria
    '310': 9,  // Sweden
    '311': 9,  // Denmark
    '1200': 10,  // Canada
    '1201': 10,  // USA
    '1202': 10,  // Mexico
    '1203': 10,  // Brazil
    '1204': 10,  // Argentina
    '1205': 10,  // Chile
    '1206': 10,  // Peru
    '1207': 10,  // Colombia
    '1208': 10,  // Venezuela
    '1209': 10,  // Ecuador
    '1210': 10,  // Bolivia
    '1211': 10,  // Uruguay
    '213': 9,    // Algeria
    '216': 8,    // Tunisia
    '218': 9,    // Libya
    '234': 10,   // Nigeria
    '235': 8,    // Chad
    '251': 9,    // Ethiopia
    '355': 9,  // Albania
    '376': 6,  // Andorra
    '971': 9,    // UAE
    '972': 9,    // Israel
    '993': 8,    // Turkmenistan
    '994': 9,    // Azerbaijan
    '995': 9,    // Georgia
    '996': 9,    // Kyrgyzstan
    '998': 9,    // Uzbekistan
    '852': 8,    // Hong Kong
    '853': 8,    // Macau
    '855': 8,    // Cambodia
    '856': 9,    // Laos
    '880': 10,   // Bangladesh
    '886': 9,    // Taiwan
}

// Dial code → human‑readable country or region name
export const countryNames = {
    '1': 'USA/Canada',
    '7': 'Russia/Kazakhstan',
    '20': 'Egypt',
    '27': 'South Africa',
    '30': 'Greece',
    '31': 'Netherlands',
    '32': 'Belgium',
    '33': 'France',
    '34': 'Spain',
    '36': 'Hungary',
    '39': 'Italy',
    '40': 'Romania',
    '44': 'United Kingdom',
    '45': 'Denmark',
    '46': 'Sweden',
    '47': 'Norway',
    '48': 'Poland',
    '49': 'Germany',
    '52': 'Mexico',
    '54': 'Argentina',
    '55': 'Brazil',
    '56': 'Chile',
    '57': 'Colombia',
    '58': 'Venezuela',
    '61': 'Australia',
    '62': 'Indonesia',
    '63': 'Philippines',
    '64': 'New Zealand',
    '65': 'Singapore',
    '66': 'Thailand',
    '81': 'Japan',
    '82': 'South Korea',
    '84': 'Vietnam',
    '86': 'China',
    '90': 'Turkey',
    '91': 'India',
    '92': 'Pakistan',
    '93': 'Afghanistan',
    '94': 'Sri Lanka',
    '95': 'Myanmar',
    '98': 'Iran',
    '200': 'Algeria',
    '201': 'Morocco',
    '202': 'Egypt',
    '203': 'Libya',
    '204': 'Tunisia',
    '205': 'Kenya',
    '206': 'Nigeria',
    '207': 'South Africa',
    '208': 'Zambia',
    '209': 'Ghana',
    '210': 'Rwanda',
    '211': 'Uganda',
    '212': 'Ethiopia',
    '300': 'Greece',
    '301': 'Cyprus',
    '302': 'Spain',
    '303': 'Italy',
    '304': 'Portugal',
    '305': 'Belgium',
    '306': 'Netherlands',
    '307': 'Luxembourg',
    '308': 'France',
    '309': 'Austria',
    '310': 'Sweden',
    '311': 'Denmark',
    '1200': 'Canada',
    '1201': 'USA',
    '1202': 'Mexico',
    '1203': 'Brazil',
    '1204': 'Argentina',
    '1205': 'Chile',
    '1206': 'Peru',
    '1207': 'Colombia',
    '1208': 'Venezuela',
    '1209': 'Ecuador',
    '1210': 'Bolivia',
    '1211': 'Uruguay',
    '213': 'Algeria',
    '216': 'Tunisia',
    '218': 'Libya',
    '234': 'Nigeria',
    '235': 'Chad',
    '251': 'Ethiopia',
    '355': 'Albania',
    '376': 'Andorra',
    '971': 'United Arab Emirates',
    '972': 'Israel',
    '993': 'Turkmenistan',
    '994': 'Azerbaijan',
    '995': 'Georgia',
    '996': 'Kyrgyzstan',
    '998': 'Uzbekistan',
    '852': 'Hong Kong',
    '853': 'Macau',
    '855': 'Cambodia',
    '856': 'Laos',
    '880': 'Bangladesh',
    '886': 'Taiwan',
}


//Module tab design navigation
export const financialPortfolioConfig = (name, portfolio_id, financialPortfolio_id, financialPortfolio_name, navigate, path) => {
    // console.log("name", name);
    // console.log("portfolioId", portfolio_id);
    // console.log("financialPortfolio_id", financialPortfolio_id);
    // console.log("path", path);
    // console.log("financialPortfolio_name", financialPortfolio_name);

    sessionStorage.setItem('navState', JSON.stringify({ name, portfolio_id, financialPortfolio_id, financialPortfolio_name }));
    navigate(path);
}