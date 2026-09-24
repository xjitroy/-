import { 
  StaffMember, 
  RoadAsset, 
  StructureAsset, 
  ProjectRecord, 
  TenderRecord, 
  BillingRecord, 
  InstructionRecord, 
  WorkflowItem, 
  SDOfficeFile,
  TrashItem
} from './types';

export const initialStaff: StaffMember[] = [
  { name: "Tijus", designation: "Assistant Engineer (Admin)", section: "Sub Division Office", phone: "7715867436", pass: "admin123", role: "admin" },
  { name: "Dipankar Bala", designation: "Junior Engineer", section: "Ranaghat Section", phone: "8393035090", pass: "rana123", role: "je" },
  { name: "Nurselim Biswas", designation: "Junior Engineer", section: "Aranghata Section", phone: "8617618102", pass: "aran123", role: "je" },
  { name: "Baidyanath Das", designation: "Junior Engineer", section: "Chakdaha Section", phone: "8670607707", pass: "chak123", role: "je" },
  { name: "XYZ", designation: "Computer Operator", section: "Tender Section", phone: "9999999999", pass: "oper123", role: "operator" },
  { name: "ABC", designation: "Barababu", section: "SD Office Section", phone: "8888888888", pass: "bara123", role: "barababu" }
];

export const initialRoads: RoadAsset[] = [
  { section: "Ranaghat Section", name: "Ranaghat- Krishnanagar State Highway-11(RKSH-11)", length: 25.04, width: "7.00", startCh: "0.00", endCh: "25.04" },
  { section: "Ranaghat Section", name: "Fulia-Township Road", length: 3.20, width: "5.50", startCh: "0.00", endCh: "3.20" },
  { section: "Ranaghat Section", name: "Fulia-Taherpur-Birnagar Road", length: 3.80, width: "5.50", startCh: "0.00", endCh: "3.80" },
  { section: "Ranaghat Section", name: "Fulia-Arbandi Road", length: 8.00, width: "3.75", startCh: "0.00", endCh: "8.00" },
  { section: "Ranaghat Section", name: "Cable Suspension Foot Bridge on the River Churni", length: 0.070, width: "4.44", startCh: "0.00", endCh: "0.070" },
  { section: "Ranaghat Section", name: "K.C.Guha Memorial T.B.Hospital Road", length: 0.655, width: "2.44", startCh: "0.00", endCh: "0.655" },
  { section: "Ranaghat Section", name: "Habibpur B.D.O office to Birnagar Rail Gate", length: 3.367, width: "3.75", startCh: "0.00", endCh: "3.367" },
  { section: "Ranaghat Section", name: "Badkulla- Aranghata Road", length: 12.50, width: "3.75", startCh: "0.00", endCh: "12.50" },
  { section: "Aranghata Section", name: "Dignagar- Badkulla Road", length: 8.40, width: "5.50", startCh: "0.00", endCh: "8.40" },
  { section: "Aranghata Section", name: "Santipur- Kalnaghat Road", length: 8.00, width: "5.50", startCh: "0.00", endCh: "8.00" },
  { section: "Aranghata Section", name: "Santipur- Guptipara Ferry Ghat Road", length: 2.29, width: "5.50/3.75", startCh: "0.00", endCh: "2.29" },
  { section: "Aranghata Section", name: "Dignagar-Beliadanga-Baganchara Road", length: 7.70, width: "5.50", startCh: "0.00", endCh: "7.70" },
  { section: "Aranghata Section", name: "Santipur Municipal Link Road", length: 7.55, width: "5.50", startCh: "0.00", endCh: "7.55" },
  { section: "Aranghata Section", name: "Fulia-Tarapur Road", length: 1.68, width: "3.75", startCh: "0.00", endCh: "1.68" },
  { section: "Aranghata Section", name: "Haripur-Baganchara Road", length: 4.66, width: "5.50", startCh: "0.00", endCh: "4.66" },
  { section: "Aranghata Section", name: "Gobindapur Bypass to Mukundapur Road Via Baganchara Bhaluka", length: 19.95, width: "4.85", startCh: "0.00", endCh: "19.95" },
  { section: "Chakdaha Section", name: "Paschim Noapara to Habibpur Railway Station Road", length: 11.73, width: "3.75", startCh: "0.00", endCh: "11.73" },
  { section: "Chakdaha Section", name: "N.H-34 to Tarapur- Balagarghat Road", length: 7.43, width: "5.50", startCh: "0.00", endCh: "7.43" },
  { section: "Chakdaha Section", name: "Tarapur- Balagarghat Road wth Link Road to Rabanberia Ghat Road", length: 9.73, width: "5.50", startCh: "0.00", endCh: "9.73" },
  { section: "Chakdaha Section", name: "Birnaghar- Aranghata Road", length: 7.70, width: "5.50", startCh: "0.00", endCh: "7.70" },
  { section: "Chakdaha Section", name: "NH-34 to Ravenbria via Payaradanga Rly Stn Road", length: 3.41, width: "5.50", startCh: "0.00", endCh: "3.41" },
  { section: "Chakdaha Section", name: "Dakshin Belepara to Badkulla Palpara Road", length: 13.50, width: "3.75", startCh: "0.00", endCh: "13.50" }
];

