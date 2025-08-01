import React, { lazy } from 'react';
const MonthUploadGroup = lazy(() => import('./pages/MonthUploadGroup'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Non_Financial = lazy(() => import('./layout/Non_Financial'));
const Financial = lazy(() => import('./layout/Financial'));
const Report = lazy(() => import('./pages/Report'));
const AccessControl = lazy(() => import('./layout/AccessControl'));
const Configurations = lazy(() => import('./layout/Configurations'));
const Communication = lazy(() => import('./layout/Communication'))
const PeriodicalReport = lazy(() => import('./pages/PeriodicalReport'));
const ListOfDDMsReport = lazy(() => import('./pages/ListOfDDMsReport'));
const DDMsReportView = lazy(() => import('./pages/DDMsReportView'));

const UserProfile = lazy(() => import('./pages/UserProfile'));
const CommunityDDMReportView = lazy(() => import('./pages/CommunityDDMReportView'));
const PortfolioReport = lazy(() => import('./pages/PortfolioReport'));
const PortfolioReportDetails = lazy(() => import('./pages/PortfolioReportDetails'));
const PortfolioDocumentListPage = lazy(() => import('./pages/PortfolioDocumentListPage'));
const ListOfCommunityReport = lazy(() => import('./pages/ListOfCommunityReport'));

const PortfolioDocumentViewPage = lazy(() => import('./pages/PortfolioDocumentViewPage'));
const PortfolioDocumentViewForPeriodPage = lazy(() => import('./pages/PortfolioDocumentViewForPeriodPage'));
const PortfolioDocumentViewOverview = lazy(() => import('./pages/PortfolioDocumentViewOverview'));


// financial
const Fcra = lazy(() => import('./pages/financial/Fcra'));
const Epf = lazy(() => import('./pages/financial/Epf'));
const TDS = lazy(() => import('./pages/financial/Tds'))
const ESI = lazy(() => import('./pages/financial/ESI'))
const GST = lazy(() => import('./pages/financial/GST'))
const ITR = lazy(() => import('./pages/financial/ITR'))
const FinancialPortfolios = lazy(() => import('./pages/financial/FinanicialPortFolios'));
//TDS
const AddTds = lazy(() => import('./pages/financial/AddTds'));
const ListTds = lazy(() => import('./pages/financial/ListTds'));
// FCRA
const AddFcra = lazy(() => import('./pages/financial/AddFcra'));
const ListFcra = lazy(() => import('./pages/financial/ListFcra'));
//EPF
const EPFAdd = lazy(() => import('./pages/financial/EpfAdd'))
const EpfList = lazy(() => import('./pages/financial/EpfList'))
//ESI
const ESIAdd = lazy(() => import('./pages/financial/ESIAdd'))
const ESIList = lazy(() => import('./pages/financial/ESIList'))

//GST
const GSTAdd = lazy(() => import('./pages/financial/GSTAdd'))
const GSTList = lazy(() => import('./pages/financial/GSTList'))

//ITR
const ITRAdd = lazy(() => import('./pages/financial/ITRAdd'))
const ITRList = lazy(() => import('./pages/financial/ITRList'))

/*       non financial      */

//Community
const Community = lazy(() => import('./pages/non-financial/Community'));
const CommunityAdd = lazy(() => import('./pages/non-financial/CommunityAdd'));
const CommunityList = lazy(() => import('./pages/non-financial/CommunityList'))

// Society
const Society = lazy(() => import('./pages/non-financial/Society'));
const SocietyAdd = lazy(() => import('./pages/non-financial/SocietyAdd'))
const SocietyList = lazy(() => import('./pages/non-financial/SocietyList'))

// Parish
const Parish = lazy(() => import('./pages/non-financial/Parish'));
const ParishAdd = lazy(() => import('./pages/non-financial/ParishAdd'))
const ParishList = lazy(() => import('./pages/non-financial/ParishList'))

// school
const School = lazy(() => import('./pages/non-financial/School'));
const SchoolAdd = lazy(() => import('./pages/non-financial/SchoolAdd'));
const SchoolList = lazy(() => import('./pages/non-financial/SchoolList'));

// college
const College = lazy(() => import('./pages/non-financial/College'));
const CollegeAdd = lazy(() => import('./pages/non-financial/CollegeAdd'));
const CollegeList = lazy(() => import('./pages/non-financial/CollegeList'));

// comapny
const Company = lazy(() => import('./pages/non-financial/Company'));
const CompanyAdd = lazy(() => import('./pages/non-financial/CompanyAdd'));
const CompanyList = lazy(() => import('./pages/non-financial/CompanyList'));

// social sector
const SocialSector = lazy(() => import('./pages/non-financial/SocialSector'));
const SocialSectorAdd = lazy(() => import('./pages/non-financial/SocialSectorAdd'));
const SocialSectorList = lazy(() => import('./pages/non-financial/SocialSectorList'));

// department
const Department = lazy(() => import('./pages/non-financial/Department'));
const DepartmentAdd = lazy(() => import('./pages/non-financial/DepartmentAdd'));
const DepartmentList = lazy(() => import('./pages/non-financial/DepartmentList'));

// boarding & hostels
const BoardingHostels = lazy(() => import('./pages/non-financial/BoardingHostel'));
const BoardingHostelsAdd = lazy(() => import('./pages/non-financial/BoardingHostelAdd'));
const BoardingHostelsList = lazy(() => import('./pages/non-financial/BoardingHostelList'));

// technical institute
const TechnicalInstitute = lazy(() => import('./pages/non-financial/TechnicalInstitute'));
const TechnicalInstituteAdd = lazy(() => import('./pages/non-financial/TechnicalInstituteAdd'));
const TechnicalInstituteList = lazy(() => import('./pages/non-financial/TechnicalInstituteList'));

// access control
const UserList = lazy(() => import('./pages/accessControl/UserList'));
const UserAdd = lazy(() => import('./pages/accessControl/UserAdd'));
const Roles = lazy(() => import('./pages/accessControl/Roles'));
const AccessRights = lazy(() => import('./pages/accessControl/AccessRights'));
const Confreres = lazy(() => import('./pages/accessControl/Confreres'));
const Diocese = lazy(() => import('./pages/Diocese'));
// config
const Province = lazy(() => import('./pages/configuration/Province'));
const CommunityConfig = lazy(() => import('./pages/configuration/Community'));
const SocietyConfig = lazy(() => import('./pages/configuration/Society'));
const ParishConfig = lazy(() => import('./pages/configuration/Parish'));
const SchoolConfig = lazy(() => import('./pages/configuration/School'));
const CollegeConfig = lazy(() => import('./pages/configuration/College'));
const CompanyConfig = lazy(() => import('./pages/configuration/Company'));
const SocialSectorConfig = lazy(() => import('./pages/configuration/SocialSector'));
const DepartmentConfig = lazy(() => import('./pages/configuration/Department'));
const BoardingHostelConfig = lazy(() => import('./pages/configuration/BoardingHostel'));
const TechnicalInstituteConfig = lazy(() => import('./pages/configuration/TechnicalInstitute'));
const PortfolioCategoryConfig = lazy(() => import('./pages/configuration/PortfolioCategory'));

const CatagriesConfig = lazy(() => import('./pages/configuration/Category'));
const MapingTableConfig = lazy(() => import('./pages/configuration/MappingTable')); const DynamicFormBuilder = lazy(() => import('./pages/configuration/DynamicFormBuilder'));

const LegalEntity = lazy(() => import('./pages/configuration/LegalEntity'));
const Portfolio = lazy(() => import('./pages/configuration/Portfolio'));

const PortfolioCategoryMapp = lazy(() => import('./pages/configuration/PortfolioCategoryMapp'));

const WebLinks = lazy(() => import('./pages/configuration/WebLinks'));

//communication
const Email = lazy(() => import('./pages/communication/Mail'));
const EmailList = lazy(() => import('./pages/communication/MailList'));
const EmailDetails = lazy(() => import('./pages/communication/EmailDetails'));
const Sms = lazy(() => import('./pages/communication/Sms'));
const SmsList = lazy(() => import('./pages/communication/SmsList'));
const SmsDetails = lazy(() => import('./pages/communication/SmsDetails'));
const Notification = lazy(() => import('./pages/communication/Notification'))
const NotificationDetails = lazy(() => import('./pages/communication/NotificationDetails'))
const NotificationAdd = lazy(() => import('./pages/communication/NotificationAdd'));

const DocumentHierarchy = lazy(() => import('./layout/DocumentHierarchy'))
// Document Hierarchy   
const bySociety = lazy(() => import('./pages/documentHierarchy/bySociety'));
const byCommunity = lazy(() => import('./pages/documentHierarchy/byCommunity'));

const ReportsHierarchy = lazy(() => import('./layout/ReportsHierarchy'));
const PrReportCategoryDetail = lazy(() => import('./pages/PrReportCategoryDetail'));

// Base route from app
export const routes = [
    { path: '/dashboard', name: 'Home', element: Dashboard },
    { path: '/community', name: 'Community', element: CommunityConfig },
    { path: '/society', name: 'Society', element: SocietyConfig },
    { path: '/parish', name: 'Parish', element: ParishConfig },
    { path: '/school', name: 'School', element: SchoolConfig },
    { path: '/technicalInstitute', name: 'Technical Institute', element: TechnicalInstituteConfig },
    { path: '/college', name: 'College', element: CollegeConfig },
    { path: '/boardingHostel', name: 'Boarding & Hostel', element: BoardingHostelConfig },
    { path: '/department', name: 'Department', element: DepartmentConfig },
    { path: '/socialSector', name: 'Social Sector', element: SocialSectorConfig },
    { path: '/company', name: 'Company', element: CompanyConfig },
    // user Profile
    { path: '/userProfile', name: 'User Profile', element: UserProfile },
    // { path: '/report', name: 'Report', element: Report },

    { path: '/accessControl/*', name: 'Access Control', element: AccessControl },
    { path: '/config/*', name: 'Configuration', element: Configurations },
    { path: '/communication/*', name: 'Communication', element: Communication },
    { path: '/nonfinancial/*', name: 'Non Financial', element: Non_Financial },
    { path: '/financial/*', name: 'Financial', element: Financial },
    { path: '/documentHirarchy/*', name: 'Document Hirarchy', element: DocumentHierarchy },
    { path: '/report/*', name: 'Reports', element: ReportsHierarchy },
]

//Documents hirarchy
export const documentRoutes = [
    { path: '/bySociety', name: 'By Society', key: "by Society", element: bySociety },
    { path: '/byCommunity', name: 'By Community', key: "by Community", element: byCommunity },
]

//Reports
export const reportRoutes = [
    // { path: '/byReport', name: 'Report', key: "Report", element: Report },
    { path: '/byPeriodicalReport', name: 'Periodical Report', key: "PeriodicalReport", element: PeriodicalReport },
    { path: '/byListOfDDMsReport', name: 'List of DDMs', key: "DDMsReport", element: ListOfDDMsReport },
    { path: '/byPortfolioReport', name: 'Portfolio Report', key: "PortfolioReport", element: PortfolioReport },
    { path: '/byListOfCommunityReport', name: 'List of Communities', key: "CommunityReport", element: ListOfCommunityReport },
]

// Uploaded docs check screen
export const docsRoute = [
    { path: '/docsview', name: 'View Docs', element: MonthUploadGroup },
]

export const financialRoutes = [
    { path: '/fcra', name: 'FCRA', element: Fcra },
    { path: '/tds', name: 'TDS', element: TDS }, //tds  changed to TAN
    { path: '/epf', name: 'EPF', element: Epf },
    { path: '/esi', name: 'ESI', element: ESI },
    { path: '/gst', name: 'GST', element: GST },
    { path: '/itr', name: 'ITR', element: ITR },
    { path: '/financialPortfolios', name: 'FinancialPortfolios', element: FinancialPortfolios },

]

export const tdsRoutes = [
    { path: '/addTds', name: 'Add Deductee Entries', element: AddTds },
    { path: '/listTds', name: 'List Deductee Entries', element: ListTds },
]

export const fcraRoutes = [
    { path: '/addFcra', name: 'Add FCRA', element: AddFcra },
    { path: '/listFcra', name: 'List FCRA', element: ListFcra },
]

export const epfRoutes = [
    { path: '/epfAdd', name: 'Add EPF', element: EPFAdd },
    { path: '/epfList', name: 'List EPF', element: EpfList }
]
export const esiRoutes = [
    { path: '/esiAdd', name: 'Add EPF', element: ESIAdd },
    { path: '/esiList', name: 'List EPF', element: ESIList }
]
export const gstRoutes = [
    { path: '/gstAdd', name: 'Add EPF', element: GSTAdd },
    { path: '/gstList', name: 'List EPF', element: GSTList }
]
export const itrRoutes = [
    { path: '/itrAdd', name: 'Add EPF', element: ITRAdd },
    { path: '/itrList', name: 'List EPF', element: ITRList }
]

// Non financial routings
export const nonFinancialRoutes = [
    { path: '/community', name: 'Community', element: Community },
    { path: '/society', name: 'Society', element: Society },
    { path: '/parish', name: 'Parishes', element: Parish },
    { path: '/school', name: 'Schools', element: School },
    { path: '/college', name: 'Colleges', element: College },
    { path: '/technicalInstitute', name: 'Technical Institutions', element: TechnicalInstitute },
    { path: '/boardingHostel', name: 'Boarding and Hostel', element: BoardingHostels },
    { path: '/department', name: 'Departments', element: Department },
    { path: '/socialSector', name: 'Social Sectors', element: SocialSector },
    { path: '/company', name: 'Companies', element: Company }

]

export const communityRoutes = [
    { path: '/communityAdd', name: 'Add community Categries', element: CommunityAdd },
    { path: '/communityList', name: 'List community Catagries', element: CommunityList },
]

export const sociteyRoutes = [
    { path: '/societyAdd', name: 'Add Society Categries', element: SocietyAdd },
    { path: '/societyList', name: 'List Society Catagries', element: SocietyList }
]

export const parishRoutes = [
    { path: '/ParishAdd', name: 'Parish Add', element: ParishAdd },
    { path: '/ParishList', name: 'Parish List', element: ParishList }
]

export const schoolRoutes = [
    { path: '/schoolAdd', name: 'Add School', element: SchoolAdd },
    { path: '/schoolList', name: 'List School', element: SchoolList }
]

export const collegeRoutes = [
    { path: '/collegeAdd', name: 'Add College', element: CollegeAdd },
    { path: '/collegeList', name: 'List College', element: CollegeList }
]

export const technicalInstituteRoutes = [
    { path: '/technicalInstituteAdd', name: 'Add Technical Institute', element: TechnicalInstituteAdd },
    { path: '/technicalInstituteList', name: 'List Technical Institute', element: TechnicalInstituteList }
]

export const boardingHostelRoutes = [
    { path: '/boardingHostelAdd', name: 'Add Boarding & Hostel', element: BoardingHostelsAdd },
    { path: '/boardingHostelList', name: 'List Boarding & Hostel', element: BoardingHostelsList }
]

export const departmentRoutes = [
    { path: '/departmentAdd', name: 'Add Department', element: DepartmentAdd },
    { path: '/departmentList', name: 'List Department', element: DepartmentList }
]

export const socialSectorRoutes = [
    { path: '/socialSectorAdd', name: 'Add Social Sector', element: SocialSectorAdd },
    { path: '/socialSectorList', name: 'List Social Sector', element: SocialSectorList }
]

export const companyRoutes = [
    { path: '/companyAdd', name: 'Add Company', element: CompanyAdd },
    { path: '/companyList', name: 'List Company', element: CompanyList }
]


// Access Control
export const accessControlRoutes = [
    { path: '/userList', name: 'Users', key: 'users', element: UserList },
    { path: '/roles', name: 'Roles', key: 'roles', element: Roles },
    { path: '/accessrights', name: 'Access Rights', key: 'access rights', element: AccessRights },
    { path: '/confreres', name: 'Confreres', key: 'confreres', element: Confreres }
]

export const userRoutes = [
    { path: '/userAdd', name: 'Add new user', element: UserAdd },
]

// config
export const configRoutes = [
    // { path: '/province', name: 'Province', element: Province },
    // { path: '/portfolio', name: 'Portfolio', element: Portfolio },
    { path: '/category', name: 'Category Template', key: "portfolio category", element: CatagriesConfig },
    { path: '/portfolioCategory', name: 'Portfolio category', key: "portfolio category", element: PortfolioCategoryConfig },
    // { path: '/legalEntity', name: 'Legal Entity', element: LegalEntity },
    { path: '/mapping', name: 'Mapping Table', key: "mapping table", element: MapingTableConfig },
    { path: '/weblinks', name: 'Web links', key: "web links", element: WebLinks },
    { path: '/diocese', name: 'Diocese', key: 'dioceses', element: Diocese },
]

//Communication
export const communicationRoutes = [
    { path: '/email', name: 'Email', key: "email", element: EmailList },
    { path: '/email/draft/:id', name: 'Email', element: Email },
    // { path: '/sms', name: 'SMS', key: "sms", element: SmsList },
    { path: '/notification', name: 'Notification', key: "notification", element: Notification },
]

export const emailRoutes = [
    { path: '/compose-mail', name: 'Compose Email', element: Email },
    { path: '/:id', name: 'Email Details', element: EmailDetails },
]

export const smsRoutes = [
    { path: '/compose-sms', name: 'Compose SMS', element: Sms },
    { path: '/:id', name: 'SMS Details', element: SmsDetails },
]

export const notifyRoutes = [
    { path: '/:notificationId', name: 'Notifications', element: NotificationDetails },
    { path: '/notifycreate', name: 'Notifications Create', element: NotificationAdd },
]

export const dynamicRoutes = [
    { path: '/formbuilder', name: 'Form builder', element: DynamicFormBuilder },
]

export const portfolioCategoryRoutes = [
    { path: '/mapcategory', name: 'Map Category', element: PortfolioCategoryMapp },
]

export const prCategoryDetailRoutes = [
    { path: '/category-detail', name: 'Category Detail', element: PrReportCategoryDetail },
    { path: '/ddm-detail/:type/:id', name: 'DDMs Detail', element: DDMsReportView },
]

export const communityDetailRoutes = [
    { path: '/cmddm-detail/:type/:id', name: 'DDMs Detail', element: CommunityDDMReportView },
]

export const portfolioDetailRoutes = [
    { path: '/portfolio-detail/:type/:id', name: 'DDMs Detail', element: PortfolioReportDetails },
    { path: '/portfolio-doc/:type/:id', name: 'DDMs Detail', element: PortfolioDocumentListPage },
    { path: '/portfolio-view/:type/:id', name: 'DDMs Detail', element: PortfolioDocumentViewPage },
    { path: '/portfolio-viewForOverPeriod/:type/:id', name: 'DDMs Detail', element: PortfolioDocumentViewForPeriodPage },
    { path: '/portfolio-viewOverview/:type/:id', name: 'DDMs Detail', element: PortfolioDocumentViewOverview},
]