export const mockPatients = [
  { id: "P001", name: "Aisha Mehta", email: "aisha.mehta@email.com", phone: "+91 98765 43210", date: "2026-03-10", gender: "Female", dob: "1992-05-14", age: 33, bloodGroup: "O+", area: "Bandra West", doctor: "Dr. Priya Sharma", purpose: "Fertility Consultation" },
  { id: "P002", name: "Rajesh Kumar", email: "rajesh.k@email.com", phone: "+91 87654 32109", date: "2026-03-09", gender: "Male", dob: "1985-11-22", age: 40, bloodGroup: "A+", area: "Andheri East", doctor: "Dr. Anil Kapoor", purpose: "General Checkup" },
  { id: "P003", name: "Sunita Verma", email: "sunita.v@email.com", phone: "+91 76543 21098", date: "2026-03-08", gender: "Female", dob: "1990-02-28", age: 36, bloodGroup: "B+", area: "Powai", doctor: "Dr. Rekha Nair", purpose: "Gynecology" },
  { id: "P004", name: "Mohammed Ali", email: "m.ali@email.com", phone: "+91 65432 10987", date: "2026-03-07", gender: "Male", dob: "1978-07-16", age: 47, bloodGroup: "AB-", area: "Malad West", doctor: "Dr. Priya Sharma", purpose: "IVF Treatment" },
  { id: "P005", name: "Priya Nair", email: "priya.nair@email.com", phone: "+91 54321 09876", date: "2026-03-06", gender: "Female", dob: "1995-09-03", age: 30, bloodGroup: "O-", area: "Juhu", doctor: "Dr. Anil Kapoor", purpose: "Prenatal Care" },
  { id: "P006", name: "Vikram Singh", email: "vikram.s@email.com", phone: "+91 43210 98765", date: "2026-03-05", gender: "Male", dob: "1982-12-30", age: 43, bloodGroup: "A-", area: "Goregaon", doctor: "Dr. Rekha Nair", purpose: "Consultation" },
  { id: "P007", name: "Deepa Pillai", email: "deepa.p@email.com", phone: "+91 32109 87654", date: "2026-03-04", gender: "Female", dob: "1988-04-19", age: 37, bloodGroup: "B-", area: "Chembur", doctor: "Dr. Priya Sharma", purpose: "Fertility Treatment" },
  { id: "P008", name: "Rahul Joshi", email: "rahul.j@email.com", phone: "+91 21098 76543", date: "2026-03-03", gender: "Male", dob: "1993-08-07", age: 32, bloodGroup: "O+", area: "Thane", doctor: "Dr. Anil Kapoor", purpose: "Scan" },
  { id: "P009", name: "Kavitha Rao", email: "kavitha.r@email.com", phone: "+91 10987 65432", date: "2026-03-02", gender: "Female", dob: "1991-01-25", age: 35, bloodGroup: "A+", area: "Vile Parle", doctor: "Dr. Rekha Nair", purpose: "Fertility Consultation" },
  { id: "P010", name: "Arjun Patel", email: "arjun.p@email.com", phone: "+91 09876 54321", date: "2026-03-01", gender: "Male", dob: "1975-06-11", age: 50, bloodGroup: "AB+", area: "Borivali", doctor: "Dr. Priya Sharma", purpose: "IUI Treatment" },
];

