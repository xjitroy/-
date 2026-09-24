import React, { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  signInWithGoogleWorkspace, 
  logoutGoogle, 
  getCachedAccessToken, 
  initAuth 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  StaffMember, 
  RoadAsset, 
  StructureAsset, 
  ProjectRecord, 
  TenderRecord, 
  BillingRecord, 
  InstructionRecord, 
  WorkflowItem, 
  SDOfficeFile 
} from './types';
import { 
  initialStaff, 
  initialRoads, 
  initialStructures, 
  initialProjects, 
  initialTenders, 
  initialBills, 
  initialInstructions, 
  initialWorkflow, 
  initialSDOffice 
} from './initialData';
import { 
  exportToGoogleSheets, 
  exportToGoogleDocs, 
  createGoogleCalendarEvent, 
  createGoogleTask 
} from './workspace';
import { queryMapsGroundingLocation } from './geminiMaps';

export default function App() {
  // Authentication & Users
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [selectedStaffName, setSelectedStaffName] = useState(initialStaff[0].name);
  const [showPassword, setShowPassword] = useState(false);

  // App Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jurisdiction' | 'tender_billing' | 'projects' | 'instructions' | 'workflow' | 'sdoffice' | 'staff' | 'my_tasks'>('dashboard');

  // Firestore Synchronized State
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [roadsList, setRoadsList] = useState<RoadAsset[]>(initialRoads);
  const [structuresList, setStructuresList] = useState<StructureAsset[]>(initialStructures);
  const [projectsList, setProjectsList] = useState<ProjectRecord[]>(initialProjects);
  const [tendersList, setTendersList] = useState<TenderRecord[]>(initialTenders);
  const [billingList, setBillingList] = useState<BillingRecord[]>(initialBills);
  const [instructionsList, setInstructionsList] = useState<InstructionRecord[]>(initialInstructions);
  const [workflowList, setWorkflowList] = useState<WorkflowItem[]>(initialWorkflow);
  const [sdOfficeList, setSdOfficeList] = useState<SDOfficeFile[]>(initialSDOffice);

  // Filter and Interactive States
  const [assetCategory, setAssetCategory] = useState<'roads' | 'bridges' | 'buildings'>('roads');
  const [assetSectionFilter, setAssetSectionFilter] = useState('all');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [activeSecurityPhase, setActiveSecurityPhase] = useState<'1st' | '2nd' | 'last'>('1st');

  // Modals
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ name: string; section: string } | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [editingTenderId, setEditingTenderId] = useState<string | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [activeReplyInstruction, setActiveReplyInstruction] = useState<InstructionRecord | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyGps, setReplyGps] = useState('23.1812° N, 88.5639° E');
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showMapsAssistantModal, setShowMapsAssistantModal] = useState(false);
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsResult, setMapsResult] = useState('');
  const [isMapsLoading, setIsMapsLoading] = useState(false);

  // Forms State
  const [instructionForm, setInstructionForm] = useState({
    targetStaff: '',
    projectRef: '',
    subject: '',
    fileLink: '',
    issueDate: new Date().toISOString().slice(0, 10),
    reminderDate: new Date().toISOString().slice(0, 10)
  });

  const [tenderForm, setTenderForm] = useState<Partial<TenderRecord>>({
    section: 'Ranaghat Section',
    assetType: 'Road',
    csStatus: 'Pending',
    woServed: 'No',
    status: 'Tender in Process',
    fy: '2026-2027'
  });

  const [billingForm, setBillingForm] = useState({
    fy: '2026-2027',
    tenderNo: '',
    projectName: '',
    billNo: '1st RA Bill',
    amount: 0,
    usedMBs: '',
    siteInspectedOn: '',
    verifiedOn: '',
    remarksJE: ''
  });

  const [workflowForm, setWorkflowForm] = useState({
    memoNo: '',
    date: new Date().toISOString().slice(0, 10),
    project: '',
    from: '',
    to: '',
    subject: '',
    status: 'Pending'
  });

  // Export Progress Notification
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Setup Firestore Realtime Listeners
  useEffect(() => {
    // 1. Initial Auth Check
    initAuth(
      (user, token) => {
        setGoogleUser(user);
        setWorkspaceToken(token);
      },
      () => {
        setGoogleUser(null);
        setWorkspaceToken(null);
      }
    );

    // 2. Realtime Firestore Sync for Cloud Persistence
    const unsubProjects = onSnapshot(doc(db, 'system', 'projects_state'), (snapshot) => {
      if (snapshot.exists()) {
        setProjectsList(snapshot.data().list || initialProjects);
      } else {
        setDoc(doc(db, 'system', 'projects_state'), { list: initialProjects });
      }
    });

    const unsubTenders = onSnapshot(doc(db, 'system', 'tenders_state'), (snapshot) => {
      if (snapshot.exists()) {
        setTendersList(snapshot.data().list || initialTenders);
      } else {
        setDoc(doc(db, 'system', 'tenders_state'), { list: initialTenders });
      }
    });

    const unsubBills = onSnapshot(doc(db, 'system', 'bills_state'), (snapshot) => {
      if (snapshot.exists()) {
        setBillingList(snapshot.data().list || initialBills);
      } else {
        setDoc(doc(db, 'system', 'bills_state'), { list: initialBills });
      }
    });

    const unsubInstructions = onSnapshot(doc(db, 'system', 'instructions_state'), (snapshot) => {
      if (snapshot.exists()) {
        setInstructionsList(snapshot.data().list || initialInstructions);
      } else {
        setDoc(doc(db, 'system', 'instructions_state'), { list: initialInstructions });
      }
    });

    const unsubWorkflow = onSnapshot(doc(db, 'system', 'workflow_state'), (snapshot) => {
      if (snapshot.exists()) {
        setWorkflowList(snapshot.data().list || initialWorkflow);
      } else {
        setDoc(doc(db, 'system', 'workflow_state'), { list: initialWorkflow });
      }
    });

    return () => {
      unsubProjects();
      unsubTenders();
      unsubBills();
      unsubInstructions();
      unsubWorkflow();
    };
  }, []);

  // Sync helpers to Firestore
  const syncToCloud = async (collectionDoc: string, dataArray: any[]) => {
    try {
      await setDoc(doc(db, 'system', collectionDoc), { list: dataArray });
    } catch (err) {
      console.warn("Offline/Cloud sync fallback:", err);
    }
  };

  // Login handler
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = staffList.find(s => s.name === selectedStaffName);
    if (found && found.pass === authPassword) {
      setCurrentUser(found);
      setAuthPassword('');
      if (found.role === 'admin') setActiveTab('dashboard');
      else if (found.role === 'je') setActiveTab('my_tasks');
      else setActiveTab('dashboard');
    } else {
      alert("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে লগইন করুন।");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleGoogleConnect = async () => {
    try {
      setStatusMessage("Google Workspace এর সাথে সংযোগ করা হচ্ছে...");
      const result = await signInWithGoogleWorkspace();
      if (result) {
        setGoogleUser(result.user);
        setWorkspaceToken(result.accessToken);
        setStatusMessage("সফলভাবে Google Workspace যুক্ত হয়েছে!");
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (error: any) {
      alert("Google সাইন-ইন সম্পন্ন করা যায়নি: " + error.message);
      setStatusMessage(null);
    }
  };

  // Google Sheets Export
  const handleExportSheets = async () => {
    if (!workspaceToken) {
      alert("Google Sheets এ এক্সপোর্ট করতে অনুগ্রহ করে উপরে 'Google Workspace Connect' এ ক্লিক করে লগইন করুন।");
      return;
    }
    try {
      setStatusMessage("Google Sheets এ রিপোর্ট পাঠানো হচ্ছে...");
      const headers = ["ID", "সেকশন", "প্রকল্পের নাম", "চেইনেজ", "দৈর্ঘ্য (Km)", "এজেন্সি", "টাকার পরিমাণ (₹)", "অগ্রগতি (%)", "স্টেজ", "DLP 1st", "DLP 2nd", "DLP Last"];
      const rows = projectsList.map(p => [
        p.id,
        p.section,
        p.projectName,
        `${p.startCh || '0.00'} - ${p.endCh || '0.00'}`,
        p.length || 0,
        p.agency || 'N/A',
        p.tenderedAmt || 0,
        `${p.progress}%`,
        p.stage,
        p.dlp1 || '-',
        p.dlp2 || '-',
        p.dlpLast || '-'
      ]);

      const res = await exportToGoogleSheets({
        title: `Ranaghat_PWDTE_Projects_Report_${new Date().toISOString().slice(0, 10)}`,
        headers,
        rows
      });

      setStatusMessage(`সফলভাবে তৈরি হয়েছে! Google Sheet খুলুন:`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      alert("এক্সপোর্ট সমস্যা: " + err.message);
    } finally {
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  // Google Docs Export
  const handleExportDocs = async () => {
    if (!workspaceToken) {
      alert("Google Docs তৈরি করতে অনুগ্রহ করে প্রথমে 'Google Workspace Connect' করুন।");
      return;
    }
    try {
      setStatusMessage("Google Docs তৈরি হচ্ছে...");
      const paragraphs = [
        "Government of West Bengal",
        "Public Works (Roads) Directorate",
        "Ranaghat Highway Sub Division, Nadia",
        "--------------------------------------------------",
        `OFFICE EXECUTIVE SUMMARY & COMPLIANCE REPORT - ${new Date().toLocaleDateString('en-GB')}`,
        "",
        `১. মোট রোড সংখ্যা: ${roadsList.length} টি (মোট দৈর্ঘ্য: ${roadsList.reduce((acc, r) => acc + (r.length || 0), 0).toFixed(2)} Km)`,
        `২. মোট ব্রিজ সংখ্যা: ${structuresList.filter(s => s.type === 'Bridge').length} টি`,
        `৩. চলমান প্রকল্প: ${projectsList.filter(p => p.progress < 100).length} টি`,
        `৪. সম্পন্ন প্রকল্প: ${projectsList.filter(p => p.progress === 100).length} টি`,
        `৫. বর্তমান পেন্ডিং নির্দেশ: ${instructionsList.filter(i => i.status === 'Pending').length} টি`,
        "",
        "প্রকল্পের বিস্তারিত তালিকা:",
        ...projectsList.map((p, i) => `${i + 1}. [${p.section}] ${p.projectName} (টাকা: ₹${p.tenderedAmt?.toLocaleString('en-IN') || 0}, অগ্রগতি: ${p.progress}%, স্টেজ: ${p.stage})`)
      ];

      const res = await exportToGoogleDocs(`PWDTE_Ranaghat_Summary_${new Date().toISOString().slice(0, 10)}`, paragraphs);
      setStatusMessage("Google Docs রিপোর্ট তৈরি সফল!");
      window.open(res.documentUrl, '_blank');
    } catch (err: any) {
      alert("Docs তৈরি করা যায়নি: " + err.message);
    } finally {
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  // Google Calendar Integration
  const handleAddToCalendar = async (title: string, dateStr: string) => {
    if (!workspaceToken) {
      alert("Google Calendar এ রিমাইন্ডার যোগ করতে Google Workspace Connect করুন।");
      return;
    }
    try {
      setStatusMessage("Google Calendar এ ইভেন্ট শিডিউল করা হচ্ছে...");
      await createGoogleCalendarEvent(
        `[PWDTE] ${title}`,
        `Ranaghat Highway Sub Division Inspection / Compliance Reminder for ${title}`,
        dateStr
      );
      setStatusMessage("Google Calendar এ ইভেন্ট সফলভাবে যোগ করা হয়েছে!");
    } catch (err: any) {
      alert("Calendar এ যোগ করা যায়নি: " + err.message);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Google Tasks Integration
  const handleAddToTasks = async (title: string, notes: string, dueDate: string) => {
    if (!workspaceToken) {
      alert("Google Tasks এ অ্যাসাইন করতে Google Workspace Connect করুন।");
      return;
    }
    try {
      setStatusMessage("Google Tasks এ কাজ যোগ করা হচ্ছে...");
      await createGoogleTask(title, notes, dueDate);
      setStatusMessage("Google Tasks এ সফলভাবে টাস্ক তৈরি হয়েছে!");
    } catch (err: any) {
      alert("Tasks এ যোগ করা যায়নি: " + err.message);
    } finally {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Google Maps Assistant Handler
  const handleSearchMaps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsQuery.trim()) return;
    setIsMapsLoading(true);
    setMapsResult('');
    const res = await queryMapsGroundingLocation(mapsQuery);
    setMapsResult(res);
    setIsMapsLoading(false);
  };

  // Instructions Action
  const handleSaveInstruction = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaff = staffList.find(s => s.name === instructionForm.targetStaff) || staffList[1];
    const newIns: InstructionRecord = {
      id: `INS-${Date.now().toString().slice(-4)}`,
      targetStaff: targetStaff.name,
      phone: targetStaff.phone,
      section: targetStaff.section,
      projectRef: instructionForm.projectRef || 'General Road/Bridge',
      subject: instructionForm.subject,
      fileLink: instructionForm.fileLink,
      issueDate: instructionForm.issueDate,
      reminderDate: instructionForm.reminderDate,
      status: 'Pending',
      seen: false
    };

    const updated = [newIns, ...instructionsList];
    setInstructionsList(updated);
    await syncToCloud('instructions_state', updated);
    setShowInstructionModal(false);

    // Auto-sync with Google Tasks & Calendar if enabled
    if (workspaceToken) {
      try {
        await createGoogleTask(`[নির্দেশ] ${newIns.subject}`, `প্রাপক: ${targetStaff.name}, সেকশন: ${targetStaff.section}`, newIns.reminderDate);
        await createGoogleCalendarEvent(`[PWDTE নির্দেশ] ${newIns.subject}`, `রেফারেন্স: ${newIns.projectRef}`, newIns.reminderDate);
      } catch (err) {
        console.warn("Background workspace sync:", err);
      }
    }

    alert("অফিসিয়াল নির্দেশ সফলভাবে জারি করা হয়েছে এবং সার্ভারে সংরক্ষিত হয়েছে!");
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplyInstruction) return;

    const updated = instructionsList.map(item => {
      if (item.id === activeReplyInstruction.id) {
        return {
          ...item,
          status: 'Complied' as const,
          replyText: replyText,
          gps: replyGps
        };
      }
      return item;
    });

    setInstructionsList(updated);
    await syncToCloud('instructions_state', updated);
    setShowReplyModal(false);
    setActiveReplyInstruction(null);
    setReplyText('');
    alert("কমপ্লায়েন্স রিপোর্ট জিপিএস লোকেশন সহ সার্ভারে পাঠানো হয়েছে!");
  };

  // Metrics
  const totalRoadKm = roadsList.reduce((acc, r) => acc + (r.length || 0), 0);
  const totalBridgeKm = structuresList.filter(s => s.type === 'Bridge').reduce((acc, b) => acc + (b.length || 0), 0);
  const totalOngoingKm = projectsList.filter(p => p.progress < 100).reduce((acc, p) => acc + (p.length || 0), 0);
  const totalCompletedKm = projectsList.filter(p => p.progress === 100).reduce((acc, p) => acc + (p.length || 0), 0);
  const totalBillingAmount = billingList.reduce((acc, b) => acc + (b.amount || 0), 0);
  const pendingInstructions = instructionsList.filter(i => i.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* ================= 1. LOGIN GATEWAY OVERLAY ================= */}
      {!currentUser && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto shadow-md border-2 border-amber-400">
                <i className="fa-solid fa-landmark text-amber-400 text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">আমার অফিস</h2>
              <p className="text-xs font-bold text-indigo-950">Ranaghat Highway Sub Division, PWRDTE</p>
              <p className="text-[11px] text-slate-500">Mission Road, Ranaghat, Nadia, Pin- 741203</p>
            </div>

            <form onSubmit={handleUserLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">অফিসার / ব্যবহারকারী নির্বাচন করুন</label>
                <select 
                  value={selectedStaffName} 
                  onChange={(e) => setSelectedStaffName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {staffList.map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} - {s.designation} ({s.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অ্যাপ অ্যাক্সেস পাসওয়ার্ড</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required 
                    placeholder="পাসওয়ার্ড লিখুন..." 
                    className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-800 font-semibold outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <i className="fa-solid fa-right-to-bracket"></i> লগইন করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 2. TOP HEADER ================= */}
      <header className="bg-indigo-950 text-white shadow-lg sticky top-0 z-40 border-b border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-amber-400">
              <i className="fa-solid fa-road text-indigo-950 text-xl"></i>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                আমার অফিস
                <span className="text-[10px] bg-amber-400 text-indigo-950 font-bold px-2 py-0.5 rounded uppercase">PWRDTE</span>
              </h1>
              <p className="text-[11px] text-indigo-200">Ranaghat Highway Sub Division • Nadia</p>
            </div>
          </div>

          {/* Google Workspace & User Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!googleUser ? (
              <button 
                onClick={handleGoogleConnect}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <i className="fa-brands fa-google text-red-500"></i> Google Workspace Connect
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-900 border border-indigo-700 px-3 py-1 rounded-xl text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-300 font-semibold">{googleUser.displayName || 'Google Connected'}</span>
                <button 
                  onClick={handleExportSheets} 
                  title="Export to Google Sheets"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                >
                  <i className="fa-solid fa-table mr-1"></i> Sheets
                </button>
                <button 
                  onClick={handleExportDocs} 
                  title="Export to Google Docs"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                >
                  <i className="fa-solid fa-file-word mr-1"></i> Docs
                </button>
              </div>
            )}

            <button 
              onClick={() => setShowMapsAssistantModal(true)}
              className="bg-indigo-800 hover:bg-indigo-700 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-600 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-map-location-dot"></i> Maps ডেটা
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2 bg-indigo-900 border border-indigo-700 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-amber-400 font-bold">{currentUser.name} ({currentUser.role.toUpperCase()})</span>
                <button 
                  onClick={handleLogout} 
                  className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded-lg text-xs font-bold transition"
                >
                  লগআউট
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="bg-amber-400 text-indigo-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow">
          <i className="fa-solid fa-circle-info"></i> {statusMessage}
        </div>
      )}

      {/* ================= 3. MAIN DASHBOARD CONTAINER ================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-4 p-4">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-slate-200 p-3 h-fit space-y-1 flex-shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            প্রধান মেনু
          </div>

          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
          >
            <i className="fa-solid fa-gauge-high w-4 text-center"></i> ড্যাশবোর্ড (Dashboard)
          </button>

          <button 
            onClick={() => setActiveTab('jurisdiction')} 
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'jurisdiction' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
          >
            <i className="fa-solid fa-road w-4 text-center"></i> রোড ও ইনফ্রা (Assets)
          </button>

          <button 
            onClick={() => setActiveTab('tender_billing')} 
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'tender_billing' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
          >
            <i className="fa-solid fa-file-invoice-dollar w-4 text-center"></i> টেন্ডার ও বিলিং সেকশন
          </button>

          <button 
            onClick={() => setActiveTab('projects')} 
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'projects' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
          >
            <i className="fa-solid fa-person-digging w-4 text-center"></i> চলমান ও সম্পন্ন কাজ
          </button>

          {/* Admin and Office Tabs */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'barababu' || currentUser.role === 'operator') && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                অফিস কন্ট্রোল
              </div>

              <button 
                onClick={() => setActiveTab('instructions')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'instructions' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-paper-plane w-4 text-center"></i> নির্দেশ ও কমপ্লায়েন্স
              </button>

              <button 
                onClick={() => setActiveTab('workflow')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'workflow' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-diagram-project w-4 text-center"></i> Work Flow
              </button>

              <button 
                onClick={() => setActiveTab('sdoffice')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'sdoffice' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-folder-tree w-4 text-center"></i> SD Office Section
              </button>

              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('staff')} 
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
                >
                  <i className="fa-solid fa-address-book w-4 text-center"></i> স্টাফ ডিরেক্টরি
                </button>
              )}
            </div>
          )}

          {/* Field JE Tab */}
          {currentUser && currentUser.role === 'je' && (
            <div className="pt-2 border-t border-slate-100">
              <button 
                onClick={() => setActiveTab('my_tasks')} 
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition border-l-4 ${activeTab === 'my_tasks' ? 'bg-indigo-50 text-indigo-700 border-indigo-700' : 'text-slate-600 hover:bg-slate-50 border-transparent'}`}
              >
                <i className="fa-solid fa-bell-concierge w-4 text-center text-rose-600"></i> আমার নির্দেশ ও কমপ্লায়েন্স
              </button>
            </div>
          )}
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 space-y-4">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h2 className="text-base font-black text-slate-800">সাব-ডিভিশন রিয়েল-টাইম ওভারভিউ</h2>
                  <p className="text-xs text-slate-500">ডাটাবেজ ও ক্লাউড সিঙ্ক চালু রয়েছে। সকল আপডেট সাথে সাথে প্রতিফলিত হবে।</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleExportSheets} 
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-file-excel"></i> Excel / Sheets
                  </button>
                  <button 
                    onClick={handleExportDocs} 
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-file-pdf"></i> Docs রিপোর্ট
                  </button>
                </div>
              </div>

              {/* STAT METRICS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => { setActiveTab('jurisdiction'); setAssetCategory('roads'); }} className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700">সড়ক</span>
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><i className="fa-solid fa-road"></i></div>
                  </div>
                  <p className="text-xl font-black text-slate-800">{roadsList.length} টি</p>
                  <p className="text-[11px] text-blue-600 font-bold mt-1">মোট: {totalRoadKm.toFixed(2)} Km</p>
                </div>

                <div onClick={() => { setActiveTab('jurisdiction'); setAssetCategory('bridges'); }} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-700">ব্রিজ</span>
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><i className="fa-solid fa-bridge"></i></div>
                  </div>
                  <p className="text-xl font-black text-slate-800">{structuresList.filter(s => s.type === 'Bridge').length} টি</p>
                  <p className="text-[11px] text-amber-600 font-bold mt-1">মোট: {totalBridgeKm.toFixed(3)} Km</p>
                </div>

                <div onClick={() => { setActiveTab('projects'); setProjectCategoryFilter('ongoing'); }} className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-700">চলমান কাজ</span>
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><i className="fa-solid fa-person-digging"></i></div>
                  </div>
                  <p className="text-xl font-black text-purple-800">{projectsList.filter(p => p.progress < 100).length} টি</p>
                  <p className="text-[11px] text-purple-600 font-bold mt-1">কাজে যুক্ত: {totalOngoingKm.toFixed(2)} Km</p>
                </div>

                <div onClick={() => { setActiveTab('projects'); setProjectCategoryFilter('completed'); }} className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-700">সম্পন্ন কাজ</span>
                    <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><i className="fa-solid fa-circle-check"></i></div>
                  </div>
                  <p className="text-xl font-black text-teal-800">{projectsList.filter(p => p.progress === 100).length} টি</p>
                  <p className="text-[11px] text-teal-600 font-bold mt-1">সম্পন্ন: {totalCompletedKm.toFixed(2)} Km</p>
                </div>

                <div onClick={() => setActiveTab('tender_billing')} className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700">চলমান টেন্ডার</span>
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><i className="fa-solid fa-file-signature"></i></div>
                  </div>
                  <p className="text-xl font-black text-indigo-900">{tendersList.filter(t => t.woServed !== 'Yes').length} টি</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1">পাইপলাইনে রয়েছে</p>
                </div>

                <div onClick={() => setActiveTab('tender_billing')} className="bg-white p-4 rounded-2xl border border-cyan-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-800">মোট বিলিং</span>
                    <div className="p-2 bg-cyan-100 text-cyan-800 rounded-lg"><i className="fa-solid fa-receipt"></i></div>
                  </div>
                  <p className="text-xl font-black text-cyan-950">₹{totalBillingAmount.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-cyan-700 font-semibold mt-1">ছাড়পত্রকৃত RA বিল</p>
                </div>

                <div onClick={() => setActiveTab('instructions')} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-700">পেন্ডিং নির্দেশ</span>
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><i className="fa-solid fa-bell"></i></div>
                  </div>
                  <p className="text-xl font-black text-rose-700">{pendingInstructions} টি</p>
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">কমপ্লায়েন্স অপেক্ষারত</p>
                </div>

                <div onClick={() => setActiveTab('workflow')} className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-700">Work Flow চিঠী</span>
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-lg"><i className="fa-solid fa-diagram-project"></i></div>
                  </div>
                  <p className="text-xl font-black text-sky-900">{workflowList.length} টি</p>
                  <p className="text-[11px] text-sky-600 font-semibold mt-1">লেটার ও ডিসপ্যাচ লগ</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JURISDICTION ASSETS */}
          {activeTab === 'jurisdiction' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">রোড ও ইনফ্রাস্ট্রাকচার অ্যাসেট মাস্টার</h2>
                  <p className="text-xs text-slate-500">নামের ওপর ক্লিক করে Work Prescription ও হিস্ট্রি দেখুন</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={assetSectionFilter} 
                    onChange={(e) => setAssetSectionFilter(e.target.value)}
                    className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 font-semibold outline-none"
                  >
                    <option value="all">সকল সেকশন (All Sections)</option>
                    <option value="Ranaghat Section">Ranaghat Section</option>
                    <option value="Aranghata Section">Aranghata Section</option>
                    <option value="Chakdaha Section">Chakdaha Section</option>
                  </select>
                  <select 
                    value={assetCategory} 
                    onChange={(e) => setAssetCategory(e.target.value as any)}
                    className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 font-semibold outline-none"
                  >
                    <option value="roads">সড়কসমূহ (Roads)</option>
                    <option value="bridges">ব্রিজসমূহ (Bridges)</option>
                    <option value="buildings">বিল্ডিং ও ইয়ার্ড (Buildings)</option>
                  </select>
                </div>
              </div>

              {assetCategory === 'roads' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-indigo-950 text-white uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">সেকশন</th>
                          <th className="p-3">সড়কের নাম (Work Prescription)</th>
                          <th className="p-3">দৈর্ঘ্য (Km)</th>
                          <th className="p-3">প্রস্থ (m)</th>
                          <th className="p-3">Start Ch.</th>
                          <th className="p-3">End Ch.</th>
                          <th className="p-3 text-center">ম্যাপ অনুসন্ধান</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roadsList
                          .filter(r => assetSectionFilter === 'all' || r.section === assetSectionFilter)
                          .map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-medium text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-indigo-900">{r.section}</td>
                              <td className="p-3">
                                <button 
                                  onClick={() => { setSelectedAsset({ name: r.name, section: r.section }); setShowPrescriptionModal(true); }}
                                  className="text-left font-bold text-indigo-700 hover:underline"
                                >
                                  {r.name}
                                </button>
                              </td>
                              <td className="p-3">{r.length}</td>
                              <td className="p-3">{r.width}</td>
                              <td className="p-3 font-mono">{r.startCh}</td>
                              <td className="p-3 font-mono">{r.endCh}</td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => { setMapsQuery(`${r.name}, ${r.section}, Nadia, West Bengal`); setShowMapsAssistantModal(true); }}
                                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded text-[10px] font-bold"
                                >
                                  <i className="fa-solid fa-map-pin"></i> ম্যাপ লোকেশন
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">সেকশন</th>
                          <th className="p-3">ক্যাটাগরি</th>
                          <th className="p-3">নাম</th>
                          <th className="p-3">লোকেশন / ল্যান্ডমার্ক</th>
                          <th className="p-3 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {structuresList
                          .filter(s => assetCategory === 'bridges' ? s.type === 'Bridge' : s.type === 'Building')
                          .filter(s => assetSectionFilter === 'all' || s.section === assetSectionFilter)
                          .map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-medium text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-700">{s.section}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.type === 'Bridge' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {s.type}
                                </span>
                              </td>
                              <td className="p-3">
                                <button 
                                  onClick={() => { setSelectedAsset({ name: s.name, section: s.section }); setShowPrescriptionModal(true); }}
                                  className="text-left font-bold text-indigo-700 hover:underline"
                                >
                                  {s.name}
                                </button>
                              </td>
                              <td className="p-3 text-slate-600">{s.location}</td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => { setMapsQuery(`${s.name}, ${s.location}, Ranaghat, Nadia`); setShowMapsAssistantModal(true); }}
                                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-950 px-2 py-0.5 rounded text-[10px] font-bold"
                                >
                                  <i className="fa-solid fa-location-dot"></i> লোকেশন
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TENDER & BILLING */}
          {activeTab === 'tender_billing' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">টেন্ডার ও বিলিং সেকশন</h2>
                  <p className="text-xs text-slate-500">Tender Processing Flow ও Running Account (RA) Billing</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingTenderId(null); setShowTenderModal(true); }}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-3 py-2 rounded-xl shadow flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus"></i> নতুন টেন্ডার রেকর্ড
                  </button>
                  <button 
                    onClick={() => setShowBillingModal(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-2 rounded-xl shadow flex items-center gap-1"
                  >
                    <i className="fa-solid fa-file-invoice"></i> নতুন RA বিল যোগ করুন
                  </button>
                </div>
              </div>

              {/* TENDERS TABLE */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold flex justify-between items-center">
                  <span><i className="fa-solid fa-file-signature text-amber-400 mr-2"></i>চলমান টেন্ডার পাইপলাইন</span>
                  <span className="text-[10px] text-slate-300">Work Order Served = Yes হলে সরাসরি Ongoing প্রকল্পে যাবে</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Serial No</th>
                        <th className="p-3">NIT No</th>
                        <th className="p-3">সেকশন</th>
                        <th className="p-3">কাজের নাম</th>
                        <th className="p-3">EMD (₹)</th>
                        <th className="p-3">সময় (দিন)</th>
                        <th className="p-3">CS Status</th>
                        <th className="p-3">Work Order Served</th>
                        <th className="p-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tendersList.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono">{t.serialNo || idx + 1}</td>
                          <td className="p-3 font-mono font-bold">{t.nitNo}</td>
                          <td className="p-3 font-bold text-indigo-900">{t.section}</td>
                          <td className="p-3 font-medium">{t.projectName}</td>
                          <td className="p-3 font-mono">₹{t.emdAmount?.toLocaleString('en-IN') || 0}</td>
                          <td className="p-3">{t.completionDays || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.csStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {t.csStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.woServed === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {t.woServed === 'Yes' ? 'Served' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={async () => {
                                const updated = tendersList.map(item => item.id === t.id ? { ...item, woServed: 'Yes', status: 'Completed Tender' } : item);
                                setTendersList(updated);
                                await syncToCloud('tenders_state', updated);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                            >
                              Serve WO
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BILLING TABLE */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-emerald-950 text-white px-4 py-2.5 text-xs font-bold flex justify-between items-center">
                  <span><i className="fa-solid fa-receipt text-amber-400 mr-2"></i>RA বিলিং সেগমেন্ট</span>
                  <span className="text-[10px] text-emerald-200">মোট ছাড়: ₹{totalBillingAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-emerald-50 text-emerald-900 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Tender No</th>
                        <th className="p-3">প্রকল্পের নাম</th>
                        <th className="p-3">RA Bill No</th>
                        <th className="p-3">FY</th>
                        <th className="p-3">টাকার পরিমাণ (₹)</th>
                        <th className="p-3">MB Details</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billingList.map((b, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/40">
                          <td className="p-3 font-mono font-bold">{b.tenderNo}</td>
                          <td className="p-3 font-medium">{b.projectName}</td>
                          <td className="p-3 font-bold text-emerald-800">{b.billNo}</td>
                          <td className="p-3">{b.fy}</td>
                          <td className="p-3 font-mono font-bold">₹{b.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3">{b.usedMBs || '-'}</td>
                          <td className="p-3 font-mono">{b.date || '-'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS TRACKING */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">চলমান ও সম্পন্ন প্রকল্প ট্র্যাকিং</h2>
                  <p className="text-xs text-slate-500">DLP Quarters (1st, 2nd, Last) ও সরাসরি প্রজেক্ট হিস্ট্রি</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={projectCategoryFilter} 
                    onChange={(e) => setProjectCategoryFilter(e.target.value as any)}
                    className="text-xs border border-slate-300 rounded-xl p-2 bg-slate-50 font-bold outline-none"
                  >
                    <option value="all">সকল প্রকল্প (All)</option>
                    <option value="ongoing">চলমান প্রকল্প (Ongoing)</option>
                    <option value="completed">সম্পন্ন প্রকল্প (Completed)</option>
                  </select>
                  <button 
                    onClick={handleExportSheets} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow"
                  >
                    <i className="fa-solid fa-file-excel mr-1"></i> Sheets Export
                  </button>
                  <button 
                    onClick={handleExportDocs} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow"
                  >
                    <i className="fa-solid fa-file-word mr-1"></i> Docs Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-purple-950 text-white uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Tender No</th>
                        <th className="p-3">সেকশন</th>
                        <th className="p-3">প্রকল্পের নাম</th>
                        <th className="p-3">চেইনেজ</th>
                        <th className="p-3">এজেন্সি</th>
                        <th className="p-3">টাকার পরিমাণ (₹)</th>
                        <th className="p-3">অগ্রগতি (%)</th>
                        <th className="p-3">স্টেজ ও DLP</th>
                        <th className="p-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projectsList
                        .filter(p => {
                          if (projectCategoryFilter === 'ongoing') return p.progress < 100;
                          if (projectCategoryFilter === 'completed') return p.progress === 100;
                          return true;
                        })
                        .map((p, idx) => (
                          <tr key={idx} className="hover:bg-purple-50/40 transition">
                            <td className="p-3 font-mono font-bold">{p.tenderNo || '-'}</td>
                            <td className="p-3 font-bold text-purple-900">{p.section}</td>
                            <td className="p-3 font-medium">{p.projectName}</td>
                            <td className="p-3 font-mono">{p.startCh} - {p.endCh} Km</td>
                            <td className="p-3">{p.agency || '-'}</td>
                            <td className="p-3 font-mono">₹{p.tenderedAmt?.toLocaleString('en-IN') || 0}</td>
                            <td className="p-3">
                              <div className="w-20 bg-slate-200 rounded-full h-2 mb-1">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-purple-700">{p.progress}%</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.progress === 100 ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
                                {p.stage}
                              </span>
                              {p.dlp1 && (
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                  1st DLP: {p.dlp1}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center space-x-1">
                              <button 
                                onClick={() => handleAddToCalendar(p.projectName, p.dlp1 || new Date().toISOString().slice(0, 10))}
                                title="Add to Google Calendar"
                                className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
                              >
                                Calendar
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INSTRUCTIONS MASTER */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">অফিসিয়াল নির্দেশ ও কমপ্লায়েন্স ট্র্যাকিং</h2>
                  <p className="text-xs text-slate-500">নির্দেশ জারি, কমপ্লায়েন্স সাবমিশন এবং রিয়েল-টাইম ক্লাউড সিঙ্ক</p>
                </div>
                <button 
                  onClick={() => setShowInstructionModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-bullhorn"></i> নতুন নির্দেশ জারি করুন
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  {instructionsList.map((ins, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ins.status === 'Complied' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {ins.status}
                          </span>
                          <span className="text-xs font-bold text-slate-800 ml-2">{ins.targetStaff} ({ins.section})</span>
                          <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">রেফারেন্স: {ins.projectRef}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">ইস্যু: {ins.issueDate}</span>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{ins.subject}</p>

                      {ins.replyText && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-emerald-900">
                            <span><i className="fa-solid fa-circle-check text-emerald-600 mr-1"></i>কমপ্লায়েন্স রিপোর্ট:</span>
                            <span className="font-mono text-[10px] text-amber-800">GPS: {ins.gps}</span>
                          </div>
                          <p className="text-slate-700">{ins.replyText}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 gap-2 text-[11px]">
                        <span className="text-slate-500">রিমাইন্ডার তারিখ: <strong>{ins.reminderDate}</strong></span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAddToTasks(ins.subject, `প্রাপক: ${ins.targetStaff}`, ins.reminderDate)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                          >
                            <i className="fa-solid fa-check-double mr-1"></i> Google Tasks
                          </button>
                          <a 
                            href={`https://wa.me/91${ins.phone}?text=${encodeURIComponent('PWDTE Instruction: ' + ins.subject)}`} 
                            target="_blank" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <i className="fa-brands fa-whatsapp"></i> WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Information Card */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 h-fit space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Communication Hub</span>
                    <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded">লাইভ সিস্টেম</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-5">
                    এডমিন কর্তৃক জারিকৃত যেকোনো নির্দেশ ফিল্ডের অফিসার ও সংশ্লিষ্ট কর্মচারীর কাছে সাথে সাথে পৌঁছাবে। কমপ্লায়েন্স জমা দিলে জিপিএস লোকেশন সহ সিস্টেমে রেকর্ড হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MY TASKS (FIELD COMPLIANCE) */}
          {activeTab === 'my_tasks' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-800">আমার পেন্ডিং নির্দেশ ও কমপ্লায়েন্স রিপোর্ট</h2>
                <p className="text-xs text-slate-500">আপনার নামের অধীনে জারিকৃত নির্দেশিকা সম্পন্ন করে রিপোর্ট পাঠান।</p>
              </div>

              <div className="space-y-3">
                {instructionsList
                  .filter(i => currentUser && i.targetStaff === currentUser.name && i.status === 'Pending')
                  .map((ins, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-rose-300 shadow-sm space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Action Required</span>
                        <span className="text-[11px] text-slate-400 font-mono">ইস্যু: {ins.issueDate}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{ins.subject}</p>
                      <p className="text-[11px] text-indigo-700">রেফারেন্স: {ins.projectRef}</p>
                      <div className="flex justify-end pt-2 border-t">
                        <button 
                          onClick={() => { setActiveReplyInstruction(ins); setShowReplyModal(true); }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                        >
                          <i className="fa-solid fa-reply mr-1"></i> কমপ্লায়েন্স রিপোর্ট জমা দিন
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 7: WORK FLOW */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Work Flow</h2>
                  <p className="text-xs text-slate-500">চিঠী-পত্র আদান-প্রদান ও লেটার ট্র্যাকিং</p>
                </div>
                <button 
                  onClick={() => setShowWorkflowModal(true)}
                  className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow"
                >
                  <i className="fa-solid fa-plus mr-1"></i> নতুন চিঠী-পত্র
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sky-950 text-white text-[10px]">
                      <tr>
                        <th className="p-3">Memo / Letter No</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">প্রকল্প / কাজ</th>
                        <th className="p-3">From</th>
                        <th className="p-3">To</th>
                        <th className="p-3">বিষয়</th>
                        <th className="p-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workflowList.map((w, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold">{w.memoNo}</td>
                          <td className="p-3 font-mono">{w.date}</td>
                          <td className="p-3 font-medium">{w.project}</td>
                          <td className="p-3">{w.from}</td>
                          <td className="p-3">{w.to}</td>
                          <td className="p-3">{w.subject}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SD OFFICE FILES */}
          {activeTab === 'sdoffice' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-800">SD Office Section (বড়বাবু ম্যানেজমেন্ট)</h2>
                <p className="text-xs text-slate-500">অফিসিয়াল ফাইল ট্র্যাকিং ও মেমো ডিসপ্যাচ</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-white uppercase text-[10px]">
                      <tr>
                        <th className="p-3">File / Memo No</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">বিষয়</th>
                        <th className="p-3">প্রেরক / প্রাপক</th>
                        <th className="p-3">ক্যাটাগরি</th>
                        <th className="p-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sdOfficeList.map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold">{f.memoNo}</td>
                          <td className="p-3 font-mono">{f.date}</td>
                          <td className="p-3 font-medium">{f.subject}</td>
                          <td className="p-3">{f.senderReceiver}</td>
                          <td className="p-3">{f.category}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: STAFF DIRECTORY */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-base font-bold text-slate-800">স্টাফ ডিরেক্টরি ও পাসওয়ার্ড কন্ট্রোল (Admin Only)</h2>
                <p className="text-xs text-slate-500">সাব-ডিভিশন কর্মীদের তালিকা ও যোগাযোগ তথ্য</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map((st, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {st.section}
                      </span>
                      <h4 className="text-sm font-black text-slate-800 mt-2">{st.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{st.designation}</p>
                      <p className="text-xs font-mono text-slate-600 mt-1">
                        <i className="fa-solid fa-phone text-slate-400 mr-1"></i>{st.phone}
                      </p>
                      <p className="text-[10px] text-amber-700 font-mono mt-0.5 font-bold">পাসওয়ার্ড: {st.pass}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <a href={`tel:${st.phone}`} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-center py-1.5 rounded-xl font-bold text-xs">
                        কল করুন
                      </a>
                      <a href={`https://wa.me/91${st.phone}`} target="_blank" className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-center py-1.5 rounded-xl font-bold text-xs border border-emerald-200">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL: GOOGLE MAPS GROUNDING ASSISTANT ================= */}
      {showMapsAssistantModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-map-location-dot text-indigo-700 text-lg"></i>
                <h3 className="font-bold text-base text-slate-800">Google Maps ও জিওগ্রাফিক তথ্য অনুসন্ধান</h3>
              </div>
              <button onClick={() => setShowMapsAssistantModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSearchMaps} className="flex gap-2">
              <input 
                type="text" 
                value={mapsQuery} 
                onChange={(e) => setMapsQuery(e.target.value)}
                placeholder="সড়ক, ব্রিজ বা নদীয়ার লোকেশন লিখুন (যেমন: Ranaghat SH-11, Anjana Bridge)..."
                className="flex-1 border rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button 
                type="submit" 
                disabled={isMapsLoading}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-2"
              >
                {isMapsLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                অনুসন্ধান
              </button>
            </form>

            <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-indigo-900 border-b pb-1">ফলাফল (Grounding via Google Maps):</div>
              {isMapsLoading ? (
                <div className="text-center py-8 text-slate-400">
                  <i className="fa-solid fa-map-pin fa-bounce text-2xl text-indigo-600 mb-2"></i>
                  <p>ম্যাপ ডেটা অনুসন্ধান করা হচ্ছে...</p>
                </div>
              ) : mapsResult ? (
                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                  {mapsResult}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-6">
                  সড়কের নাম বা যেকোনো ল্যান্ডমার্ক লিখে ম্যাপে অনুসন্ধান করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTRUCTION ISSUANCE ================= */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">অফিসিয়াল নির্দেশ জারি করুন</h3>
              <button onClick={() => setShowInstructionModal(false)} className="text-slate-400 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveInstruction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">প্রাপক কর্মী নির্বাচন করুন</label>
                <select 
                  value={instructionForm.targetStaff} 
                  onChange={(e) => setInstructionForm({ ...instructionForm, targetStaff: e.target.value })}
                  required 
                  className="w-full border rounded-lg p-2 font-semibold"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {staffList.filter(s => s.role !== 'admin').map((s, idx) => (
                    <option key={idx} value={s.name}>{s.name} ({s.designation} - {s.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">প্রকল্প / অ্যাসেট রেফারেন্স</label>
                <input 
                  type="text" 
                  value={instructionForm.projectRef} 
                  onChange={(e) => setInstructionForm({ ...instructionForm, projectRef: e.target.value })}
                  placeholder="যেমন: RKSH-11 Road, Anjana Bridge..." 
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">নির্দেশিকার বিষয়বস্তু</label>
                <textarea 
                  rows={3} 
                  required 
                  value={instructionForm.subject} 
                  onChange={(e) => setInstructionForm({ ...instructionForm, subject: e.target.value })}
                  placeholder="সুনির্দিষ্ট নির্দেশ লিখুন..." 
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ইস্যুর তারিখ</label>
                  <input 
                    type="date" 
                    value={instructionForm.issueDate} 
                    onChange={(e) => setInstructionForm({ ...instructionForm, issueDate: e.target.value })}
                    required 
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">রিমাইন্ডার তারিখ</label>
                  <input 
                    type="date" 
                    value={instructionForm.reminderDate} 
                    onChange={(e) => setInstructionForm({ ...instructionForm, reminderDate: e.target.value })}
                    required 
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowInstructionModal(false)} className="px-4 py-2 bg-slate-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">নির্দেশ জারি করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: COMPLIANCE REPLY ================= */}
      {showReplyModal && activeReplyInstruction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">কমপ্লায়েন্স রিপোর্ট জমা দিন</h3>
              <button onClick={() => setShowReplyModal(false)} className="text-slate-400 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-3 text-xs">
              <p className="p-2.5 bg-slate-100 rounded-lg text-slate-700 italic border">
                নির্দেশ: {activeReplyInstruction.subject}
              </p>

              <div>
                <label className="block font-bold mb-1">Action Taken Report / কমপ্লায়েন্স বিবরণ</label>
                <textarea 
                  rows={3} 
                  required 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="কী পদক্ষেপ গ্রহণ করা হয়েছে বিস্তারিত লিখুন..." 
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900 text-[11px]"><i className="fa-solid fa-location-crosshairs mr-1"></i> লাইভ GPS স্থানাঙ্ক:</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setReplyGps(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
                        });
                      }
                    }} 
                    className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px]"
                  >
                    রিফ্রেশ
                  </button>
                </div>
                <p className="font-mono text-slate-700 text-xs mt-1">{replyGps}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowReplyModal(false)} className="px-4 py-2 bg-slate-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">রিপ্লাই সাবমিট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WORK PRESCRIPTION ================= */}
      {showPrescriptionModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{selectedAsset.section}</span>
                <h3 className="font-black text-base text-slate-900 mt-1">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <h4 className="font-bold text-xs text-indigo-950 mb-2">এই রোডের সংশ্লিষ্ট প্রকল্পসমূহ:</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px]">
                      <tr>
                        <th className="p-2">কাজের নাম</th>
                        <th className="p-2">চেইনেজ</th>
                        <th className="p-2">টাকা (₹)</th>
                        <th className="p-2">এজেন্সি</th>
                        <th className="p-2">অগ্রগতি</th>
                        <th className="p-2">স্টেজ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projectsList
                        .filter(p => p.assetName === selectedAsset.name || p.projectName.includes(selectedAsset.name))
                        .map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{p.projectName}</td>
                            <td className="p-2 font-mono">{p.startCh} - {p.endCh} Km</td>
                            <td className="p-2 font-mono">₹{p.tenderedAmt?.toLocaleString('en-IN') || 0}</td>
                            <td className="p-2">{p.agency || '-'}</td>
                            <td className="p-2 font-bold text-purple-700">{p.progress}%</td>
                            <td className="p-2">{p.stage}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
