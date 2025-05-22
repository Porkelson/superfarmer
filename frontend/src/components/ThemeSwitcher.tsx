import React, { useEffect, useState } from "react";

function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>(() => {
    // domyślny motyw: ciemny
    return "dark";
  });
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return (
    <div className="flex gap-2 items-center mb-4">
      <span className="font-bold">Motyw:</span>
      <button className={`btn btn-sm ${theme === "light" ? "btn-active btn-primary" : ""}`} onClick={() => setTheme("light")}>Jasny</button>
      <button className={`btn btn-sm ${theme === "dark" ? "btn-active btn-primary" : ""}`} onClick={() => setTheme("dark")}>Ciemny</button>
    </div>
  );
}

export default ThemeSwitcher; 