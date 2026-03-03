import { TC } from "../../utils/constants";

export const Div = () => <div style={{ width: 50, height: 1, background: "#C8A951", opacity: 0.25, margin: "3rem auto" }} />;
export const SL = ({ children }) => <div style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C8A951", opacity: 0.7, marginBottom: "0.4rem" }}>{children}</div>;
export const SH = ({ children }) => <h2 style={{ fontFamily: "'Georgia',serif", fontSize: "1.8rem", fontWeight: 300, marginBottom: "1rem", lineHeight: 1.2 }}>{children}</h2>;
export const SP = ({ children }) => <p style={{ color: "#8A8678", maxWidth: 620, marginBottom: "1rem", fontSize: "0.88rem", lineHeight: 1.7 }}>{children}</p>;
export const Quote = ({ text, ref: r }) => (
  <div style={{ borderLeft: "2px solid rgba(200,169,81,0.4)", padding: "1.2rem 1.5rem", margin: "2rem 0", background: "rgba(200,169,81,0.02)" }}>
    <div style={{ fontFamily: "'Georgia',serif", fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.5 }}>{text}</div>
    <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678", marginTop: "0.6rem" }}>— {r}</div>
  </div>
);
export const Tag = ({ name, col }) => <span style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 1, border: `1px solid ${TC[col]}40`, color: TC[col] }}>{name}</span>;
