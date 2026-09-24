export interface StaffMember {
  name: string;
  designation: string;
  section: string;
  phone: string;
  pass: string;
  role: 'admin' | 'je' | 'operator' | 'barababu';
}

export interface RoadAsset {
  id?: string;
  section: string;
  name: string;
  length: number;
  width: string;
  startCh: string;
  endCh: string;
}

export interface StructureAsset {
  id?: string;
  section: string;
  type: 'Bridge' | 'Building';
  name: string;
  length: number;
  location: string;
  spanCount?: number;
}

export interface ProjectRecord {
  id: string;
  migratedTenderId?: string;
  migratedFromTender?: boolean;
  section: string;
  assetType?: string;
  assetName?: string;
  projectName: string;
  startCh?: string;
  endCh?: string;
  length?: number;
  fy?: string;
  tenderNo?: string;
  tenderAuthority?: string;
  workOrderNo?: string;
  agency?: string;
  quotedRate?: string;
  tenderedAmt?: number;
  progress: number;
  stage: string;
  completionDate?: string;
  dlp1?: string;
  dlp2?: string;
  dlpLast?: string;
  remarks?: string;
  lastUpdated?: string;
  workOrderData?: string;
  workOrderName?: string;
  workOrderType?: string;
  securityDeposits?: {
    [phase in '1st' | '2nd' | 'last']?: {
      siteInspectedOn?: string;
      applicationVerifiedOn?: string;
      remarksFromJE?: string;
      sdSendMemo?: string;
      sdSendDate?: string;
      status?: string;
      securityStatus?: string;
      forwardedTo?: string;
      recommendedOn?: string;
    };
  };
}

export interface TenderRecord {
  id: string;
  tenderAuthority?: string;
  serialNo?: string;
  section: string;
  assetType?: string;
  assetName?: string;
  projectName: string;
  fy?: string;
  startCh?: string;
  endCh?: string;
  length?: number;
  estAmt?: number;
  estimatedCost?: number;
  nitNo?: string;
  tenderNo?: string;
  workOrderNo?: string;
  agency?: string;
  quotedRate?: string;
  tenderedAmt?: number;
  emdAmount?: number;
  completionDays?: number;
  permissionLastDate?: string;
  purchaseLastDate?: string;
  droppingLastDate?: string;
  openingDate?: string;
  webPublishDate?: string;
  publishDate?: string;
  paperName?: string;
  paperPublishDate?: string;
  csSentDate?: string;
  lowestAgency?: string;
  bankDraftNo?: string;
  bankDraftDate?: string;
  bankName?: string;
  csStatus?: string;
  csReceiptDate?: string;
  remarks?: string;
  tenderNoticeData?: string;
  tenderNoticeName?: string;
  workOrderData?: string;
  workOrderName?: string;
  woDate?: string;
  woServed?: string;
  status: string;
  action?: string;
}

export interface BillingRecord {
  id: string;
  tenderNo: string;
  projectId?: string;
  section?: string;
  projectName: string;
  agency?: string;
  nature?: string;
  billNo: string;
  fy?: string;
  amount: number;
  date?: string;
  tenderedAmount?: number;
  usedMBs?: string;
  siteInspectedOn?: string;
  verifiedOn?: string;
  remarksJE?: string;
  remarks?: string;
  sendMemo?: string;
  sendDate?: string;
  status: string;
  assignedJE?: string;
  recommendedOn?: string;
}

export interface InstructionRecord {
  id: string;
  targetStaff: string;
  phone: string;
  section: string;
  projectRef?: string;
  subject: string;
  fileLink?: string;
  attachmentData?: string;
  attachmentName?: string;
  attachmentType?: string;
  issueDate: string;
  reminderDate: string;
  status: 'Pending' | 'Complied' | 'Cancelled';
  seen?: boolean;
  replyText?: string;
  replyFile?: string;
  replyAttachmentData?: string;
  replyAttachmentName?: string;
  replyAttachmentType?: string;
  gps?: string;
}

export interface WorkflowItem {
  id: string;
  memoNo: string;
  date: string;
  project: string;
  tenderNo?: string;
  from: string;
  to: string;
  subject: string;
  status: string;
  section?: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  type?: string;
  billId?: string;
  projectId?: string;
  securityPhase?: '1st' | '2nd' | 'last';
  recommendedOn?: string;
  barababuSentOn?: string;
}

export interface SDOfficeFile {
  id?: string;
  memoNo: string;
  date: string;
  subject: string;
  senderReceiver: string;
  category: string;
  status: string;
  fileLink?: string;
}

export interface TrashItem {
  id: string;
  itemType: 'project' | 'tender' | 'billing' | 'instruction' | 'workflow' | 'sdoffice' | 'road' | 'structure';
  type?: 'project' | 'tender' | 'billing' | 'instruction' | 'workflow' | 'sdoffice' | 'road' | 'structure';
  title: string;
  deletedBy: string;
  deletedAt: string;
  originalId?: string;
  data: any;
}
