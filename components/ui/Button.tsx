import React from "react";

function Button({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      className="disabled:cursor-not-allowed disabled:shadow-sm disabled:translate-y-1 cursor-pointer shadow-md shadow-neutral-950 mt-3 px-4 bg-amber-300 border-2 rounded-lg border-amber-800 py-2 hover:shadow-sm hover:translate-y-1 text-amber-950 font-bold active:opacity-75"
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
