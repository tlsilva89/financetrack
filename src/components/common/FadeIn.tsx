import React, { useState, useEffect } from "react";

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
}

const FadeIn: React.FC<FadeInProps> = ({ children, duration = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
