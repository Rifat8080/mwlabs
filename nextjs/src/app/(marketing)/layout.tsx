import { StudioFooter } from "@/components/cinematic/studio-footer";
import { StudioNav } from "@/components/cinematic/studio-nav";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="studio-shell"><StudioNav /><main>{children}</main><StudioFooter /></div>;
}