export const initialStructures: StructureAsset[] = [
  { section: "Ranaghat Section", type: "Bridge", name: "Bridge over 12 Maser Khal", length: 0.025, location: "Ranaghat Area" },
  { section: "Ranaghat Section", type: "Bridge", name: "Bridge over Anjana at 18.8 Km of RKSH-11 Road", length: 0.045, location: "18.80 Km of RKSH-11 Road" },
  { section: "Ranaghat Section", type: "Bridge", name: "Bridge over Anjana at Badkulla of 14.30 Km of RKSH-11 Road", length: 0.035, location: "14.30 Km of RKSH-11 Road" },
  { section: "Ranaghat Section", type: "Bridge", name: "Bridge at 5.70 Km of Badkulla Aranghata Road", length: 0.020, location: "5.70 Km of Badkulla Aranghata Road" },
  { section: "Ranaghat Section", type: "Building", name: "Ranaghat Highway Sub Division & Section Office Building including Stack Yard", length: 0, location: "Mission road, Ranaghat, Nadia, Pin- 741203" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge over Canal at Santipur Bypass (Ghoralia Bridge)", length: 0.030, location: "Santipur Bypass" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge over canal near Pather Sathi at Santipur", length: 0.025, location: "Near Pather Sathi, Santipur" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge at Dignagar Badkulla", length: 0.020, location: "Dignagar-Badkulla Road" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge at Santipur Kalnaghat Road (Munshir pole)", length: 0.030, location: "Munshir pole, Kalnaghat Road" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge at Santipur Kalnaghat Road", length: 0.020, location: "Kalnaghat Road" },
  { section: "Aranghata Section", type: "Bridge", name: "Bridge over river Chariganga at Gobindapur by pass to Mukundapur Road", length: 0.050, location: "Chariganga River" },
  { section: "Chakdaha Section", type: "Bridge", name: "Bridge over Galakata Khal", length: 0.020, location: "Galakata Khal" },
  { section: "Chakdaha Section", type: "Bridge", name: "Bridge over River Churni ( Jugol Kishor)", length: 0.075, location: "Churni River" },
  { section: "Chakdaha Section", type: "Bridge", name: "Bridge at 2 Km of NH 34 to Tarapur Balagarhghat Road (Box Bridge)", length: 0.015, location: "2.00 Km of NH-34 to Tarapur Balagarhghat Rd" },
  { section: "Chakdaha Section", type: "Bridge", name: "Bridge at Purandarpur", length: 0.020, location: "Purandarpur" }
];

export const initialProjects: ProjectRecord[] = [
  {
    id: "PRJ-101",
    section: "Ranaghat Section",
    assetName: "Ranaghat- Krishnanagar State Highway-11(RKSH-11)",
    projectName: "Special repair to RKSH-11 Road from 0.00 to 10.00 Km",
    startCh: "0.00",
    endCh: "10.00",
    length: 10.00,
    fy: "2026-2027",
    tenderNo: "T-01/26-27",
    tenderAuthority: "Executive Engineer, Nadia Highway Division",
    workOrderNo: "Memo 441 dt 12/08/2026",
    agency: "M/S Zenith Construction",
    quotedRate: "-2.50%",
    tenderedAmt: 438750,
    progress: 75,
    stage: "Ongoing",
    remarks: "Work progressing smoothly"
  },
  {
    id: "PRJ-100",
    section: "Ranaghat Section",
    assetName: "Ranaghat- Krishnanagar State Highway-11(RKSH-11)",
    projectName: "Periodic Maintenance from 12.00 to 18.00 Km",
    startCh: "12.00",
    endCh: "18.00",
    length: 6.00,
    fy: "2024-2025",
    tenderNo: "T-15/24-25",
    tenderAuthority: "Executive Engineer, Nadia Highway Division",
    workOrderNo: "Memo 108 dt 05/01/2025",
    agency: "M/S Apex Builders",
    quotedRate: "+1.20%",
    tenderedAmt: 980000,
    progress: 100,
    stage: "Completed",
    completionDate: "2025-06-30",
    dlp1: "2026-06-30",
    dlp2: "2028-06-30",
    dlpLast: "2030-06-30",
    remarks: "Completed within scheduled time"
  }
];

export const initialTenders: TenderRecord[] = [
  {
    id: "TND-101",
    serialNo: "1",
    section: "Ranaghat Section",
    projectName: "Special repair to RKSH-11 Road from 0.00 to 10.00 Km",
    fy: "2026-2027",
    estAmt: 450000,
    nitNo: "WBPWD/RHSD/NIT-01/26-27",
    tenderAuthority: "Executive Engineer, Nadia Highway Division",
    agency: "M/S Zenith Construction",
    quotedRate: "-2.50%",
    tenderedAmt: 438750,
    emdAmount: 9000,
    completionDays: 60,
    permissionLastDate: "2026-08-01T14:00",
    purchaseLastDate: "2026-08-04T16:00",
    droppingLastDate: "2026-08-08T14:00",
    openingDate: "2026-08-08T15:00",
    webPublishDate: "2026-07-25",
    paperName: "Anandabazar Patrika",
    paperPublishDate: "2026-07-26",
    csStatus: "Approved",
    woServed: "Yes",
    status: "Completed Tender"
  },
  {
    id: "TND-102",
    serialNo: "2",
    section: "Aranghata Section",
    projectName: "Patch repair to Dignagar-Badkulla Road",
    fy: "2026-2027",
    estAmt: 250000,
    nitNo: "WBPWD/RHSD/NIT-02/26-27",
    tenderAuthority: "Assistant Engineer, Ranaghat Highway Sub Division",
    agency: "M/S Bengal Infra",
    quotedRate: "-1.00%",
    tenderedAmt: 247500,
    emdAmount: 5000,
    completionDays: 30,
    permissionLastDate: "2026-09-28T14:00",
    purchaseLastDate: "2026-09-29T16:00",
    droppingLastDate: "2026-10-03T14:00",
    openingDate: "2026-10-03T15:00",
    webPublishDate: "2026-09-22",
    paperName: "Bartaman",
    paperPublishDate: "2026-09-23",
    csStatus: "Pending",
    woServed: "No",
    status: "Tender in Process"
  }
];

export const initialBills: BillingRecord[] = [
  {
    id: "BIL-101",
    tenderNo: "T-01/26-27",
    section: "Ranaghat Section",
    projectName: "Special repair to RKSH-11 Road from 0.00 to 10.00 Km",
    agency: "M/S Zenith Construction",
    billNo: "1st RA Bill",
    fy: "2026-2027",
    tenderedAmount: 438750,
    amount: 320000,
    date: "2026-09-15",
    usedMBs: "MB No. 104, Page 22-45",
    siteInspectedOn: "2026-09-10",
    verifiedOn: "2026-09-12",
    remarksJE: "Satisfactory work",
    sendMemo: "Memo 512/RHSD",
    sendDate: "2026-09-15",
    status: "Forwarded to EE"
  }
];

export const initialInstructions: InstructionRecord[] = [
  {
    id: "INS-501",
    targetStaff: "Dipankar Bala",
    phone: "8393035090",
    section: "Ranaghat Section",
    projectRef: "RKSH-11 Road (18.8 Km Bridge)",
    subject: "অঞ্জনা নদীর ওপর ১৮.৮ কিমি ব্রিজের উইংওয়াল ও স্প্যান অবিলম্বে পরিদর্শন করে ছবি ও কমপ্লায়েন্স রিপোর্ট দিন।",
    fileLink: "https://drive.google.com",
    issueDate: "2026-09-20",
    reminderDate: "2026-09-21",
    status: "Pending",
    seen: false,
    replyText: "",
    replyFile: "",
    gps: ""
  }
];

export const initialWorkflow: WorkflowItem[] = [
  {
    id: "WF-1",
    memoNo: "RHSD/W-104/2026",
    date: "2026-09-22",
    project: "Special repair to RKSH-11 Road",
    tenderNo: "T-01/26-27",
    from: "Assistant Engineer",
    to: "Executive Engineer, Nadia Highway Division-I",
    subject: "Work order confirmation & security verification",
    status: "Dispatched",
    section: "Ranaghat Section"
  }
];

export const initialSDOffice: SDOfficeFile[] = [
  { 
    memoNo: "RHSD/Est-12/2026", 
    date: "2026-09-18", 
    subject: "Administrative Approval for Special Repair to SH-11", 
    senderReceiver: "Executive Engineer, Nadia Highway Division-I", 
    category: "Administrative", 
    status: "Received & Processed" 
  }
];

export const initialTrash: TrashItem[] = [];
