"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Box,
  FlaskConical,
  LayoutDashboard,
  Layers3,
  PanelLeft,
  ScanText,
  Ticket,
  Workflow,
} from "lucide-react";
const links = [
  ["/", "Dashboard", LayoutDashboard],
  ["/tickets", "Tickets", Ticket],
  ["/classify", "Classify Ticket", ScanText],
  ["/training", "Training", Workflow],
  ["/models", "Models", Box],
  ["/experiments", "Experiments", FlaskConical],
] as const;
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Layers3 size={22} />
          </span>
          <span>
            Ticket Intelligence<small>NLP LEARNING LAB</small>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">TI</span>
          <div>
            Support intelligence<small>Personal workspace</small>
          </div>
          <span className="version">V1</span>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {pathname === href && <span className="active-dot" />}
            </Link>
          ))}
        </nav>
        <div className="lab-note">
          <FlaskConical size={20} />
          <strong>Your learning, your models.</strong>
          <p>Build the ML. Explore the results. One experiment at a time.</p>
          <Link href="/experiments">
            Explore the learning path <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">ML</span>
          <div>
            Student workspace<small>Local development</small>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <div className="topbar">
          <span>
            <PanelLeft size={17} /> Workspace <span className="slash">/</span>{" "}
            {links.find(([href]) => href === pathname)?.[1] || "Workspace"}
          </span>
          <span className="local-pill">
            <span /> Local environment
          </span>
        </div>
        <main>{children}</main>
        <footer>
          <span>NLP Support-Ticket Intelligence System</span>
          <span>
            <Activity size={13} /> Built for experimentation
          </span>
        </footer>
      </div>
    </div>
  );
}
