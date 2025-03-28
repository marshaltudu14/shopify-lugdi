import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/app/[country]/cart/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Bag",
      href: "/cart",
      icon: ShoppingBag,
      badge: cart.itemCount,
    },
    {
      name: "Account",
      href: "https://account.lugdi.store",
      icon: User,
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800" />

      {/* Navigation */}
      <nav className="relative flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <div key={item.name} className="relative flex-1">
            <Link
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <NavItem
                icon={item.icon}
                name={item.name}
                isActive={isActive(item.href)}
                badge={item.badge}
              />
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}

// NavItem Component
const NavItem = ({
  icon: Icon,
  name,
  isActive,
  badge,
}: {
  icon: React.ElementType;
  name: string;
  isActive: boolean;
  badge?: number;
}) => {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center w-full"
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative">
        <Icon
          className={`h-5 w-5 ${
            isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
          }`}
        />

        {/* Badge - Only show if badge is defined and greater than 0 */}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white dark:text-black text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
            {badge}
          </span>
        )}
      </div>

      {/* Text */}
      <span
        className={`text-[10px] mt-1 font-medium ${
          isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        {name}
      </span>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-3 h-1 w-10 bg-primary rounded-full"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  );
};
