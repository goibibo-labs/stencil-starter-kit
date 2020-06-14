import {useRef, useEffect} from 'preact/hooks';

const useIntersectionObserver = (options, actionHandler) => {
  const elRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting === true) {
        actionHandler();
        // setIsVisible(true);
      }
    }, options);

    if (elRef && elRef.current) {
      observer.observe(elRef.current);
    }

    return () => observer.disconnect();
  }, [elRef]);
  return [elRef];
};

export default useIntersectionObserver;