export const mockAppointments = [
  { id: "A001", patientName: "Aisha Mehta", patientId: "P001", serviceType: "Fertility Consultation", doctor: "Dr. Priya Sharma", date: "2026-03-12", time: "09:00 AM", session: "Morning", status: "Scheduled" },
  { id: "A002", patientName: "Rajesh Kumar", patientId: "P002", serviceType: "General Checkup", doctor: "Dr. Anil Kapoor", date: "2026-03-12", time: "10:30 AM", session: "Morning", status: "Checked-In" },
  { id: "A003", patientName: "Sunita Verma", patientId: "P003", serviceType: "Scan", doctor: "Dr. Rekha Nair", date: "2026-03-12", time: "11:00 AM", session: "Morning", status: "Completed" },
  { id: "A004", patientName: "Mohammed Ali", patientId: "P004", serviceType: "IVF Consultation", doctor: "Dr. Priya Sharma", date: "2026-03-12", time: "02:00 PM", session: "Afternoon", status: "Scheduled" },
  { id: "A005", patientName: "Priya Nair", patientId: "P005", serviceType: "Prenatal Care", doctor: "Dr. Anil Kapoor", date: "2026-03-12", time: "02:30 PM", session: "Afternoon", status: "Cancelled" },
  { id: "A006", patientName: "Vikram Singh", patientId: "P006", serviceType: "Consultation", doctor: "Dr. Rekha Nair", date: "2026-03-13", time: "09:30 AM", session: "Morning", status: "Scheduled" },
  { id: "A007", patientName: "Deepa Pillai", patientId: "P007", serviceType: "Fertility Treatment", doctor: "Dr. Priya Sharma", date: "2026-03-13", time: "11:30 AM", session: "Morning", status: "Scheduled" },
  { id: "A008", patientName: "Rahul Joshi", patientId: "P008", serviceType: "Scan", doctor: "Dr. Anil Kapoor", date: "2026-03-13", time: "03:00 PM", session: "Afternoon", status: "Completed" },
  { id: "A009", patientName: "Kavitha Rao", patientId: "P009", serviceType: "Fertility Consultation", doctor: "Dr. Rekha Nair", date: "2026-03-14", time: "10:00 AM", session: "Morning", status: "Scheduled" },
  { id: "A010", patientName: "Arjun Patel", patientId: "P010", serviceType: "IUI Treatment", doctor: "Dr. Priya Sharma", date: "2026-03-14", time: "04:00 PM", session: "Evening", status: "Checked-In" },
];

export const mockBilling = [
  { id: "B001", patientName: "Aisha Mehta", createdBy: "Admin Riya", date: "2026-03-10", time: "10:30 AM", session: "Morning", notes: "Fertility Consultation + Scan", paymentMode: "UPI", totalBill: 5500 },
  { id: "B002", patientName: "Rajesh Kumar", createdBy: "Admin Priya", date: "2026-03-09", time: "11:00 AM", session: "Morning", notes: "General Checkup", paymentMode: "Cash", totalBill: 1200 },
  { id: "B003", patientName: "Sunita Verma", createdBy: "Admin Riya", date: "2026-03-08", time: "02:00 PM", session: "Afternoon", notes: "Gynecology Consultation + Lab", paymentMode: "Card", totalBill: 3800 },
  { id: "B004", patientName: "Mohammed Ali", createdBy: "Admin Priya", date: "2026-03-07", time: "03:30 PM", session: "Afternoon", notes: "IVF Procedure", paymentMode: "Net Banking", totalBill: 45000 },
  { id: "B005", patientName: "Priya Nair", createdBy: "Admin Riya", date: "2026-03-06", time: "09:00 AM", session: "Morning", notes: "Prenatal Checkup", paymentMode: "UPI", totalBill: 2500 },
  { id: "B006", patientName: "Vikram Singh", createdBy: "Admin Priya", date: "2026-03-05", time: "04:00 PM", session: "Evening", notes: "Consultation", paymentMode: "Cash", totalBill: 800 },
  { id: "B007", patientName: "Deepa Pillai", createdBy: "Admin Riya", date: "2026-03-04", time: "11:30 AM", session: "Morning", notes: "IUI + Injections", paymentMode: "Card", totalBill: 15000 },
  { id: "B008", patientName: "Rahul Joshi", createdBy: "Admin Priya", date: "2026-03-03", time: "10:00 AM", session: "Morning", notes: "Scan + Report", paymentMode: "UPI", totalBill: 2200 },
];

