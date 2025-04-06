import { useEffect, useRef } from "react";
import Typed from "typed.js";
 
const AnimatedText = ({ texts }) => {
    const el = useRef(null);
 
    useEffect(() => {
      const typed = new Typed(el.current, {
        strings: texts,
        typeSpeed: 30,
        backSpeed: 5,
        loop: true,
        showCursor: false,
      });
 
      return () => typed.destroy();
    }, [texts]);
 
    return (
      <span
        className="text-lg text-slate-700 max-w-lg inline-block mb-5"
        ref={el}
      />
    );
  };
 
export default AnimatedText;