import { DocFooter } from "@/components/DocFooter";
import { DocHeader } from "@/components/DocHeader";
import { getAllDocs } from "@/lib/mdx";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const docs = getAllDocs();
  const docTitles = Object.fromEntries(
    docs.map((doc) => [doc.slug, doc.title]),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <DocHeader docTitles={docTitles} />
      {children}
      <DocFooter />
    </div>
  );
}