export const mockInventory = [
  { id: "D001", drugName: "Clomiphene Citrate", dosage: "50mg", category: "Fertility", generic: "Clomifene", quantity: 150, vendor: "Sun Pharma", orderDate: "2026-01-15", expiryDate: "2027-01-15" },
  { id: "D002", drugName: "Progesterone", dosage: "200mg", category: "Hormone", generic: "Progesterone", quantity: 80, vendor: "Abbott India", orderDate: "2026-02-01", expiryDate: "2026-04-30" },
  { id: "D003", drugName: "FSH Injection", dosage: "75 IU", category: "Fertility", generic: "Follitropin", quantity: 45, vendor: "Merck", orderDate: "2026-02-10", expiryDate: "2026-05-10" },
  { id: "D004", drugName: "HCG Injection", dosage: "5000 IU", category: "Fertility", generic: "Chorionic Gonadotropin", quantity: 30, vendor: "Sun Pharma", orderDate: "2026-01-20", expiryDate: "2026-03-20" },
  { id: "D005", drugName: "Metformin", dosage: "500mg", category: "Antidiabetic", generic: "Metformin HCl", quantity: 200, vendor: "Cipla", orderDate: "2025-12-01", expiryDate: "2027-12-01" },
  { id: "D006", drugName: "Folic Acid", dosage: "5mg", category: "Supplement", generic: "Folacin", quantity: 5, vendor: "Mankind", orderDate: "2025-11-15", expiryDate: "2026-03-10" },
  { id: "D007", drugName: "Estradiol", dosage: "2mg", category: "Hormone", generic: "Estradiol Valerate", quantity: 120, vendor: "Bayer", orderDate: "2026-02-20", expiryDate: "2027-02-20" },
  { id: "D008", patientName: "Aspirin", drugName: "Aspirin", dosage: "75mg", category: "Anticoagulant", generic: "Acetylsalicylic Acid", quantity: 300, vendor: "Cipla", orderDate: "2025-10-01", expiryDate: "2027-10-01" },
  { id: "D009", drugName: "GnRH Agonist", dosage: "3.75mg", category: "Fertility", generic: "Leuprorelin", quantity: 8, vendor: "Abbott India", orderDate: "2026-01-05", expiryDate: "2026-04-05" },
  { id: "D010", drugName: "Dydrogesterone", dosage: "10mg", category: "Hormone", generic: "Dydrogesterone", quantity: 0, vendor: "Solvay", orderDate: "2025-09-01", expiryDate: "2026-03-05" },
  { id: "D011", drugName: "Letrozole", dosage: "2.5mg", category: "Fertility", generic: "Letrozole", quantity: 90, vendor: "Novartis", orderDate: "2026-02-25", expiryDate: "2028-02-25" },
  { id: "D012", drugName: "Cetirizine", dosage: "10mg", category: "Antihistamine", generic: "Cetirizine HCl", quantity: 3, vendor: "Dr. Reddy's", orderDate: "2025-08-01", expiryDate: "2026-02-28" },
];

export const mockInPatients = [
  { id: "IP001", patientId: "P001", patientName: "Aisha Mehta", procedure: "Egg Retrieval", hospital: "ACUTIX Main", date: "2026-03-12", time: "08:00 AM", status: "Admitted" },
  { id: "IP002", patientId: "P002", patientName: "Rajesh Kumar", procedure: "Endoscopy", hospital: "ACUTIX Main", date: "2026-03-12", time: "10:00 AM", status: "In Surgery" },
  { id: "IP003", patientId: "P004", patientName: "Mohammed Ali", procedure: "Embryo Transfer", hospital: "ACUTIX Main", date: "2026-03-12", time: "01:00 PM", status: "Completed" },
  { id: "IP004", patientId: "P007", patientName: "Deepa Pillai", procedure: "IUI Procedure", hospital: "ACUTIX Branch", date: "2026-03-13", time: "09:00 AM", status: "Scheduled" },
  { id: "IP005", patientId: "P005", patientName: "Priya Nair", procedure: "Laparoscopy", hospital: "ACUTIX Main", date: "2026-03-13", time: "11:00 AM", status: "Scheduled" },
  { id: "IP006", patientId: "P009", patientName: "Kavitha Rao", procedure: "Hysteroscopy", hospital: "ACUTIX Branch", date: "2026-03-14", time: "08:30 AM", status: "Scheduled" },
  { id: "IP007", patientId: "P003", patientName: "Sunita Verma", procedure: "Cesarean Section", hospital: "ACUTIX Main", date: "2026-03-10", time: "07:00 AM", status: "Discharged" },
  { id: "IP008", patientId: "P010", patientName: "Arjun Patel", procedure: "TESA", hospital: "ACUTIX Main", date: "2026-03-11", time: "09:30 AM", status: "Discharged" },
];

