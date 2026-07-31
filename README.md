# JEPPIAAR INSTITUTE OF TECHNOLOGY
## Student Mark Report Automation System

An enterprise-level, single-page web application dashboard for automating college examination mark report generation.

---

### Features

- **Automated Processing**: Upload an Excel `.xlsx` sheet containing all examinees. The system automatically populates each student's record into the official **template.pdf** / **PARENTS.docx** 2-page format.
- **Adobe Acrobat PDF Viewer Style**: Interactive 2-page document preview (Page 1: End Semester & Continuous Internal Evaluation Marks; Page 2: Parent Acknowledgement Form).
- **Exact Document Output**:
  - **Download Word (`.docx`)**: Merged multi-page Microsoft Word document containing all student reports separated by page breaks.
  - **Download PDF (`.pdf`)**: Merged multi-page PDF document containing all student reports formatted for printing.
- **Official Branding**: Includes official Jeppiaar Institute of Technology vector logo emblem (`jit_logo.svg`) and Anna University / AICTE accreditation credentials.

---

### Getting Started

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

#### 3. Build for Production
```bash
npm run build
```

---

### Project Structure

```
├── public/
│   └── jit_logo.svg               # Official Jeppiaar IT Vector Logo
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Header.tsx                 # Top Branding & 3D Illustration Header
│   │   │   ├── StatsGrid.tsx              # 6 System Statistics Cards
│   │   │   ├── UploadSection.tsx           # Step 1 Excel Drag & Drop Dropzone + Summary
│   │   │   ├── AcrobatDocumentViewer.tsx   # Step 2 Adobe Acrobat Style 2-Page Preview
│   │   │   ├── DownloadSection.tsx        # Step 3 Download Buttons (Word & PDF)
│   │   │   ├── ProcessingModal.tsx        # Animated Progress Modal Dialog
│   │   │   ├── Toast.tsx                  # System Alert Toast Notifications
│   │   │   └── Footer.tsx                 # Bottom Copyright Bar
│   │   ├── data/
│   │   │   └── sampleStudents.ts          # Default 512 Student Test Dataset
│   │   ├── utils/
│   │   │   ├── excelParser.ts             # XLSX Parser & Validation
│   │   │   ├── excelGenerator.ts          # Sample Excel Template Export
│   │   │   ├── docGenerator.ts            # DOCX Multi-Page Generator
│   │   │   └── pdfGenerator.ts            # PDF Multi-Page Generator
│   │   ├── pages/
│   │   │   └── Dashboard.tsx              # Main Single-Page Dashboard
│   │   └── types.ts                       # Student & Exam Data Definitions
│   ├── styles/
│   │   └── index.css                      # Styling & Design Tokens
│   ├── main.tsx                           # React Root Entry Point
│   └── routes.tsx                         # Router Config
├── index.html                             # Main HTML Document
├── package.json                           # NPM Dependencies & Scripts
└── vite.config.ts                         # Vite Build Config
```
