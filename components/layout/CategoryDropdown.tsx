import Link from "next/link";

type DropdownLink = {
  label: string;
  href: string;
};

type CategoryDropdownProps = {
  label: string;
  href: string;
  links: DropdownLink[];
};

export function CategoryDropdown({
  label,
  href,
  links,
}: CategoryDropdownProps) {
  return (
    <div className="group relative flex min-h-12 items-center">
      <Link
        href={href}
        className="flex min-h-12 items-center gap-1 transition hover:text-slate-500"
      >
        {label}
        <span className="text-xs">⌄</span>
      </Link>

      <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-2 rounded-b-xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          href={href}
          className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
        >
          Ver todo en {label}
        </Link>

        <div className="my-2 border-t border-slate-100" />

        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}