export const mockFertility = [
  { id: "F001", patientName: "Aisha Mehta", patientId: "P001", treatmentType: "IVF", cycleNumber: 2, betaHCGDate: "2026-03-25", result: "Positive", remarks: "Successful implantation", cycles: ["Stimulation", "Retrieval", "Fertilization", "Transfer"] },
  { id: "F002", patientName: "Deepa Pillai", patientId: "P007", treatmentType: "IUI", cycleNumber: 3, betaHCGDate: "2026-04-02", result: "Pending", remarks: "Awaiting results", cycles: ["Stimulation", "IUI", "Waiting"] },
  { id: "F003", patientName: "Kavitha Rao", patientId: "P009", treatmentType: "IVF", cycleNumber: 1, betaHCGDate: "2026-03-28", result: "Pending", remarks: "First cycle", cycles: ["Stimulation", "Retrieval", "Fertilization"] },
  { id: "F004", patientName: "Mohammed Ali", patientId: "P004", treatmentType: "ICSI", cycleNumber: 2, betaHCGDate: "2026-03-20", result: "Negative", remarks: "Repeat cycle recommended", cycles: ["Stimulation", "Retrieval", "ICSI", "Transfer"] },
  { id: "F005", patientName: "Arjun Patel", patientId: "P010", treatmentType: "IUI", cycleNumber: 1, betaHCGDate: "2026-04-05", result: "Pending", remarks: "First IUI attempt", cycles: ["Stimulation", "IUI"] },
  { id: "F006", patientName: "Priya Nair", patientId: "P005", treatmentType: "IVF-FET", cycleNumber: 2, betaHCGDate: "2026-03-15", result: "Positive", remarks: "Frozen embryo transfer successful", cycles: ["Preparation", "Transfer", "Monitoring"] },
];

export const mockStaff = [
  { id: "S001", name: "Dr. Priya Sharma", role: "Doctor", department: "Fertility & IVF", contact: "+91 98765 11111", status: "Active", specialization: "Reproductive Medicine" },
  { id: "S002", name: "Dr. Anil Kapoor", role: "Doctor", department: "General Medicine", contact: "+91 87654 22222", status: "Active", specialization: "Obstetrics & Gynecology" },
  { id: "S003", name: "Dr. Rekha Nair", role: "Doctor", department: "Radiology", contact: "+91 76543 33333", status: "Active", specialization: "Diagnostic Radiology" },
  { id: "S004", name: "Meena Krishnan", role: "Nurse", department: "Fertility & IVF", contact: "+91 65432 44444", status: "Active", specialization: "IVF Lab Technician" },
  { id: "S005", name: "Sudha Menon", role: "Nurse", department: "OPD", contact: "+91 54321 55555", status: "Active", specialization: "Patient Care" },
  { id: "S006", name: "Riya Desai", role: "Admin", department: "Administration", contact: "+91 43210 66666", status: "Active", specialization: "Hospital Administration" },
  { id: "S007", name: "Priya Gupta", role: "Receptionist", department: "Front Desk", contact: "+91 32109 77777", status: "Active", specialization: "Patient Coordination" },
  { id: "S008", name: "Dr. Suresh Babu", role: "Doctor", department: "Andrology", contact: "+91 21098 88888", status: "On Leave", specialization: "Male Infertility" },
  { id: "S009", name: "Anita Jain", role: "Nurse", department: "Surgery", contact: "+91 10987 99999", status: "Active", specialization: "Surgical Assistance" },
  { id: "S010", name: "Karthik Iyer", role: "Admin", department: "Accounts", contact: "+91 09876 00000", status: "Active", specialization: "Medical Billing" },
];

export const appointmentTrendsData = [
  { month: "Sep", Patients: 65, Doctors: 28, Customs: 42 },
  { month: "Oct", Patients: 80, Doctors: 35, Customs: 55 },
  { month: "Nov", Patients: 70, Doctors: 30, Customs: 48 },
  { month: "Dec", Patients: 95, Doctors: 42, Customs: 60 },
  { month: "Jan", Patients: 85, Doctors: 38, Customs: 52 },
  { month: "Feb", Patients: 110, Doctors: 48, Customs: 70 },
  { month: "Mar", Patients: 128, Doctors: 52, Customs: 85 },
];

