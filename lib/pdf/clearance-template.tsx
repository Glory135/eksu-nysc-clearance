import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer"

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "2px solid #006400",
    paddingBottom: 15,
  },
  logoSection: {
    width: 60,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  universityName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#006400",
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#000",
    marginBottom: 3,
  },
  address: {
    fontSize: 9,
    color: "#666",
  },
  passportBox: {
    width: 80,
    height: 100,
    border: "1px solid #000",
    justifyContent: "center",
    alignItems: "center",
  },
  passportImage: {
    width: 78,
    height: 98,
  },
  passportPlaceholder: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    padding: 5,
  },
  instructions: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 15,
    lineHeight: 1.4,
  },
  formSection: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
  },
  label: {
    fontSize: 9,
    fontWeight: 600,
    marginRight: 5,
    minWidth: 100,
  },
  value: {
    fontSize: 9,
    flex: 1,
    borderBottom: "1px solid #000",
    paddingBottom: 2,
  },
  dateFields: {
    flexDirection: "row",
    gap: 10,
  },
  dateBox: {
    width: 80,
    borderBottom: "1px solid #000",
    paddingBottom: 2,
    textAlign: "center",
  },
  dateLabel: {
    fontSize: 7,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  checkbox: {
    width: 12,
    height: 12,
    border: "1px solid #000",
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 10,
    fontWeight: 700,
  },
  signatureSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: "1px solid #ddd",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  signatureBox: {
    width: "48%",
  },
  signatureLine: {
    borderBottom: "1px solid #000",
    height: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  verificationBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #ddd",
    padding: 10,
    marginBottom: 10,
  },
  verificationTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
    color: "#006400",
  },
  verificationText: {
    fontSize: 8,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  officialUse: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    color: "#666",
  },
  watermark: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    color: "#999",
  },
  clearanceId: {
    textAlign: "center",
    fontSize: 9,
    fontWeight: 600,
    color: "#006400",
    marginBottom: 10,
  },
})

interface ClearanceFormData {
  clearanceId: string
  student: {
    name: string
    email: string
    matricNumber: string
    phone?: string
    sex?: string
    dateOfBirth?: string
    maritalStatus?: string
    stateOfOrigin?: string
    lga?: string
    graduationDate?: string
    courseOfStudy?: string
  }
  department: {
    name: string
    faculty?: string
  }
  passportUrl: string
  hod: {
    name: string
    approvedAt: string
  }
  admissions: {
    name: string
    approvedAt: string
  }
  generatedAt: string
}

