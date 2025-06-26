import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Change background when scrolled
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide/show navbar logic
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`
      fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out
      ${visible ? 'translate-y-0' : '-translate-y-full'}
      ${scrolled ? 'bg-white shadow-md text-gray-800' : 'bg-transparent text-white'}
    `}>
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center group">
      <div className="relative">
        {/* Main logo text */}
        <h1 className="text-xl md:text-xl font-bold tracking-tighter leading-none">
          <span className={`transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            SUHANI'S CREATIONS
          </span>
        </h1>
        
        {/* Subtext with underline effect */}
        <div className="relative">
          {/* <span className={`text-sm md:text-sm font-medium tracking-wider ${scrolled ? 'text-gray-700' : 'text-gray-300'} transition-colors duration-300`}>
            CONSTRUCT
          </span> */}
          <div className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transform origin-left transition-all duration-300 ${scrolled ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
        </div>
      </div>
    </a>
     


        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8">
          {[
            { href: "#about", text: "About" },
            // { href: "#services", text: "Services" },
            { href: "#projects", text: "Projects" },
            { href: "#contact", text: "Contact" }
          ].map((item) => (
            <li key={item.href}>
              <a 
                href={item.href} 
                className={`
                  relative py-2 px-1 transition-colors duration-200
                  after:content-[''] after:absolute after:bottom-0 after:left-0 
                  after:w-0 after:h-0.5 after:transition-all after:duration-300 
                  hover:after:w-full
                  ${scrolled ? 
                    'hover:text-yellow-600 after:bg-yellow-600' : 
                    'hover:text-yellow-400 after:bg-yellow-400'}
                `}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl focus:outline-none transition-transform duration-300 hover:scale-110"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FaTimes className={scrolled ? 'text-gray-800' : 'text-white'} />
          ) : (
            <FaBars className={scrolled ? 'text-gray-800' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <ul className={`${scrolled ? 'bg-white' : 'bg-gray-900/95'} text-center py-4 px-6 space-y-4 backdrop-blur-md`}>
          {[
            { href: "#about", text: "About" },
            { href: "#services", text: "Services" },
            { href: "#projects", text: "Projects" },
            { href: "#contact", text: "Contact" }
          ].map((item) => (
            <li key={item.href}>
              <a 
                href={item.href} 
                onClick={closeMenu}
                className={`
                  block py-3 px-4 rounded-lg transition-colors duration-200
                  ${scrolled ? 
                    'hover:bg-gray-100 hover:text-yellow-600' : 
                    'hover:bg-gray-800 hover:text-yellow-400'}
                `}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;