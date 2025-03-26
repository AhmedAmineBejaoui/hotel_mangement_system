import { useLocation } from "wouter";

const getPageTitle = (path: string): string => {
  switch (path) {
    case "/":
      return "Dashboard";
    case "/guests":
      return "Guests";
    case "/rooms":
      return "Rooms";
    case "/staff":
      return "Staff";
    case "/bookings":
      return "Bookings";
    case "/payments":
      return "Payments";
    case "/settings":
      return "Settings";
    case "/help":
      return "Help & Support";
    default:
      return "Dashboard";
  }
};

const Header = () => {
  const [location] = useLocation();
  const pageTitle = getPageTitle(location);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button className="md:hidden text-gray-500 focus:outline-none mr-4">
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
              <i className="ri-notification-3-line text-xl"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          
          <div className="relative">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
              <i className="ri-search-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
