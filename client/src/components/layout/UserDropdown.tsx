import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger 
  } from "@/components/ui/dropdown-menu";
  
  const UserDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              JD
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <i className="ri-arrow-down-s-line ml-auto"></i>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <i className="ri-user-settings-line mr-2"></i>
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <i className="ri-settings-3-line mr-2"></i>
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <i className="ri-logout-box-line mr-2"></i>
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  export default UserDropdown;
  