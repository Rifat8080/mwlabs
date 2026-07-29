import Image from "next/image";
import { ContactForm } from "@/components/cinematic/contact-form";

const services = [
  ["01", "Web development", "Fast, flexible sites and products that make the business easier to choose.", "Strategy · UX · Next.js", "chrome"],
  ["02", "Branding", "Identity systems that make the right customers recognise what you stand for.", "Positioning · Identity · Guidelines", "glass"],
  ["03", "Digital marketing", "Demand systems built around a useful message, a measurable path, and a clear next move.", "SEO · Paid media · CRM", "steel"],
  ["04", "Video & motion", "Campaign films and motion systems that make complex ideas quick to understand.", "Concept · Edit · Motion", "ceramic"],
  ["05", "AI automation", "Practical automations that clear repetitive work without adding another black box.", "Agents · Integrations · Ops", "glass"],
  ["06", "Growth strategy", "A concrete plan for what to change next, why it matters, and how to prove it worked.", "Research · Roadmap · Measurement", "chrome"]
] as const;

const projects = [
  ["Arcline", "2025", "Commerce system", "+41% checkout completion", "/work/arcline.svg", 1440, 960, "A product and checkout redesign for a premium homeware business."],
  ["Lume", "2024", "Brand / launch film", "3.2× campaign watch-through", "/work/lume.svg", 1440, 1800, "A launch identity and motion system for a personal care line."],
  ["Rooted", "2024", "Membership product", "18 days from brief to beta", "/work/rooted.svg", 1440, 960, "A focused platform for a fast-growing wellness community."],
  ["Tide", "2023", "Content engine", "56% less production time", "/work/tide.svg", 1440, 1800, "A modular content workflow for a consumer finance team."]
] as const;

export default function HomePage() {
  return <>
    <section className="studio-hero" data-scene="hero"><div className="hero-meta mono"><span>MW LABS / DHAKA</span><span>UTC +06 / AVAILABLE FOR SELECT PROJECTS</span></div><div className="hero-object-placeholder" aria-hidden="true"><span>01</span></div><div className="hero-copy"><h1 className="hero-title">Design<br />that<br /><em>ships.</em></h1><p>Design, engineering, and motion for brands that ship.</p><div className="hero-actions"><a className="studio-cta" href="#contact">Book a call <span aria-hidden="true">↗</span></a><a className="text-link" href="#work">See selected work <span aria-hidden="true">↓</span></a></div></div><p className="hero-caption mono">A full-service digital studio / web / brand / motion / AI automation</p></section>

    <section className="manifesto" data-scene="manifesto"><p className="mono">01 / MANIFESTO</p><h2>We help ambitious teams turn a clear point of view into work that customers can see, use, and choose.</h2></section>

    <section id="capabilities" className="capabilities" data-scene="capabilities" aria-labelledby="capabilities-title"><div className="section-head"><p className="mono">02 / CAPABILITIES</p><h2 id="capabilities-title">The skills to get it made.<br />The judgement to make it matter.</h2></div><ol>{services.map(([index, title, description, deliverables, material]) => <li key={index}><a href="#contact" data-material={material}><span className="mono">{index}</span><strong>{title}</strong><p>{description}</p><span className="service-deliverables mono">{deliverables}</span><b aria-hidden="true">↗</b></a></li>)}</ol></section>

    <section id="work" className="selected-work" data-scene="work" aria-labelledby="work-title"><div className="work-intro"><p className="mono">03 / SELECTED WORK</p><h2 id="work-title">Proof, not promises.</h2><p>Four engagements where a focused system made a measurable difference.</p></div><div className="work-list">{projects.map(([client, year, scope, result, image, width, height, description], index) => <article className="work-entry" key={client}><div className="work-data"><p className="mono">0{index + 1} / 04</p><h3>{client}</h3><dl><div><dt>Year</dt><dd>{year}</dd></div><div><dt>Scope</dt><dd>{scope}</dd></div><div><dt>Result</dt><dd>{result}</dd></div></dl><p>{description}</p></div><figure><Image src={image} alt={`${client} project placeholder — replace with final photography`} width={width} height={height} sizes="(min-width: 1024px) 62vw, 94vw" /></figure></article>)}</div></section>

    <section id="process" className="process" data-scene="process" aria-labelledby="process-title"><div className="section-head"><p className="mono">04 / PROCESS</p><h2 id="process-title">A sequence that keeps the work moving.</h2></div><ol><li><span className="mono">01</span><h3>Brief</h3><p>Get precise about the situation, the decision, and the signal of progress.</p></li><li><span className="mono">02</span><h3>Direction</h3><p>Choose the point of view, shape the system, and make the trade-offs visible.</p></li><li><span className="mono">03</span><h3>Build</h3><p>Bring design, engineering, and production together while the context is fresh.</p></li><li><span className="mono">04</span><h3>Launch</h3><p>Measure what changed, learn from it, and turn that knowledge into the next move.</p></li></ol></section>

    <section id="studio" className="studio-section" data-scene="studio" aria-labelledby="studio-title"><div><p className="mono">05 / STUDIO</p><h2 id="studio-title">A small senior team that stays close to the decision.</h2><p>We work with fewer clients at a time so the people doing the work remain in the room when the important calls get made. That makes the work sharper and the process simpler.</p></div><dl><div><dt>10+</dt><dd>Senior specialists</dd></div><div><dt>5</dt><dd>Core disciplines</dd></div><div><dt>20+</dt><dd>Markets served</dd></div><div><dt>1</dt><dd>Team accountable</dd></div></dl></section>

    <section id="contact" className="studio-contact" data-scene="contact" aria-labelledby="contact-title"><div><p className="mono">06 / CONTACT</p><h2 id="contact-title">Make the next move count.</h2><p>Tell us what needs to change. We’ll tell you whether we are the right team to help.</p><a className="contact-email" href="mailto:hello@mwlabs.example">hello@mwlabs.example</a><a className="booking-link" href="#contact">Open booking link <span aria-hidden="true">↗</span></a></div><ContactForm /></section>
  </>;
}
