import Link from "next/link";

const links = [
  ["Capabilities", "#capabilities"],
  ["Work", "#work"],
  ["Process", "#process"],
  ["Studio", "#studio"]
] as const;

export function StudioNav() {
  return <header className="studio-nav"><Link className="studio-mark" href="/" aria-label="MW Labs home">MW<span>LABS</span></Link><nav aria-label="Primary"><ul>{links.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul></nav><a className="studio-cta" href="#contact">Book a call <span aria-hidden="true">↗</span></a></header>;
}
