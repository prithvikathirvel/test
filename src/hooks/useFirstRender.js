import { useEffect, useState } from 'react';

const useFirstRender = (delay = 0) => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsFirstRender(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isFirstRender;
};

export default useFirstRender;