export const ClearanceFormPDF = ({ data }: { data: ClearanceFormData }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB")
  }

  const parseDateOfBirth = (dob?: string) => {
    if (!dob) return { day: "", month: "", year: "" }
    const date = new Date(dob)
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "long" }),
      year: date.getFullYear().toString(),
    }
  }

  const dobParts = parseDateOfBirth(data.student.dateOfBirth)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src="/placeholder-logo.png" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.universityName}>EKITI STATE UNIVERSITY, ADO-EKITI</Text>
            <Text style={styles.formTitle}>APPLICATION FORM FOR NATIONAL YOUTH SERVICE MOBILIZATION</Text>
            <Text style={styles.address}>P.M.B. 5363, ADO-EKITI, EKITI STATE</Text>
          </View>
          <View style={styles.passportBox}>
            {data.passportUrl ? (
              <Image style={styles.passportImage} src={data.passportUrl || "/placeholder.svg"} />
            ) : (
              <Text style={styles.passportPlaceholder}>Passport Photograph</Text>
            )}
          </View>
        </View>

        {/* Clearance ID */}
        <Text style={styles.clearanceId}>Clearance ID: {data.clearanceId}</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          In the space provided, please affix one passport photograph using staple pin and must be duly stamped by your
          Head of Department. Please peruse and complete the form appropriately.
        </Text>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>1. Name:</Text>
              <Text style={styles.value}>{data.student.name}</Text>
            </View>
          </View>

          {/* Faculty and Department */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>2. Faculty:</Text>
              <Text style={styles.value}>{data.department.faculty || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>3. Department:</Text>
              <Text style={styles.value}>{data.department.name}</Text>
            </View>
          </View>

          {/* Course of Study */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>3. Course of Study:</Text>
              <Text style={styles.value}>{data.student.courseOfStudy || "N/A"}</Text>
            </View>
          </View>

          {/* Matric Number */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>4. Matric Number:</Text>
              <Text style={styles.value}>{data.student.matricNumber}</Text>
            </View>
          </View>

          {/* JAMB Reg No */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>5. JAMB Reg. No:</Text>
              <Text style={styles.value}>N/A</Text>
            </View>
          </View>

          {/* Sex */}
          <View style={styles.row}>
            <Text style={styles.label}>6. Sex (Tick X)</Text>
            <View style={styles.checkboxRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 9, marginRight: 5 }}>Male</Text>
                <View style={styles.checkbox}>
                  {data.student.sex?.toLowerCase() === "male" && <Text style={styles.checkmark}>X</Text>}
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 9, marginRight: 5 }}>Female</Text>
                <View style={styles.checkbox}>
                  {data.student.sex?.toLowerCase() === "female" && <Text style={styles.checkmark}>X</Text>}
                </View>
              </View>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.row}>
            <Text style={styles.label}>7. Date of Birth</Text>
            <View style={styles.dateFields}>
              <View>
                <Text style={styles.dateBox}>{dobParts.day}</Text>
                <Text style={styles.dateLabel}>Day</Text>
              </View>
              <View>
                <Text style={styles.dateBox}>{dobParts.month}</Text>
                <Text style={styles.dateLabel}>Month</Text>
              </View>
              <View>
                <Text style={styles.dateBox}>{dobParts.year}</Text>
                <Text style={styles.dateLabel}>Year</Text>
              </View>
            </View>
          </View>

          {/* Marital Status */}
          <View style={styles.row}>
            <Text style={styles.label}>8. Marital Status (Tick x)</Text>
            <View style={styles.checkboxRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 9, marginRight: 5 }}>Single</Text>
                <View style={styles.checkbox}>
                  {data.student.maritalStatus?.toLowerCase() === "single" && <Text style={styles.checkmark}>X</Text>}
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 9, marginRight: 5 }}>Married</Text>
                <View style={styles.checkbox}>
                  {data.student.maritalStatus?.toLowerCase() === "married" && <Text style={styles.checkmark}>X</Text>}
                </View>
              </View>
            </View>
          </View>

          {/* State of Origin */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>9. State of Origin:</Text>
              <Text style={styles.value}>{data.student.stateOfOrigin || "N/A"}</Text>
            </View>
          </View>

          {/* LGA */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>10. Local Government of Origin:</Text>
              <Text style={styles.value}>{data.student.lga || "N/A"}</Text>
            </View>
          </View>

          {/* Graduation Date */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>11. Date and Year of Graduation:</Text>
              <Text style={styles.value}>{data.student.graduationDate || "N/A"}</Text>
            </View>
          </View>

          {/* Phone and Email */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>12. Phone Number(s):</Text>
              <Text style={styles.value}>{data.student.phone || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address:</Text>
              <Text style={styles.value}>{data.student.email}</Text>
            </View>
          </View>
        </View>

        {/* Confirmation */}
        <Text style={{ fontSize: 8, fontStyle: "italic", marginBottom: 15 }}>
          I Confirm that the information provided by me above is true and authentic.
        </Text>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature of Prospective Corps Member & Date</Text>
            </View>
          </View>
        </View>

        {/* Official Use Only */}
        <Text style={styles.officialUse}>OFFICIAL USE ONLY</Text>

        {/* Verification Sections */}
        <View style={styles.verificationBox}>
          <Text style={styles.verificationTitle}>Verification of Results by the Admission Office</Text>
          <Text style={styles.verificationText}>
            I confirm that the results of the Student has been verified by Admission Office
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.verificationText}>
                Name: {data.admissions.name}
                {"\n"}
                Date: {formatDate(data.admissions.approvedAt)}
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Name and Signature of Admission Officer</Text>
            </View>
          </View>
        </View>

        <View style={styles.verificationBox}>
          <Text style={styles.verificationTitle}>HEAD OF DEPARTMENT</Text>
          <Text style={styles.verificationText}>
            I confirm that he/she is from the Department of {data.department.name} and his/her result was approved on{" "}
            {formatDate(data.hod.approvedAt)}.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.verificationText}>
                HOD Name: {data.hod.name}
                {"\n"}
                Date: {formatDate(data.hod.approvedAt)}
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Head of Department Signature and Date</Text>
            </View>
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark}>
          EKSU NYSC Clearance System – Auto-Generated on {formatDate(data.generatedAt)}
          {"\n"}
          Verified by EKSU NYSC Clearance System
        </Text>
      </Page>
    </Document>
  )
}
