import { useEffect, useRef } from "react";
import Typed from "typed.js";
 
const AnimatedText = ({ texts }) => {
    const el = useRef(null);
 
    useEffect(() => {
      const typed = new Typed(el.current, {
        strings: texts,
        typeSpeed: 25,
        backSpeed: 5,
        loop: false,
        showCursor: false,
      });
 
      return () => typed.destroy();
    }, [texts]);
 
    return (
      <span
        className="text-lg text-gray-300 max-w-lg inline-block"
        ref={el}
      />
    );
  };
 
export default AnimatedText;