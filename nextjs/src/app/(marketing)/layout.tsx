import { StudioFooter } from "@/components/cinematic/studio-footer";
import { StudioNav } from "@/components/cinematic/studio-nav";
import { ScrollOrchestrator } from "@/components/cinematic/scroll-orchestrator";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="studio-shell"><ScrollOrchestrator /><StudioNav /><main>{children}</main><StudioFooter /></div>;
}
