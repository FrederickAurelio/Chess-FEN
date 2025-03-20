import React from "react";

function Anchor({
  className,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      target="_blank"
      className={`flex items-center gap-2 text-lg border-2 rounded-lg border-amber-800 py-2 px-4  bg-amber-300 shadow-md shadow-neutral-950 hover:shadow-sm hover:translate-y-1 font-bold active:opacity-75"
      target="_blank ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

export default Anchor;
