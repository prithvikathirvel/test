"use client";

function PrimaryButton({
  onClick,
  text,
  fontSize,
  icon,
  className = "",
  width,
  height,
  backgroundColor = "var(--primary-color)",
  textColor = "#ffffff",
  hoverColor = "var(--primary-color)",
  type = "button",
}) {
  const style = {
    width,
    height,
    backgroundColor,
    color: textColor,
  };

  const hoverStyle = {
    '--hover-bg': hoverColor,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...style, ...hoverStyle }}
      className={`rounded-lg flex items-center justify-center font-medium hover:cursor-pointer transition-colors duration-200 hover:bg-[var(--hover-bg)] ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
}

export default PrimaryButton;
