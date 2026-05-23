import jsPDF from "jspdf";

interface ReportData {
  symptoms?: any[];
  scans?: any[];
  arTraining?: {
    totalSessions: number;
    totalReps: number;
    avgFormScore: number;
    recentSessions?: any[];
  };
  stats?: any;
  sessions?: any[];
}

export function generatePDF(
  reportType: string,
  reportData: ReportData,
  userInfo: { name?: string; dueDate?: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    const lines = doc.splitTextToSize(text, pageWidth - 40);
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += fontSize * 0.5;
    });
    yPos += 5;
  };

  const addSection = (title: string) => {
    yPos += 10;
    doc.setFillColor(46, 125, 125); // Brand color
    doc.rect(20, yPos - 5, pageWidth - 40, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 25, yPos + 2);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  };

  // Header
  doc.setFillColor(46, 125, 125);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Pregnancy Report", 20, 25);
  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // User Info
  addText(`Generated: ${new Date().toLocaleDateString()}`, 10);
  if (userInfo.name) {
    addText(`Name: ${userInfo.name}`, 10);
  }
  if (userInfo.dueDate) {
    addText(`Due Date: ${new Date(userInfo.dueDate).toLocaleDateString()}`, 10);
  }
  yPos += 5;

  // Report Type Title
  const reportTitles: Record<string, string> = {
    full_summary: "Full Pregnancy Summary",
    symptoms_report: "Symptoms Report",
    ar_training_report: "AR Training Progress Report",
    progress_report: "Progress Report",
    scans_report: "Scans Summary",
  };

  addText(reportTitles[reportType] || "Report", 18, true);

  // Content based on report type
  switch (reportType) {
    case "full_summary":
      // Symptoms Section
      if (reportData.symptoms && reportData.symptoms.length > 0) {
        addSection("Symptoms Log");
        addText(`Total Symptoms Logged: ${reportData.symptoms.length}`, 12, true);
        reportData.symptoms.slice(0, 10).forEach((symptom: any, index: number) => {
          addText(
            `${index + 1}. ${symptom.name || "Unknown"} - ${symptom.severity} (${new Date(symptom.logged_at).toLocaleDateString()})`,
            10
          );
          if (symptom.notes) {
            addText(`   Notes: ${symptom.notes}`, 9);
          }
        });
      }

      // Scans Section
      if (reportData.scans && reportData.scans.length > 0) {
        addSection("Medical Scans");
        addText(`Total Scans: ${reportData.scans.length}`, 12, true);
        reportData.scans.forEach((scan: any, index: number) => {
          addText(
            `${index + 1}. ${scan.scan_type?.replace(/_/g, " ") || "Scan"} - ${new Date(scan.scan_date || scan.created_at).toLocaleDateString()}`,
            10
          );
          if (scan.trimester) {
            addText(`   Trimester: ${scan.trimester}`, 9);
          }
        });
      }

      // AR Training Section
      if (reportData.arTraining) {
        addSection("AR Training Progress");
        addText(`Total Sessions: ${reportData.arTraining.totalSessions}`, 12, true);
        addText(`Total Reps: ${reportData.arTraining.totalReps}`, 12);
        addText(`Average Form Score: ${Math.round(reportData.arTraining.avgFormScore || 0)}%`, 12);
      }
      break;

    case "symptoms_report":
      if (reportData.symptoms && reportData.symptoms.length > 0) {
        addSection("Detailed Symptoms Log");
        addText(`Total Symptoms: ${reportData.symptoms.length}`, 12, true);
        yPos += 5;

        reportData.symptoms.forEach((symptom: any, index: number) => {
          addText(`${index + 1}. ${symptom.name || "Unknown"}`, 12, true);
          addText(`   Severity: ${symptom.severity}`, 10);
          addText(`   Date: ${new Date(symptom.logged_at).toLocaleDateString()}`, 10);
          if (symptom.notes) {
            addText(`   Notes: ${symptom.notes}`, 10);
          }
          yPos += 3;
        });
      } else {
        addText("No symptoms logged yet.", 12);
      }
      break;

    case "ar_training_report":
      if (reportData.stats) {
        addSection("Training Summary");
        addText(`Total Sessions: ${reportData.stats.totalSessions}`, 12, true);
        addText(`Total Reps: ${reportData.stats.totalReps}`, 12);
        addText(`Average Form Score: ${Math.round(reportData.stats.avgFormScore || 0)}%`, 12);
        yPos += 10;
      }

      if (reportData.sessions && reportData.sessions.length > 0) {
        addSection("Session History");
        reportData.sessions.forEach((session: any, index: number) => {
          addText(
            `${index + 1}. ${session.session_type?.replace(/_/g, " ")} - ${new Date(session.started_at).toLocaleDateString()}`,
            11,
            true
          );
          addText(`   Reps: ${session.total_reps}`, 10);
          addText(`   Form Score: ${Math.round(session.avg_form_score || 0)}%`, 10);
          addText(`   Duration: ${Math.floor((session.duration_seconds || 0) / 60)} minutes`, 10);
          yPos += 3;
        });
      } else {
        addText("No training sessions yet.", 12);
      }
      break;

    case "scans_report":
      if (reportData.scans && reportData.scans.length > 0) {
        addSection("Medical Scans Summary");
        addText(`Total Scans: ${reportData.scans.length}`, 12, true);
        yPos += 5;

        reportData.scans.forEach((scan: any, index: number) => {
          addText(`${index + 1}. ${scan.scan_type?.replace(/_/g, " ") || "Medical Scan"}`, 11, true);
          addText(`   Date: ${new Date(scan.scan_date || scan.created_at).toLocaleDateString()}`, 10);
          if (scan.trimester) {
            addText(`   Trimester: ${scan.trimester}`, 10);
          }
          if (scan.notes) {
            addText(`   Notes: ${scan.notes}`, 10);
          }
          yPos += 3;
        });
      } else {
        addText("No scans uploaded yet.", 12);
      }
      break;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "Generated by MatRiverse - Pregnancy Wellness App",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  }

  return doc;
}
