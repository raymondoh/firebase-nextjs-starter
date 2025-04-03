import Image from "next/image";

export function Logo({ className = "", ...props }) {
  return (
    <Image
      src="/fire.svg" // Update this path to match where you saved the file
      alt="App Logo"
      width={100}
      height={100}
      className={className}
      {...props}
    />
  );
}
