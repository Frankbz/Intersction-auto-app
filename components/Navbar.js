"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();
    return ( 
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image src="/logo.jfif" alt="Logo" width={80} height={80} />
          <p className="mb-0 fw-bold">Automation App</p>
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item me-3">
              <Link href="/map" className="nav-link">
                Map
              </Link>
            </li>
            {session?.user && (
              <li className="nav-item">
              <button className="btn btn-link nav-link" onClick={() => signOut()}>
                Sign Out
              </button>
            </li>
            )}
            
          </ul>
        </div>
      </div>
    </nav>
    );
  }
 
export default Navbar;