export const monthlyRevenueData = [
  { month: "Sep", revenue: 280000 },
  { month: "Oct", revenue: 320000 },
  { month: "Nov", revenue: 295000 },
  { month: "Dec", revenue: 380000 },
  { month: "Jan", revenue: 350000 },
  { month: "Feb", revenue: 420000 },
  { month: "Mar", revenue: 457000 },
];

export const fertilitySuccessData = [
  { name: "IVF Success", value: 40, color: "#3CC0D0" },
  { name: "IUI Success", value: 25, color: "#5ED3CF" },
  { name: "ICSI Success", value: 20, color: "#F6C177" },
  { name: "FET Success", value: 15, color: "#1F2A5A" },
];

export const bpSugarData = [
  { day: "Mon", systolic: 120, diastolic: 80, sugar: 95 },
  { day: "Tue", systolic: 125, diastolic: 82, sugar: 102 },
  { day: "Wed", systolic: 118, diastolic: 78, sugar: 98 },
  { day: "Thu", systolic: 130, diastolic: 85, sugar: 110 },
  { day: "Fri", systolic: 122, diastolic: 80, sugar: 100 },
  { day: "Sat", systolic: 115, diastolic: 75, sugar: 92 },
  { day: "Sun", systolic: 119, diastolic: 79, sugar: 96 },
];

export const kickCountData = [
  { week: "Wk 28", morning: 8, evening: 12, night: 10 },
  { week: "Wk 29", morning: 10, evening: 14, night: 11 },
  { week: "Wk 30", morning: 9, evening: 13, night: 12 },
  { week: "Wk 31", morning: 11, evening: 15, night: 13 },
  { week: "Wk 32", morning: 12, evening: 16, night: 14 },
  { week: "Wk 33", morning: 10, evening: 14, night: 13 },
  { week: "Wk 34", morning: 13, evening: 17, night: 15 },
];

export const pretermData = [
  { week: "24", cervixLength: 38, risk: "Low" },
  { week: "26", cervixLength: 35, risk: "Low" },
  { week: "28", cervixLength: 30, risk: "Moderate" },
  { week: "30", cervixLength: 26, risk: "Moderate" },
  { week: "32", cervixLength: 22, risk: "High" },
  { week: "34", cervixLength: 20, risk: "High" },
];

export const costingData = [
  { item: "IVF Base Package", quantity: 1, unitCost: 120000, total: 120000 },
  { item: "Medication - Stimulation", quantity: 1, unitCost: 45000, total: 45000 },
  { item: "Egg Retrieval", quantity: 1, unitCost: 25000, total: 25000 },
  { item: "ICSI (Intracytoplasmic Sperm Injection)", quantity: 5, unitCost: 3000, total: 15000 },
  { item: "Embryo Transfer", quantity: 1, unitCost: 15000, total: 15000 },
  { item: "Cryopreservation", quantity: 3, unitCost: 5000, total: 15000 },
  { item: "Anesthesia", quantity: 1, unitCost: 8000, total: 8000 },
  { item: "Lab Tests & Scans", quantity: 1, unitCost: 12000, total: 12000 },
];

export const ivfFailureData = [
  { name: "Poor Egg Quality", value: 30, color: "#3CC0D0" },
  { name: "Implantation Failure", value: 25, color: "#F6C177" },
  { name: "Sperm Quality", value: 15, color: "#1F2A5A" },
  { name: "Uterine Issues", value: 20, color: "#5ED3CF" },
  { name: "Other Factors", value: 10, color: "#E07B54" },
];

export const patientVisitHistory = [
  { year: "2026", month: "March", event: "IVF Cycle 2 - Egg Retrieval", type: "Procedure", doctor: "Dr. Priya Sharma" },
  { year: "2026", month: "January", event: "Fertility Consultation - IVF Planning", type: "Consultation", doctor: "Dr. Priya Sharma" },
  { year: "2025", month: "October", event: "IVF Cycle 1 - Embryo Transfer", type: "Procedure", doctor: "Dr. Priya Sharma" },
  { year: "2025", month: "July", event: "Diagnostic Tests & Scans", type: "Scan", doctor: "Dr. Rekha Nair" },
  { year: "2024", month: "December", event: "Initial Fertility Assessment", type: "Consultation", doctor: "Dr. Anil Kapoor" },
];
