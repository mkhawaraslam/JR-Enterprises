import { StyleSheet } from "@react-pdf/renderer";
import { PAGE } from "@/components/pdf/template-config";

export const pdfStyles = StyleSheet.create({
  page: {
    position: "relative",
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
  },
  canvas: {
    width: PAGE.width,
    height: PAGE.height,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE.width,
    height: PAGE.height,
  },
  field: {
    position: "absolute",
    justifyContent: "center",
  },
  fieldText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  fieldTextBold: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  cell: {
    position: "absolute",
    justifyContent: "flex-start",
    paddingTop: 3,
    paddingHorizontal: 4,
  },
  cellText: {
    fontSize: 11,
    lineHeight: 1.2,
    fontFamily: "Helvetica-Bold",
  },
  cellCenter: {
    textAlign: "center",
  },
  cellRight: {
    textAlign: "right",
  },
  cover: {
    position: "absolute",
    backgroundColor: "#ffffff",
  },
});

